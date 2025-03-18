# Barangay Management System - Frontend

The frontend application for the Barangay Management System. Built with React and modern web technologies.

## Overview

This frontend application provides a user-friendly interface for barangay officials to manage residents' data, view analytics, and perform administrative tasks. It communicates with the Redis-backed Express.js server to fetch and update data.

## Features

- **Authentication**: Secure login system with JWT authentication
- **Dashboard**: Visual overview of barangay statistics and demographics
- **Residents Management**: Add, view, edit, and delete resident records
- **File Management**: Upload and manage resident profile photos
- **Data Export**: Generate and download CSV reports
- **Analytics**: Visual charts for population statistics and trends
- **User-friendly Interface**: Modern, responsive design for desktop and mobile

## Tech Stack

- **React**: UI library and component system
- **Recharts**: Data visualization for analytics
- **Axios**: HTTP client for API requests
- **React Router DOM**: Client-side routing
- **React Icons**: Icon library for UI elements
- **CSS Modules**: Component-scoped styling

## Project Structure

```
src/
├── components/           # UI components
│   ├── Dashboard.jsx     # Dashboard component with analytics
│   ├── DataTable.jsx     # Reusable data table for records
│   ├── ResidentsRecord.jsx  # Residents management component
│   ├── EditResidentModal.jsx # Editing resident modal
│   ├── AddResidentModal.jsx  # Adding new resident modal
│   ├── Layout.jsx        # Main layout with sidebar
│   ├── Login.jsx         # Authentication component
│   └── Sidebar.jsx       # Navigation sidebar
├── services/             # API interface modules
│   ├── analyticsService.js  # Analytics API calls
│   ├── authService.js    # Authentication API calls
│   ├── axios.js          # Axios configuration
│   └── residentService.js # Resident API calls
├── styles/               # CSS files
│   ├── Dashboard.css     # Dashboard styling
│   ├── DataTable.css     # DataTable styling
│   └── ResidentsRecord.css # ResidentsRecord styling
├── utils/                # Utility functions
│   ├── imageUtils.js     # Image handling utilities
│   └── toast.js          # Toast notification utility
├── App.jsx               # Main App component
└── index.js              # Entry point
```

## Component Documentation

### Dashboard
The Dashboard component displays analytics about residents including gender distribution, voter status, and other key metrics. It fetches data from the `analyticsService` and renders it using charts from Recharts.

### DataTable
A reusable component for displaying tabular data with features like:
- Sorting
- Pagination
- Search/filtering
- Row actions (view, edit, delete)

### ResidentsRecord
Manages the display and interaction with resident records. It includes:
- List view of all residents
- View resident details
- Edit resident information
- Delete resident records
- Export resident data to CSV

### Modal Components
- **AddResidentModal**: Form for adding new residents
- **EditResidentModal**: Form for editing existing residents
- **ViewResidentModal**: Detailed view of resident information

### Authentication Components
- **Login**: Handles user authentication
- **Register**: Handles new user registration (admin only)

## Services

### analyticsService.js
Handles API calls related to analytics data:
- `getResidentStats()`: Fetches resident statistics (gender, voter status)
- `getPopulationProgression()`: Fetches population growth over time

### residentService.js
Handles API calls related to resident data:
- `getAllResidents()`: Fetches all residents
- `getResident(id)`: Fetches a specific resident
- `createResident(data)`: Creates a new resident
- `updateResident(id, data)`: Updates a resident
- `deleteResident(id)`: Deletes a resident
- `exportResidentsCSV()`: Exports resident data to CSV

### authService.js
Handles authentication-related API calls:
- `login(credentials)`: Authenticates a user
- `register(userData)`: Registers a new user
- `logout()`: Logs out the current user

## Setup and Development

### Prerequisites
- Node.js (v14 or higher)
- NPM or Yarn package manager
- Backend server running (see backend README)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd barangay-system/redis-frontend
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

### Building for Production

```
npm run build
```

This creates a `build` directory with optimized production files.

## Best Practices

- **State Management**: Use React hooks for local state, context for shared state
- **API Calls**: Always use the appropriate service module for API calls
- **Error Handling**: Implement proper error handling with user-friendly messages
- **Styling**: Keep styles modular and component-specific
- **Responsive Design**: Ensure all components work on various screen sizes
- **Performance**: Optimize rendering with proper React patterns

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Ensure the backend server is running
   - Check API URL configuration in services
   - Verify network connectivity

2. **Authentication Issues**:
   - Clear browser cookies/localStorage
   - Check JWT token expiration
   - Verify user credentials

3. **Image Upload Problems**:
   - Check file size limits
   - Verify supported file formats
   - Ensure proper FormData handling

## Contributing

Follow these steps to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with a clear description

## License

This project is licensed under the ISC License.
