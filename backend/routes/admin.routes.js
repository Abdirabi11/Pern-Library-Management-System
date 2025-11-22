import express from "express"
import { approveRequest, getActionLogs, getRequests, getSingleActionlog, getSingleRequest, rejectRequest, revokeRequest, updateUserRole } from "../controller/admin.controller.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router()

//Requests
router.get("/requests", protectedRoute, authorizeRoles("admin"), getRequests);
router.get("/requests/:uuid", protectedRoute, authorizeRoles("admin"), getSingleRequest)
router.post("/requests/:uuid/approve", protectedRoute, authorizeRoles("admin"), approveRequest);
router.put("/requests/:uuid/reject", protectedRoute, authorizeRoles("admin"), rejectRequest);

//User-role
router.put("/users/:uuid/role", protectedRoute, authorizeRoles("admin"), updateUserRole);

router.post("/requests/:uuid/revoke", protectedRoute, authorizeRoles("admin"), revokeRequest);

//Action-logs
router.get("/logs", protectedRoute, authorizeRoles("admin"), getActionLogs);
router.get("/logs/:uuid", protectedRoute, authorizeRoles("admin"), getSingleActionlog)

export default router;