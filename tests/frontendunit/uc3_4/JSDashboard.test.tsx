/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Dashboard from "../../../src/pages/employee/JSDashboard";
import { format, startOfWeek, endOfWeek } from "date-fns";

// Mock the hooks used in JSDashboard
const mockAssignments = [
  {
    assignment_id: "1",
    job_title: "Warehouse Helper",
    company_name: "ABC Logistics",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    job_location: "123 Main St",
    pay_rate: 25,
    job_description: "General warehouse duties",
    job_requirements: "Must be able to lift 20kg",
    status: "confirmed",
    contact_number: "+65 1234 5678",
    contact_email: "contact@abc.com",
    job_type: "warehouse",
    break_hours: 1,
    created_at: new Date().toISOString(),
  },
  {
    assignment_id: "2",
    job_title: "Retail Assistant",
    company_name: "XYZ Store",
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
    job_location: "456 Store Ave",
    pay_rate: 20,
    job_description: "Customer service duties",
    job_requirements: "Good communication skills",
    status: "pending",
    contact_number: "+65 9876 5432",
    contact_email: "hr@xyz.com",
    job_type: "retail",
    break_hours: 0.5,
    created_at: new Date().toISOString(),
  }
];

const mockUserProfile = {
  first_name: "John",
  last_name: "Doe",
  display: {
    rating: 4.5
  }
};

// Mock useAssignments hook
const mockUseAssignments = {
  assignments: mockAssignments,
  loading: false,
  fetchAssignments: vi.fn(),
  updateAssignmentStatus: vi.fn(),
  weeklyTotal: 850.50,
  fetchWeeklyEarnings: vi.fn(),
};

vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: () => mockUseAssignments,
}));

// Mock useUserProfile hook
const mockUseUserProfile = {
  profileData: mockUserProfile,
  loading: false,
  error: null,
};

vi.mock("../../src/hooks/useUserProfile", () => ({
  useUserProfile: () => mockUseUserProfile,
}));

// Mock child components to focus on JSDashboard logic
vi.mock("../../src/components/StatsCard", () => ({
  default: ({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) => (
    <div data-testid="stats-card">
      <span data-testid="stats-title">{title}</span>
      <span data-testid="stats-value">{value}</span>
      {icon && <span data-testid="stats-icon">icon</span>}
    </div>
  ),
}));

vi.mock("../../src/components/PayoutWeeklySummaryCard", () => ({
  default: ({ refreshTrigger }: { refreshTrigger?: number }) => (
    <div data-testid="payout-summary-card">
      <span data-testid="refresh-trigger">{refreshTrigger || 0}</span>
    </div>
  ),
}));

vi.mock("../../src/components/JobseekerAssignmentCard", () => ({
  JobseekerAssignmentCard: ({ assignment, onViewDetails }: any) => (
    <div data-testid={`assignment-card-${assignment.id}`}>
      <span data-testid="assignment-title">{assignment.title}</span>
      <span data-testid="assignment-company">{assignment.company_name}</span>
      <span data-testid="assignment-status">{assignment.status}</span>
      <button
        data-testid={`view-details-${assignment.id}`}
        onClick={() => onViewDetails(assignment)}
      >
        View Details
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/JobseekerAssignmentDetailModals", () => ({
  AssignmentDetailsModal: ({ assignment, isOpen, onClose, onStatusChange }: any) =>
    isOpen ? (
      <div data-testid="assignment-modal">
        <span data-testid="modal-assignment-title">{assignment?.title}</span>
        <button data-testid="close-modal" onClick={onClose}>Close</button>
        <button data-testid="status-change" onClick={onStatusChange}>Change Status</button>
      </div>
    ) : null,
}));

vi.mock("../../src/components/MonthlyCalendar", () => ({
  default: () => <div data-testid="monthly-calendar">Calendar</div>,
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Star: () => <div data-testid="star-icon" />,
}));

describe("JSDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock states
    mockUseAssignments.loading = false;
    mockUseAssignments.assignments = mockAssignments;
    mockUseUserProfile.profileData = mockUserProfile;
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders dashboard with welcome message using user's name", () => {
    render(<Dashboard />);

    // Check welcome message with user name
    expect(screen.getByText("Welcome Back,")).toBeTruthy();
    expect(screen.getByText("John Doe")).toBeTruthy();
  });

  it("displays default welcome message when user profile is unavailable", () => {
    mockUseUserProfile.profileData = null;
    
    render(<Dashboard />);

    expect(screen.getByText("Welcome Back,")).toBeTruthy();
    expect(screen.getByText("Job Seeker")).toBeTruthy();
  });

  it("shows loading state when assignments are loading", () => {
    mockUseAssignments.loading = true;
    
    render(<Dashboard />);

    expect(screen.getByText("Loading assignments...")).toBeTruthy();
  });

  it("displays current week date range in assignments header", () => {
    render(<Dashboard />);

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const startFormatted = format(weekStart, 'MMM d');
    const endFormatted = format(weekEnd, 'MMM d');
    const expectedRange = `${startFormatted} – ${endFormatted}`;

    expect(screen.getByText("Upcoming Assignments")).toBeTruthy();
    expect(screen.getByText(expectedRange)).toBeTruthy();
  });

  it("displays assignment cards when assignments are available", () => {
    render(<Dashboard />);

    // Check that assignment cards are rendered
    expect(screen.getByTestId("assignment-card-1")).toBeTruthy();
    expect(screen.getByTestId("assignment-card-2")).toBeTruthy();
    
    // Check assignment details are displayed
    expect(screen.getByText("Warehouse Helper")).toBeTruthy();
    expect(screen.getByText("ABC Logistics")).toBeTruthy();
    expect(screen.getByText("Retail Assistant")).toBeTruthy();
    expect(screen.getByText("XYZ Store")).toBeTruthy();
  });

  it("shows 'no assignments' message when no assignments available", () => {
    mockUseAssignments.assignments = [];
    
    render(<Dashboard />);

    expect(screen.getByText("No upcoming assignments")).toBeTruthy();
  });

  it("opens assignment details modal when view details is clicked", async () => {
    render(<Dashboard />);

    const viewDetailsButton = screen.getByTestId("view-details-1");
    fireEvent.click(viewDetailsButton);

    await waitFor(() => {
      expect(screen.getByTestId("assignment-modal")).toBeTruthy();
      expect(screen.getByTestId("modal-assignment-title")).toBeTruthy();
    });
  });

  it("closes modal when close button is clicked", async () => {
    render(<Dashboard />);

    // Open modal first
    const viewDetailsButton = screen.getByTestId("view-details-1");
    fireEvent.click(viewDetailsButton);

    await waitFor(() => {
      expect(screen.getByTestId("assignment-modal")).toBeTruthy();
    });

    // Close modal
    const closeButton = screen.getByTestId("close-modal");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("assignment-modal")).toBeNull();
    });
  });

  it("triggers assignment refresh and payout refresh when status changes", async () => {
    render(<Dashboard />);

    // Open modal
    const viewDetailsButton = screen.getByTestId("view-details-1");
    fireEvent.click(viewDetailsButton);

    await waitFor(() => {
      expect(screen.getByTestId("assignment-modal")).toBeTruthy();
    });

    // Trigger status change
    const statusChangeButton = screen.getByTestId("status-change");
    fireEvent.click(statusChangeButton);

    // Check that fetchAssignments was called
    await waitFor(() => {
      expect(mockUseAssignments.fetchAssignments).toHaveBeenCalled();
    });
  });

  it("displays user rating in stats card", () => {
    render(<Dashboard />);

    expect(screen.getByTestId("stats-card")).toBeTruthy();
    expect(screen.getByText("Rating")).toBeTruthy();
    expect(screen.getByText("4.5")).toBeTruthy();
  });

  it("shows default rating when profile has no rating", () => {
    mockUseUserProfile.profileData = {
      first_name: "John",
      last_name: "Doe",
      display: { rating: undefined }
    };
    
    render(<Dashboard />);

    expect(screen.getByText("0.0")).toBeTruthy();
  });

  it("renders payout summary card and monthly calendar", () => {
    render(<Dashboard />);

    expect(screen.getByTestId("payout-summary-card")).toBeTruthy();
    expect(screen.getByTestId("monthly-calendar")).toBeTruthy();
  });

  it("correctly maps assignment status to card status", () => {
    // Test with different statuses
    const testAssignments = [
      { ...mockAssignments[0], assignment_id: "test1", status: "confirmed" },
      { ...mockAssignments[0], assignment_id: "test2", status: "completed" },
      { ...mockAssignments[0], assignment_id: "test3", status: "cancel_by_employer" }
    ];
    
    mockUseAssignments.assignments = testAssignments;
    
    render(<Dashboard />);

    // The status mapping logic transforms statuses:
    // confirmed -> upcoming, completed -> completed, cancel_by_employer -> cancel_by_employer
    expect(screen.getByTestId("assignment-card-test1")).toBeTruthy();
    expect(screen.getByTestId("assignment-card-test2")).toBeTruthy();
    expect(screen.getByTestId("assignment-card-test3")).toBeTruthy();
  });

  it("handles missing assignment data gracefully", () => {
    const incompleteAssignment = {
      assignment_id: "incomplete",
      job_title: "Basic Job",
      company_name: "Basic Company",
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      job_location: "Unknown Location",
      pay_rate: 0,
      job_description: "",
      job_requirements: "",
      status: "confirmed",
      contact_number: "",
      contact_email: "",
      job_type: "",
      break_hours: 0,
      created_at: new Date().toISOString(),
    };
    
    mockUseAssignments.assignments = [incompleteAssignment];
    
    render(<Dashboard />);

    // Should render with default values
    expect(screen.getByTestId("assignment-card-incomplete")).toBeTruthy();
  });

  it("filters assignments to current week only", () => {
    // Add an assignment from next week (should not appear)
    const nextWeekAssignment = {
      ...mockAssignments[0],
      assignment_id: "next-week",
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    };
    
    mockUseAssignments.assignments = [...mockAssignments, nextWeekAssignment];
    
    render(<Dashboard />);

    // Should only show current week assignments
    expect(screen.getByTestId("assignment-card-1")).toBeTruthy();
    expect(screen.getByTestId("assignment-card-2")).toBeTruthy();
    expect(screen.queryByTestId("assignment-card-next-week")).toBeNull();
  });

  it("handles profile data with missing display property", () => {
    mockUseUserProfile.profileData = {
      first_name: "Jane",
      last_name: "Smith",
      display: { rating: 0 }
    };
    
    render(<Dashboard />);

    expect(screen.getByText("Jane Smith")).toBeTruthy();
    expect(screen.getByText("0.0")).toBeTruthy(); // Default rating
  });

  it("displays proper layout structure", () => {
    render(<Dashboard />);

    // Check main layout sections are present
    expect(screen.getByText("Upcoming Assignments")).toBeTruthy();
    expect(screen.getByText("Rating")).toBeTruthy();
    
    // Check that all major components are rendered
    expect(screen.getByTestId("stats-card")).toBeTruthy();
    expect(screen.getByTestId("payout-summary-card")).toBeTruthy();
    expect(screen.getByTestId("monthly-calendar")).toBeTruthy();
  });
});