import express from "express"
import { approveRequest, getActionLogs, getAllRequests, rejectRequest, revokeRequest, updateUserRole } from "../controller/admin.controller.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router()

//admin-route
router.get("/requests", protectedRoute, authorizeRoles("admin"), getAllRequests);
router.post("/requests/:id/approve", protectedRoute, authorizeRoles("admin"), approveRequest);
router.put("/requests/:id/reject", protectedRoute, authorizeRoles("admin"), rejectRequest);
router.put("/users/:id/role", protectedRoute, authorizeRoles("admin"), updateUserRole);

router.post("/requests/:id/revoke", protectedRoute, authorizeRoles("admin"), revokeRequest);

//admin logs
router.get("/logs", protectedRoute, authorizeRoles("admin"), getActionLogs);



export default router;