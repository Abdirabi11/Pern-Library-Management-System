import { pool } from "../config/db.js"

export const findOrCreateAuthor = async (name) => {
    const existing = await pool.query("SELECT uuid FROM authors WHERE name = $1", [name]);
    if (existing.rows.length > 0) return existing.rows[0].uuid;
  
    const result = await pool.query("INSERT INTO authors (name) VALUES ($1) RETURNING uuid", [name]);
    return result.rows[0].uuid;
  };
  