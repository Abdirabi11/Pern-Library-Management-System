import { pool } from "../config/db.js";
import { bookSeeds } from "../../bookData.js";

const seedBooks = async () => {
    try {
        console.log("📚 Seeding books...");
        for(const book of bookSeeds){
            const { title, author, description, category, publishedYear, totalCopies, availableCopies, coverImage }=book

            const existingAuthor = await pool.query("SELECT uuid, name FROM authors WHERE name = $1", [author]);

            let authorUuid;
            let authorName
            
            if(existingAuthor.rows.length >0){
                authorUuid = existingAuthor.rows[0].uuid;
                authorName= existingAuthor.rows[0].name
            }else{
                const authorResult = await pool.query(
                    "INSERT INTO authors (name) VALUES ($1) RETURNING uuid, name",
                    [author]
                );
                authorUuid = authorResult.rows[0].uuid;
                authorName= authorResult.rows[0].name
            }

            await pool.query(
                `INSERT INTO books (title, author_uuid, author_name, description, category, published_year, total_copies, available_copies, cover_image)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [title, authorUuid, authorName, description, category, publishedYear, totalCopies, availableCopies, coverImage]
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