import express from "express"
import { 
    addBook, 
    editBook, 
    removebook, 
    getBooks, 
    requestAddBook, 
    requestDeleteBook, 
    getBookById
} from "../controller/book.controller.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router()

router.get("/get-book", getBooks)
router.get("/get-book/:id", getBookById)

// Only admin can add, edit, or delete directly
router.post("/add-book", protectedRoute, authorizeRoles("admin"), addBook)
router.put("/edit-book/:id",protectedRoute, authorizeRoles("admin"), editBook)
router.delete("/remove-book/:id", protectedRoute, authorizeRoles("admin"), removebook)

// Librarian requests
router.post("/request-add", protectedRoute, authorizeRoles("librarian"), requestAddBook)
router.post("/request-delete/:id", protectedRoute, authorizeRoles("librarian"), requestDeleteBook)

export default router;