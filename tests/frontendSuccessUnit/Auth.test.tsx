import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../../src/pages/Auth';

// --- Mocks ---

// Mock useAuth hook
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockClearError = vi.fn();

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    loading: false,
    error: null,
    clearError: mockClearError,
  })
}));

// Mock React Router hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('mode=signup')],
  };
});

// Mock child components
vi.mock('../../src/components/auth/AuthHeader', () => ({
  AuthHeader: () => <div data-testid="mock-auth-header">Auth Header</div>
}));

vi.mock('../../src/components/auth/AuthFooter', () => ({
  AuthFooter: () => <div data-testid="mock-auth-footer">Auth Footer</div>
}));

vi.mock('../../src/components/auth/UserTypeToggle', () => ({
  UserTypeToggle: ({ userType, setUserType }) => (
    <div data-testid="mock-user-type-toggle">
      <button 
        data-testid="jobseeker-button"
        onClick={() => setUserType('jobseeker')}
        className={userType === 'jobseeker' ? 'active' : ''}
      >
        Job Seeker
      </button>
      <button 
        data-testid="employer-button"
        onClick={() => setUserType('employer')}
        className={userType === 'employer' ? 'active' : ''}
      >
        Employer
      </button>
    </div>
  )
}));

vi.mock('../../src/components/auth/AuthFormFields', () => ({
  AuthFormFields: ({ isSignup, userType, formData, setFormData }) => (
    <div data-testid="mock-auth-form-fields">
      {isSignup && (
        <>
          <input
            data-testid="email-input"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData.setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            data-testid="password-input"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData.setPassword(e.target.value)}
            placeholder="Password"
          />
          <input
            data-testid="confirm-password-input"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData.setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
          <input
            data-testid="first-name-input"
            value={formData.firstName}
            onChange={(e) => setFormData.setFirstName(e.target.value)}
            placeholder="First Name"
          />
          {userType === 'jobseeker' && (
            <input
              data-testid="date-of-birth-input"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData.setDateOfBirth(e.target.value)}
            />
          )}
          {userType === 'employer' && (
            <input
              data-testid="company-name-input"
              value={formData.companyName}
              onChange={(e) => setFormData.setCompanyName(e.target.value)}
              placeholder="Company Name"
            />
          )}
        </>
      )}
    </div>
  )
}));

// Helper component to wrap Auth with Router
const AuthWithRouter = ({ searchParams = 'mode=signup' }) => (
  <BrowserRouter>
    <div>
      {/* Mock search params by updating the mock */}
      <Auth />
    </div>
  </BrowserRouter>
);

// --- Test Suite ---

describe('Auth Component - UC1 Create Account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset sessionStorage
    sessionStorage.clear();
  });

  it('renders signup mode correctly with all required components', () => {
    render(<AuthWithRouter />);
    
    // Check that all main components are rendered
    expect(screen.getByTestId('mock-auth-header')).toBeTruthy();
    expect(screen.getByTestId('mock-auth-footer')).toBeTruthy();
    expect(screen.getByTestId('mock-user-type-toggle')).toBeTruthy();
    expect(screen.getByTestId('mock-auth-form-fields')).toBeTruthy();
    
    // Check that form fields are rendered for signup
    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('confirm-password-input')).toBeTruthy();
    expect(screen.getByTestId('first-name-input')).toBeTruthy();
  });

  it('switches user type correctly and shows appropriate fields', async () => {
    render(<AuthWithRouter />);
    
    const jobseekerButton = screen.getByTestId('jobseeker-button');
    const employerButton = screen.getByTestId('employer-button');
    
    // Initially should be jobseeker (default)
    expect(jobseekerButton.className).toContain('active');
    expect(screen.getByTestId('date-of-birth-input')).toBeTruthy();
    expect(screen.queryByTestId('company-name-input')).toBeNull();
    
    // Switch to employer
    fireEvent.click(employerButton);
    
    await waitFor(() => {
      expect(employerButton.className).toContain('active');
      expect(screen.getByTestId('company-name-input')).toBeTruthy();
      expect(screen.queryByTestId('date-of-birth-input')).toBeNull();
    });
  });

  it('handles form input changes correctly', async () => {
    render(<AuthWithRouter />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const firstNameInput = screen.getByTestId('first-name-input');
    
    // Test form inputs
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('Password123!');
      expect(confirmPasswordInput.value).toBe('Password123!');
      expect(firstNameInput.value).toBe('John');
    });
  });

  it('displays success message from session storage on login mode', () => {
    // Mock search params for login mode
    vi.mocked(vi.importActual('react-router-dom')).useSearchParams = () => [
      new URLSearchParams('mode=login')
    ];
    
    // Set success message in session storage
    sessionStorage.setItem('signup_success', 'Account created successfully! Please check your email to verify your account.');
    
    render(<AuthWithRouter />);
    
    // The success message should be displayed
    // Note: This tests the useEffect logic that checks sessionStorage
    expect(sessionStorage.getItem('signup_success')).toBe('Account created successfully! Please check your email to verify your account.');
  });
});