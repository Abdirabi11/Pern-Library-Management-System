import { pool } from "../config/db.js"
import { v4 as uuidv4 } from "uuid";
import { isValidUUID } from "../utils/validators.js";
import { AppError } from "../utils/appError.js";

export const borrowBook= async (req, res)=>{
    const {uuid: bookUuid}= req.params;
    const requesterUuid = req.user?.uuid;
    const requesterName = req.user?.name;
    const requesterRole = req.user?.role;
    try {
        if (!isValidUUID(bookUuid)) throw new AppError("Invalid UUID format", 400);
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
        );
        const requestUuid = requestResult.rows[0].uuid;
        await pool.query(`
            INSERT INTO borrowed_records (request_uuid, book_uuid, book_title, user_uuid, status, remarks, role)
            VALUES($1, $2, $3, $4, $5, $6, $7)
        `, [
            requestUuid, 
            bookUuid, 
            book.title, 
            requesterUuid, 
            'pending', 
            `Student ${requesterName} Request to borrow: ${book.title}`, 
            requesterRole
        ])

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
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getBorrowedBook= async (req, res)=>{
    const studentUuid = req.user?.uuid;
    try {
        const result= await pool.query(`
            SELECT 
                b.uuid,
                b.user_uuid,
                b.book_uuid,
                b.book_title,
                b.status,
                b.role,
                b.remarks,
                b.borrowed_date,
                b.created_at
                FROM borrowed_records b
                WHERE b.user_uuid = $1
                ORDER BY b.created_at DESC
        `, [studentUuid]);
        if (result.rows.length === 0) {
            return res.status(200).json({ success: true, borrowedBooks: [] });
        };
        res.status(200).json({ success: true, borrowedBooks: result.rows });
    } catch (err) {
        console.log("Error in borrowBook controller", err.message);
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const returnBook= async (req, res)=>{
    const {recordUuid}= req.params;
    const performerUuid= req.user?.uuid;
    const performarName= req.user?.name;
    const perfomerRole= req.user?.role;

    console.log("Returning book:", { recordUuid, performerUuid });

    try {
        if (!isValidUUID(recordUuid))  throw new AppError("Invalid UUID format", 400);

        //checking if this student has borrowed the book and it's not already returned
        const borrowedBookResult=  await pool.query(`
            SELECT br.book_uuid, br.status, b.title
            FROM borrowed_records br
            JOIN books b ON br.book_uuid = b.uuid
            WHERE br.uuid = $1 AND br.user_uuid = $2
        `,[recordUuid, performerUuid]);

        if(borrowedBookResult.rows.length === 0) throw new AppError("You have not borrowed this book", 404);
        const borrowedBook = borrowedBookResult.rows[0];
        if (borrowedBook.status === "returned")  throw new AppError("This book has already been returned", 400);

        // Updating borrowed_records status to 'returned'
        await pool.query(`
            UPDATE borrowed_records
            SET status = 'returned', return_date = NOW()
            WHERE uuid = $1 AND user_uuid = $2
        `, [recordUuid, performerUuid]);

         //increment available copies in books table
        await pool.query(`
            UPDATE books 
            SET available_copies = available_copies + 1
            WHERE uuid = $1
        `, [borrowedBook.book_uuid]) 

        //loging into actions_log
        await pool.query(`
            INSERT INTO actions_log (action_type, details, entity_type, entity_uuid, performed_by, performer_name, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                "return_book",
                `Student ${performarName} returned book ${borrowedBook.title}`,
                "book",
                borrowedBook.book_uuid,
                performerUuid,
                performarName,
                perfomerRole
            ]
        );
        res.status(200).json({success: true, message:  `Book ${borrowedBook.title} returned successfully`});
    } catch (err) {
        console.log("Error in returnBook controller", err.message);
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}