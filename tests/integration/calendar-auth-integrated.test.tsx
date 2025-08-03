/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import Calendar from "../../src/components/Calendar";

// Create a comprehensive Supabase mock that handles authentication properly
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { user_type: 'jobseeker' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: mockUser }, 
        error: null 
      })),
      onAuthStateChange: vi.fn((callback) => {
        // Immediately call the callback with authenticated user
        callback('SIGNED_IN', { 
          user: mockUser,
          session: { 
            user: mockUser,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            token_type: 'bearer'
          }
        });
        return {
          data: { subscription: { unsubscribe: vi.fn() } }
        };
      }),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn((table) => {
      // Return different mocks based on table
      if (table === 'job_seekers') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ 
                data: { 
                  user_id: 'test-user-id',
                  user_type: 'jobseeker'
                }, 
                error: null 
              }))
            }))
          }))
        };
      }
      // Default for availability and other tables
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        upsert: vi.fn(() => Promise.resolve({ data: [], error: null }))
      };
    }),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }
}));

// Mock React Router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/" }),
    useParams: () => ({}),
  };
});

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  Save: () => <div data-testid="save-icon" />,
  File: () => <div data-testid="file-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  X: () => <div data-testid="x-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}));

/**
 * Calendar Integration Tests with Real Authentication Flow
 * 
 * These tests use:
 * - Real useAuth hook (not mocked)
 * - Real useAvailability hook (not mocked) 
 * - Real useAvailabilityTemplate hook (not mocked)
 * - Only external dependencies are mocked (Supabase client, Router, Icons)
 * 
 * This provides true integration testing while handling authentication properly.
 */
describe("Calendar Authentication Integrated Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // Set predictable date
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-12-16T10:00:00Z"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * UC4: Calendar with Real Hooks and Authentication Integration
   * 
   * Tests the complete integration:
   * 1. Real useAuth hook authenticates user
   * 2. Real useAvailability hook loads data  
   * 3. Calendar renders with integrated functionality
   * 4. All components work together naturally
   */
  it("should integrate Calendar with real hooks and authentication", async () => {
    render(<Calendar />);

    // Wait for authentication and component loading to complete
    // The real hooks should resolve with our mocked Supabase responses
    await waitFor(() => {
      expect(screen.getByText("Mon")).toBeTruthy();
    }, { timeout: 10000 });

    // Verify Calendar rendered with all integration points
    expect(screen.getByText("Templates")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
    expect(screen.getByText("Today")).toBeTruthy();

    // Verify weekdays are rendered (Calendar grid integration)
    expect(screen.getByText("Tue")).toBeTruthy();
    expect(screen.getByText("Wed")).toBeTruthy();
    expect(screen.getByText("Thu")).toBeTruthy();
    expect(screen.getByText("Fri")).toBeTruthy();
    expect(screen.getByText("Sat")).toBeTruthy();
    expect(screen.getByText("Sun")).toBeTruthy();
  });

  /**
   * UC4: Real Hook Data Flow Integration
   * 
   * Tests that the real hooks are actually being called:
   * 1. useAuth hook authenticates and provides user
   * 2. useAvailability hook queries database  
   * 3. useAvailabilityTemplate hook is available for templates
   * 4. Component integration works with real data flow
   */
  it("should demonstrate real hook data flow integration", async () => {
    const { supabase } = await import("../../src/integrations/supabase/client");

    render(<Calendar />);

    // Wait for component to load with real hooks
    await waitFor(() => {
      expect(screen.getByText("Mon")).toBeTruthy();
    }, { timeout: 10000 });

    // Verify that real hooks made real database calls
    await waitFor(() => {
      // useAuth should have called getUser
      expect(vi.mocked(supabase.auth.getUser)).toHaveBeenCalled();
      
      // useAvailability should have queried availability table
      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith("availability");
    }, { timeout: 5000 });

    // Calendar should be fully functional with real hook integration
    expect(screen.getByText("Templates")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  /**
   * UC4: Component State Integration with Real Hooks
   * 
   * Tests that component state works properly with real hooks:
   * 1. Calendar maintains state through real hook updates
   * 2. Re-renders work correctly with hook data
   * 3. Component lifecycle integrates with hooks properly
   */
  it("should maintain component state integration with real hooks", async () => {
    const { rerender } = render(<Calendar />);

    // Wait for initial render with real hooks
    await waitFor(() => {
      expect(screen.getByText("Mon")).toBeTruthy();
    }, { timeout: 10000 });

    // Verify initial integration
    expect(screen.getByText("Templates")).toBeTruthy();

    // Re-render should maintain hook integration
    rerender(<Calendar />);
    
    // Should still work after re-render (real hooks maintain state)
    expect(screen.getByText("Mon")).toBeTruthy();
    expect(screen.getByText("Templates")).toBeTruthy();
  });
});