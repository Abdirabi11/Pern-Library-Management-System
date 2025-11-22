import { pool } from "../config/db.js"
import { v4 as uuidv4 } from "uuid";
import { isValidUUID } from "../utils/validators.js";
import { AppError } from "../utils/appError.js";

export const getRequests= async(req, res)=>{
    try {
        const result= await pool.query(`
            SELECT 
                r.uuid,
                r.request_type,
                r.book_uuid,
                r.status,
                r.book_data,
                r.remarks,
                u.name AS requester_name,
                u.role AS requester_role,
                u.uuid AS requester_uuid,
                r.created_at,
                r.updated_at
            FROM requests r
            LEFT JOIN users u ON r.requester_uuid = u.uuid
            LEFT JOIN books b ON r.book_uuid = b.uuid
            ORDER BY r.created_at DESC
        `);
        if (result.rows.length === 0) {
            return res.status(200).json({ success: true, requests: [] });
        };
        res.status(200).json({ success: true, requests: result.rows});
    } catch (err) {
        console.log("Error in getRequests controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const getSingleRequest= async (req, res)=>{
    const {uuid}= req.params;
    try {
        if (!isValidUUID(uuid))  throw new AppError("Invalid UUID format", 400);
        const result = await pool.query(`
            SELECT 
                r.uuid,
                r.request_type,
                r.book_uuid,
                r.status,
                r.book_data,
                r.remarks,
                u.name AS requester_name,
                u.role AS requester_role,
                u.uuid AS requester_uuid,
                r.created_at,
                r.updated_at
            FROM requests r
            LEFT JOIN users u ON r.requester_uuid = u.uuid
            LEFT JOIN books b ON r.book_uuid = b.uuid
            WHERE r.uuid = $1
        `, [uuid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, messgae:"Request not found" });
        };
        res.status(200).json({success: true, request: result.rows[0],});
    } catch (err) {
        console.log("Error in getAllRequests controller", err.message);
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const approveRequest= async(req, res)=>{
    const {uuid}= req.params
    const adminUuid = req.user?.uuid
    const adminName= req.user?.name
    const adminRole= req.user?.role
    const parseBookData = (data) => (typeof data === "string" ? JSON.parse(data) : data);

    const client = await pool.connect(); 
    try {
        await client.query("BEGIN");

        if (!req.user) throw new AppError("Unauthorized", 401);
        if (!isValidUUID(uuid)) throw new AppError("Invalid UUID format", 400);

        const request= await client.query("SELECT * FROM requests WHERE uuid = $1 FOR UPDATE", [uuid]);
        if (request.rows.length === 0){
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, messgae:"Request not found" });
        };

        const reqData= request.rows[0];
        if (reqData.status === "approved" || reqData.status === "rejected") {
            await client.query("ROLLBACK");
            return res.status(409).json({
              success: false, message: `This request has already been ${reqData.status}`
            });
        }
        // Approve ADD BOOK
        if(reqData.request_type=== "add_book"){
            if (!req.body.title || !req.body.author)  throw new AppError("Title and Author are required", 400);
    
            const book = parseBookData(reqData.book_data);
            const authorRes = await client.query("SELECT uuid FROM authors WHERE name = $1", [book.author]);

            let authorUuid=
                authorRes.rows.length > 0
                ? authorRes.rows[0].uuid
                : (await client.query("INSERT INTO authors (name) VALUES ($1) RETURNING uuid", [book.author]))
                    .rows[0].uuid;

            const addedBook= await client.query(`
             INSERT INTO books (title, description, author_uuid, published_year, total_copies, available_copies, cover_image)
             VALUES ($1, $2, $3, $4, $5, $6, $7)  RETURNING uuid, title`,
             [
                book.title,
                book.description,
                authorUuid,
                book.publishedYear,
                book.totalCopies,
                book.availableCopies,
                book.coverImage
            ]);
            const bookUuid = addedBook.rows[0].uuid;
            const bookName = addedBook.rows[0].title;
           
            await client.query( `
                INSERT INTO actions_log 
                (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  "APPROVE_ADD_BOOK", 
                  `Admin ${adminName} approved adding book ${bookName} by ${book.author}`,
                  "book",
                  bookUuid,
                  adminName,
                  adminUuid,
                  adminRole
                ]
            );
            // Approve DELETE BOOK
        }else if (reqData.request_type === "delete_book"){
            const bookData = parseBookData(reqData.book_data);
            const bookUuid = bookData.book_uuid;
            const bookName = bookData.book_name;

            await client.query("DELETE FROM books WHERE uuid=$1", [bookUuid]);

            await client.query(`
                INSERT INTO actions_log 
                (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  "APPROVE_DELETE_BOOK",
                  `Admin ${adminName} approved deleting book '${bookName}'`,
                  "book",
                  bookUuid,
                  adminName,
                  adminUuid,
                  "admin"
                ]
            );
        }else if (reqData.request_type === "borrow_book"){
            const bookData = parseBookData(reqData.book_data)
            const bookName = bookData.book_name || bookData.title;
            const bookUuid = bookData.book_uuid || reqData.entity_uuid;
            const requesterUuid = reqData.requester_uuid;
            const requesterName = reqData.requester_name;
          
            await client.query(`
                UPDATE borrowed_records
                SET status = 'approved', admin_uuid = $3
                WHERE book_uuid = $1 AND user_uuid = $2`,
                [bookUuid, requesterUuid, adminUuid]
            );

            await client.query(` 
                UPDATE books 
                SET available_copies= available_copies - 1
                WHERE uuid= $1 AND available_copies > 0
            `, [bookUuid])

            await client.query(`
                INSERT INTO actions_log 
                (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  "APPROVE_BORROW_BOOK",
                  `Admin ${adminName} approved borrow request for '${bookName}' by student ${requesterName}`,
                  "book",
                  bookUuid,
                  adminName,
                  adminUuid,
                  "admin"
                ]
            );
        }
        await client.query("UPDATE requests SET status = 'approved' WHERE uuid = $1", [uuid]);
        await client.query("COMMIT");
        res.status(200).json({ success: true, message: "Request approved successfully" });
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("Error in approveRequest controller", err.message);
        if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }finally{
        client.release();
    }
};

export const rejectRequest= async (req, res)=>{
    const { uuid } = req.params
    const adminUuid = req.user?.uuid;
    const adminName= req.user?.name

    const client = await pool.connect(); 
    try {
        await client.query("BEGIN");

        if (!req.user) throw new AppError("Unauthorized", 401);
        if (!isValidUUID(uuid))  throw new AppError("Invalid UUID format", 400);

        const request= await client.query("SELECT * FROM requests WHERE uuid = $1 FOR UPDATE", [uuid]);
        if (request.rows.length === 0){
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, messgae:"Request not found" });
        };

        const reqData = request.rows[0];
        if (reqData.status === "approved" || reqData.status === "rejected") {
            await client.query("ROLLBACK");
            return res.status(409).json({
              success: false,
              message: `This request has already been ${reqData.status}`,
            });
        };
        let entityUuid = null;
        let entityType = "book"
        let details = "";

        if(reqData.request_type === "add_book" || reqData.request_type === "delete_book"){
            const bookData = typeof reqData.book_data === "string" 
             ? JSON.parse(reqData.book_data) 
             : reqData.book_data;

            entityUuid = bookData.book_uuid || null
            const bookName= bookData.book_name || bookData.title
            details = `Admin ${adminName} rejected ${reqData.request_type.replace("_", " ")} request for '${bookName}'`;
        }else if(reqData.request_type === "borrow_book"){
            const bookData = typeof reqData.book_data === "string" 
             ? JSON.parse(reqData.book_data) 
             : reqData.book_data

            entityUuid = bookData.book_uuid || reqData.book_uuid
            const bookName = bookData.book_name || bookData.title;
            const requesterName = reqData.requester_name;
            details = `Admin ${adminName} rejected borrow request for '${bookName}' by student ${requesterName}`;

            await client.query(
                `UPDATE borrowed_records SET status='rejected', admin_uuid=$3 WHERE book_uuid=$1 AND user_uuid=$2`,
                [entityUuid, reqData.requester_uuid, adminUuid]
            );
        }

        await client.query("UPDATE requests SET status='rejected' WHERE uuid=$1", [uuid]);

        await client.query(
            `
            INSERT INTO actions_log 
            (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            `,
            ["REJECT_REQUEST", details, entityType, entityUuid, adminName, adminUuid, "admin"]
        );
        await client.query("COMMIT");
        res.status(200).json({ success: true, message: "Request rejected successfully" });
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("Error in approveRequest controller", err.message);
        if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }finally{
        client.release();
    }
}

export const revokeRequest= async (req, res)=>{
    const {uuid}= req.params
    const adminUuid= req.user.uuid
    try {
        if (!isValidUUID(uuid))  throw new AppError("Invalid UUID format", 400);
        const result= await pool.query("SELECT * FROM requests WHERE uuid= $1", [uuid]);
        if(result.rows.length === 0) throw new AppError("Request not found", 404);

        const request= result.rows[0]
        if(request.status !== "approved") throw new AppError("Only approved requests can be revoked", 400);
            
        if(request.request_type === "add_book"){
            const book= typeof request.book_data === "string" ? JSON.parse(request.book_data) : request.book_data;

            const bookResult= await pool.query("SELECT uuid FROM books WHERE title= $1", [book.title]);
            if(bookResult.rows.length > 0){
                await pool.query("DELETE FROM books WHERE uuid= $1", [bookResult.rows[0].uuid])
            };

            await pool.query(`INSERT INTO actions_log (admin_uuid, action_type, details) VALUES($1, $2, $3)`,
             [adminUuid, "REVOKE_ADD_BOOK", `Revoked previously approved addition of book ${book.title}`]
            );
        }else if (request.request_type === "delete_book"){
            await pool.query(`INSERT INTO actions_log (admin_uuid, action_type, details) VALUES ($1, $2, $3)`,
             [adminUuid, "REVOKE_DELETE_BOOK", `Revoked delete approval for book uuid ${request.book_data}`]
            );
        }

        await pool.query("UPDATE requests SET revoked = TRUE WHERE uuid = $1", [uuid]);
        res.status(200).json({ success: true, message: "Request revoked successfully" });
    } catch (err) {
        console.log("Error in revokeRequest controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getActionLogs= async (req, res)=>{
    try {
        const result= await pool.query(`
          SELECT 
            a.uuid, 
            a.action_type,
            a.details,
            a.entity_type,
            a.entity_uuid,
            a.performed_by,
            a.performer_name,
            a.role,
            a.created_at
          FROM actions_log a
          LEFT JOIN users admin ON a.admin_uuid = admin.uuid
          LEFT JOIN users librarian ON a.librarian_uuid = librarian.uuid
          LEFT JOIN users student ON a.student_uuid = student.uuid
          ORDER BY a.created_at DESC
        `)
        if (result.rows.length === 0) {
            return res.status(200).json({ success: true, actions: [] });
        };
        res.status(200).json({ success: true, logs: result.rows });
    } catch (err) {
        console.log("Error in getActionLogs controller", err.message);
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        };
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getSingleActionlog= async(req, res)=>{
    const {uuid}= req.params
    try {
        if (!isValidUUID(uuid)) throw new AppError("Invalid UUID format", 400);
        const result= await pool.query(`
          SELECT 
            a.uuid, 
            a.action_type,
            a.details,
            a.entity_type,
            a.entity_uuid,
            a.performed_by,
            a.performer_name,
            a.role,
            a.created_at
          FROM actions_log a
          LEFT JOIN users admin ON a.admin_uuid = admin.uuid
          LEFT JOIN users librarian ON a.librarian_uuid = librarian.uuid
          LEFT JOIN users student ON a.student_uuid = student.uuid
          WHERE a.uuid = $1
        `, [uuid])
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, messgae:"Action not found" });
        };
        res.status(200).json({ success: true, log: result.rows[0] });
    } catch (err) {
        console.log("Error in getSingleActionlog controller", err.message);
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        };
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const updateUserRole= async (req, res)=>{
    const {uuid}= req.params;
    const {role}= req.body;
    const adminUuid = req.user?.uuid;
    const validateRoles= ["admin", "librarian", "student"];
   
    try {
        if(!validateRoles.includes(role)) throw new AppError("Invalid role", 400);
        if (!isValidUUID(uuid)) throw new AppError("Invalid UUID format", 400);
        
        const result= await pool.query(
            "UPDATE users SET role=$1, updated_at=NOW() WHERE uuid=$2 RETURNING uuid, name, email, role",[role, uuid]
        )
        if (result.rowCount === 0) throw new AppError("User not found", 404);

        // if (result.rows.length === 0) {
        //     return res.status(200).json({ success: true, requests: [] });
        // };

        const updatedUser= result.rows[0]
        await pool.query(
            `INSERT INTO actions_log (uuid, admin_uuid, action_type, details, created_at)
             VALUES($1, $2, $3, $4, NOW())`,
             [
                uuidv4(),
                adminUuid,
                "UPDATE_USER_ROLE",
                `Updated role of ${updatedUser.name} (${updatedUser.email}) to ${role}`
             ]
        )
        res.status(200).json({success: true, message: `User role updated to ${role}`, user: updatedUser,});
    } catch (err) {
        console.log("Error in updateUserRole controller", err.message);
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        };
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}