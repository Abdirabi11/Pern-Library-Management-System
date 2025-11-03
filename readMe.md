📚 Library Management System (LMS)

A role-based Library Management System built using Express.js and PostgreSQL.
It includes multi-layer authentication and authorization, allowing Admins, Librarians, and Users to interact through different permission levels.

🚀 Features
🧑‍💼 Role-Based Access Control

Admin – Full access to manage users, books, and librarian requests.

Librarian – Can view and edit books, and send requests to the admin to add or delete books.

User – Can browse and view books.

📖 Core Functionalities

User Authentication: Signup, login, logout, and protected routes with JWT.

Role Authorization: Middleware-based control using authorizeRoles().

Book Management:

Admins can directly add, edit, or delete books.

Librarians can send requests for book addition or deletion (requires admin approval).

Request Management:

Librarians create requests for adding or removing books.

Admins can approve, reject, or revoke those requests.

Action Logs: Admin can track system actions for transparency.

🏗️ Tech Stack
Layer	Technology
Backend	Node.js, Express.js
Database	PostgreSQL (via pgAdmin 4)
Auth	JWT (JSON Web Token)
ORM / Query	SQL Queries (manual via pg package or raw SQL)
Environment	dotenv
🗂️ Database Structure

I created a database called library_management_system in pgAdmin 4.
It contains 7 main tables:

Table	Description
users	Stores user details and roles (admin, librarian, user).
books	Contains all book details.
borrow_records	(Optional) Keeps track of borrowed books.
requests	Stores librarian requests to add or remove books.
logs	Tracks admin actions (approvals, rejections, updates).
roles	Defines user roles.
permissions	Maps roles to their allowed actions.
⚙️ API Routes Overview
🔑 Auth Routes (/api/auth)
Method	Endpoint	Access	Description
POST	/signup	Public	Create new user
POST	/login	Public	Login and get JWT
POST	/logout	Authenticated	Logout user
GET	/me	Authenticated	Get logged-in user data
📚 Book Routes (/api/books)
Method	Endpoint	Access	Description
GET	/get-book	Public	Get all books
GET	/get-book/:id	Public	Get book by ID
POST	/add-book	Admin	Add a new book
PUT	/edit-book/:id	Admin	Edit a book
DELETE	/remove-book/:id	Admin	Delete a book
POST	/request-add	Librarian	Request to add a new book
POST	/request-delete/:id	Librarian	Request to delete a book
🧑‍💼 Admin Routes (/api/admin)
Method	Endpoint	Access	Description
GET	/requests	Admin	Get all pending librarian requests
POST	/requests/:id/approve	Admin	Approve librarian request
PUT	/requests/:id/reject	Admin	Reject librarian request
POST	/requests/:id/revoke	Admin	Revoke a previously approved request
PUT	/users/:id/role	Admin	Update a user’s role
GET	/logs	Admin	View action logs
🔐 Middlewares
protectedRoute

Verifies JWT token.

Ensures user is authenticated before accessing protected endpoints.

authorizeRoles(...roles)

Restricts route access to specific roles (e.g., "admin", "librarian").

🧠 How Authentication Works

User signs up / logs in → receives a JWT token.

The token is sent in Authorization header as Bearer <token>.

protectedRoute middleware validates the token and attaches user info to the request.

authorizeRoles() checks the user’s role to determine access level.

Admins can directly manage data, while Librarians must request admin approval for restricted actions.

💾 Setup Instructions
1. Clone the repository
git clone https://github.com/abdirabi11/library-management-system.git
cd library-management-system

2. Install dependencies
npm install

3. Setup environment variables

Create a .env file:

PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/library_management_system
JWT_SECRET=your_jwt_secret

4. Run database (via pgAdmin or psql)

Make sure your PostgreSQL database is running and accessible.

5. Start the server
npm run dev

✅ Testing

You can test all routes using Postman or Thunder Client.
Make sure to:

Register an Admin, Librarian, and User.

Login to get JWT tokens.

Test role-based access for each endpoint.

🧱 Folder Structure
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
 ┗ 📜.env

🧑‍💻 Author

Abdirabi Yusuf Adan
Junior Full-Stack Developer | Focused on MERN & PostgreSQL
🌐 GitHub Profile