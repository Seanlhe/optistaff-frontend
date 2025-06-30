/**
 * Landing Page Component
 * @description Simple landing page with login/signup options
 */

import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      backgroundColor: '#f8f9fa', 
      color: '#333', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white',
        padding: '60px 40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          color: '#2c3e50',
          fontWeight: 'bold'
        }}>
          OptiStaff
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          marginBottom: '3rem',
          color: '#6c757d',
          fontWeight: '300'
        }}>
          Welcome to OptiStaff - Your Staff Management Solution
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link 
            to="/auth?mode=login" 
            style={{ 
              padding: '15px 30px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Login
          </Link>
          <Link 
            to="/auth?mode=signup" 
            style={{ 
              padding: '15px 30px', 
              backgroundColor: 'white',
              color: '#007bff', 
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: '2px solid #007bff',
              cursor: 'pointer'
            }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
