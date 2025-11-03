import { pool } from "../config/db.js"

export const getAllRequests= async(req, res)=>{
    try {
        const result= await pool.query(`
            SELECT r.*, u.name AS librarian_name 
            FROM requests r
            JOIN users u ON r.librarian_id = u.id
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

export const approveRequest= async(req, res)=>{
    const {id}= req.params
    const adminId= req.user.id
    try {
        const request= await pool.query("SELECT * FROM requests WHERE id=$1", [id])
        if (request.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const reqData= request.rows[0]

        let actionType = "";
        let details = "";

        if(reqData.type === "add_book"){
            const book = reqData.book_data

            const authorRes = await pool.query("SELECT id FROM authors WHERE name = $1", [book.author]);

            let authorId;
            if (authorRes.rows.length > 0) {
                authorId = authorRes.rows[0].id;
            } else {
                const newAuthor = await pool.query(
                    "INSERT INTO authors (name) VALUES ($1) RETURNING id", [book.author]
                );
                authorId = newAuthor.rows[0].id;
            }

            await pool.query(`
             INSERT INTO books (title, description, author_id, published_year, total_copies, available_copies, cover_image)
             VALUES ($1, $2, $3, $4, $5, $5, $6)
            `,
             [
                book.title,
                book.description,
                authorId,
                book.publishedYear,
                book.totalCopies,
                book.coverImage
            ])

            actionType = "APPROVE_ADD_BOOK";
            details = `Approved adding book "${book.title}" by ${book.author}`;
        }else if (reqData.type === "delete_book"){
            const bookId= reqData.book_data
            await pool.query("DELETE FROM books WHERE id=$1", [bookId])

            actionType = "APPROVE_DELETE_BOOK";
            details = `Approved deleting book with ID ${bookId}`;
        }

        //updating request status
        await pool.query("UPDATE requests SET status='approved' WHERE id=$1", [id]);

        //logging admin action
        await pool.query(`
         INSERT INTO actions_log (admin_id, action_type, details)
         VALUES ($1, $2, $3)
        `, [adminId, actionType, details]);

        res.status(200).json({ success: true, message: "Request approved successfully" });
    } catch (err) {
        console.log("Error in approveRequest controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const rejectRequest= async (req, res)=>{
    const { id } = req.params
    try {
        await pool.query("UPDATE requests SET status='rejected' WHERE id = $1", [id])
    } catch (err) {
        console.log("Error in rejectRequest controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const updateUserRole= async (req, res)=>{
    const {id}= req.params
    const {role}= req.body

    const validateRoles= ["admin", "librarian", "student"]
    if(!validateRoles){
        return res.status(400).json({ success: false, message: "Invalid role" });
    }
    try {
        const result= await pool.query(
            "UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2 RETURNING id, name, email, role",[role, id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({success: true, message: `User role updated to ${role}`, user: result.rows[0],});
    } catch (err) {
        console.log("Error in updateUserRole controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getActionLogs= async (req, res)=>{
    try {
        const result= await pool.query(`
          SELECT a.*, u.name AS admin_name
          FROM actions_log a
          LEFT JOIN users u ON a.admin_id= u.id
          ORDER BY a.created_at DESC
        `)

        res.status(200).json({ success: true, logs: result.rows });
    } catch (err) {
        console.log("Error in getActionLogs controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const revokeRequest= async (req, res)=>{
    const {id}= req.params
    const adminId= req.user.id
    try {
        const result= await pool.query("SELECT * FROM requests WHERE id= $1", [id])
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

            await pool.query(`INSERT INTO actions_log (admin_id, action_type, details) VALUES($1, $2, $3)`,
             [adminId, "REVOKE_ADD_BOOK", `Revoked previously approved addition of book "${book.title}`]
            )
        }else if (request.type === "delete_book"){
            await pool.query(`INSERT INTO actions_log (admin_id, action_type, details) VALUES ($1, $2, $3)`,
             [adminId, "REVOKE_DELETE_BOOK", `Revoked delete approval for book ID ${request.book_data}`]
            )
        }

        await pool.query("UPDATE requests SET revoked = TRUE WHERE id = $1", [id])

        res.status(200).json({ success: true, message: "Request revoked successfully" });
    } catch (err) {
        console.log("Error in revokeRequest controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}