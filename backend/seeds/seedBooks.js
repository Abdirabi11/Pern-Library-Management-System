import { pool } from "../config/db.js";
import { bookSeeds } from "../../bookData.js";

const seedBooks = async () => {
    try {
        console.log("📚 Seeding books...");
        for(const book of bookSeeds){
            const { title, author, description, publishedYear, totalCopies, availableCopies, coverImage }=book

            const existingAuthor = await pool.query("SELECT id FROM authors WHERE name = $1", [author]);
            let authorId;
            
            if(existingAuthor.rows.length >0){
                authorId = existingAuthor.rows[0].id;
            }else{
                const authorResult = await pool.query(
                    "INSERT INTO authors (name) VALUES ($1) RETURNING id",
                    [author]
                );
                authorId = authorResult.rows[0].id;
            }

            await pool.query(
                `INSERT INTO books (title, author_id, description, published_year, total_copies, available_copies, cover_image)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [title, authorId, description, publishedYear, totalCopies, availableCopies, coverImage]
            );
        }

        console.log("Books seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding books:", err.message);
        process.exit(1);
    }
}

seedBooks()