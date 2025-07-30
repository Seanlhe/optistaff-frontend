import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import JSDashboard from "../../src/pages/employee/JSDashboard";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { useAssignments } from "../../src/hooks/useAssignments";
import { useUserProfile } from "../../src/hooks/useUserProfile";

// 1. MOCK THE DATA LAYER (HOOKS)
// We are testing the integration of UI components, so we control the data they receive.
vi.mock("../../src/hooks/useAssignments");
vi.mock("../../src/hooks/useUserProfile");

// 2. MOCK THE MODAL
// While this is an integration test, modals can be complex (using portals).
// Mocking the modal keeps this test focused on the Dashboard <-> Card interaction.
vi.mock("../../src/components/JobseekerAssignmentDetailModals", () => ({
  AssignmentDetailsModal: vi.fn(({ assignment, isOpen, onClose }) => {
    if (!isOpen || !assignment) return null;
    return (
      <div data-testid="assignment-details-modal">
        <h2>Modal for: {assignment.job_title}</h2>
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  }),
}));

// Cast the mocked hooks for TypeScript
const mockUseAssignments = vi.mocked(useAssignments);
const mockUseUserProfile = vi.mocked(useUserProfile);

describe("JSDashboard - Integration Tests", () => {
  // Define a fixed date to make tests predictable
  const mockCurrentDate = new Date("2025-01-20T10:00:00Z"); // This is a Monday

  // Define mock data that the hooks will return
  const mockAssignmentsData = [
    {
      assignment_id: "assign-1",
      job_title: "Restaurant Server",
      company_name: "The Great Food Co",
      employee_name: "John Doe",
      employer_name: "The Great Food Co",
      employee_id: "emp-1",
      postal_code: "123456",
      job_description: "Serve customers",
      job_requirements: "Experience required",
      job_type: "Restaurant",
      start_time: new Date("2025-01-22T09:00:00Z"), // Wednesday, within the test week
      end_time: new Date("2025-01-22T17:00:00Z"),
      pay_rate: 22.5,
      job_location: "Marina Bay, Singapore",
      break_hours: 1,
      contact_number: "123-456-7890",
      contact_email: "contact@example.com",
      check_in_time: null,
      check_out_time: null,
      status: "confirmed" as const,
      created_at: "2025-01-20T00:00:00Z",
    },
    {
      assignment_id: "assign-2",
      job_title: "Kitchen Helper",
      company_name: "Next Week Eatery",
      employee_name: "John Doe",
      employer_name: "Next Week Eatery",
      employee_id: "emp-1",
      postal_code: "654321",
      job_description: "Help in kitchen",
      job_requirements: "No experience required",
      job_type: "Kitchen",
      start_time: new Date("2025-01-29T09:00:00Z"), // A week later, should NOT appear
      end_time: new Date("2025-01-29T17:00:00Z"),
      pay_rate: 20.0,
      job_location: "Orchard, Singapore",
      break_hours: 0.5,
      contact_number: "987-654-3210",
      contact_email: "kitchen@example.com",
      check_in_time: null,
      check_out_time: null,
      status: "confirmed" as const,
      created_at: "2025-01-20T00:00:00Z",
    },
  ];

  const mockProfileData = {
    // Add the properties the component is actually looking for
    first_name: "John", 
    last_name: "Doe",
    display: {
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      rating: 4.5,
      accountStatus: "ACTIVE" as const,
      email: "john@example.com",
      accountCreated: "2025-01-01T00:00:00Z",
    },
    personalInfo: {
      phoneNumber: "123-456-7890",
      homeAddress: "123 Main St, Singapore",
      postalCode: "123456",
    },
    userRole: "jobseeker" as const,
  };

  // Setup mock returns and timers before each test
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockCurrentDate);

    mockUseAssignments.mockReturnValue({
      assignments: mockAssignmentsData,
      weeklyEarnings: [],
      weeklyTotal: 0,
      loading: false,
      error: null,
      updateAssignmentStatus: vi.fn(),
      fetchAssignmentsByShift: vi.fn(),
      fetchAssignments: vi.fn(),
      fetchWeeklyEarnings: vi.fn(),
    });

    mockUseUserProfile.mockReturnValue({
      profileData: mockProfileData,
      loading: false,
      personalInfoLoading: false,
      accountSettingsLoading: false,
      error: null,
      personalInfoError: null,
      accountSettingsError: null,
      updatePersonalInfo: vi.fn(),
      updateAccountSettings: vi.fn(),
      getPersonalInfoData: vi.fn(),
      getAccountFormData: vi.fn(),
      fetchProfile: vi.fn(),
      uploadProfileImage: vi.fn(),
      deleteProfile: vi.fn(),
      isJobSeeker: vi.fn(() => true),
      isClient: vi.fn(() => false),
      getDisplayData: vi.fn(),
    });
  });

  // Cleanup after each test
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should render the dashboard with correct user data and weekly assignments", () => {
    render(<JSDashboard />);

    // Check for user-specific welcome message
    expect(
      screen.getByRole("heading", { name: /Welcome Back, John Doe/i })
    ).toBeInTheDocument();

    // Check for the correct weekly date range display
    const weekStart = startOfWeek(mockCurrentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(mockCurrentDate, { weekStartsOn: 1 });
    const expectedRange = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`;
    expect(screen.getByText(expectedRange)).toBeInTheDocument();

    // Check that the assignment WITHIN the week is rendered by the real JobseekerAssignmentCard
    expect(
      screen.getByRole("heading", { name: "Restaurant Server" })
    ).toBeInTheDocument();
    expect(screen.getByText("The Great Food Co")).toBeInTheDocument();
    expect(screen.getByText("22.5/hr")).toBeInTheDocument();

    // Check that the assignment OUTSIDE the week is NOT rendered
    expect(
      screen.queryByRole("heading", { name: "Kitchen Helper" })
    ).not.toBeInTheDocument();

    // Check that the real StatsCard renders the user's rating
    expect(screen.getByText("Your Rating")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("should open the details modal when 'View Details' is clicked on an assignment card", async () => {
    render(<JSDashboard />);

    // Find the "View Details" button within the specific assignment card
    // Note: The aria-label comes from the JobseekerAssignmentCard component we wrote
    const viewDetailsButton = screen.getByRole("button", {
      name: /View details for Restaurant Server/i,
    });
    expect(viewDetailsButton).toBeInTheDocument();

    // The modal should not be present initially
    expect(screen.queryByTestId("assignment-details-modal")).not.toBeInTheDocument();

    // Click the button to open the modal
    fireEvent.click(viewDetailsButton);

    // Wait for the modal to appear and assert its presence
    await waitFor(() => {
      expect(screen.getByTestId("assignment-details-modal")).toBeInTheDocument();
    });

    // Check that the modal received the correct data
    expect(
      screen.getByRole("heading", { name: "Modal for: Restaurant Server" })
    ).toBeInTheDocument();
  });

  it("should display an empty state if no assignments are scheduled for the week", () => {
    // Override the default mock return for this specific test
    mockUseAssignments.mockReturnValue({
      assignments: [], // No assignments
      weeklyEarnings: [],
      weeklyTotal: 0,
      loading: false,
      error: null,
      updateAssignmentStatus: vi.fn(),
      fetchAssignmentsByShift: vi.fn(),
      fetchAssignments: vi.fn(),
      fetchWeeklyEarnings: vi.fn(),
    });

    render(<JSDashboard />);

    expect(
      screen.getByText("No upcoming assignments")
    ).toBeInTheDocument();
  });
});