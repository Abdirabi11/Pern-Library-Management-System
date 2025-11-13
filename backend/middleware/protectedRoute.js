import jwt from "jsonwebtoken"
import { redisClient } from "../config/redis.js";

export const protectedRoute= async(req, res, next)=>{
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.token
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
}
 
export const refreshToken= async (req, res)=>{
    const token= req.cookies?.refreshToken;
    if(!token){
        return res.status(401).json({ success: false, message: "Refresh token missing" });
    }
    try {
        const decoded= jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const storedToken= await redisClient.get(`refresh:${decoded.uuid}`);

        if (storedToken !== token) {
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        };

        const newAccessToken= jwt.sign(
            {uuid: user.uuid, role: decoded.role, name: decoded.name},
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );
        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        });
      
        res.status(200).json({ success: true, token: newAccessToken });
    } catch (err) {
        console.log("Error in refreshToken controller:", err.message);
        return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }
}
