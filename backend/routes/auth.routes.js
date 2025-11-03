import express from "express"
import { approveRequest, getAllRequests } from "../controller/admin.controller.js";
import { getUser, login, logout, signup } from "../controller/auth.controller.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { protectedRoute } from "../middleware/protectedRoute.js";


const router = express.Router()

router.post("/signup", signup)
router.post("/login", login),
router.post("/logout", logout)
router.get("/me",protectedRoute,  getUser)

router.get("/requests", protectedRoute, authorizeRoles("admin"), getAllRequests);
router.put("/requests/:id/approve", protectedRoute, authorizeRoles("admin"), approveRequest);


export default router;