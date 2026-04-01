# BuddyScript Social Feed App

A full-stack social feed application built with **Next.js**, **TypeScript**, **Prisma**, **PostgreSQL (Neon)**, and **Cloudinary**.

This project was developed as part of a technical assignment. The goal was to convert the provided static HTML/CSS designs for **Login**, **Register**, and **Feed** into a working full-stack web application while following the required design as closely as possible.

---

## Live Demo

Add your deployed URL here:

**Live URL:** [Add Vercel URL here]

---

## Video Walkthrough

Add your YouTube walkthrough link here:

**Video URL:** [Add YouTube link here]

---

## GitHub Repository

**Repository URL:** [Add GitHub repo link here]

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- Next.js Route Handlers
- Prisma ORM

### Database
- PostgreSQL (Neon)

### Media Storage
- Cloudinary

### Deployment
- Vercel

---

## Features Implemented

### Authentication & Authorization
- User registration with:
  - first name
  - last name
  - email
  - password
- User login
- User logout
- Current authenticated user endpoint
- Secure session-based authentication
- Session stored in database
- httpOnly cookie-based session handling
- Protected feed route

### Feed
- Protected feed page for authenticated users only
- Create post with:
  - text
  - image
  - visibility setting (`PUBLIC` / `PRIVATE`)
- Feed displays newest posts first
- Public posts visible to all logged-in users
- Private posts visible only to the author

### Interactions
- Like / unlike posts
- Add comments to posts
- Like / unlike comments
- Add replies to comments
- Like / unlike replies
- Show users who liked posts
- Show users who liked comments
- Show users who liked replies

### UI / UX
- Login page based on provided design
- Registration page based on provided design
- Feed page designed closely to the provided reference
- Sticky top navigation
- Responsive layout for desktop and mobile
- Light / dark mode toggle on feed page
- Static side widgets added to preserve design fidelity:
  - stories
  - suggested people
  - friends list
  - share button
  - follow/connect buttons
- Non-required UI items are intentionally static placeholders

---

## Architecture Decisions

### 1. Why Next.js full-stack
I used **Next.js full-stack** instead of a separate frontend/backend architecture to reduce deployment complexity, avoid CORS issues, and move faster within the assignment deadline.

This gave me:
- one codebase
- one deployment
- cleaner auth flow
- simpler integration between frontend and backend

### 2. Why PostgreSQL
PostgreSQL was chosen because the application is relational in nature:
- users
- posts
- comments
- replies
- likes
- sessions

This also aligns well with the assignment’s emphasis on standard database design and scalability.

### 3. Why Prisma
Prisma was used for:
- clean schema management
- strong typing
- readable queries
- faster development
- maintainable backend code

### 4. Why session-based auth
Instead of a frontend-managed token-only approach, I implemented **server-side sessions with database persistence and httpOnly cookies**.

Benefits:
- stronger control over login state
- easy logout and session invalidation
- safer than storing tokens in localStorage
- closer to production-style web authentication

### 5. Why Cloudinary
Images are uploaded to Cloudinary and only the image URL and public ID are stored in the database.

Benefits:
- keeps binary files out of the database
- better scalability
- simpler media delivery
- standard production practice

---

## Database Design

The application uses the following main models:

- `User`
- `Session`
- `Post`
- `PostLike`
- `Comment`
- `CommentLike`
- `Reply`
- `ReplyLike`

### Why separate tables for likes
Likes were kept separate for posts, comments, and replies to keep:
- relationships explicit
- queries simpler
- indexes cleaner
- constraints stronger
- implementation safer and easier to maintain

### Why replies are separate from comments
Replies were modeled separately for clarity and simplicity because the assignment only requires:
- comments on posts
- replies to comments

This avoids unnecessary recursive/thread complexity for the scope of the assignment.

---

## Scalability Considerations

The assignment asked to design the system while assuming millions of posts and reads. The following decisions were made with scalability in mind:

- normalized relational schema
- explicit foreign key relationships
- compound unique constraints for likes
- indexed foreign keys and feed query paths
- newest-first feed query support
- visibility stored at post level
- session persistence in database
- external image storage via Cloudinary
- server-side authorization checks for access control

Examples:
- posts indexed by visibility and created time
- likes use unique compound keys to prevent duplicates
- comments and replies are stored in dedicated tables for predictable access patterns

---

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Posts
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:postId`
- `POST /api/posts/:postId/like`
- `GET /api/posts/:postId/likes`

### Comments
- `GET /api/posts/:postId/comments`
- `POST /api/posts/:postId/comments`
- `POST /api/comments/:commentId/like`
- `GET /api/comments/:commentId/likes`

### Replies
- `GET /api/comments/:commentId/replies`
- `POST /api/comments/:commentId/replies`
- `POST /api/replies/:replyId/like`
- `GET /api/replies/:replyId/likes`

---

## Project Structure

```bash
src/
  app/
    api/
      auth/
      posts/
      comments/
      replies/
    login/
    register/
    feed/
  components/
    auth/
    feed/
    providers/
  lib/
    auth/
    api/
    posts/
    comments/
    replies/
    prisma.ts
prisma/
  schema.prisma