import { pool } from "../config/db.js"

export const getMonthlyBorrowStats= async (req, res)=>{
    try {
        const monthlyBorrow= await pool.query(`
            SELECT 
                DATE_TRUNC('month',created_at) AS month,
                COUNT(*) AS total_borrowed
            FROM borrowed_records
            WHERE status= 'approved'
            GROUP BY month
            ORDER BY month
        `);
        res.status(200).json({success: true, monthlyBorrow: monthlyBorrow.rows});
    } catch (err) {
        console.log("Error in getMonthlyBorrowStats controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getRequestTrends= async (req, res)=>{
    try {
        const requestTrends= await pool.query(`
            SELECT 
                DATE_TRUNC('month', created_at) AS month,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
            FROM requests
            GROUP BY month
            ORDER BY month
        `);
        res.status(200).json({success: true, requestTrends: requestTrends.rows});
    } catch (err) {
        console.log("Error in getRequestTrends controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getBorrowedVsReturned= async (req, res)=>{
    try {
        const borrowedVsReturned= await pool.query(`
            SELECT
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS borrowed,
                SUM(CASE WHEN status = 'return' THEN 1 ELSE 0 END) AS returned
            FROM borrowed_records
        `
        );
        res.status(200).json({success: true, borrowedReturned: borrowedVsReturned.rows});
    } catch (err) {
        console.log("Error in getBorrowedVsReturned controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
//Track admin actions or activity volume.
export const getSystemUsage= async (req, res)=>{
    try {
        const systemUsage= await pool.query(`
            SELECT role, COUNT(*) AS total_actions
            FROM actions_log
            GROUP BY role
        `);
        res.status(200).json({success: true, systemUsages: systemUsage.rows});
    } catch (err) {
        console.log("Error in getSystemUsage controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
