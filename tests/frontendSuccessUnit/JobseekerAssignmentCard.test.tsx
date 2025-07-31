/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { JobseekerAssignmentCard } from "../../src/components/JobseekerAssignmentCard";
import type { JobseekerAssignmentCard as AssignmentCardType } from "../../src/components/JobseekerAssignmentCard";

// Mock UI components
vi.mock("../../src/components/ui/button", () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("../../src/components/ui/card", () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Clock: () => <div data-testid="clock-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
}));

describe("JobseekerAssignmentCard", () => {
  const mockAssignment: AssignmentCardType = {
    id: "test-assignment-1",
    title: "Warehouse Helper",
    company_name: "ABC Logistics",
    date: "Mon, Dec 16",
    time: "9:00 AM – 5:00 PM",
    location: "123 Main Street, Singapore",
    hourlyRate: 25,
    description: "General warehouse duties including packing and sorting",
    requirements: "Must be able to lift 20kg",
    status: "upcoming",
    contactNumber: "+65 1234 5678",
    contactEmail: "contact@abc.com",
    jobType: "warehouse",
    breakHours: 1,
    startTime: "2024-12-16T09:00:00Z",
    endTime: "2024-12-16T17:00:00Z",
  };

  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders assignment card with basic information", () => {
    render(
      <JobseekerAssignmentCard
        assignment={mockAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("Warehouse Helper")).toBeTruthy();
    expect(screen.getByText("ABC Logistics")).toBeTruthy();
    expect(screen.getByText("Mon, Dec 16, 9:00 AM – 5:00 PM")).toBeTruthy();
    expect(screen.getByText("123 Main Street, Singapore")).toBeTruthy();
    expect(screen.getByText("25/hr")).toBeTruthy();
  });

  it("displays all required icons", () => {
    render(
      <JobseekerAssignmentCard
        assignment={mockAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByTestId("clock-icon")).toBeTruthy();
    expect(screen.getByTestId("map-pin-icon")).toBeTruthy();
    expect(screen.getByTestId("dollar-sign-icon")).toBeTruthy();
  });

  it("shows View Details button and calls onViewDetails when clicked", () => {
    render(
      <JobseekerAssignmentCard
        assignment={mockAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    const viewDetailsButton = screen.getByText("View Details");
    expect(viewDetailsButton).toBeTruthy();

    fireEvent.click(viewDetailsButton);
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockAssignment);
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it("applies correct status styling for upcoming assignments", () => {
    const upcomingAssignment = { ...mockAssignment, status: "upcoming" as const };
    
    render(
      <JobseekerAssignmentCard
        assignment={upcomingAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    // The status styling should be applied (testing presence of status element)
    expect(screen.getByText("Upcoming")).toBeTruthy();
  });

  it("applies correct status styling for completed assignments", () => {
    const completedAssignment = { ...mockAssignment, status: "completed" as const };
    
    render(
      <JobseekerAssignmentCard
        assignment={completedAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("Completed")).toBeTruthy();
  });

  it("applies correct status styling for cancelled by employer", () => {
    const cancelledAssignment = { ...mockAssignment, status: "cancel_by_employer" as const };
    
    render(
      <JobseekerAssignmentCard
        assignment={cancelledAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("Cancelled by Employer")).toBeTruthy();
  });

  it("applies correct status styling for cancelled by employee", () => {
    const cancelledAssignment = { ...mockAssignment, status: "cancel_by_employee" as const };
    
    render(
      <JobseekerAssignmentCard
        assignment={cancelledAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("Cancelled by Employee")).toBeTruthy();
  });

  it("handles missing optional fields gracefully", () => {
    const minimalAssignment: AssignmentCardType = {
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
      <JobseekerAssignmentCard
        assignment={minimalAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("Basic Job")).toBeTruthy();
    expect(screen.getByText("Basic Company")).toBeTruthy();
    expect(screen.getByText("20/hr")).toBeTruthy();
  });

  it("formats hourly rate correctly with different values", () => {
    const testCases = [
      { rate: 15, expected: "15/hr" },
      { rate: 25.5, expected: "25.5/hr" },
      { rate: 100, expected: "100/hr" },
    ];

    testCases.forEach(({ rate, expected }) => {
      const testAssignment = { ...mockAssignment, hourlyRate: rate };
      
      const { unmount } = render(
        <JobseekerAssignmentCard
          assignment={testAssignment}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText(expected)).toBeTruthy();
      
      unmount();
    });
  });

  it("handles long text content without breaking layout", () => {
    const longTextAssignment: AssignmentCardType = {
      ...mockAssignment,
      title: "Very Long Job Title That Should Not Break The Layout Design",
      company_name: "Very Long Company Name That Might Cause Layout Issues",
      location: "Very Long Address That Includes Many Details About The Specific Location",
      description: "This is a very long description that contains many details about the job requirements and expectations that should be handled properly by the component layout",
    };

    render(
      <JobseekerAssignmentCard
        assignment={longTextAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("Very Long Job Title That Should Not Break The Layout Design")).toBeTruthy();
    expect(screen.getByText("Very Long Company Name That Might Cause Layout Issues")).toBeTruthy();
  });

  it("renders without crashing when assignment prop is updated", () => {
    const { rerender } = render(
      <JobseekerAssignmentCard
        assignment={mockAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    const updatedAssignment = {
      ...mockAssignment,
      title: "Updated Job Title",
      status: "completed" as const,
    };

    rerender(
      <JobseekerAssignmentCard
        assignment={updatedAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("Updated Job Title")).toBeTruthy();
    expect(screen.getByText("Completed")).toBeTruthy();
  });

  it("maintains accessibility with proper button semantics", () => {
    render(
      <JobseekerAssignmentCard
        assignment={mockAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    const button = screen.getByText("View Details");
    expect(button.tagName).toBe("BUTTON");
  });

  it("handles zero hourly rate correctly by not showing it", () => {
    const zeroRateAssignment = { ...mockAssignment, hourlyRate: 0 };
    
    render(
      <JobseekerAssignmentCard
        assignment={zeroRateAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    // When hourlyRate is 0, the component doesn't render the rate section
    expect(screen.queryByText("0/hr")).toBeNull();
  });

  it("renders all status variations with correct text", () => {
    const statusTestCases: Array<{ status: AssignmentCardType['status'], expectedText: string }> = [
      { status: "upcoming", expectedText: "Upcoming" },
      { status: "completed", expectedText: "Completed" },
      { status: "cancel_by_employer", expectedText: "Cancelled by Employer" },
      { status: "cancel_by_employee", expectedText: "Cancelled by Employee" },
    ];

    statusTestCases.forEach(({ status, expectedText }) => {
      const testAssignment = { ...mockAssignment, status };
      
      const { unmount } = render(
        <JobseekerAssignmentCard
          assignment={testAssignment}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText(expectedText)).toBeTruthy();
      
      unmount();
    });
  });

  it("handles undefined status gracefully", () => {
    const noStatusAssignment = { ...mockAssignment };
    delete (noStatusAssignment as any).status;
    
    render(
      <JobseekerAssignmentCard
        assignment={noStatusAssignment}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Should render without crashing and show some default state
    expect(screen.getByText("Warehouse Helper")).toBeTruthy();
  });
});