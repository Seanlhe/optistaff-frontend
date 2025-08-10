import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import ClientRoster from "../../../src/pages/employer/ClientRoster";
import { Shift } from "../../../src/types/hooks";

// Mock the useShifts hook to simulate shift cancellation workflow
const mockUpdateShiftStatus = vi.fn();
const mockRefetchShifts = vi.fn();

const mockedShifts: Shift[] = [
  {
    shift_id: "shift-001",
    job_title: "Software Engineer",
    job_location: "Downtown Office",
    job_description: "Full-stack development work with React and Node.js",
    job_requirements: "3+ years experience, React, TypeScript, Node.js",
    start_time: new Date("2025-08-11T09:00:00Z"),
    end_time: new Date("2025-08-11T17:00:00Z"),
    pay_rate: 35.0,
    staff_needed: 3,
    staff_assigned: 2,
    status: "active",
    created_at: new Date("2025-08-01T10:00:00Z"),
    postal_code: 12345,
    break_duration: 60,
    employer_name: "Tech Solutions Inc",
    company_name: "Tech Solutions Inc",
    job_type: "contract",
    submission_cycle: "PRIMARY",
  },
  {
    shift_id: "shift-002",
    job_title: "Data Analyst",
    job_location: "Uptown Branch",
    job_description: "Analyze customer data and generate reports",
    job_requirements: "SQL, Python, Excel proficiency",
    start_time: new Date("2025-08-11T10:00:00Z"),
    end_time: new Date("2025-08-11T18:00:00Z"),
    pay_rate: 30.0,
    staff_needed: 2,
    staff_assigned: 1,
    status: "active",
    created_at: new Date("2025-08-01T11:00:00Z"),
    postal_code: 54321,
    break_duration: 45,
    employer_name: "Data Corp",
    company_name: "Data Corp Inc",
    job_type: "contract",
    submission_cycle: "PRIMARY",
  },
  {
    shift_id: "shift-003",
    job_title: "Marketing Assistant",
    job_location: "Downtown Office",
    job_description: "Support marketing campaigns and social media",
    job_requirements: "Digital marketing experience, creativity",
    start_time: new Date("2025-08-12T09:00:00Z"),
    end_time: new Date("2025-08-12T17:00:00Z"),
    pay_rate: 25.0,
    staff_needed: 1,
    staff_assigned: 1,
    status: "active",
    created_at: new Date("2025-08-01T12:00:00Z"),
    postal_code: 12345,
    break_duration: 60,
    employer_name: "Marketing Pro",
    company_name: "Marketing Pro Inc",
    job_type: "contract",
    submission_cycle: "PRIMARY",
  },
];

// Mock the useShifts hook
vi.mock("../../../src/hooks/useShifts", () => ({
  useShifts: () => ({
    shifts: mockedShifts,
    loading: false,
    error: null,
    updateShiftStatus: mockUpdateShiftStatus,
    refetchShifts: mockRefetchShifts,
  }),
}));

// Mock useAuth hook to provide authenticated user
vi.mock("../../../src/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-employer-id", email: "employer@example.com" },
    loading: false,
    error: null,
  }),
}));

// Mock date-fns for consistent date formatting
vi.mock("date-fns", async () => {
  const actual = (await vi.importActual("date-fns")) as any;
  return {
    ...actual,
    format: vi.fn((date, formatStr) => {
      const d = new Date(date);
      if (formatStr === "MMMM yyyy") {
        return `${d.toLocaleString("default", {
          month: "long",
        })} ${d.getFullYear()}`;
      }
      if (formatStr === "h:mm a") {
        return d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      if (formatStr === "MMMM d, yyyy") {
        return `${d.toLocaleString("default", {
          month: "long",
        })} ${d.getDate()}, ${d.getFullYear()}`;
      }
      return actual.format(date, formatStr);
    }),
    startOfWeek: vi.fn((date, options) => actual.startOfWeek(date, options)),
    addDays: vi.fn((date, amount) => actual.addDays(date, amount)),
  };
});

describe("UC8 Shift Cancellation Integration Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock return values for successful cancellation by default
    mockUpdateShiftStatus.mockResolvedValue({ updated_count: 1 });
  });

  it("Renders ClientRoster with shifts and allows shift selection, UC8 Steps 1-3", async () => {
    render(<ClientRoster />);

    // UC8 Step 1: Employer navigates to roster page
    expect(screen.getByText("August 2025")).toBeTruthy(); // Calendar header

    // UC8 Step 2: System displays shifts
    // Wait for shifts to be rendered in calendar days
    await waitFor(() => {
      expect(screen.getByText("Software Engineer")).toBeTruthy();
      expect(screen.getByText("Data Analyst")).toBeTruthy();
    });

    // UC8 Step 3: Employer clicks on desired job to cancel
    const softwareEngineerShift = screen.getAllByText("Software Engineer")[0]; // Click on the shift card, not modal
    fireEvent.click(softwareEngineerShift);

    // Verify shift details modal opens
    await waitFor(() => {
      expect(screen.getAllByText("Downtown Office")).toHaveLength(2); // One in dropdown, one in modal
      expect(
        screen.getByText("Full-stack development work with React and Node.js")
      ).toBeTruthy();
    });
  });

  it("Displays shift details and handles successful cancellation, UC8 Steps 4-7", async () => {
    render(<ClientRoster />);

    // Wait for shifts to load and select a shift
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(1);
    });

    const softwareEngineerShift = screen.getAllByText("Software Engineer")[0];
    fireEvent.click(softwareEngineerShift);

    // UC8 Step 4: ClientShiftDetails displays shift information
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(2); // One in card, one in modal
      expect(screen.getAllByText("Downtown Office")).toHaveLength(2); // One in dropdown, one in modal
      expect(screen.getByText("$35.00")).toBeTruthy();
      expect(screen.getByText("2 / 3")).toBeTruthy(); // Staff ratio
    });

    // UC8 Step 5: Employer clicks cancel button
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // UC8 Step 6: useShifts hook calls updateShiftStatus
    expect(mockUpdateShiftStatus).toHaveBeenCalledWith(
      "shift-001",
      "cancel_by_employer"
    );

    // UC8 Step 7: Successful response (updated_count = 1)
    await waitFor(() => {
      expect(mockRefetchShifts).toHaveBeenCalled();
    });
  });

  it("Handles failed cancellation when updated count is 0, UC8 Steps 4-5, 8", async () => {
    // Mock failed cancellation
    mockUpdateShiftStatus.mockResolvedValue({ updated_count: 0 });

    render(<ClientRoster />);

    // Wait for shifts and select one
    await waitFor(() => {
      expect(screen.getAllByText("Data Analyst")).toHaveLength(1);
    });

    const dataAnalystShift = screen.getAllByText("Data Analyst")[0];
    fireEvent.click(dataAnalystShift);

    // UC8 Step 4: Display shift details
    await waitFor(() => {
      expect(screen.getAllByText("Data Analyst")).toHaveLength(2); // One in card, one in modal
      expect(screen.getAllByText("Uptown Branch")).toHaveLength(2); // One in dropdown, one in modal
    });

    // UC8 Step 5: Click cancel button
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Verify updateShiftStatus was called
    expect(mockUpdateShiftStatus).toHaveBeenCalledWith(
      "shift-002",
      "cancel_by_employer"
    );

    // UC8 Step 8: Error handling when updated_count is 0
    // The component should handle this gracefully without crashing
    await waitFor(() => {
      // Verify the component is still functional
      expect(screen.getByText("Data Analyst")).toBeTruthy();
    });
  });

  it("Handles API errors during cancellation gracefully", async () => {
    // Mock API error
    mockUpdateShiftStatus.mockRejectedValue(new Error("Network error"));

    render(<ClientRoster />);

    // Wait for shifts and select one
    await waitFor(() => {
      expect(screen.getAllByText("Marketing Assistant")).toHaveLength(1);
    });

    const marketingShift = screen.getAllByText("Marketing Assistant")[0];
    fireEvent.click(marketingShift);

    // Display shift details
    await waitFor(() => {
      expect(screen.getAllByText("Marketing Assistant")).toHaveLength(2); // One in card, one in modal
      expect(screen.getAllByText("Downtown Office")).toHaveLength(2); // One in dropdown, one in modal
    });

    // Attempt cancellation
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Verify API call was made
    expect(mockUpdateShiftStatus).toHaveBeenCalledWith(
      "shift-003",
      "cancel_by_employer"
    );

    // Component should handle error without crashing
    await waitFor(() => {
      expect(screen.getAllByText("Marketing Assistant")).toHaveLength(2); // One in card, one in modal
    });
  });

  it("Allows multiple shift cancellations in sequence", async () => {
    render(<ClientRoster />);

    // First cancellation
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(1);
    });

    let softwareEngineerShift = screen.getAllByText("Software Engineer")[0];
    fireEvent.click(softwareEngineerShift);

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockUpdateShiftStatus).toHaveBeenCalledWith(
      "shift-001",
      "cancel_by_employer"
    );

    // Close modal
    fireEvent.click(screen.getByText("×"));

    // Second cancellation
    await waitFor(() => {
      expect(screen.getAllByText("Data Analyst")).toHaveLength(1);
    });

    const dataAnalystShift = screen.getAllByText("Data Analyst")[0];
    fireEvent.click(dataAnalystShift);

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockUpdateShiftStatus).toHaveBeenCalledWith(
      "shift-002",
      "cancel_by_employer"
    );

    // Verify both calls were made
    expect(mockUpdateShiftStatus).toHaveBeenCalledTimes(2);
  });

  it("Maintains shift filtering during cancellation workflow", async () => {
    render(<ClientRoster />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(1);
    });

    // Filter by location
    const locationSelect = screen.getByRole("combobox");
    fireEvent.change(locationSelect, { target: { value: "Downtown Office" } });

    // Should only show Downtown shifts (Software Engineer and Marketing Assistant)
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(1);
      expect(screen.getAllByText("Marketing Assistant")).toHaveLength(1);
      // Data Analyst (Uptown Branch) should not be visible
      expect(screen.queryByText("Data Analyst")).toBeNull();
    });

    // Select and cancel a filtered shift
    const softwareEngineerShift = screen.getAllByText("Software Engineer")[0];
    fireEvent.click(softwareEngineerShift);

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockUpdateShiftStatus).toHaveBeenCalledWith(
      "shift-001",
      "cancel_by_employer"
    );

    // Verify filter is maintained after cancellation
    expect(locationSelect).toBeTruthy();
    expect((locationSelect as HTMLSelectElement).value).toBe("Downtown Office");
  });

  it("Handles cancellation during different week views", async () => {
    render(<ClientRoster />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(1);
    });

    // Navigate to next week
    const nextWeekButton = screen.getByText("→");
    fireEvent.click(nextWeekButton);

    // Navigate back to current week
    const prevWeekButton = screen.getByText("←");
    fireEvent.click(prevWeekButton);

    // Ensure shifts are still visible
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(1);
    });

    // Perform cancellation
    const softwareEngineerShift = screen.getAllByText("Software Engineer")[0];
    fireEvent.click(softwareEngineerShift);

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockUpdateShiftStatus).toHaveBeenCalledWith(
      "shift-001",
      "cancel_by_employer"
    );
  });

  it("Verifies complete UC8 workflow end-to-end", async () => {
    render(<ClientRoster />);

    // UC8 Step 1: Load roster page
    expect(screen.getByText("August 2025")).toBeTruthy();

    // UC8 Steps 2-3: Display shifts and click desired job
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(1);
    });

    const shiftToCancel = screen.getAllByText("Software Engineer")[0];
    fireEvent.click(shiftToCancel);

    // UC8 Step 4: ClientShiftDetails renders shift information
    await waitFor(() => {
      expect(screen.getAllByText("Software Engineer")).toHaveLength(2); // One in card, one in modal
      expect(screen.getAllByText("Downtown Office")).toHaveLength(2); // One in dropdown, one in modal
      expect(
        screen.getByText("Full-stack development work with React and Node.js")
      ).toBeTruthy();
      expect(screen.getByText("$35.00")).toBeTruthy();
      expect(screen.getByText("2 / 3")).toBeTruthy();
    });

    // UC8 Step 5: Click cancel button
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeTruthy();
    fireEvent.click(cancelButton);

    // UC8 Step 6: useShifts hook updateShiftStatus called
    expect(mockUpdateShiftStatus).toHaveBeenCalledWith(
      "shift-001",
      "cancel_by_employer"
    );

    // UC8 Step 7: Successful response triggers refetch
    await waitFor(() => {
      expect(mockRefetchShifts).toHaveBeenCalled();
    });

    // Verify workflow completion
    expect(mockUpdateShiftStatus).toHaveBeenCalledTimes(1);
    expect(mockRefetchShifts).toHaveBeenCalledTimes(1);
  });
});
