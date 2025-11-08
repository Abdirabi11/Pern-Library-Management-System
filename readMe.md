🧩 Library Management System API








🌟 First Impression

Welcome to the Library Management System API!
This backend is secure, modular, and role-based with logging and request approval workflows.
It’s designed for admins, librarians, and students to manage books, authors, and borrowing seamlessly.

🔑 Tech Stack

Node.js & Express – Server & API

PostgreSQL – Relational Database

JWT & bcryptjs – Authentication & Password Security

uuid – Unique Identifiers

dotenv – Environment Configuration

📚 Features & Roles
Admin

Add, edit, delete books directly

Approve/reject librarian requests

Access action logs

Librarian

Request to add or delete books

Actions logged for accountability

Student

Borrow and return books

View borrowed books

Requests logged for admin approval

Extra Features

🔐 Role-based access control

📝 Audit logging for all critical actions

🌱 Clean folder structure for easy maintenance

🧱 Setup & Installation
1️⃣ Clone the Repository
git clone https://github.com/abdirabi11/Pern-Library-Management-System.git
cd library-management-system

2️⃣ Install dependencies
npm install

3️⃣ Set up environment variables

Create .env:

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_NAME=your_db_name
DB_PORT=5432
JWT_SECRET=your_jwt_secret
NODE_ENV=development

4️⃣ Run the server
npm run dev

5️⃣ Test endpoints

Use Postman or Insomnia.
Protected routes require Bearer token.

📚 API Overview
Auth 🔑
Method	Endpoint	Roles	Description
POST	/signup	all	Register new user
POST	/login	all	Login user
POST	/logout	all	Logout user
GET	/me	authenticated	Get current user info
Books 📖
Method	Endpoint	Roles	Description
GET	/get-book	all	List all books
GET	/get-book/:uuid	all	Get book by UUID
POST	/add-book	admin	Add a book
PUT	/edit-book/:uuid	admin	Edit a book
DELETE	/remove-book/:uuid	admin	Delete a book
Librarian Requests 📝
Method	Endpoint	Roles	Description
POST	/request-add	librarian	Request to add a book
POST	/request-delete/:uuid	librarian	Request to delete a book
Student Borrowing 📚
Method	Endpoint	Roles	Description
POST	/borrow-book/:uuid	student	Borrow a book
POST	/return-book/:uuid	student	Return a borrowed book
GET	/borrowed-book	student	View borrowed books
🗂️ Folder Structure
├─ controllers/
│   ├─ admin.controller.js
│   ├─ auth.controller.js
│   ├─ book.controller.js
│   ├─ librarian.controller.js
│   └─ student.controller.js
├─ middleware/
│   ├─ authorizeRoles.js
│   └─ protectedRoute.js
├─ routes/
│   ├─ authRoutes.js
│   └─ bookRoutes.js
├─ utils/
│   └─ validators.js
├─ config/
│   └─ db.js
└─ server.js

🌟 Action Logging

All critical actions are recorded in actions_log with:

Action type

Performer (UUID + Name)

Entity affected

Timestamp.

🧑‍💻 Author

👤 Abdirabi Yusuf Adan
Junior Full-Stack Developer | Focused on MERN & PostgreSQL
🌐 GitHub

💼 Passionate about building scalable and secure backend systems.

📜 License

This project is licensed under the MIT License – feel free to use and modify it.