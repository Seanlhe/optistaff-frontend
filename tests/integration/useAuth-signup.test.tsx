import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../src/hooks/useAuth';

// --- Mocks ---

// Mock Supabase client with complete functionality
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }))
};

vi.mock('../../src/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test wrapper with Router context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// --- Test Suite ---

describe('useAuth Integration Tests - UC1 Create Account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('successfully creates job seeker account with complete signup flow', async () => {
    // Mock successful Supabase responses
    const mockUser = {
      id: 'test-user-id-123',
      email: 'jobseeker@example.com',
      user_metadata: { user_type: 'jobseeker' }
    };

    vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    vi.mocked(mockSupabase.from).mockImplementation((table) => {
      if (table === 'job_seekers') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: [{ user_id: 'test-user-id-123', first_name: 'John', last_name: 'Doe' }], 
              error: null 
            }))
          }))
        } as any;
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      } as any;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Prepare signup data
    const signupData = {
      email: 'jobseeker@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      userType: 'jobseeker' as const,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+65 9123 4567',
      dateOfBirth: '1990-01-01',
      address: '123 Test Street',
      postalCode: '123456'
    };

    // Perform signup
    await act(async () => {
      await result.current.signup(signupData);
    });

    // Verify Supabase auth.signUp was called with correct data
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'jobseeker@example.com',
      password: 'Password123!',
      options: {
        data: {
          user_type: 'jobseeker',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '+65 9123 4567'
        }
      }
    });

    // Verify job seeker profile was created
    expect(mockSupabase.from).toHaveBeenCalledWith('job_seekers');
    
    // Verify no error state
    expect(result.current.error).toBeNull();
  });

  it('successfully creates employer account with complete signup flow', async () => {
    // Mock successful Supabase responses for employer
    const mockUser = {
      id: 'test-employer-id-456',
      email: 'employer@company.com',
      user_metadata: { user_type: 'employer' }
    };

    vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    vi.mocked(mockSupabase.from).mockImplementation((table) => {
      if (table === 'clients') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: [{ client_id: 'test-employer-id-456', company_name: 'Test Company' }], 
              error: null 
            }))
          }))
        } as any;
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      } as any;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Prepare employer signup data
    const signupData = {
      email: 'employer@company.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      userType: 'employer' as const,
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+65 9876 5432',
      address: '456 Business Ave',
      postalCode: '654321',
      companyName: 'Test Company',
      officeNumber: '+65 6123 4567'
    };

    // Perform signup
    await act(async () => {
      await result.current.signup(signupData);
    });

    // Verify Supabase auth.signUp was called with correct employer data
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'employer@company.com',
      password: 'Password123!',
      options: {
        data: {
          user_type: 'employer',
          first_name: 'Jane',
          last_name: 'Smith',
          phone_number: '+65 9876 5432'
        }
      }
    });

    // Verify client profile was created
    expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    
    // Verify no error state
    expect(result.current.error).toBeNull();
  });

  it('handles authentication state updates during signup process', async () => {
    // Mock loading and error states
    const mockUser = {
      id: 'test-user-loading',
      email: 'test@example.com',
      user_metadata: { user_type: 'jobseeker' }
    };

    // First call returns loading, second call returns success
    let callCount = 0;
    vi.mocked(mockSupabase.auth.signUp).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // Simulate loading state
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: { user: mockUser, session: null },
              error: null
            });
          }, 100);
        });
      }
      return Promise.resolve({
        data: { user: mockUser, session: null },
        error: null
      });
    });

    vi.mocked(mockSupabase.from).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const signupData = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      userType: 'jobseeker' as const,
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+65 9999 9999',
      dateOfBirth: '1995-01-01',
      address: '789 Test Road',
      postalCode: '999999'
    };

    // Start signup process
    const signupPromise = act(async () => {
      await result.current.signup(signupData);
    });

    // Initially should be loading
    expect(result.current.loading).toBe(true);

    // Wait for completion
    await signupPromise;

    // After completion, loading should be false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have no errors
    expect(result.current.error).toBeNull();
  });
});