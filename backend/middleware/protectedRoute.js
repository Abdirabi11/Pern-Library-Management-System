import jwt from "jsonwebtoken"

export const protectedRoute= async(req, res, next)=>{
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.accessToken
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};