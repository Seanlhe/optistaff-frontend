/**
 * Authentication Page Component
 * @description Login and signup page with Supabase integration
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const mode = searchParams.get('mode') as 'login' | 'signup' | null;
  
  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'jobseeker' | 'employer'>('jobseeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(mode === 'signup');

  // Job seeker specific fields
  const [phoneNumber, setPhoneNumber] = useState('');

  // Employer specific fields
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (!mode) {
      navigate('/');
    }
    setIsSignup(mode === 'signup');
  }, [mode, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation for signup
    if (isSignup) {
      if (userType === 'employer' && !companyName.trim()) {
        setError('Company name is required for employers');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignup) {
        // Prepare metadata based on user type
        const metadata = {
          first_name: firstName,
          last_name: lastName,
          user_type: userType === 'jobseeker' ? 'job-seeker' : 'client', // Match your database function
          ...(userType === 'jobseeker' && phoneNumber && { 
            phone_number: phoneNumber
          }),
          ...(userType === 'employer' && { 
            company_name: companyName,
            contact_email: email // Use email as contact_email for employers
          })
        };

        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Show success message for email confirmation
          if (!data.session) {
            setError('Please check your email to confirm your account before signing in.');
            setLoading(false);
            return;
          }
          // If auto-confirmed, redirect
          navigate(userType === 'jobseeker' ? '/jobseeker' : '/employer');
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Get user role from metadata or database
          const userRole = data.user.user_metadata?.user_type;
          if (userRole === 'job-seeker') {
            navigate('/jobseeker');
          } else if (userRole === 'client') {
            navigate('/employer');
          } else {
            // Fallback: check database tables
            const { data: jobSeekerData } = await supabase
              .from('job_seekers')
              .select('user_id')
              .eq('user_id', data.user.id)
              .single();

            if (jobSeekerData) {
              navigate('/jobseeker');
            } else {
              navigate('/employer');
            }
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Link 
            to="/" 
            style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#2c3e50', 
              textDecoration: 'none' 
            }}
          >
            OptiStaff
          </Link>
          <h2 style={{ 
            marginTop: '15px', 
            fontSize: '1.8rem', 
            fontWeight: '600', 
            color: '#2c3e50',
            marginBottom: '5px'
          }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            color: '#6c757d',
            margin: '0'
          }}>
            {isSignup ? 'Sign up for OptiStaff' : 'Sign in to your account'}
          </p>
        </div>

        {/* Auth Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '40px 30px'
        }}>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* User Type Toggle (Sign up only) */}
            {isSignup && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#2c3e50',
                  marginBottom: '10px'
                }}>
                  I am a...
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setUserType('jobseeker')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: `2px solid ${userType === 'jobseeker' ? '#007bff' : '#e9ecef'}`,
                      borderRadius: '6px',
                      backgroundColor: userType === 'jobseeker' ? '#e3f2fd' : 'white',
                      color: userType === 'jobseeker' ? '#007bff' : '#6c757d',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🔍 Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('employer')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: `2px solid ${userType === 'employer' ? '#28a745' : '#e9ecef'}`,
                      borderRadius: '6px',
                      backgroundColor: userType === 'employer' ? '#e8f5e8' : 'white',
                      color: userType === 'employer' ? '#28a745' : '#6c757d',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🏢 Employer
                  </button>
                </div>
              </div>
            )}

            {/* Name Fields (Sign up only) */}
            {isSignup && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#2c3e50',
                marginBottom: '5px'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="john@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#2c3e50',
                marginBottom: '5px'
              }}>
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {/* Job Seeker Specific Fields */}
            {isSignup && userType === 'jobseeker' && (
              <>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </>
            )}

            {/* Employer Specific Fields */}
            {isSignup && userType === 'employer' && (
              <>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="ABC Restaurant"
                  />
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: error.includes('email') ? '#d1ecf1' : '#f8d7da',
                border: `1px solid ${error.includes('email') ? '#bee5eb' : '#f5c6cb'}`,
                borderRadius: '6px',
                padding: '12px'
              }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: error.includes('email') ? '#0c5460' : '#721c24',
                  margin: '0'
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: loading ? '#6c757d' : (userType === 'employer' && isSignup ? '#28a745' : '#007bff'),
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? (
                isSignup ? 'Creating Account...' : 'Signing In...'
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: '0' }}>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link
                to={`/auth?mode=${isSignup ? 'login' : 'signup'}`}
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </Link>
            </p>
          </div>

          {/* Back to Landing */}
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.9rem',
                color: '#6c757d',
                textDecoration: 'none'
              }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;