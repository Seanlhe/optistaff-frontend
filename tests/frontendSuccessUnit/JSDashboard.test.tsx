import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "../../src/pages/employee/JSDashboard";
import { startOfWeek, endOfWeek, format } from "date-fns";

// Mock the dependencies with minimal implementations
vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: vi.fn(),
}));

vi.mock("../../src/hooks/useUserProfile", () => ({
  useUserProfile: vi.fn(),
}));

vi.mock("../../src/components/StatsCard", () => ({
  default: vi.fn(({ title, value }) => (
    <div data-testid="stats-card">
      <span>{title}: {value}</span>
    </div>
  )),
}));

vi.mock("../../src/components/PayoutWeeklySummaryCard", () => ({
  default: vi.fn(() => <div data-testid="payout-card">Payout Summary</div>),
}));

vi.mock("../../src/components/JobseekerAssignmentCard", () => ({
  JobseekerAssignmentCard: vi.fn(({ assignment, onViewDetails }) => (
    <div data-testid="assignment-card" data-assignment-id={assignment.id}>
      <span>{assignment.title} - {assignment.company_name}</span>
      <button onClick={() => onViewDetails(assignment)}>View Details</button>
    </div>
  )),
}));

vi.mock("../../src/components/JobseekerAssignmentDetailModals", () => ({
  AssignmentDetailsModal: vi.fn(({ assignment, isOpen, onClose }) => (
    isOpen && assignment ? (
      <div data-testid="assignment-modal">
        <span>Modal for {assignment.id}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  )),
}));

vi.mock("../../src/components/MonthlyCalendar", () => ({
  default: vi.fn(() => <div data-testid="monthly-calendar">Calendar</div>),
}));

import { useAssignments } from "../../src/hooks/useAssignments";
import { useUserProfile } from "../../src/hooks/useUserProfile";

const mockUseAssignments = vi.mocked(useAssignments);
const mockUseUserProfile = vi.mocked(useUserProfile);

describe("JSDashboard - Essential Tests", () => {
  const mockCurrentDate = new Date("2025-01-20T10:00:00Z"); // Monday
  
  const mockAssignments = [
    {
      assignment_id: "assign-1",
      shift_id: "shift-1",
      user_id: "user-1",
      status: "confirmed",
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-15T10:00:00Z",
      start_time: "2025-01-20T09:00:00Z", // Current week
      end_time: "2025-01-20T17:00:00Z",
      job_title: "Restaurant Server",
      company_name: "The Great Food Co",
      job_location: "Marina Bay, Singapore",
      pay_rate: 18.50,
    },
    {
      assignment_id: "assign-2",
      shift_id: "shift-2",
      user_id: "user-1",
      status: "pending",
      created_at: "2025-01-18T10:00:00Z",
      updated_at: "2025-01-18T10:00:00Z",
      start_time: "2025-01-27T09:00:00Z", // Next week - should filter out
      end_time: "2025-01-27T17:00:00Z",
      job_title: "Kitchen Helper",
      company_name: "Another Restaurant",
      job_location: "Orchard, Singapore",
      pay_rate: 16.00,
    },
  ];

  const mockProfileData = {
    display: {
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      rating: 4.5,
      accountStatus: "ACTIVE" as const,
      email: "john.doe@example.com",
      accountCreated: "2025-01-01T00:00:00Z",
    },
    personalInfo: {
      phoneNumber: "+6591234567",
      homeAddress: "123 Test Street",
      postalCode: "123456",
    },
    userRole: "jobseeker" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockCurrentDate);

    mockUseAssignments.mockReturnValue({
      assignments: mockAssignments,
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
      fetchProfile: vi.fn(),
      updatePersonalInfo: vi.fn(),
      updateAccountSettings: vi.fn(),
      uploadProfileImage: vi.fn(),
      deleteProfile: vi.fn(),
      isJobSeeker: vi.fn().mockReturnValue(true),
      isClient: vi.fn().mockReturnValue(false),
      getDisplayData: vi.fn().mockReturnValue(mockProfileData.display),
      getPersonalInfoData: vi.fn().mockReturnValue(mockProfileData.personalInfo),
      getAccountFormData: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Core Business Logic", () => {
    it("filters assignments to current week only", () => {
      render(<Dashboard />);

      // Should show only 1 assignment from current week (assign-1)
      const assignmentCards = screen.getAllByTestId("assignment-card");
      expect(assignmentCards).toHaveLength(1);

      // Should show the assignment from current week
      expect(screen.getByText("Restaurant Server - The Great Food Co")).toBeInTheDocument();

      // Should not show assignment from next week
      expect(screen.queryByText("Kitchen Helper - Another Restaurant")).not.toBeInTheDocument();
    });

    it("transforms assignment status correctly", () => {
      const assignmentsWithStatuses = [
        { ...mockAssignments[0], status: "confirmed" },
        { ...mockAssignments[0], assignment_id: "assign-2", status: "pending" },
        { ...mockAssignments[0], assignment_id: "assign-3", status: "completed" },
      ];

      mockUseAssignments.mockReturnValue({
        assignments: assignmentsWithStatuses,
        weeklyEarnings: [],
        weeklyTotal: 0,
        loading: false,
        error: null,
        updateAssignmentStatus: vi.fn(),
        fetchAssignmentsByShift: vi.fn(),
        fetchAssignments: vi.fn(),
        fetchWeeklyEarnings: vi.fn(),
      });

      render(<Dashboard />);

      const assignmentCards = screen.getAllByTestId("assignment-card");
      expect(assignmentCards).toHaveLength(3);
    });

    it("displays current week date range", () => {
      render(<Dashboard />);

      const weekStart = startOfWeek(mockCurrentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(mockCurrentDate, { weekStartsOn: 1 });
      const expectedRange = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`;

      expect(screen.getByText(expectedRange)).toBeInTheDocument();
    });
  });

  describe("User Interface", () => {
    it("renders welcome message with user name", () => {
      render(<Dashboard />);

      expect(screen.getByText("Welcome Back,")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("displays user rating", () => {
      render(<Dashboard />);

      expect(screen.getByText("Rating: 4.5")).toBeInTheDocument();
    });

    it("shows empty state when no assignments in current week", () => {
      mockUseAssignments.mockReturnValue({
        assignments: [],
        weeklyEarnings: [],
        weeklyTotal: 0,
        loading: false,
        error: null,
        updateAssignmentStatus: vi.fn(),
        fetchAssignmentsByShift: vi.fn(),
        fetchAssignments: vi.fn(),
        fetchWeeklyEarnings: vi.fn(),
      });

      render(<Dashboard />);

      expect(screen.getByText("No upcoming assignments")).toBeInTheDocument();
    });

    it("renders view details button", () => {
      render(<Dashboard />);

      const viewDetailsButton = screen.getByText("View Details");
      expect(viewDetailsButton).toBeInTheDocument();
    });
  });

  describe("Loading and Error States", () => {
    it("shows loading state", () => {
      mockUseAssignments.mockReturnValue({
        assignments: [],
        weeklyEarnings: [],
        weeklyTotal: 0,
        loading: true,
        error: null,
        updateAssignmentStatus: vi.fn(),
        fetchAssignmentsByShift: vi.fn(),
        fetchAssignments: vi.fn(),
        fetchWeeklyEarnings: vi.fn(),
      });

      render(<Dashboard />);

      expect(screen.getByText("Loading assignments...")).toBeInTheDocument();
    });

    it("handles missing profile data", () => {
      mockUseUserProfile.mockReturnValue({
        profileData: null,
        loading: false,
        personalInfoLoading: false,
        accountSettingsLoading: false,
        error: null,
        personalInfoError: null,
        accountSettingsError: null,
        fetchProfile: vi.fn(),
        updatePersonalInfo: vi.fn(),
        updateAccountSettings: vi.fn(),
        uploadProfileImage: vi.fn(),
        deleteProfile: vi.fn(),
        isJobSeeker: vi.fn().mockReturnValue(true),
        isClient: vi.fn().mockReturnValue(false),
        getDisplayData: vi.fn().mockReturnValue(null),
        getPersonalInfoData: vi.fn().mockReturnValue(null),
        getAccountFormData: vi.fn(),
      });

      render(<Dashboard />);

      expect(screen.getByText("Job Seeker")).toBeInTheDocument();
      expect(screen.getByText("Rating: 0.0")).toBeInTheDocument();
    });
  });
});