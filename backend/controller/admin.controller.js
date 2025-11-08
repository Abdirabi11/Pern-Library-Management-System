import { pool } from "../config/db.js"
import { v4 as uuidv4 } from "uuid";
import { isValidUUID } from "../utils/validators.js";

export const getAllRequests= async(req, res)=>{
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
        `)

        res.status(200).json({
            success: true,
            requests: result.rows
        });
    } catch (err) {
        console.log("Error in getAllRequests controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getSingleRequest= async (req, res)=>{
    const {uuid}= req.params
    try {
        if (!isValidUUID(uuid)) {
            return res.status(404).json({
              success: false,
              message: "Book not found",
            });
        }
               
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

        if(result.rows.length === 0){
            res.status(404).json({success: false, message: "Request not found"})
        }

        res.status(200).json({success: true, request: result.rows[0],});
    } catch (err) {
        console.log("Error in getAllRequests controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const approveRequest= async(req, res)=>{
    const {uuid}= req.params
    const adminUuid = req.user?.uuid
    const adminName= req.user?.name
    try {
        if (!isValidUUID(uuid)) {
            return res.status(404).json({
              success: false,
              message: "Book not found",
            });
        }

        const request= await pool.query("SELECT * FROM requests WHERE uuid=$1", [uuid])
        if (request.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }
        const reqData= request.rows[0]

        // Approve ADD BOOK
        if(reqData.request_type=== "add_book"){
            const book = reqData.book_data
            const authorRes = await pool.query("SELECT uuid FROM authors WHERE name = $1", [book.author]);

            let authorUuid=
                authorRes.rows.length > 0
                ? authorRes.rows[0].uuid
                : (await pool.query("INSERT INTO authors (name) VALUES ($1) RETURNING uuid", [book.author]))
                    .rows[0].uuid;

            const addedBook= await pool.query(`
             INSERT INTO books (title, description, author_uuid, published_year, total_copies, available_copies, cover_image)
             VALUES ($1, $2, $3, $4, $5, $6, $7)  RETURNING uuid, title
            `,
             [
                book.title,
                book.description,
                authorUuid,
                book.publishedYear,
                book.totalCopies,
                book.availableCopies,
                book.coverImage
            ])

            const bookUuid = addedBook.rows[0].uuid;
            const bookName = addedBook.rows[0].title;
           
            await pool.query(
                `
                INSERT INTO actions_log 
                (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `,
                [
                  "APPROVE_ADD_BOOK", 
                  `Admin ${adminName} approved deleting book ${bookName} by ${book.author}`,
                  "book",
                  bookUuid,
                  adminName,
                  adminUuid,
                  "admin"
                ]
            );
   
             // Approve DELETE BOOK
        }else if (reqData.request_type === "delete_book"){
            const bookData = typeof reqData.book_data === "string" ? JSON.parse(reqData.book_data) : reqData.book_data;
            const bookUuid = bookData.book_uuid
            const bookName = bookData.book_name;

            await pool.query("DELETE FROM books WHERE uuid=$1", [bookUuid])

            await pool.query(
                `
                INSERT INTO actions_log 
                (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `,
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
            const bookData = typeof reqData.book_data === "string" 
             ? JSON.parse(reqData.book_data) 
             : reqData.book_data;

            const bookName = bookData.book_name || bookData.title;
            const bookUuid = bookData.book_uuid || reqData.entity_uuid;
            const requesterUuid = reqData.requester_uuid;
            const requesterName = reqData.requester_name;

            await pool.query(
                `
                UPDATE borrowed_records
                SET status = 'approved', admin_uuid = $3
                WHERE book_uuid = $1 AND user_uuid = $2
                `,
                [bookUuid, requesterUuid, adminUuid]
              );

            await pool.query(
                `
                INSERT INTO actions_log 
                (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                `,
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
        await pool.query("UPDATE requests SET status='approved' WHERE uuid=$1", [uuid]);

        res.status(200).json({ success: true, message: "Request approved successfully" });
    } catch (err) {
        console.log("Error in approveRequest controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const rejectRequest= async (req, res)=>{
    const { uuid } = req.params
    const adminUuid = req.user?.uuid;
    const adminName= req.user?.name
    try {
        if (!isValidUUID(uuid)) {
            return res.status(404).json({
              success: false,
              message: "Book not found",
            });
        }

        const requestRes = await pool.query("SELECT * FROM requests WHERE uuid=$1", [uuid]);
        if (requestRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const result= await pool.query("UPDATE requests SET status='rejected' WHERE uuid = $1", [uuid])
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const reqData = requestRes.rows[0];

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

            await pool.query(
                `UPDATE borrowed_records SET status='rejected', admin_uuid=$3 WHERE book_uuid=$1 AND user_uuid=$2`,
                [entityUuid, reqData.requester_uuid, adminUuid]
            );
        }

        await pool.query("UPDATE requests SET status='rejected' WHERE uuid=$1", [uuid])

        await pool.query(
            `
            INSERT INTO actions_log 
            (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            `,
            ["REJECT_REQUEST", details, entityType, entityUuid, adminName, adminUuid, "admin"]
        );

        res.status(200).json({success: true, message: "Request rejected successfully"})
    } catch (err) {
        console.log("Error in rejectRequest controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const updateUserRole= async (req, res)=>{
    const {uuid}= req.params
    const {role}= req.body
    const adminUuid = req.user?.uuid

    const validateRoles= ["admin", "librarian", "student"]
    if(!validateRoles.includes(role)){
        return res.status(400).json({ success: false, message: "Invalid role" });
    }

    try {
        if (!isValidUUID(uuid)) {
            return res.status(404).json({
              success: false,
              message: "Book not found",
            });
        }

        const result= await pool.query(
            "UPDATE users SET role=$1, updated_at=NOW() WHERE uuid=$2 RETURNING uuid, name, email, role",[role, uuid]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

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

        //   admin.name AS admin_name,
        //   librarian.name AS librarian_name,
        //   student.name AS student_name

        res.status(200).json({ success: true, logs: result.rows });
    } catch (err) {
        console.log("Error in getActionLogs controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getSingleActionlog= async(req, res)=>{
    const {uuid}= req.params
    try {
        if (!isValidUUID(uuid)) {
            return res.status(404).json({
              success: false,
              message: "Book not found",
            });
        }

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

        res.status(200).json({ success: true, logs: result.rows });
    } catch (err) {
        console.log("Error in getSingleActionlog controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const revokeRequest= async (req, res)=>{
    const {uuid}= req.params
    const adminUuid= req.user.id
    try {
        if (!isValidUUID(uuid)) {
            return res.status(404).json({
              success: false,
              message: "Book not found",
            });
        }

        const result= await pool.query("SELECT * FROM requests WHERE id= $1", [uuid])
        if(result.rows.length === 0){
            res.status(404).json({success:false, message: "Request not found"})
        }

        const request= result.rows[0]
        if(request.status !== "approved"){
            return res.status(400).json({ success: false, message: "Only approved requests can be revoked" });
        }

        if(request.type === "add_book"){
            const book= JSON.parse(request.book_data)

            const bookResult= await pool.query("SELECT id FROM books WHERE title= $1", [book.title])
            if(bookResult.rows.length > 0){
                await pool.query("DELETE FROM books WHERE id= $1", [bookResult.rows[0].id])
            }

            await pool.query(`INSERT INTO actions_log (admin_uuid, action_type, details) VALUES($1, $2, $3)`,
             [adminUuid, "REVOKE_ADD_BOOK", `Revoked previously approved addition of book "${book.title}`]
            )
        }else if (request.type === "delete_book"){
            await pool.query(`INSERT INTO actions_log (admin_uuid, action_type, details) VALUES ($1, $2, $3)`,
             [adminUuid, "REVOKE_DELETE_BOOK", `Revoked delete approval for book ID ${request.book_data}`]
            )
        }

        await pool.query("UPDATE requests SET revoked = TRUE WHERE uuid = $1", [id])

        res.status(200).json({ success: true, message: "Request revoked successfully" });
    } catch (err) {
        console.log("Error in revokeRequest controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}