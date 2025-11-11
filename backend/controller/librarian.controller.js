import { pool } from "../config/db.js"
import { AppError } from "../utils/appError.js";
import { isValidUUID } from "../utils/validators.js";

///* Librarian: handles check-ins, checkouts, and fines

export const requestAddBook= async (req, res)=>{
    try {
        const { title, description, author, publishedYear, totalCopies, availableCopies, coverImage } = req.body;
        if(!title || !author || !description || !publishedYear || !totalCopies || !availableCopies || !coverImage
            ){
                throw new AppError("All fields must be filled", 400);     
        }
        const requesterUuid = req.user?.uuid;
        const librarianUuid= req.user?.uuid

        await pool.query(`INSERT INTO requests (requester_uuid, request_type, book_data, remarks)
         VALUES ($1, $2, $3, $4)`,
         [
            requesterUuid, 
            "add_book", 
            JSON.stringify({ title, description, author, publishedYear, totalCopies, coverImage, availableCopies }),
            `Request to add book: ${title}`
         ]
        )

        await pool.query(
            `INSERT INTO actions_log (librarian_uuid, action_type, details)
             VALUES ($1, $2, $3)`,
            [librarianUuid, "REQUEST_ADD_BOOK", `Librarian ${req.user.name} (UUID:${librarianUuid}) requested to add book name: ${title} by ${author}`]
        );
        res.status(201).json({ success: true, message: "Request sent to admin for approval" });
    } catch (err) { 
        console.log("Error in requestAddBook:", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const requestDeleteBook= async (req, res)=>{
    const {uuid}= req.params
    const requesterUuid = req.user?.uuid;
    const librarianUuid= req.user?.uuid
    try {
        if (!isValidUUID(uuid))  throw new AppError("Invalid UUID format", 400);
        const bookResult = await pool.query(
            "SELECT title FROM books WHERE uuid = $1",
            [uuid]
        );

        if (bookResult.rows.length === 0) throw new AppError("Book not found", 404)
        const bookName= bookResult.rows[0].title;

        await pool.query(`INSERT INTO requests (requester_uuid, request_type, book_data, remarks) 
         VALUES($1, $2, $3, $4)`, 
         [requesterUuid, "delete_book", JSON.stringify({ book_name: bookName, book_uuid: uuid }), `Request to delete book's name: ${bookName}`]
        )

        await pool.query(
            `INSERT INTO actions_log (librarian_uuid, action_type, details)
             VALUES ($1, $2, $3)`,
            [librarianUuid, "Request_delete_book", `Librarian ${req.user.name} (UUID:${librarianUuid}) requested to remove book's name: ${bookName}`]
        );
        res.status(201).json({success: true, message: "Request to delete book sent to admin for approval." });
    } catch (err) {
        console.log("Error in requestDeleteBook:", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}