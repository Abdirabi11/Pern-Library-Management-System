import { pool } from "../config/db.js"


export const addBook= async (req, res)=>{
    const {
        title, author, description, publishedYear, totalCopies, availableCopies, coverImage
    }= req.body
    try {
       if(
            !title || 
            !author || 
            !description || 
            !publishedYear || 
            !totalCopies || 
            !availableCopies ||
            !coverImage
        ){
            return res.status(401).json({success: false, message: "All fields must be filled"})        
        }

        const authorResult = await pool.query(
            "INSERT INTO authors (name) VALUES ($1) RETURNING id",
            [author]
        );

        const authorId = authorResult.rows[0].id;

        const result = await pool.query(
            `INSERT INTO books (title, author_id, description, published_year, total_copies, available_copies, cover_image) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [title, authorId, description, publishedYear, totalCopies, availableCopies, coverImage]
        );
      
        res.status(201).json({ success: true, message: "Book added successfully", book: result.rows[0] });
    } catch (err) {
        console.log("Error in addBook controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getBooks= async (req, res)=>{
    try {
        const result= await pool.query("SELECT * FROM books")

        res.status(200).json({
            success: true,
            requests: result.rows
        });
    } catch (err) {
        console.log("Error in requestDeleteBook controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getBookById= async (req, res)=>{
    const {id}= req.params
    try {
        const result= await pool.query("SELECT * FROM books where id= $1", [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }
        res.status(200).json({ success: true, book: result.rows[0] });
    } catch (err) {
        console.log("Error in getBookById controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const editBook= async(req, res)=>{
    const {bookId}= req.params
    const updates= req.body
    try {
        const existingBook= await pool.query("SELECT * FROM books WHERE bookId= $1", [bookId])
        if (existingBook.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        const fields=[]
        const values= []
        let index= 1

        for (const key in updates){
            fields.push(`${key}= $${index}`)
            values.push(updates[key])
            index++
        }
        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        values.push(bookId)

        const result= await pool.query(`
            UPDATE booka SET ${fields.join(", ")} WHERE id= $${index} RETURNING *`, values
        )

        res.status(200).json({success: true, message:"Book updated successfully", book: result.rows[0],})
    } catch (err) {
        console.log("Error in editBook controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const removebook= async (req, res)=>{
    const {id}= req.params
    try {
        const existingBook= await pool.query("SELECT * FROM books WHERE id= $1", [id])
        if(existingBook.rows.length === 0){
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        await pool.query("DELETE FROM books WHERE id= $1", [id])

        res.status(200).json({success: true, message: "Book deleted successfully"})

    } catch (err) {
        console.log("Error in removebook controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const requestAddBook= async (req, res)=>{
    try {
        const { title, description, author, publishedYear, totalCopies, coverImage } = req.body;

        const librarianId= req.user.id

        await pool.query(`INSERT INTO requests (librarian_id, type, book_data, message)
         VALUES ($1, $2, $3, $4)`,
         [
            librarianId, 
            "add_book", 
            JSON.stringify({ title, description, author, publishedYear, totalCopies, coverImage }),
            `Request to add book: ${title}`
         ]
        )
        res.status(201).json({ success: true, message: "Request sent to admin for approval" });
    } catch (err) { 
        console.log("Error in requestAddBook:", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const requestDeleteBook= async (req, res)=>{
    const {id}= req.params
    const librarianId= req.user.id
    try {
        await pool.query(`INSERT INTO requests (librarian_id, type, book_data, message) 
         VALUES($1, $2, $3, $4)`, 
         [librarianId, "delete_book", id, `Request to delete book ID: ${id}`]
        )

        res.status(201).json({
            success: true,
            message: "Request to delete book sent to admin for approval."
        });
    } catch (err) {
        console.log("Error in requestDeleteBook:", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


