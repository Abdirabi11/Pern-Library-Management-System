import express from "express"
import { getMonthlyBorrowStats } from "../controller/Analytics.controller.js";
import { 
    addBook, 
    editBook, 
    removeBook, 
    getAllBooks, 
    getBookByUuid
} from "../controller/book.controller.js";
import { requestAddBook, requestDeleteBook } from "../controller/librarian.controller.js";
import { borrowBook, getBorrowedBook, returnBook } from "../controller/student.controller.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { validateBook } from "../middleware/validateBook.js";

const router = express.Router()

router.get("/get-book", getAllBooks)
router.get("/get-book/:uuid", getBookByUuid)

// Only admin can add, edit, or delete directly
router.post("/add-book", protectedRoute, validateBook, authorizeRoles("admin"), addBook)
router.put("/edit-book/:uuid", protectedRoute, validateBook, authorizeRoles("admin"), editBook)
router.delete("/remove-book/:uuid", protectedRoute, authorizeRoles("admin"), removeBook)

// Librarian requests
router.post("/request-add", protectedRoute, authorizeRoles("librarian"), requestAddBook)
router.post("/request-delete/:uuid", protectedRoute, authorizeRoles("librarian"), requestDeleteBook)

// Student borrow-routes
router.post("/monthlyBorrow", protectedRoute, authorizeRoles("student"), getMonthlyBorrowStats)
router.get("/borrowed-book", protectedRoute, authorizeRoles("student"), getBorrowedBook)
router.post("/return-book/:recordUuid", protectedRoute, authorizeRoles("student"), returnBook)


export default router;