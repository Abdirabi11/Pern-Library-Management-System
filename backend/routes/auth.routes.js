import express from "express"
import { getUser, login, logout, signup } from "../controller/auth.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", protectedRoute,  getUser)

export default router;