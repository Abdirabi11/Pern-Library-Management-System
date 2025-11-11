import express from "express"
import { approveRequest, getActionLogs, getRequests, getSingleActionlog, getSingleRequest, rejectRequest, revokeRequest, updateUserRole } from "../controller/admin.controller.js";
import { getBorrowedVsReturned, getMonthlyBorrowStats, getRequestTrends, getSystemUsage } from "../controller/Analytics.controller.js";
import { getActiveUsers, getDashboardStats, getTopBorrowedBooks } from "../controller/dashboard.controller.js";
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

//Dashboard-routes
router.get("/getStats", protectedRoute, authorizeRoles("admin"), getDashboardStats)
router.get("/getTopBorrowed", protectedRoute, authorizeRoles("admin"), getTopBorrowedBooks)
router.get("/getActive", protectedRoute, authorizeRoles("admin"), getActiveUsers)

//Analytic-routes
router.get("/borrowStats", protectedRoute, authorizeRoles("admin"), getMonthlyBorrowStats)
router.get("/getRequestTrends", protectedRoute, authorizeRoles("admin"), getRequestTrends)
router.get("/borrowedReturned", protectedRoute, authorizeRoles("admin"), getBorrowedVsReturned)
router.get("/systemUsage", protectedRoute, authorizeRoles("admin"), getSystemUsage)





export default router;