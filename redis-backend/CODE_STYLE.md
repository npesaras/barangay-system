# Code Style Guide for Barangay Management System

This document outlines the coding standards and best practices for the Barangay Management System project.

## General Guidelines

- **Keep it simple**: Write clear, readable code
- **Be consistent**: Follow established patterns in the codebase
- **Comment wisely**: Document why, not what
- **Stay DRY**: Don't Repeat Yourself; extract reusable code
- **Test your code**: Write tests for critical functionality

## Naming Conventions

### JavaScript/Node.js

- **Variables and functions**: Use camelCase
  ```javascript
  const userRole = 'admin';
  function getUserDetails() { ... }
  ```

- **Classes and React components**: Use PascalCase
  ```javascript
  class ResidentModel { ... }
  function ResidentCard() { ... }
  ```

- **Constants**: Use UPPER_SNAKE_CASE
  ```javascript
  const API_URL = 'http://localhost:5000';
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  ```

- **File names**: Use descriptive names
  - React components: PascalCase (e.g., `ResidentCard.jsx`)
  - Services/Utilities: camelCase (e.g., `authService.js`)
  - Configuration files: kebab-case (e.g., `webpack-config.js`)

## Code Structure

### Backend (Express.js)

- Group related routes together
- Use middleware for common functionality
- Separate business logic from route handlers

```javascript
// Good
app.get('/residents', authenticateToken, async (req, res) => {
  try {
    const residents = await getResidents();
    res.json(residents);
  } catch (error) {
    handleError(error, res);
  }
});

// Avoid
app.get('/residents', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);
    try {
      // Mixing authentication, error handling, and business logic
      const residents = await client.hGetAll('residents');
      res.json(residents);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
});
```

### Frontend (React)

- One component per file
- Separate concerns: UI, state management, API calls
- Use hooks for state and side effects

```jsx
// Good
function ResidentCard({ resident, onEdit }) {
  return (
    <div className="card">
      <h3>{resident.firstName} {resident.lastName}</h3>
      <button onClick={() => onEdit(resident)}>Edit</button>
    </div>
  );
}

// Avoid
function ResidentCard({ resident }) {
  const [loading, setLoading] = useState(false);
  
  const handleEdit = async () => {
    setLoading(true);
    try {
      // Mixing UI with API calls
      await axios.put(`/residents/${resident.id}`, resident);
      alert('Updated!');
    } catch (error) {
      alert('Error!');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card">
      <h3>{resident.firstName} {resident.lastName}</h3>
      <button onClick={handleEdit} disabled={loading}>
        {loading ? 'Saving...' : 'Edit'}
      </button>
    </div>
  );
}
```

## Error Handling

### Backend

- Use try/catch blocks for async code
- Provide meaningful error messages
- Log errors with contextual information

```javascript
// Good
try {
  await client.hSet(`resident:${id}`, formattedData);
} catch (error) {
  console.error(`Failed to save resident ${id}:`, error);
  res.status(500).json({ message: 'Failed to save resident data' });
}

// Avoid
try {
  await client.hSet(`resident:${id}`, formattedData);
} catch (error) {
  console.error(error);
  res.status(500).send('Error');
}
```

### Frontend

- Handle errors at the service layer
- Show user-friendly error messages
- Provide recovery options when possible

```javascript
// Good
try {
  await residentService.updateResident(id, data);
  showToast.success('Resident updated successfully');
} catch (error) {
  console.error('Update failed:', error);
  showToast.error('Failed to update resident. Please try again.');
}

// Avoid
try {
  await axios.put(`/residents/${id}`, data);
  alert('Success!');
} catch (error) {
  alert('Error!');
}
```

## Comments and Documentation

- Write comments for complex logic or non-obvious decisions
- Document functions, components, and modules
- Keep comments up-to-date with code changes

```javascript
/**
 * Formats resident data for display
 * @param {Object} resident - Raw resident data from API
 * @returns {Object} Formatted resident data
 */
function formatResidentData(resident) {
  // Transform birthdate to local format
  const birthdate = new Date(resident.birthdate).toLocaleDateString();
  
  // Calculate age based on birthdate
  const age = calculateAge(resident.birthdate);
  
  return {
    ...resident,
    birthdate,
    age,
    fullName: `${resident.firstName} ${resident.lastName}`
  };
}
```

## CSS and Styling

- Use consistent naming conventions (BEM, SMACSS, etc.)
- Organize styles by component
- Use variables for colors, spacing, and other repeated values

```css
/* Good */
.resident-card {
  margin-bottom: 1rem;
}

.resident-card__header {
  font-weight: bold;
}

.resident-card--highlighted {
  background-color: var(--highlight-color);
}

/* Avoid */
.card {
  margin-bottom: 16px;
}

.bold {
  font-weight: bold;
}

.yellow-bg {
  background-color: #ffeb3b;
}
```

## Performance Considerations

- Optimize API calls (pagination, caching, etc.)
- Use React.memo for pure components
- Avoid unnecessary re-renders
- Implement loading indicators for async operations

## Security Best Practices

- Validate input on both client and server
- Sanitize user input to prevent XSS attacks
- Use parametrized queries to prevent injection
- Implement proper authentication and authorization
- Don't expose sensitive information in client-side code

## Git Workflow

- Write clear, descriptive commit messages
- Make small, focused commits
- Create feature branches for new functionality
- Use pull requests for code review
- Keep the main branch stable

## Additional Resources

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Style Guide](https://reactjs.org/docs/code-style.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) 