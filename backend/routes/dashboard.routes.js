import express from "express"
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { getBorrowedVsReturned, getMonthlyBorrowStats, getRequestTrends, getSystemUsage } from "../controller/Analytics.controller.js";
import { getActiveUsers, getDashboardStats, getTopBorrowedBooks } from "../controller/dashboard.controller.js";

const router = express.Router()

//Dashboard-routes
router.get("/getStats", protectedRoute, authorizeRoles("admin"), getDashboardStats);
router.get("/getTopBorrowed", protectedRoute, authorizeRoles("admin"), getTopBorrowedBooks);
router.get("/getActive", protectedRoute, authorizeRoles("admin"), getActiveUsers);

//Analytic-routes
router.get("/borrowStats", protectedRoute, authorizeRoles("admin"), getMonthlyBorrowStats);
router.get("/getRequestTrends", protectedRoute, authorizeRoles("admin"), getRequestTrends);
router.get("/borrowedReturned", protectedRoute, authorizeRoles("admin"), getBorrowedVsReturned);
router.get("/systemUsage", protectedRoute, authorizeRoles("admin"), getSystemUsage);

export default router;