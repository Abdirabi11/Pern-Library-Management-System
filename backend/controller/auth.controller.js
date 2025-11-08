import { pool } from "../config/db.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid";

export const signup= async (req, res)=>{
    const {name, email, password}= req.body;
    try {
        if(!name || !email || !password){
            return res.status(400).json({success: false, message: "All fields required"})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
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

        const token= jwt.sign({ uuid: newUser.uuid, role: newUser.role, name: newUser.name }, 
            process.env.JWT_SECRET,{ expiresIn: "15m" }
        )

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: newUser
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
        }

        const userResult= await pool.query("SELECT * FROM users WHERE email = $1", [email])

        const user= userResult.rows[0]
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
          }

        const isPasswordCorrect= await bcrypt.compare(password, user.password_hash)
        if(!isPasswordCorrect){
            return res.status(400).json({success: false, message:"inavlid credentials"})
        }

        const token= jwt.sign({uuid: user.uuid,name: user.name, role: user.role}, process.env.JWT_SECRET, {
            expiresIn:"15m"
        })

        res.cookie("token", token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15min
        })

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (err) {
        console.log("Error in signup controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const logout= async (req, res)=>{
    try {
        res.clearCookie("token", {path: "/"})
        res.status(200).json({success: true, message: "Logged out successfully"})
    } catch (err) {
        console.log("Error in logout controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" }); 
    }
}

export const getUser= async(req, res)=>{
    try {
        const userUuid = req.user.uuid;

        const result = await pool.query("SELECT * FROM users WHERE uuid= $1", [userUuid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({success: true, user: result.rows[0]})
    } catch (err) {
        console.log("Error in getUser controller", err.message);
		res.status(500).json({ success: false, message: "Internal server error" }); 
    }
}