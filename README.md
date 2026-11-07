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
* [Node.js](https://nodejs.org/) (version 20 or newer)
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

### 3. Configure local environment

Copy `.env.example` to `.env` and set the required values. The application requires `MONGO_URI`, `ENCRYPTION_KEY`, and four independent JWT secrets (`USER_ACCESS_SECRET`, `USER_REFRESH_SECRET`, `ADMIN_ACCESS_SECRET`, and `ADMIN_REFRESH_SECRET`). The encryption key must be exactly 32 UTF-8 bytes; each JWT secret must be at least 32 bytes. Never commit `.env` or reuse the sample values as production secrets.

Set Cloudinary credentials for image uploads. `GOOGLE_CLIENT_ID` is only needed for Google sign-in. `CORS_ORIGINS` is a comma-separated list of frontend origins; production requires at least one origin. Set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies in front of the app (commonly `1` behind a single load balancer); leave it at `0` when the app is directly exposed.

### 4. Run locally

```bash
npm run dev
```

Create a production build with `npm run build`; `npm start` starts the compiled `dist/main.js` application.

## 🚢 Deployment

The repository includes a multi-stage `Dockerfile` that builds the TypeScript application, installs production dependencies, runs as the non-root Node user, and probes `/health/ready`. Build and run the image with your container platform, then inject the environment values listed in `.env.example` through that platform's secret manager. Do not copy local `.env` files into an image.

Use a managed MongoDB deployment reachable by the application, configure `MONGO_URI`, set `NODE_ENV=production`, `PORT`, `CORS_ORIGINS`, all five cryptographic secrets, and Cloudinary credentials. Keep the encryption key stable across deployments: changing it without migrating encrypted phone numbers makes existing values unreadable. The server waits for MongoDB before listening, exits with a non-zero status if startup fails, handles `SIGINT`/`SIGTERM`, and exposes `/health/live` and `/health/ready` probes.

The API enables standard security headers, limits JSON bodies to 1 MB, limits uploads to one 5 MB image, and rate-limits authentication endpoints. For multiple replicas, also configure rate limiting at a shared gateway or use a shared rate-limit store.

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

**Notifications**
- `GET /api/notification?page=1&limit=20` — Fetch the authenticated user's post activity notifications and unread count.
- `PATCH /api/notification/:id/read` — Mark one notification as read.
- `PATCH /api/notification/read-all` — Mark all notifications as read.

**Direct chat** (all routes require the access token)
- `POST /api/chat/conversations` with `{ "recipientId": "<userId>" }` — Create or return the one-to-one conversation.
- `GET /api/chat/conversations?page=1&limit=30` — List inbox conversations with last message and unread count.
- `GET /api/chat/conversations/:conversationId/messages?before=<ISO date>&limit=30` — Fetch older-first-paginated message history (maximum 100 per page).
- `POST /api/chat/conversations/:conversationId/messages` with `{ "text": "Hello" }` — Send a message through REST; it is also broadcast to connected sockets.
- `POST /api/chat/conversations/:conversationId/read` — Mark incoming messages as read.

The Socket.IO server is attached to the same API host. Authenticate with the existing `token` cookie or initialize the client with `auth: { token: accessToken }`. Join a conversation with `chat:join` and `{ conversationId }`; send `{ conversationId, text }` using `chat:send`; optional events are `chat:typing` (`{ conversationId, isTyping }`) and `chat:read` (`{ conversationId }`). Successful operations acknowledge `{ success: true, data }`; saved messages are emitted as `chat:message`, inbox updates as `chat:inbox:new-message`, and read/typing updates as `chat:read` and `chat:typing`. The server validates conversation membership for every event. Install `socket.io-client` in a frontend client to connect.

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
