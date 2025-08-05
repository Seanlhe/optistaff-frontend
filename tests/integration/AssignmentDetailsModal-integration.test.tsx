/**
 * AssignmentDetailsModal Integration Test
 * @description Integration test for AssignmentDetailsModal component with assignment actions + useAssignments hook
 * @author OptiStaff Team  
 * @testing_approach Component + Hook Integration: Modal with assignment actions + useAssignments hook
 * - Mock: Supabase client (assignment updates)
 * - Real: Modal logic, useAssignments hook, status changes, form submissions
 * - Tests: Modal display, status updates, feedback submission, assignment refresh
 * - UC: User views assignment details, changes status, submits feedback
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Import component to test
import { AssignmentDetailsModal } from "../../src/components/JobseekerAssignmentDetailModals";
import type { JobseekerAssignmentCard } from "../../src/components/JobseekerAssignmentCard";
import type { Feedback } from "../../src/types/hooks";

// Mock data for testing
const mockUser = {
  id: "test-user-123",
  email: "test@example.com",
  role: "jobseeker" as const,
};

const mockFeedback: Feedback = {
  feedback_id: "feedback-123",
  assignment_id: "assignment-123",
  reviewer_id: "employer-456",
  reviewee_id: "test-user-123",
  rating_score: 4,
  comment: "Great work! Very reliable and professional.",
  review_type: "employer_to_jobseeker",
  created_at: "2024-12-01T10:00:00Z",
};

// Mock functions for test callbacks
const mockOnClose = vi.fn();
const mockOnStatusChange = vi.fn();

// Mock Supabase client operations
vi.mock("../../src/integrations/supabase/client", () => {
  const mockRpc = vi.fn();
  const mockFrom = vi.fn();
  
  return {
    supabase: {
      rpc: mockRpc,
      from: mockFrom,
    },
  };
});

// Mock useAuth to return test user
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    loading: false,
    error: null,
  })),
}));

// Mock UI components
vi.mock("../../src/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid="modal-container">
        <div onClick={() => onOpenChange(false)} data-testid="modal-backdrop" />
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className }: any) => (
    <div className={className} data-testid="modal-content">
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="modal-header">{children}</div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h1 className={className} data-testid="modal-title">
      {children}
    </h1>
  ),
}));

vi.mock("../../src/components/ui/button", () => ({
  Button: ({ children, onClick, className, variant, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-testid="modal-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Clock: () => <div data-testid="clock-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Coffee: () => <div data-testid="coffee-icon" />,
  User: () => <div data-testid="user-icon" />,
  Star: ({ className }: any) => (
    <div data-testid="star-icon" className={className} />
  ),
}));

describe("AssignmentDetailsModal Integration Tests", () => {
  // Get references to the mocked functions
  let mockSupabaseRpc: any;
  let mockSupabaseFrom: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import the mocked supabase client to access the mock functions
    const { supabase } = await import("../../src/integrations/supabase/client");
    mockSupabaseRpc = supabase.rpc;
    mockSupabaseFrom = supabase.from;
    
    // Setup default mock responses for useAssignments hook operations
    mockSupabaseRpc.mockImplementation((functionName: string, params: any) => {
      if (functionName === "update_assignment_status") {
        return Promise.resolve({
          data: { updated_count: 1, payout_created: false },
          error: null,
        });
      }
      if (functionName === "get_assignments_by_jobseeker") {
        return Promise.resolve({
          data: [],
          error: null,
        });
      }
      if (functionName === "get_weekly_earnings_summary") {
        return Promise.resolve({
          data: [],
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    });
    
    // Setup default mock responses for useFeedback hook operations
    mockSupabaseFrom.mockImplementation((tableName: string) => {
      if (tableName === "feedback") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
            neq: vi.fn().mockReturnValue({
              neq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });
  });

  // ========================================
  // Modal Display Rendering Tests (3 tests)
  // ========================================
  describe("Modal Display Rendering", () => {
    // UC: User opens modal to view complete assignment details
    test("displays complete assignment details modal", async () => {
      const completeAssignment: JobseekerAssignmentCard = {
        id: "assignment-123",
        title: "Warehouse Assistant",
        company_name: "ABC Logistics Ltd",
        date: "Mon, Dec 16",
        time: "9:00 AM – 5:00 PM",
        location: "123 Industrial Road, Singapore 619234",
        hourlyRate: 25,
        description: "General warehouse duties including inventory management, packing, and quality control checks",
        requirements: "Must be able to lift 25kg, prior warehouse experience preferred",
        status: "upcoming",
        contactNumber: "+65 1234 5678",
        contactEmail: "warehouse@abc.com",
        jobType: "Warehouse Operations",
        breakHours: 1,
        startTime: "09:00",
        endTime: "17:00",
      };

      render(
        <AssignmentDetailsModal
          assignment={completeAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      // Wait for modal to render and load feedback
      await waitFor(() => {
        expect(screen.getByTestId("modal-container")).toBeTruthy();
      });

      // Verify modal header information
      expect(screen.getByTestId("modal-title")).toBeTruthy();
      expect(screen.getByText("Warehouse Assistant")).toBeTruthy();
      expect(screen.getByText("ABC Logistics Ltd")).toBeTruthy();
      expect(screen.getByText("$25/hr")).toBeTruthy();

      // Verify main assignment sections
      expect(screen.getByText("Schedule")).toBeTruthy();
      expect(screen.getByText("Mon, Dec 16")).toBeTruthy();
      expect(screen.getByText("9:00 AM – 5:00 PM")).toBeTruthy();
      
      expect(screen.getByText("Location")).toBeTruthy();
      expect(screen.getByText("123 Industrial Road, Singapore 619234")).toBeTruthy();
      
      expect(screen.getByText("Compensation")).toBeTruthy();
      expect(screen.getByText("25/h")).toBeTruthy();
      
      expect(screen.getByText("Job Type")).toBeTruthy();
      expect(screen.getByText("Warehouse Operations")).toBeTruthy();
      
      expect(screen.getByText("Break Time")).toBeTruthy();
      expect(screen.getByText("1 hour(s) break included")).toBeTruthy();

      // Verify optional sections
      expect(screen.getByText("Job Description")).toBeTruthy();
      expect(screen.getByText("General warehouse duties including inventory management, packing, and quality control checks")).toBeTruthy();
      
      expect(screen.getByText("Requirements")).toBeTruthy();
      expect(screen.getByText("Must be able to lift 25kg, prior warehouse experience preferred")).toBeTruthy();
      
      expect(screen.getByText("Contact Information")).toBeTruthy();
      expect(screen.getByText("+65 1234 5678")).toBeTruthy();
      expect(screen.getByText("warehouse@abc.com")).toBeTruthy();

      // Verify assignment details section
      expect(screen.getByText("Assignment Details")).toBeTruthy();
      expect(screen.getByText("upcoming")).toBeTruthy();
      expect(screen.getByText("assignment-123")).toBeTruthy();

      // Verify all icons are rendered
      expect(screen.getByTestId("clock-icon")).toBeTruthy();
      expect(screen.getByTestId("map-pin-icon")).toBeTruthy();
      expect(screen.getByTestId("dollar-sign-icon")).toBeTruthy();
      expect(screen.getByTestId("user-icon")).toBeTruthy();
      expect(screen.getByTestId("coffee-icon")).toBeTruthy();
      expect(screen.getByTestId("briefcase-icon")).toBeTruthy();
      expect(screen.getByTestId("file-text-icon")).toBeTruthy();
      expect(screen.getByTestId("phone-icon")).toBeTruthy();
      expect(screen.getByTestId("mail-icon")).toBeTruthy();
    });

    // UC: User opens modal for assignment with minimal information
    test("displays minimal assignment details modal", async () => {
      const minimalAssignment: JobseekerAssignmentCard = {
        id: "assignment-minimal",
        title: "Basic Task",
        company_name: "Simple Corp",
        date: "Tue, Dec 17",
        time: "10:00 AM – 2:00 PM",
        location: "Downtown Office",
        hourlyRate: 0, // No pay (volunteer/intern)
        status: "completed",
      };

      render(
        <AssignmentDetailsModal
          assignment={minimalAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("modal-container")).toBeTruthy();
      });

      // Verify basic information is displayed
      expect(screen.getByText("Basic Task")).toBeTruthy();
      expect(screen.getByText("Simple Corp")).toBeTruthy();
      expect(screen.getByText("Tue, Dec 17")).toBeTruthy();
      expect(screen.getByText("10:00 AM – 2:00 PM")).toBeTruthy();
      expect(screen.getByText("Downtown Office")).toBeTruthy();

      // Verify compensation section is not shown when hourlyRate is 0
      expect(screen.queryByText("Compensation")).toBeFalsy();
      expect(screen.queryByText("$0/hr")).toBeFalsy();

      // Verify optional sections are not shown
      expect(screen.queryByText("Job Description")).toBeFalsy();
      expect(screen.queryByText("Requirements")).toBeFalsy();
      expect(screen.queryByText("Contact Information")).toBeFalsy();
      expect(screen.queryByText("Job Type")).toBeFalsy();

      // Verify no cancel button for completed assignment
      expect(screen.queryByText("Cancel Assignment")).toBeFalsy();

      // Verify assignment ID is shown
      expect(screen.getByText("assignment-minimal")).toBeTruthy();
    });

    // UC: Modal doesn't render when assignment is null
    test("doesn't render when assignment is null", () => {
      render(
        <AssignmentDetailsModal
          assignment={null}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      // Modal should not render when assignment is null
      expect(screen.queryByTestId("modal-container")).toBeFalsy();
    });
  });

  // ========================================
  // Status Updates and Assignment Actions Tests (3 tests)
  // ========================================
  describe("Status Updates and Assignment Actions", () => {
    // UC: User cancels an upcoming assignment
    test("successfully cancels upcoming assignment", async () => {
      const user = userEvent.setup();
      const upcomingAssignment: JobseekerAssignmentCard = {
        id: "assignment-upcoming",
        title: "Restaurant Server",
        company_name: "Dining Place",
        date: "Wed, Dec 18",
        time: "6:00 PM – 10:00 PM",
        location: "Marina Bay",
        hourlyRate: 20,
        status: "upcoming",
      };

      render(
        <AssignmentDetailsModal
          assignment={upcomingAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Cancel Assignment")).toBeTruthy();
      });

      // Click cancel assignment button
      const cancelButton = screen.getByText("Cancel Assignment");
      await user.click(cancelButton);

      // Verify updateAssignmentStatus RPC was called with correct parameters
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledWith("update_assignment_status", {
          p_assignment_id: "assignment-upcoming",
          p_status_name: "cancel_by_employee",
        });
      });

      // Verify callbacks were triggered
      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    // UC: Cancel button not shown for completed assignments
    test("doesn't show cancel button for completed assignments", async () => {
      const completedAssignment: JobseekerAssignmentCard = {
        id: "assignment-completed",
        title: "Office Cleaning",
        company_name: "Clean Co",
        date: "Thu, Dec 12",
        time: "8:00 AM – 12:00 PM",
        location: "Business District",
        hourlyRate: 18,
        status: "completed",
      };

      render(
        <AssignmentDetailsModal
          assignment={completedAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("modal-container")).toBeTruthy();
      });

      // Verify cancel button is not present for completed assignment
      expect(screen.queryByText("Cancel Assignment")).toBeFalsy();
      
      // Verify assignment details are still shown
      expect(screen.getByText("Office Cleaning")).toBeTruthy();
      expect(screen.getByText("completed")).toBeTruthy();
    });

    // UC: Assignment cancellation fails with error handling
    test("handles assignment cancellation failure", async () => {
      const user = userEvent.setup();
      
      // Mock cancellation failure - return error from Supabase
      mockSupabaseRpc.mockImplementation((functionName: string) => {
        if (functionName === "update_assignment_status") {
          return Promise.resolve({
            data: null,
            error: { message: "Network error" },
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const upcomingAssignment: JobseekerAssignmentCard = {
        id: "assignment-fail",
        title: "Event Staff",
        company_name: "Event Co",
        date: "Fri, Dec 20",
        time: "2:00 PM – 8:00 PM",
        location: "Convention Center",
        hourlyRate: 22,
        status: "upcoming",
      };

      render(
        <AssignmentDetailsModal
          assignment={upcomingAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Cancel Assignment")).toBeTruthy();
      });

      // Click cancel assignment button
      const cancelButton = screen.getByText("Cancel Assignment");
      await user.click(cancelButton);

      // Wait for RPC call
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledWith("update_assignment_status", {
          p_assignment_id: "assignment-fail",
          p_status_name: "cancel_by_employee",
        });
      });

      // With the real hook behavior, it handles errors gracefully by setting error state
      // and returns undefined. The component now correctly checks the return value,
      // so it should NOT call the callbacks when the operation fails.
      
      // Fixed component behavior: callbacks are NOT triggered on failure
      // because the component now checks if updateAssignmentStatus succeeded
      expect(mockOnStatusChange).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Feedback Display Tests (3 tests)
  // ========================================
  describe("Feedback Display", () => {
    // UC: User views completed assignment with employer feedback
    test("displays employer feedback for completed assignment", async () => {
      // Mock successful feedback fetch
      mockSupabaseFrom.mockImplementation((tableName) => {
        if (tableName === "feedback") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockFeedback,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      });

      const completedAssignment: JobseekerAssignmentCard = {
        id: "assignment-123",
        title: "Data Entry Clerk",
        company_name: "Office Solutions",
        date: "Mon, Dec 9",
        time: "9:00 AM – 5:00 PM",
        location: "CBD Office",
        hourlyRate: 16,
        status: "completed",
      };

      render(
        <AssignmentDetailsModal
          assignment={completedAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      // Wait for feedback to load
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith("feedback");
      });

      await waitFor(() => {
        expect(screen.getByText("Employer Feedback")).toBeTruthy();
      });

      // Verify feedback content is displayed
      expect(screen.getByText("Rating:")).toBeTruthy();
      expect(screen.getByText("(4/5)")).toBeTruthy();
      expect(screen.getByText("Great work! Very reliable and professional.")).toBeTruthy();

      // Verify star rating is displayed
      const starIcons = screen.getAllByTestId("star-icon");
      expect(starIcons.length).toBeGreaterThanOrEqual(5); // At least 5 stars in rating display
    });

    // UC: Completed assignment with no feedback shows appropriate state
    test("handles completed assignment with no feedback", async () => {
      // Mock no feedback found (already set as default in beforeEach)
      // Default mock returns null for feedback

      const completedAssignment: JobseekerAssignmentCard = {
        id: "assignment-no-feedback",
        title: "Security Guard",
        company_name: "Security Corp",
        date: "Sat, Dec 14",
        time: "10:00 PM – 6:00 AM",
        location: "Shopping Mall",
        hourlyRate: 15,
        status: "completed",
      };

      render(
        <AssignmentDetailsModal
          assignment={completedAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      // Wait for feedback fetch attempt
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith("feedback");
      });

      // Verify feedback section is not displayed when no feedback exists
      expect(screen.queryByText("Employer Feedback")).toBeFalsy();
      expect(screen.queryByText("Rating:")).toBeFalsy();

      // Verify other sections are still displayed
      expect(screen.getByText("Security Guard")).toBeTruthy();
      expect(screen.getByText("Assignment Details")).toBeTruthy();
    });

    // UC: Feedback section not shown for non-completed assignments
    test("doesn't show feedback section for upcoming assignments", async () => {
      const upcomingAssignment: JobseekerAssignmentCard = {
        id: "assignment-upcoming-no-feedback",
        title: "Retail Associate",
        company_name: "Fashion Store",
        date: "Sun, Dec 22",
        time: "11:00 AM – 7:00 PM",
        location: "Shopping Center",
        hourlyRate: 17,
        status: "upcoming",
      };

      render(
        <AssignmentDetailsModal
          assignment={upcomingAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("modal-container")).toBeTruthy();
      });

      // Verify feedback section is not displayed for upcoming assignments
      expect(screen.queryByText("Employer Feedback")).toBeFalsy();
      expect(screen.queryByText("Rating:")).toBeFalsy();

      // Verify other sections are displayed
      expect(screen.getByText("Retail Associate")).toBeTruthy();
      expect(screen.getByText("Cancel Assignment")).toBeTruthy(); // Should show cancel for upcoming
    });
  });

  // ========================================
  // Assignment Refresh and Hook Integration Tests (2 tests)
  // ========================================
  describe("Assignment Refresh and Hook Integration", () => {
    // UC: Modal fetches feedback on open and updates when assignment changes
    test("integrates with hooks to fetch and refresh data", async () => {
      const firstAssignment: JobseekerAssignmentCard = {
        id: "assignment-first",
        title: "Kitchen Helper",
        company_name: "Restaurant A",
        date: "Mon, Dec 23",
        time: "5:00 PM – 11:00 PM",
        location: "Food Court",
        hourlyRate: 19,
        status: "completed",
      };

      const { rerender } = render(
        <AssignmentDetailsModal
          assignment={firstAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      // Wait for initial feedback fetch
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith("feedback");
      });

      // Change to different assignment
      const secondAssignment: JobseekerAssignmentCard = {
        id: "assignment-second",
        title: "Delivery Driver",
        company_name: "Logistics B",
        date: "Tue, Dec 24",
        time: "8:00 AM – 4:00 PM",
        location: "Distribution Center",
        hourlyRate: 21,
        status: "completed",
      };

      rerender(
        <AssignmentDetailsModal
          assignment={secondAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      // Verify feedback is fetched for new assignment
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith("feedback");
      });

      // Verify new assignment details are displayed
      expect(screen.getByText("Delivery Driver")).toBeTruthy();
      expect(screen.getByText("Logistics B")).toBeTruthy();
      expect(screen.getByText("assignment-second")).toBeTruthy();
    });

    // UC: Modal closes properly and triggers callbacks
    test("handles modal close and callback integration", async () => {
      const user = userEvent.setup();
      const testAssignment: JobseekerAssignmentCard = {
        id: "assignment-close-test",
        title: "Warehouse Picker",
        company_name: "Logistics Co",
        date: "Wed, Dec 25",
        time: "6:00 AM – 2:00 PM",
        location: "Industrial Area",
        hourlyRate: 23,
        status: "upcoming",
      };

      const { rerender } = render(
        <AssignmentDetailsModal
          assignment={testAssignment}
          isOpen={true}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("modal-backdrop")).toBeTruthy();
      });

      // Click modal backdrop to close
      const backdrop = screen.getByTestId("modal-backdrop");
      await user.click(backdrop);

      // Verify onClose callback was triggered
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      // Test modal closed state by rerendering with isOpen=false
      rerender(
        <AssignmentDetailsModal
          assignment={testAssignment}
          isOpen={false}
          onClose={mockOnClose}
          onStatusChange={mockOnStatusChange}
        />
      );

      // Modal should not be rendered when isOpen is false
      expect(screen.queryByTestId("modal-container")).toBeFalsy();
    });
  });
});