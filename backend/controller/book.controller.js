import { pool } from "../config/db.js"
import { v4 as uuidv4 } from "uuid";
import { isValidUUID } from "../utils/validators.js";
import { AppError } from "../utils/appError.js";
import { findOrCreateAuthor } from "../services/authorService.js";

export const addBook= async (req, res)=>{
    const performerUuid= req.user?.uuid;
    const performerName= req.user?.name;
    const role= req.user?.role;

    const {title, author, description, publishedYear, totalCopies, availableCopies, coverImage}= req.body
    try {
       if(!title || !author || !description || !publishedYear || !totalCopies || !availableCopies || !coverImage
        ){
            throw new AppError("All fields must be filled", 400);     
        }

        const authorUuid = await findOrCreateAuthor(author);

        const result = await pool.query(
            `INSERT INTO books (title, author_uuid, description, published_year, total_copies, available_copies, cover_image) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, uuid, title`,
            [title, authorUuid, description, publishedYear, totalCopies, availableCopies, coverImage]
        );

        const bookUuid = result.rows[0].uuid;
        
        await pool.query(
         `INSERT INTO actions_log (action_type, details, entity_type, entity_uuid, performer_name, performed_by, role)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
           [
                "Added_book", 
                `admin ${performerName} Added book: ${title} by ${author}`,
                "book",
                bookUuid,
                performerName,
                performerUuid,
                role,
            ]
        )
        res.status(201).json({ success: true, message: "Book added successfully", data: { book } });
    } catch (err) {
        console.log("Error in addBook controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getAllBooks= async (req, res)=>{
    try {
        const result= await pool.query(`
         SELECT
            b.uuid  AS book_uuid,
            b.title,
            b.description,
            a.name AS author_name,
            a.uuid AS author_uuid,
            b.published_year,
            b.total_copies,
            b.available_copies,
            b.cover_image,
            b.created_at
         FROM books b
         LEFT JOIN authors a ON b.author_uuid = a.uuid
         ORDER BY b.created_at DESC
        `);
        if(result.rows.length === 0) throw new AppError("No book found", 404);
        res.status(200).json({success: true, data: { books: result.rows } });
    } catch (err) {
        console.log("Error in getBooks controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getBookByUuid= async (req, res)=>{
    const {uuid}= req.params
    try {
        if (!isValidUUID(uuid)) throw new AppError("Invalid UUID format", 400);
        const result= await pool.query(`
         SELECT 
            b.uuid,
            b.title,
            b.description,
            a.name AS author_name,
            b.published_year,
            b.total_copies,
            b.available_copies,
            b.cover_image,
            b.created_at,
            a.uuid AS author_uuid
         FROM books b
         LEFT JOIN authors a ON b.author_uuid = a.uuid
         WHERE b.uuid = $1
        `, [uuid])
        if (result.rows.length === 0) throw new AppError("Book not found", 404);
        res.status(200).json({ success: true, data: { book }});
    } catch (err) {
        console.log("Error in getBookById controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const editBook= async(req, res)=>{
    const {uuid}= req.params
    const updates= req.body
    try {
        if (!isValidUUID(uuid)) throw new AppError("Invalid UUID format", 400);
        const existingBook= await pool.query("SELECT * FROM books WHERE uuid= $1", [uuid]);
        if (existingBook.rows.length === 0) throw new AppError("Book not found", 404);

        const columnMap = {
            title: "title",
            description: "description",
            publishedYear: "published_year",
            totalCopies: "total_copies",
            availableCopies: "available_copies",
            coverImage: "cover_image",
        };

        const fields=[]
        const values= []
        let index= 1

        for (const key in updates) {
            const column = columnMap[key];
            if (!column) continue
            fields.push(`${column} = $${index}`);
            values.push(updates[key]);
            index++;
        }
        if (fields.length === 0 && !updates.authorName) throw new AppError("No field to update", 400);

        let authorName = existingBook.rows[0].author_name;
        let authorUuid = existingBook.rows[0].author_uuid;

        if (updates.authorName) {
            authorUuid = await findOrCreateAuthor(updates.authorName);
            authorName = updates.authorName;

            fields.push(`author_name = $${index}`);
            values.push(authorName);
            index++;

            fields.push(`author_uuid = $${index}`);
            values.push(authorUuid);
            index++;
        };
        values.push(uuid);

        const result= await pool.query(`
            UPDATE books SET ${fields.join(", ")} WHERE uuid= $${index} RETURNING *`, values
        );

        const adminUuid= req.user?.uuid;
        const updatedBook= result.rows[0];
        const cleanTitle = updatedBook.title.replace(/\s*\(.*?\)\s*/g, "").trim();

        await pool.query(
            `INSERT INTO actions_log (admin_uuid, book_uuid, action_type, details)
            VALUES($1, $2, $3, $4)`,
            [adminUuid, uuid, "Edited_book", `Edited book: ${cleanTitle} by ${authorName}`]
        );

        res.status(200).json({success: true, message:"Book updated successfully", data: { book }});
    } catch (err) {
        console.log("Error in editBook controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const removeBook= async (req, res)=>{
    const {uuid}= req.params;
    try {
        if (!isValidUUID(uuid)) throw new AppError("Invalid UUID format", 400);
        const existingBook= await pool.query(`
            SELECT 
                b.title,
                a.name AS author_name
            FROM books b
            LEFT JOIN authors a ON b.author_uuid = a.uuid
            WHERE b.uuid = $1
        `, [uuid]);
        if(existingBook.rows.length === 0) throw new AppError("Book not found", 404);

        const { title, author_name } = existingBook.rows[0];

        await pool.query("DELETE FROM books WHERE uuid= $1", [uuid]);

        const adminUuid= req.user?.uuid;

        await pool.query(
            `INSERT into actions_log (admin_uuid, book_uuid, action_type, details)
              VALUES ($1, $2, $3, $4)`,
              [adminUuid, uuid, "Deleted_Book", `Deleted book: ${title} by ${author_name}`]
        );
        res.status(200).json({success: true, message: "Book deleted successfully"});
    } catch (err) {
        console.log("Error in removebook controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

