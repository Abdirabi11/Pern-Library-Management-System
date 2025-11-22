import {pool} from "../config/db.js"

export const getDashboardStats= async (req, res)=>{
    try {
        const totalUsersResult= await pool.query("SELECT COUNT (*) AS total_users FROM users");
        const totalBooksResult= await pool.query("SELECT COUNT (*) AS total_books FROM books");
        const totalBorrowedResult= await pool.query("SELECT COUNT (*) AS borrowed_books FROM borrowed_records");
        const pendingRequestsResult= await pool.query("SELECT COUNT (*) AS pending_requests FROM requests WHERE status='pending'");
        const approvedRequestsResult= await pool.query("SELECT COUNT (*) AS approved_requests FROM requests WHERE status='approved'");
        const rejectedRequestsResult= await pool.query("SELECT COUNT (*) AS reject_requests FROM requests WHERE status='rejected'");
        const totalActionsResult= await pool.query("SELECT COUNT (*) AS total_actions FROM actions_log");

        const stats= {
            totalUsers: totalUsersResult.rows[0].total_users,
            totalBooks: totalBooksResult.rows[0].total_books,
            totalBorrowed: totalBorrowedResult.rows[0].borrowed_books,
            pendingRequests: pendingRequestsResult.rows[0].pending_requests,
            approvedRequests: approvedRequestsResult.rows[0].approved_requests,
            rejectedRequests: rejectedRequestsResult.rows[0].rejected_requests,
            totalActions: totalActionsResult.rows[0].total_actions
        };
        res.status(200).json({ success: true, stats });
    } catch (err) {
        console.log("Error in getDashboardStats controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getTopBorrowedBooks= async (req, res)=>{
    try {
        const topBorrowed= await pool.query(`
            SELECT b.title, COUNT(*) AS borrow_count
            FROM borrowed_records br
            JOIN books b ON br.book_uuid = b.uuid
            WHERE br.status = 'approved'
            GROUP BY b.title
            ORDER BY borrow_count DESC
            LIMIT 5
        `);
        res.status(200).json({success: true, topBorrow: topBorrowed.rows});
    } catch (err) {
        console.log("Error in getTopBorrowedBooks controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getActiveUsers= async (req, res)=>{
    try {
        const activeUsers= await pool.query(`
            SELECT u.name, COUNT(*) AS borrow_count
            FROM borrowed_records br
            JOIN users u ON br.user_uuid = u.uuid
            WHERE br.status= 'approved'
            GROUP BY u.name
            ORDER BY borrow_count DESC
            LIMIT 5
        `)
        res.status(200).json({success: true, activeUsers: activeUsers.rows});
    } catch (err) {
        console.log("Error in getActiveUsers controller", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}