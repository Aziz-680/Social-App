# 📱 Social App API

A robust, secure, and fully typed RESTful API built for a social media application. This backend handles user authentication, profile management, post creation with pagination, and secure commenting systems using a strict layered architecture (Controllers, Services, Repositories).

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** MongoDB & Mongoose
* **Validation:** Zod
* **Authentication:** JSON Web Tokens (JWT)
* **Security:** Argon2 (Password Hashing)

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (LTS version recommended)
* [Git](https://git-scm.com/)
* [MongoDB](https://www.mongodb.com/) (Local instance or an Atlas cloud URI)

---

## 🚀 Getting Started

Follow these steps to get the development environment running on your local machine.

### 1. Clone the repository
```bash
git clone [https://github.com/Aziz-680/Social-App.git](https://github.com/Aziz-680/Social-App.git)
cd Social-App
```
||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

### 2. Install dependencies

npm install

Express (express): The web framework handling your API routes (like /api/post).

Mongoose (mongoose): The tool that connects your app to your MongoDB database.

Argon2 (argon2): A highly secure password hashing algorithm (often preferred over bcrypt!).

Zod (zod): Your data validation library for securing inputs.

JSON Web Token (jsonwebtoken): For creating and verifying your authentication wristbands (JWTs).

Environment Tools (dotenv, cross-env): For securely loading your .env variables and ensuring your scripts work on both Mac and Windows.

Nodemon (nodemon): The dev tool that automatically restarts your server when you save a file.

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

### 3. Set up Environment Variables

Make your .env file 

# Application Port
PORT=...

# MongoDB Connection String (Replace with your own if using Atlas)
MONGO_URI=...

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key_here

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

### 4. Set up Environment Variables

npm run dev

||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

🌐 Core API Endpoints
Here is a high-level overview of the available routes. Note that protected routes require a valid JWT Bearer token.

### Authentication (Public)
POST /api/auth/register - Create a new user account.

POST /api/auth/login - Authenticate a user and return a JWT.

User Profiles (Protected 🛡️)
GET /api/user/profile - Fetch the logged-in user's profile.

PUT /api/user/profile - Update profile information.

Posts
GET /api/post - Fetch the authenticated user's privacy-filtered feed.

POST /api/post - Create a new post (Protected 🛡️).

DELETE /api/post/:id - Delete a post (Authorized Owners Only 🛡️).

POST /api/post/:id/like - Toggle a like on a post (Protected).

Comments
GET /api/comment/:postId - Fetch comments for a post visible to the authenticated user.

POST /api/comment - Add a comment to a post (Protected 🛡️).

🛡️ Architecture & Security
Layered Design: Routes are guarded by authentication middleware, requests are strictly validated using Zod, and business logic is kept completely separate from database queries using the Repository pattern.

Data Sanitization: Passwords and sensitive data are stripped from API responses before being sent to the client.

Resource Ownership: Users are securely authorized before being allowed to delete or modify posts and comments.

### Frontend API reference

All routes below require the access token in an `Authorization: Bearer YOUR_ACCESS_TOKEN` header or the `token` cookie. Responses use `{ success, message, data, meta }`.

**Users**
- `GET /api/user/profile` — Current user's full profile.
- `GET /api/user/search?q=<term>&page=1&limit=20` — Search users; excludes the current user.
- `GET /api/user/:userId` — Public profile.
- `PUT /api/user/profile` — Update profile fields.
- `POST /api/user/upload-avatar` — Upload a `profilePicture` multipart field.

**Posts and comments**
- `GET /api/post?page=1&limit=10` — Privacy-filtered feed.
- `GET /api/post/user/:userId?page=1&limit=5` — Posts visible on a user's profile.
- `GET /api/post/:id` — Fetch a post if its privacy allows access.
- `POST /api/post` — Create a post using JSON or multipart `content`, `media` (URLs), and `privacy`; multipart uploads may include an `image` file.
- `PUT /api/post/:id` — Edit `content` and/or `privacy` (owner only).
- `DELETE /api/post/:id` — Delete a post (owner only).
- `POST /api/post/:id/like` — Toggle a like.
- `POST /api/post/:id/react` — Set or remove a `like`, `love`, `haha`, `wow`, `sad`, or `angry` reaction.
- `POST /api/post/:id/repost` — Repost a public post.
- `GET /api/comment/:postId` — Fetch comments for a post visible to the current user.
- `POST /api/comment` — Add a comment using JSON `postId` and `content`.

Post privacy values are `public`, `friends`, and `only_me`. Feed and profile post lists include pagination in `meta.pagination`; page size is capped at 50.

**Friends**
- `GET /api/friend` — Current user's friends.
- `GET /api/friend/list/:userId` — A profile's friends.
- `GET /api/friend/status/:userId` — `self`, `friends`, `request_sent`, `request_received`, or `none`.
- `GET /api/friend/requests` and `GET /api/friend/sent-requests` — Incoming and outgoing requests.
- `POST /api/friend/request/:recipientId` — Send a request.
- `POST /api/friend/accept/:senderId` — Accept an incoming request.
- `POST /api/friend/reject/:senderId` — Reject an incoming request or cancel an outgoing one.
- `DELETE /api/friend/:friendId` — Unfriend.
