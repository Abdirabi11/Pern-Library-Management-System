import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"
import bookRoutes from "./routes/book.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import { errorHandler } from "./middleware/errorHandler.js"

dotenv.config()
const app= express()
const PORT= process.env.PORT || 5006

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/admin/dashboard", dashboardRoutes)

app.use(errorHandler);

app.listen(PORT, ()=>{
    console.log("Server running on:" + PORT)
})
