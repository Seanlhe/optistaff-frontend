import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/integrations/supabase/client';

// --- Mocks ---

// Mock Supabase client
vi.mock('../../src/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
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
  }
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

  it('successfully creates job seeker account with complete signup flow', async () => {
    // Mock successful Supabase responses
    const mockUser = {
      id: 'test-user-id-123',
      email: 'jobseeker@example.com',
      user_metadata: { user_type: 'jobseeker' }
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    vi.mocked(supabase.from).mockImplementation((table) => {
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
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'jobseeker@example.com',
      password: 'Password123!',
      options: {
        data: {
          user_type: 'job-seeker',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '+65 9123 4567',
          address: '123 Test Street',
          postal_code: '123456',
          date_of_birth: '1990-01-01'
        }
      }
    });

    // Verify no error state after signup
    expect(result.current.error).toBeNull();
  });

  it('successfully creates employer account with complete signup flow', async () => {
    // Mock successful Supabase responses for employer
    const mockUser = {
      id: 'test-employer-id-456',
      email: 'employer@company.com',
      user_metadata: { user_type: 'employer' }
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    vi.mocked(supabase.from).mockImplementation((table) => {
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
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'employer@company.com',
      password: 'Password123!',
      options: {
        data: {
          user_type: 'client',
          first_name: 'Jane',
          last_name: 'Smith',
          phone_number: '+65 9876 5432',
          address: '456 Business Ave',
          postal_code: '654321',
          company_name: 'Test Company',
          office_number: '+65 6123 4567'
        }
      }
    });

    // Verify no error state after signup
    expect(result.current.error).toBeNull();
  });

  it('handles successful signup completion without errors', async () => {
    // Mock successful responses
    const mockUser = {
      id: 'test-user-simple',
      email: 'simple@example.com',
      user_metadata: { user_type: 'jobseeker' }
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    const signupData = {
      email: 'simple@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      userType: 'jobseeker' as const,
      firstName: 'Simple',
      lastName: 'User',
      phoneNumber: '+65 8888 8888',
      dateOfBirth: '1995-01-01',
      address: '789 Simple Road',
      postalCode: '888888'
    };

    // Perform signup
    await act(async () => {
      await result.current.signup(signupData);
    });

    // Should complete without errors
    expect(result.current.error).toBeNull();
    
    // Verify signup was called
    expect(supabase.auth.signUp).toHaveBeenCalled();
  });
});