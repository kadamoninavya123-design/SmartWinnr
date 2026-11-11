# Smart Winnr – Restaurant Rating and Review Platform

## Project Overview

Smart Winnr is a full-stack web application that allows customers to explore restaurants, submit ratings and reviews, and manage their feedback. Restaurant owners can manage their restaurant details and view customer feedback, while administrators manage users, restaurants, owners, and reviews.

## Key Features

### Administrator
- View platform statistics and rating distribution.
- View and manage registered users.
- Activate or deactivate user accounts.
- Create restaurant owner accounts.
- Add and manage restaurants.
- Assign restaurant owners.
- View and remove customer reviews.

### Customer
- Register and log in securely.
- Browse and search restaurants.
- View restaurant details.
- Submit ratings from 1 to 5 stars.
- Write, edit, and delete reviews.
- View previously submitted reviews.

### Restaurant Owner
- Log in to the owner dashboard.
- View the assigned restaurant.
- Update restaurant information.
- View customer reviews.
- View average restaurant rating and total reviews.

## Technologies Used

**Frontend**
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router DOM

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcryptjs

**Database**
- MongoDB
- Mongoose

## Project Structure

```text
SmartWinnr/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── seedAdmin.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── index.css
│   └── package.json
│
├── README.md
└── .gitignore
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd SmartWinnr
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder using the environment variables listed below.

Start the backend:

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## Environment Variables

Create `backend/.env` with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret

ADMIN_NAME=Administrator
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Do not upload your actual `.env` file or credentials to GitHub.

## Review Business Rule

Each customer can submit only one review per restaurant. Customers can update or delete their existing reviews.

## Security

- Passwords are hashed using bcryptjs.
- JWT is used for authentication.
- Role-based authorization protects restricted routes.
- Backend validation protects user, restaurant, and review operations.

## Author

Developed as a full-stack Restaurant Rating and Review Platform project.