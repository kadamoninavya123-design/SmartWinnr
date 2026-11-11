\# Smart Winnr – Restaurant Rating and Review Platform



\## Project Overview



Smart Winnr is a full-stack web application that allows customers to discover restaurants, submit ratings and reviews, and manage their feedback. Restaurant owners can manage their assigned restaurant and view customer reviews, while administrators can manage users, restaurants, and platform activity.



\## Technologies Used



\### Frontend

\- React.js

\- Vite

\- JavaScript

\- HTML5

\- CSS3

\- Axios

\- React Router



\### Backend

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT Authentication

\- bcrypt



\## Main Features



\### Customer

\- Register and log in.

\- Browse and search restaurants.

\- Filter restaurants by location and cuisine.

\- Submit ratings from 1 to 5.

\- Write, update, and delete reviews.

\- View personal ratings and reviews.



\### Restaurant Owner

\- Log in securely.

\- View assigned restaurant details.

\- Update permitted restaurant information.

\- View customer reviews and reviewer information.

\- View average restaurant rating.



\### Administrator

\- View platform dashboard statistics.

\- Manage users and restaurants.

\- Create restaurant owner accounts.

\- Assign owners to restaurants.

\- View and remove reviews.

\- View average platform rating and rating distribution.



\## Business Rules



\- Each customer can submit only one review per restaurant.

\- Customers can update or delete their own reviews.

\- Ratings must be whole numbers between 1 and 5.

\- Role-based access is enforced by the backend.

\- Passwords are hashed before storage.



\## Project Structure



```text

SmartWinnr/

├── backend/

│   ├── config/

│   ├── middleware/

│   ├── models/

│   ├── routes/

│   ├── scripts/

│   ├── .env.example

│   ├── package.json

│   └── server.js

├── frontend/

│   ├── public/

│   ├── src/

│   ├── .gitignore

│   ├── package.json

│   └── vite.config.js

├── .gitignore

├── .env.example

└── README.md

```



\## Installation and Setup



\### Prerequisites

\- Node.js and npm

\- MongoDB Atlas account or local MongoDB installation

\- Git



\### 1. Clone the repository



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

cd SmartWinnr

```



\### 2. Backend setup



```bash

cd backend

npm install

```



Configure the backend environment variables using the `.env.example` file. Create a `.env` file and provide your MongoDB connection string, JWT secret, and administrator credentials.



Start the backend:



```bash

npm run dev

```



\### 3. Frontend setup



Open another terminal:



```bash

cd frontend

npm install

```



Configure the frontend environment variables if required by the frontend configuration.



Start the frontend:



```bash

npm run dev

```



\## Environment Variables



Refer to `.env.example` for the required environment variable names and placeholder values.



Never commit actual passwords, database connection strings, JWT secrets, or other sensitive credentials.



\## Application URLs



\- Frontend: http://localhost:5173

\- Backend: http://localhost:5000



\## Authentication and Security



\- JWT-based authentication.

\- bcrypt password hashing.

\- Protected API routes.

\- Backend role-based authorization.

\- Input validation and error handling.



\## Database Collections



The application uses MongoDB with the following collections:



\- `users`

\- `restaurants`

\- `reviews`



Mongoose schemas, ObjectId references, timestamps, validation, and indexes are used to manage relationships and data integrity.



\## Testing



Backend API endpoints were tested using Postman.



Frontend code quality was checked using ESLint, and the production build was verified using:



```bash

npm run lint

npm run build

```



\## Future Enhancements



\- Restaurant image uploads.

\- Advanced restaurant recommendations.

\- Improved responsive design.

\- Deployment to a cloud hosting platform.



\## Author



Developed as a Restaurant Rating and Review Platform assignment.



