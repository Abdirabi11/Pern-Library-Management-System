import express from "express"
import { 
    addBook, 
    editBook, 
    removebook, 
    getBooks, 
    getBookByUuid
} from "../controller/book.controller.js";
import { requestAddBook, requestDeleteBook } from "../controller/librarian.controller.js";
import { borrowBook, getBorrowedBook } from "../controller/student.controller.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router()

router.get("/get-book", getBooks)
router.get("/get-book/:uuid", getBookByUuid)

// Only admin can add, edit, or delete directly
router.post("/add-book", protectedRoute, authorizeRoles("admin"), addBook)
router.put("/edit-book/:uuid",protectedRoute, authorizeRoles("admin"), editBook)
router.delete("/remove-book/:uuid", protectedRoute, authorizeRoles("admin"), removebook)

// Librarian requests
router.post("/request-add", protectedRoute, authorizeRoles("librarian"), requestAddBook)
router.post("/request-delete/:uuid", protectedRoute, authorizeRoles("librarian"), requestDeleteBook)

// Student borrow-routes
router.post("/borrow-book/:uuid", protectedRoute, authorizeRoles("student"), borrowBook)
router.get("/borrowed-book", protectedRoute, authorizeRoles("student"), getBorrowedBook)


export default router;