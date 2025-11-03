📚 Library Management System (LMS)

A Role-Based Library Management System built with Node.js, Express, and PostgreSQL, featuring secure authentication, layered authorization, and a request-approval workflow between librarians and admins.

🌟 Overview

This project provides a multi-role system where:

Admins manage users, books, and librarian requests.

Librarians can edit/view books and request actions (add/delete) that require admin approval.

Users can browse and view available books.

Designed for enterprise-style role separation and scalable backend architecture.

⚙️ Tech Stack
Layer	Technology
Backend Framework	Express.js (Node.js)
Database	PostgreSQL (pgAdmin 4)
Authentication	JSON Web Tokens (JWT)
Environment Management	dotenv
Request Testing	Postman / Thunder Client
🧠 Key Features

✅ JWT Authentication – Secure login, signup, and token-based session control.
✅ Role Authorization – Admin, Librarian, and User roles with custom middleware.
✅ Book Management – CRUD for books, plus librarian request system.
✅ Request Approval Workflow – Librarians send requests to admin for approval or rejection.
✅ Action Logs – Every admin action is recorded for traceability.
✅ PostgreSQL Integration – Full relational structure using pgAdmin 4.

🗂️ Database Structure

Database name: library_management_system

Table	Description
users	User details with roles (admin, librarian, user).
books	Library books data (title, author, etc.).
requests	Requests created by librarians to add or remove books.
logs	Admin action logs (approvals, rejections, role changes).
roles	Role definitions.
permissions	Role-based permissions.
borrow_records	(Optional) Tracks borrowed books and returns.
📦 Folder Structure
📦 library-management-system
 ┣ 📂controller
 ┃ ┣ 📜auth.controller.js
 ┃ ┣ 📜book.controller.js
 ┃ ┗ 📜admin.controller.js
 ┣ 📂middleware
 ┃ ┣ 📜protectedRoute.js
 ┃ ┗ 📜authorizeRoles.js
 ┣ 📂routes
 ┃ ┣ 📜auth.route.js
 ┃ ┣ 📜book.route.js
 ┃ ┗ 📜admin.route.js
 ┣ 📜server.js
 ┣ 📜package.json
 ┗ 📜.env

🔐 Middleware Logic
🧾 protectedRoute

Checks for a valid JWT in the request headers.

Rejects unauthenticated users.

🧰 authorizeRoles(...roles)

Restricts endpoints to users with specific roles.

Example: authorizeRoles("admin") → only admins allowed.

🧩 API Endpoints
🔑 Auth Routes (/api/auth)
Method	Endpoint	Access	Description
POST	/signup	Public	Register new user
POST	/login	Public	Authenticate user
POST	/logout	Authenticated	Logout user
GET	/me	Authenticated	Get logged user info
📚 Book Routes (/api/books)
Method	Endpoint	Access	Description
GET	/get-book	Public	Get all books
GET	/get-book/:id	Public	Get book by ID
POST	/add-book	Admin	Add new book
PUT	/edit-book/:id	Admin	Edit book
DELETE	/remove-book/:id	Admin	Delete book
POST	/request-add	Librarian	Request new book
POST	/request-delete/:id	Librarian	Request book deletion
🧑‍💼 Admin Routes (/api/admin)
Method	Endpoint	Access	Description
GET	/requests	Admin	View all librarian requests
POST	/requests/:id/approve	Admin	Approve request
PUT	/requests/:id/reject	Admin	Reject request
POST	/requests/:id/revoke	Admin	Revoke approved request
PUT	/users/:id/role	Admin	Update user role
GET	/logs	Admin	View all admin action logs
⚡ Authentication Flow
flowchart LR
A[User Sign Up / Login] --> B[JWT Token Created]
B --> C[Token Stored in Cookie / Header]
C --> D[protectedRoute Middleware]
D --> E[authorizeRoles Middleware]
E --> F[Access Granted / Denied]

🧱 Setup & Installation
1️⃣ Clone the Repository
git clone https://github.com/abdirabi11/Pern-Library-Management-System.git
cd library-management-system

2️⃣ Install Dependencies
npm install

3️⃣ Create .env File
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/library_management_system
JWT_SECRET=your_jwt_secret

4️⃣ Run the Server
npm run dev


Server should now run on
👉 http://localhost:5006

🧪 Testing with Postman

Signup as Admin, Librarian, and User.

Login and copy your JWT token.

Send it in the Authorization header as:

Authorization: Bearer <your_token>


Test access levels:

Admin → Full access

Librarian → Limited with request actions

User → Read-only access

🧠 Example Use-Case

A Librarian finds a new book → sends a request to Admin (/request-add).

Admin approves → Book is added to the main collection.

All actions are logged → Admin can review logs anytime.

🧑‍💻 Author

👤 Abdirabi Yusuf Adan
Junior Full-Stack Developer | Focused on MERN & PostgreSQL
🌐 GitHub

💼 Passionate about building scalable and secure backend systems.

📜 License

This project is licensed under the MIT License – feel free to use and modify it.