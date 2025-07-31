/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AssignmentDetailsModal } from "../../src/components/JobseekerAssignmentDetailModals";
import type { JobseekerAssignmentCard } from "../../src/components/JobseekerAssignmentCard";

// Mock the useAssignments hook
const mockUseAssignments = {
  updateAssignmentStatus: vi.fn(),
};

vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: () => mockUseAssignments,
}));

// Mock UI components
vi.mock("../../src/components/ui/button", () => ({
  Button: ({ children, onClick, className, variant, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("../../src/components/ui/dialog", () => ({
  Dialog: ({ children, open, ...props }: any) => 
    open ? <div data-testid="dialog-container" {...props}>{children}</div> : null,
  DialogContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  DialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
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
}));

// Mock StatusEnum
vi.mock("../../src/types/hooks", () => ({
  StatusEnum: {
    CancelByEmployee: "cancel_by_employee",
    CancelByEmployer: "cancel_by_employer",
    Completed: "completed",
    Confirmed: "confirmed",
    Pending: "pending",
  },
}));

describe("AssignmentDetailsModal", () => {
  const mockAssignment: JobseekerAssignmentCard = {
    id: "test-assignment-1",
    title: "Warehouse Helper",
    company_name: "ABC Logistics",
    date: "Mon, Dec 16",
    time: "9:00 AM – 5:00 PM",
    location: "123 Main Street, Singapore",
    hourlyRate: 25,
    description: "General warehouse duties including packing and sorting",
    requirements: "Must be able to lift 20kg and work in a fast-paced environment",
    status: "upcoming",
    contactNumber: "+65 1234 5678",
    contactEmail: "contact@abc.com",
    jobType: "warehouse",
    breakHours: 1,
    startTime: "2024-12-16T09:00:00Z",
    endTime: "2024-12-16T17:00:00Z",
  };

  const mockOnClose = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Reset mock implementations
    mockUseAssignments.updateAssignmentStatus.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when assignment is null", () => {
    render(
      <AssignmentDetailsModal
        assignment={null}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByText("Warehouse Helper")).toBeNull();
  });

  it("renders nothing when isOpen is false", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={false}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByText("Warehouse Helper")).toBeNull();
  });

  it("displays assignment details when open", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("Warehouse Helper")).toBeTruthy();
    expect(screen.getByText("ABC Logistics")).toBeTruthy();
    expect(screen.getByText("Mon, Dec 16")).toBeTruthy();
    expect(screen.getByText("9:00 AM – 5:00 PM")).toBeTruthy();
    expect(screen.getByText("123 Main Street, Singapore")).toBeTruthy();
    expect(screen.getByText("$25/hr")).toBeTruthy();
  });

  it("displays job description when available", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("General warehouse duties including packing and sorting")).toBeTruthy();
  });

  it("displays job requirements when available", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("Must be able to lift 20kg and work in a fast-paced environment")).toBeTruthy();
  });

  it("displays contact information when available", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("+65 1234 5678")).toBeTruthy();
    expect(screen.getByText("contact@abc.com")).toBeTruthy();
  });

  it("displays job type when available", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("warehouse")).toBeTruthy();
  });

  it("displays break hours when available", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("1 hour(s) break included")).toBeTruthy();
  });

  it("handles zero break hours correctly", () => {
    const assignmentWithZeroBreak = { ...mockAssignment, breakHours: 0 };
    
    render(
      <AssignmentDetailsModal
        assignment={assignmentWithZeroBreak}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("0 hour(s) break included")).toBeTruthy();
  });

  it("handles null break hours correctly", () => {
    const assignmentWithNullBreak = { ...mockAssignment, breakHours: null };
    
    render(
      <AssignmentDetailsModal
        assignment={assignmentWithNullBreak}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("0 hour(s) break included")).toBeTruthy();
  });

  it("displays all required icons", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByTestId("clock-icon")).toBeTruthy();
    expect(screen.getByTestId("map-pin-icon")).toBeTruthy();
    expect(screen.getByTestId("dollar-sign-icon")).toBeTruthy();
    expect(screen.getByTestId("briefcase-icon")).toBeTruthy();
    expect(screen.getByTestId("phone-icon")).toBeTruthy();
    expect(screen.getByTestId("mail-icon")).toBeTruthy();
  });

  it("shows cancel assignment button for upcoming assignments", () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("Cancel Assignment")).toBeTruthy();
  });

  it("does not show cancel button for completed assignments", () => {
    const completedAssignment = { ...mockAssignment, status: "completed" as const };
    
    render(
      <AssignmentDetailsModal
        assignment={completedAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByText("Cancel Assignment")).toBeNull();
  });

  it("does not show cancel button for already cancelled assignments", () => {
    const cancelledAssignment = { ...mockAssignment, status: "cancel_by_employee" as const };
    
    render(
      <AssignmentDetailsModal
        assignment={cancelledAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByText("Cancel Assignment")).toBeNull();
  });

  it("calls updateAssignmentStatus when cancel button is clicked", async () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    const cancelButton = screen.getByText("Cancel Assignment");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockUseAssignments.updateAssignmentStatus).toHaveBeenCalledWith(
        "test-assignment-1",
        "cancel_by_employee"
      );
    });
  });

  it("calls onStatusChange after successful cancellation", async () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    const cancelButton = screen.getByText("Cancel Assignment");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalled();
    });
  });

  it("calls onClose after successful cancellation", async () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    const cancelButton = screen.getByText("Cancel Assignment");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("handles cancellation error gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockUseAssignments.updateAssignmentStatus.mockRejectedValueOnce(
      new Error("Network error")
    );

    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    const cancelButton = screen.getByText("Cancel Assignment");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to cancel assignment:",
        expect.any(Error)
      );
    });

    // Should not call onClose or onStatusChange on error
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnStatusChange).not.toHaveBeenCalled();
  });

  it("handles missing optional fields gracefully", () => {
    const minimalAssignment: JobseekerAssignmentCard = {
      id: "minimal-1",
      title: "Basic Job",
      company_name: "Basic Company",
      date: "Today",
      time: "9-5",
      location: "Somewhere",
      hourlyRate: 20,
      status: "upcoming",
    };

    render(
      <AssignmentDetailsModal
        assignment={minimalAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("Basic Job")).toBeTruthy();
    expect(screen.getByText("Basic Company")).toBeTruthy();
    expect(screen.getByText("$20/hr")).toBeTruthy();
  });

  it("handles undefined onStatusChange prop", async () => {
    render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        // onStatusChange is undefined
      />
    );

    const cancelButton = screen.getByText("Cancel Assignment");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockUseAssignments.updateAssignmentStatus).toHaveBeenCalled();
    });

    // Should still call onClose
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("displays formatted break hours for multiple hours", () => {
    const assignmentWithMultipleBreaks = { ...mockAssignment, breakHours: 2 };
    
    render(
      <AssignmentDetailsModal
        assignment={assignmentWithMultipleBreaks}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("2 hour(s) break included")).toBeTruthy();
  });

  it("displays formatted break hours for fractional hours", () => {
    const assignmentWithFractionalBreak = { ...mockAssignment, breakHours: 0.5 };
    
    render(
      <AssignmentDetailsModal
        assignment={assignmentWithFractionalBreak}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("0.5 hour(s) break included")).toBeTruthy();
  });

  it("handles assignment prop changes correctly", () => {
    const { rerender } = render(
      <AssignmentDetailsModal
        assignment={mockAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("Warehouse Helper")).toBeTruthy();

    const updatedAssignment = {
      ...mockAssignment,
      title: "Updated Job Title",
      company_name: "Updated Company",
    };

    rerender(
      <AssignmentDetailsModal
        assignment={updatedAssignment}
        isOpen={true}
        onClose={mockOnClose}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText("Updated Job Title")).toBeTruthy();
    expect(screen.getByText("Updated Company")).toBeTruthy();
  });
});