import express from "express"
import { getUser, login, logout, refreshToken, signup } from "../controller/auth.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router()

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectedRoute, logout);
router.get("/getMe", protectedRoute,  getUser);

router.post("/refresh", refreshToken);

export default router;