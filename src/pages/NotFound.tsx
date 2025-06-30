/**
 * 404 Not Found Page Component
 * @description Error page for invalid routes
 */

import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
        Go back to home
      </Link>
    </div>
  );
};

export default NotFound;
