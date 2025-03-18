# Barangay Management System

A comprehensive web application for managing barangay residents' records and analytics. The system consists of a Redis-backed Express.js server and a React frontend application.

## Overview

This Barangay Management System allows barangay officials to:
- Register and manage resident information
- Track demographic data like gender distribution and voter status
- Generate analytics and reports
- Export resident data to CSV format
- Manage user access with role-based permissions

## Tech Stack

### Backend
- **Express.js**: Web server framework
- **Redis**: NoSQL database for data storage
- **JWT**: User authentication and authorization
- **Multer**: File upload handling for resident profile images
- **bcrypt.js**: Password hashing for security

### Frontend
- **React**: UI library
- **Recharts**: Data visualization for analytics
- **Axios**: API communication
- **React Router**: Navigation and routing
- **React Icons**: UI icons and symbols

## System Requirements

- Node.js (v14 or higher)
- Redis server (v6 or higher)
- NPM or Yarn package manager

## Project Structure

```
barangay-system/
├── redis-backend/           # Backend server
│   ├── __tests__/           # Test files
│   ├── node_modules/        # Node dependencies
│   ├── test/                # Additional tests
│   ├── uploads/             # Uploaded resident profile images
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   ├── server.js            # Main server file
│   └── README.md            # This file
└── redis-frontend/          # React frontend
    ├── public/              # Static files
    ├── src/                 # Source code
    │   ├── components/      # React components
    │   ├── services/        # API service modules
    │   ├── styles/          # CSS files
    │   ├── utils/           # Utility functions
    │   ├── App.jsx          # Main App component
    │   └── index.js         # Entry point
    ├── package.json         # Frontend dependencies
    └── README.md            # Frontend documentation
```

## Installation and Setup

### Backend Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd barangay-system/redis-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ADMIN_REGISTRATION_CODE=your_admin_registration_code
   REDIS_URL=redis://localhost:6379
   ```

4. Ensure Redis server is running on your machine.

5. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd ../redis-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Authenticate a user and receive JWT

### Residents
- `GET /residents` - Get all residents
- `GET /residents/:id` - Get a specific resident
- `POST /residents` - Create a new resident
- `PUT /residents/:id` - Update a resident
- `DELETE /residents/:id` - Delete a resident
- `GET /residents/export/csv` - Export residents data to CSV

### Analytics
- `GET /analytics/residents` - Get resident statistics (gender, voter status)
- `GET /analytics/population-progression` - Get population growth over time

## Data Models

### User
- `id`: Unique identifier
- `username`: User's login name
- `password`: Hashed password
- `role`: User role (admin, staff)

### Resident
- `id`: Unique identifier
- `firstName`, `middleName`, `lastName`: Name components
- `alias`: Alternative name
- `birthplace`: Place of birth
- `birthdate`: Date of birth
- `age`: Current age
- `civilStatus`: Marital status
- `gender`: Gender
- `purok`: Barangay subdivision
- `votersStatus`: Registration status
- `email`: Email address
- `contactNumber`: Phone number
- `occupation`: Current job
- `citizenship`: Country of citizenship
- `address`: Full address
- `householdNo`: Household identifier
- `precinctNo`: Voting precinct number
- `profileImage`: Photo reference

## Security

- User authentication via JWT
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Backend validation for API requests

## Testing

Run the test suite with:
```
npm test
```

## Deployment

### Backend
1. Set up a production Redis instance
2. Configure environment variables for production
3. Deploy the Express.js server

### Frontend
1. Build the production bundle:
   ```
   cd redis-frontend
   npm run build
   ```
2. Deploy the build directory to a static file server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.

## Acknowledgements

- Express.js team
- Redis team
- React team
- All open-source libraries used in this project 