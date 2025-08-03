/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../../src/pages/employee/JSDashboard";
import { Assignment } from "../../src/types/hooks";

// Wrapper component to provide Router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Only mock external UI components that don't affect integration logic
vi.mock("../../src/components/MonthlyCalendar", () => ({
  default: () => <div data-testid="monthly-calendar">Monthly Calendar</div>,
}));

// Mock Supabase and external dependencies only
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

// Mock auth context
vi.mock("../../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
    loading: false,
  }),
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

/**
 * Integration tests for JSDashboard with Assignment Components
 * 
 * These tests focus on components that interact directly with JSDashboard:
 * - JobseekerAssignmentCard: Displays assignments from useAssignments hook
 * - JobseekerAssignmentDetailModals: Shows detailed view when assignment card is clicked
 * - PayoutWeeklySummaryCard: Shows payout summary with refresh triggers
 * - StatsCard: Displays user rating from useUserProfile hook
 * 
 * Key interactions tested:
 * 1. Assignment data flow from hooks to display components
 * 2. Assignment card click opening detail modal
 * 3. Assignment status changes triggering data refresh
 * 4. Component state management and data synchronization
 */
describe("JSDashboard Assignment Components Integration", () => {
  const mockAssignment: Assignment = {
    assignment_id: "test-assignment-1",
    job_title: "Warehouse Helper",
    company_name: "ABC Logistics",
    start_time: "2024-12-16T09:00:00Z",
    end_time: "2024-12-16T17:00:00Z",
    job_location: "123 Main Street, Singapore",
    pay_rate: 25,
    job_description: "General warehouse duties",
    job_requirements: "Must be able to lift 20kg",
    status: "confirmed",
    contact_number: "+65 1234 5678",
    contact_email: "contact@abc.com",
    job_type: "warehouse",
    break_hours: 1,
    created_at: "2024-12-15T10:00:00Z",
    employee_name: "John Doe",
    employer_name: "ABC Logistics",
    employee_id: "test-user-id",
    postal_code: "123456",
    latitude: 1.3521,
    longitude: 103.8198,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Set current date to ensure predictable week filtering
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-12-16T10:00:00Z")); // Monday
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * UC3/UC4 Context: This test verifies that JSDashboard properly integrates with JobseekerAssignmentCard
   * to display assignments that may have been created after completing UC3 (Set Preferences) and UC4 (Indicate Availability).
   * After a jobseeker sets their preferences and availability, they would see matching assignments on the dashboard.
   */
  it("should integrate JSDashboard with JobseekerAssignmentCard using real hooks", async () => {
    // Mock Supabase response with assignment data that would match UC3 preferences
    const mockSupabaseResponse = {
      data: [mockAssignment],
      error: null,
    };

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(mockSupabaseResponse)),
        })),
      })),
    } as any);

    render(<Dashboard />, { wrapper: TestWrapper });

    // Wait for real useAssignments hook to load data
    await waitFor(() => {
      expect(screen.getByText("Upcoming Assignments")).toBeTruthy();
    });

    // Verify JobseekerAssignmentCard displays assignment data from real hook integration
    await waitFor(() => {
      expect(screen.getByText("Warehouse Helper")).toBeTruthy();
      expect(screen.getByText("ABC Logistics")).toBeTruthy();
      expect(screen.getByText("25/hr")).toBeTruthy();
      expect(screen.getByText("123 Main Street, Singapore")).toBeTruthy();
    });
  });

  /**
   * UC3/UC4 Context: After setting preferences and availability, jobseekers need to view assignment details
   * to make informed decisions about accepting jobs. This tests the integration between assignment cards
   * and the detailed modal view using real components.
   */
  it("should integrate assignment card click with detail modal using real components", async () => {
    // Setup Supabase mock for assignments
    const mockSupabaseResponse = {
      data: [mockAssignment],
      error: null,
    };

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(mockSupabaseResponse)),
        })),
      })),
    } as any);

    render(<Dashboard />, { wrapper: TestWrapper });

    // Wait for real components to load
    await waitFor(() => {
      expect(screen.getByText("View Details")).toBeTruthy();
    });

    // Find and click the "View Details" button - simulates jobseeker wanting more information
    const viewDetailsButton = screen.getByText("View Details");
    fireEvent.click(viewDetailsButton);

    // Verify real AssignmentDetailsModal opens with correct data
    await waitFor(() => {
      expect(screen.getByText("General warehouse duties")).toBeTruthy();
      expect(screen.getByText("Must be able to lift 20kg")).toBeTruthy();
    });

    // Verify modal shows contact information for the jobseeker to connect with employer
    expect(screen.getByText("+65 1234 5678")).toBeTruthy();
    expect(screen.getByText("contact@abc.com")).toBeTruthy();
  });

  /**
   * UC3/UC4 Context: When jobseekers have no assignments matching their availability (from UC4),
   * the dashboard should clearly communicate this state using real hook integration.
   */
  it("should display no assignments message when no current week assignments exist", async () => {
    // Setup: No assignments from Supabase - could happen if availability doesn't match any jobs
    const emptySupabaseResponse = {
      data: [],
      error: null,
    };

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(emptySupabaseResponse)),
        })),
      })),
    } as any);

    render(<Dashboard />, { wrapper: TestWrapper });

    // Wait for real useAssignments hook to process empty data
    await waitFor(() => {
      expect(screen.getByText("No upcoming assignments")).toBeTruthy();
    });
  });

  /**
   * UC3/UC4 Context: Dashboard should filter and display assignments correctly using real data processing.
   * This tests the integration between real hooks and the dashboard's data filtering logic.
   */
  it("should filter and display assignments using real hook integration", async () => {
    // Setup: Multiple assignments to test filtering logic
    const currentWeekAssignment = {
      ...mockAssignment,
      assignment_id: "current-week",
      start_time: "2024-12-16T09:00:00Z", // Monday of current week
    };
    
    const nextWeekAssignment = {
      ...mockAssignment,
      assignment_id: "next-week",
      job_title: "Next Week Job",
      start_time: "2024-12-23T09:00:00Z", // Monday of next week
    };

    const multipleAssignmentsResponse = {
      data: [currentWeekAssignment, nextWeekAssignment],
      error: null,
    };

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(multipleAssignmentsResponse)),
        })),
      })),
    } as any);

    render(<Dashboard />, { wrapper: TestWrapper });

    // Wait for real hooks to process and filter data
    await waitFor(() => {
      expect(screen.getByText("Warehouse Helper")).toBeTruthy();
    });

    // Should only show current week assignment due to dashboard's filtering logic
    expect(screen.queryByText("Next Week Job")).toBeNull();
  });

  /**
   * UC3/UC4 Context: Test real component integration for displaying user information
   * and handling profile data through actual hook implementations.
   */
  it("should integrate real useUserProfile hook with dashboard display", async () => {
    // Setup empty assignments to focus on profile integration
    const emptySupabaseResponse = {
      data: [],
      error: null,
    };

    // Import mocked supabase
    const { supabase } = await import("../../src/integrations/supabase/client");
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(emptySupabaseResponse)),
        })),
      })),
    } as any);

    render(<Dashboard />, { wrapper: TestWrapper });

    // Wait for dashboard to load with real hooks
    await waitFor(() => {
      expect(screen.getByText("Welcome Back,")).toBeTruthy();
    });

    // Verify real StatsCard component is rendered (may show default values with real hook)
    expect(screen.getByText("Rating")).toBeTruthy();
  });
});