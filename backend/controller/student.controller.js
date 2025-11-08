import { pool } from "../config/db.js"
import { v4 as uuidv4 } from "uuid";
import { isValidUUID } from "../utils/validators.js";

export const borrowBook= async (req, res)=>{
    const {uuid: bookUuid}= req.params
    const requesterUuid = req.user?.uuid;
    const requesterName = req.user?.name;
    const requesterRole = req.user?.role

    try {
        if (!isValidUUID(bookUuid)) {
            return res.status(404).json({
              success: false,
              message: "Book not found",
            });
        }

        const bookResult = await pool.query("SELECT title FROM books WHERE uuid=$1", [bookUuid]);
        if (bookResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }
        const book = bookResult.rows[0];

        const requestResult= await pool.query(`
            INSERT INTO requests (requester_uuid, request_type, book_uuid, book_data, remarks, requester_name, requester_role)
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING uuid`,
            [   
                requesterUuid, 
                "borrow_book",
                bookUuid,
                JSON.stringify({title: book.title, book_uuid: bookUuid }),
                `Student ${requesterName} Request to borrow: ${book.title}`,
                requesterName,
                requesterRole,
            ]
        )

        const requestUuid = requestResult.rows[0].uuid;
        
        await pool.query(`
            INSERT INTO borrowed_records (request_uuid, book_uuid, user_uuid, status, remarks, role)
            VALUES($1, $2, $3, $4, $5, $6)
        `, [requestUuid, bookUuid, requesterUuid, 'pending', `Student ${requesterName} Request to borrow: ${book.title}`, requesterRole])

        await pool.query(
            `
            INSERT INTO actions_log 
            (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            `,
            [
              "borrow_book",
              `Student ${requesterName} requested to borrow ${book.title}`,
              "book",         
              bookUuid, 
              requesterName,       
              requesterUuid,   
              requesterRole,           
            ]
          );

        res.status(200).json({success: true, message:`Student request to borrow book name: ${book.title} sent for admin approval.`})
    } catch (err) {
        console.log("Error in borrowBook controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getBorrowedBook= async (req, res)=>{
    const studentUuid = req.user?.uuid
    try {
        const result= await pool.query(`
            SELECT 
                b.uuid,
                b.user_uuid,
                b.book_uuid,
                b.status,
                b.role,
                b.remarks,
                b.borrowed_date,
                b.created_at
                FROM borrowed_records b
                WHERE b.user_uuid = $1
                ORDER BY b.created_at DESC
        `, [studentUuid])

        if(result.rows.length === 0){
            res.status(404).json({success: false, message: "Not borrowed book"})
        }
        res.status(200).json({ success: true, borrowedBooks: result.rows });
    } catch (err) {
        console.log("Error in borrowBook controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const returnBook= async (req, res)=>{
    try {
        
    } catch (error) {
        
    }
}