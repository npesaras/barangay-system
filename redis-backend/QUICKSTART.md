# Barangay Management System - Quick Start Guide

This guide will help new developers get up and running with the Barangay Management System quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm (usually comes with Node.js)
- Redis (v6 or later)
- Git

## Backend Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd barangay-system
```

2. **Install backend dependencies**

```bash
cd redis-backend
npm install
```

3. **Configure environment variables**

Create a `.env` file in the `redis-backend` directory with the following contents:

```
PORT=5000
JWT_SECRET=your_secret_key_here
ADMIN_REGISTRATION_CODE=admin123
REDIS_URL=redis://localhost:6379
```

You should change the `JWT_SECRET` and `ADMIN_REGISTRATION_CODE` to secure values.

4. **Start Redis**

Ensure your Redis server is running. If you've installed Redis locally, you can start it with:

```bash
redis-server
```

5. **Start the backend server**

```bash
npm run dev
```

The server should start running on http://localhost:5000.

## Frontend Setup

1. **Install frontend dependencies**

```bash
cd ../redis-frontend
npm install
```

2. **Start the development server**

```bash
npm run dev
```

The frontend application should open in your browser at http://localhost:3000.

## Initial Setup

When you first run the application, you'll need to create an admin user:

1. Go to http://localhost:3000/register
2. Create a new user with the role "admin" and use the `ADMIN_REGISTRATION_CODE` you set in the `.env` file
3. Login with your new admin credentials

## Common Development Tasks

### Adding a New Resident Field

1. Update the resident schema in the frontend forms:
   - `AddResidentModal.jsx`
   - `EditResidentModal.jsx`
   - `ResidentsRecord.jsx` (for displaying the field)

2. Update the backend resident handling in `server.js` (look for the resident-related endpoints)

### Running Tests

```bash
cd redis-backend
npm test
```

### Debugging

- Backend logs are output to the console when running with `npm run dev`
- Frontend development tools (React DevTools, Redux DevTools) can be installed as browser extensions
- Check the browser console (F12) for frontend errors

## Common Issues and Solutions

### Cannot connect to Redis

Ensure Redis is running and that the `REDIS_URL` in your `.env` file is correct.

### JWT authentication errors

Check that:
- The `JWT_SECRET` in `.env` is set correctly
- The token is being included in API requests
- The token hasn't expired

### Image upload issues

- Check that the `uploads` directory exists and is writable
- Verify that the image is within the size limits
- Ensure the correct Content-Type headers are being sent

## Architecture Overview

### Data Flow

1. User interacts with the React frontend
2. Frontend components call service methods
3. Service methods make API requests to the backend
4. Backend processes requests, interacts with Redis
5. Redis stores/retrieves data
6. Data flows back up the chain to the user

### Key Files

- `redis-backend/server.js` - Main backend entry point
- `redis-frontend/src/App.jsx` - Main frontend entry point
- `redis-frontend/src/components/` - UI components
- `redis-frontend/src/services/` - API service modules

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [JWT Information](https://jwt.io/) 