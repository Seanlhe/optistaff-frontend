import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import JSDashboard from "../../src/pages/employee/JSDashboard";
import { Assignment } from "../../src/types/hooks";

// Mock the hooks
const mockAssignments: Assignment[] = [
  {
    assignment_id: "1",
    company_name: "Test Company",
    employee_name: "John Doe",
    employer_name: "Jane Smith",
    employee_id: "emp1",
    job_title: "Software Engineer",
    job_location: "Singapore",
    postal_code: "123456",
    job_description: "Test job",
    job_requirements: "Test requirements",
    job_type: "Full-time",
    pay_rate: 25.0,
    start_time: new Date(),
    end_time: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours later
    break_hours: 1,
    contact_number: "+65 1234 5678",
    contact_email: "test@example.com",
    check_in_time: null,
    check_out_time: null,
    status: "confirmed",
    created_at: new Date().toISOString(),
  },
];

const mockFeedback = [
  {
    feedback_id: "feedback1",
    assignment_id: "1",
    reviewer_id: "employer1",
    reviewee_id: "emp1",
    rating_score: 5,
    comment: "Great work!",
    review_type: "employer_to_employee",
    created_at: new Date().toISOString(),
  },
];

vi.mock("../../src/hooks/useFeedback", () => ({
  useFeedback: () => ({
    feedback: mockFeedback,
    loading: false,
    error: null,
    fetchFeedback: vi.fn(),
    submitFeedback: vi.fn(),
    updateFeedback: vi.fn(),
    deleteFeedback: vi.fn(),
  }),
}));

vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: () => ({
    assignments: mockAssignments,
    loading: false,
    fetchAssignments: vi.fn(),
    updateAssignmentStatus: vi.fn(),
  }),
}));

vi.mock("../../src/hooks/useUserProfile", () => ({
  useUserProfile: () => ({
    profileData: {
      display: {
        fullName: "John Doe",
        rating: 4.5,
      },
    },
  }),
}));

// Mock child components
vi.mock("../../src/components/PayoutWeeklySummaryCard", () => ({
  default: ({ refreshTrigger }: { refreshTrigger: number }) => (
    <div data-testid="payout-summary">Payout Summary {refreshTrigger}</div>
  ),
}));

vi.mock("../../src/components/MonthlyCalendar", () => ({
  default: () => <div data-testid="monthly-calendar">Monthly Calendar</div>,
}));

describe("JSDashboard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard with assignment data", async () => {
    render(<JSDashboard />);

    // Check if welcome message is displayed
    expect(screen.getByText(/Welcome Back/)).toBeTruthy();
    expect(screen.getByText("John Doe")).toBeTruthy();

    // Check if assignment card is rendered
    await waitFor(() => {
      expect(screen.getByText("Software Engineer")).toBeTruthy();
      expect(screen.getByText("Test Company")).toBeTruthy();
    });

    // Check if stats card is rendered
    expect(screen.getByText("Rating")).toBeTruthy();
    expect(screen.getByText("4.5")).toBeTruthy();

    // Check if other components are rendered
    expect(screen.getByTestId("payout-summary")).toBeTruthy();
    expect(screen.getByTestId("monthly-calendar")).toBeTruthy();
  });

  it("displays empty state when no assignments", async () => {
    // Mock empty assignments
    vi.mocked(require("../../src/hooks/useAssignments").useAssignments).mockReturnValue({
      assignments: [],
      loading: false,
      fetchAssignments: vi.fn(),
      updateAssignmentStatus: vi.fn(),
    });

    render(<JSDashboard />);

    await waitFor(() => {
      expect(screen.getByText("No upcoming assignments")).toBeTruthy();
    });
  });

  it("displays loading state", () => {
    // Mock loading state
    vi.mocked(require("../../src/hooks/useAssignments").useAssignments).mockReturnValue({
      assignments: [],
      loading: true,
      fetchAssignments: vi.fn(),
      updateAssignmentStatus: vi.fn(),
    });

    render(<JSDashboard />);

    expect(screen.getByText("Loading assignments...")).toBeTruthy();
  });

  it("shows feedback rating on completed assignments", async () => {
    // Mock completed assignment
    const completedAssignment = {
      ...mockAssignments[0],
      status: "completed",
    };

    vi.mocked(require("../../src/hooks/useAssignments").useAssignments).mockReturnValue({
      assignments: [completedAssignment],
      loading: false,
      fetchAssignments: vi.fn(),
      updateAssignmentStatus: vi.fn(),
    });

    render(<JSDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Software Engineer")).toBeTruthy();
      // Check if feedback rating is displayed
      expect(screen.getByText("5")).toBeTruthy();
    });
  });
});
