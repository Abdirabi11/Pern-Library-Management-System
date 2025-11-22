import { pool } from "../config/db.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../config/redis.js";

const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

export const signup= async (req, res)=>{
    const {name, email, password}= req.body;
    try {
        if(!name || !email || !password){
            return res.status(400).json({success: false, message: "All fields required"})
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            return res.status(400).json({ success: false, message: "Invalid email" });
        }
        
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)){
            return res.status(400).json({ 
                message:"Password must be at least 8 characters long, include upper & lowercase letters, a number, and a special character."
            });
        }

        const existingUser= await pool.query("SELECT * FROM users WHERE email=$1",[email])
        if(existingUser.rows.length > 0){
            return res.status(400).json({success: false, message: "User existis already"})
        }

        const salt= await bcrypt.genSalt(12)
        const hashedPassword= await bcrypt.hash(password, salt)

        const newUuid = uuidv4(); 

        const result= await pool.query(
            "INSERT INTO users (uuid, name, email, password_hash) VALUES ($1,$2,$3,$4) RETURNING *",
            [newUuid, name, email, hashedPassword]
        )

        const newUser = result.rows[0];

        const accessToken = jwt.sign(
            { uuid: newUser.uuid, name: newUser.name, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRES }
        );
      
        const refreshToken = jwt.sign({ uuid: newUser.uuid }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES,
        });

        await redisClient.set(`refresh:${newUser.uuid}`, refreshToken, { ex: REFRESH_TOKEN_TTL });

        res.cookie("accessToken", accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15min
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TOKEN_TTL * 1000,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: accessToken,
            user: { uuid: newUser.uuid, name: newUser.name, email: newUser.email, role: newUser.role },
        });
    } catch (err) {
        console.log("Error in signup controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const login= async (req, res)=>{
    try {
        const {email, password}= req.body;
        if(!email || !password){
            return res.status(400).json({success: false, message: "All fields are required"})
        };

        const userResult= await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user= userResult.rows[0];
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        };

        const valid= await bcrypt.compare(password, user.password_hash);
        if(!valid){
            return res.status(400).json({success: false, message:"inavlid credentials"})
        };

        const accessToken = jwt.sign(
            { uuid: user.uuid, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRES }
        );
      
        const refreshToken = jwt.sign({ uuid: user.uuid }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES,
        });

        await redisClient.set(`refresh:${user.uuid}`, refreshToken, { ex: REFRESH_TOKEN_TTL });

        res.cookie("accessToken", accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15min
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TOKEN_TTL * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: { uuid: user.uuid, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.log("Error in signup controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const logout= async (req, res)=>{
    try {
        const userUuid = req.user?.uuid;
        if (userUuid) await redisClient.del(`refresh:${userUuid}`);

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        console.log("Error in logout controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" }); 
    }
}

export const refreshToken = async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res.status(401).json({ success: false, message: "Refresh token missing" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const storedToken = await redisClient.get(`refresh:${decoded.uuid}`);
      if (storedToken !== token)
        return res.status(403).json({ success: false, message: "Invalid refresh token" });

        const userResult = await pool.query("SELECT uuid, name, role FROM users WHERE uuid = $1", [decoded.uuid]);
        const user = userResult.rows[0];
        if (!user) return res.status(404).json({ success: false, message: "User not found during refresh" });

      const newAccessToken = jwt.sign(
        { uuid: user.uuid, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES }
      );
  
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });
  
      res.status(200).json({
         success: true,
         token: newAccessToken,   
         user: { uuid: user.uuid, name: user.name, role: user.role } 
        });
    } catch (err) {
      console.error("Error in refreshToken controller:", err.message);
      res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }
};
  

export const getUser= async(req, res)=>{
    try {
        const userUuid = req.user.uuid;

        const result = await pool.query("SELECT * FROM users WHERE uuid= $1", [userUuid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        };
        res.status(200).json({success: true, user: result.rows[0]})
    } catch (err) {
        console.log("Error in getUser controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" }); 
    }
};