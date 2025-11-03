import jwt from "jsonwebtoken"

export const protectedRoute= async(req, res, next)=>{
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.token
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: decoded.userId, ...decoded}; // e.g. { userId: 3, iat: ..., exp: ... }
        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}
 
