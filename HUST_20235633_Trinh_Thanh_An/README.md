# DevShare Lite

## Author Information

-   **University:** Hanoi University of Science and Technology
-   **Student ID:** 20235633
-   **Full Name:** Trinh Thanh An

## Project Overview

**DevShare Lite** is a lightweight, full-stack web application designed as a knowledge-sharing platform for the developer community. It allows users to create, share, and discover articles, engage in discussions through comments, and organize content into series. The platform is built with a modern technology stack, featuring a Laravel backend and a Next.js frontend, providing a seamless and interactive user experience.

### Implemented Features

-   **User Authentication:** Secure user registration and login functionality.
-   **Post Management:** Create, read, update, and delete posts with Markdown support.
-   **Tagging System:** Assign multiple tags to posts for better content organization and discovery.
-   **Commenting System:** Nested comments and replies to foster community discussions.
-   **Series Creation:** Group related posts into a cohesive series.
-   **User Profiles:** Public user profiles displaying posts, followers, and following counts.
-   **Social Interactions:** Like, save (bookmark), and follow other users.
-   **Notifications:** Real-time notifications for events like new followers.
-   **Content Discovery:**
    -   Trending posts algorithm based on engagement.
    -   Discover popular users (skaters).
    -   Full-text search for posts and users.

---

## Technology Stack

### Backend (Laravel)

-   **Framework:** **Laravel 12** - A robust and elegant PHP framework for building web applications.
-   **API:** RESTful API built with Laravel to handle all backend logic.
-   **Authentication:** **Laravel Sanctum** for SPA authentication.
-   **Database:** Configured for **SQLite** by default for ease of setup, with support for MySQL, PostgreSQL, etc..

*Reasoning: Laravel was chosen for its expressive syntax, comprehensive feature set (ORM, routing, authentication), and strong community support, which accelerates backend development.*

### Frontend (Next.js)

-   **Framework:** **Next.js 15** (with App Router) - A powerful React framework for building server-rendered and static web applications.
-   **Language:** **TypeScript** for type safety and improved developer experience.
-   **Styling:** **Tailwind CSS** for a utility-first CSS workflow.
-   **State Management:** React Context API for managing global state like authentication.
-   **Data Fetching:** **Axios** for making API requests to the Laravel backend.

*Reasoning: Next.js with the App Router provides a modern, component-based architecture with excellent performance benefits (Server Components, etc.). TypeScript and Tailwind CSS were chosen to ensure code quality, maintainability, and a consistent design system.*

---

## Project Structure

### `source_code/frontend`

The frontend is a standard Next.js application with the App Router.

-   `src/app/`: Contains all the application routes and pages.
    -   `(auth)/`: Auth-related pages (Login, Register).
    -   `(dashboard)/`: Main application pages that share a common layout.
        -   `posts/[id]/`: Dynamic route for viewing a single post.
        -   `profile/[username]/`: Dynamic route for user profiles.
-   `src/components/`: Reusable React components (Header, Sidebars, PostCard, etc.).
-   `src/context/`: Contains the `AuthContext` for managing user authentication state.
-   `src/lib/`: Utility functions and the configured Axios instance for API calls.
-   `src/styles/`: Global and component-specific CSS files.
-   `src/types/`: TypeScript type definitions for the application.

### `source_code/backend`

The backend is a standard Laravel application.

-   `app/Http/Controllers/Api/`: Controllers that handle API requests for different resources (Auth, Post, Profile, etc.).
-   `app/Models/`: Eloquent models representing database tables (User, Post, Comment, Tag, etc.).
-   `app/Notifications/`: Notification classes, such as `NewFollower`.
-   `database/migrations/`: Database schema definitions for all tables.
-   `routes/api.php`: Defines all the API endpoints for the application.

---

## Installation and Setup

Follow these steps to set up and run the project on your local machine.

### Prerequisites

-   PHP >= 8.2
-   Composer
-   Node.js >= 18.0
-   NPM or Yarn
-   A database server (SQLite is used by default)

### 1. Backend Setup (Laravel)

```bash
# 1. Navigate to the backend directory
cd source_code/backend

# 2. Install PHP dependencies
composer install

# 3. Create a copy of the .env.example file
cp .env.example .env

# 4. Generate the application key
php artisan key:generate

# 5. Create the SQLite database file
touch database/database.sqlite

# 6. Run database migrations to create the tables
php artisan migrate

# 7. Start the Laravel development server and related services (queue, vite)
# This single command will run the server, queue listener, and Vite for asset bundling.
npm run dev
```

### 2. Frontend Setup (Next.js)


```bash
# 1. Open a new terminal and navigate to the frontend directory
cd source_code/frontend

# 2. Install Node.js dependencies
npm install
# or
# yarn install

# 3. Create a local environment file
cp .env.example .env.local

# 4. In the .env.local file, ensure the API URL points to your Laravel backend
# NEXT_PUBLIC_API_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

# 5. Start the Next.js development server
npm run dev
```