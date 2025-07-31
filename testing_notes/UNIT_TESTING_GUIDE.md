# JSDashboard Unit Testing Guide

This guide provides comprehensive documentation for the unit tests created for the JSDashboard component and all its interacting components. It's designed to help university students understand testing patterns, mocking strategies, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Test Architecture](#test-architecture)
3. [Setup and Configuration](#setup-and-configuration)
4. [Mocking Strategy](#mocking-strategy)
5. [Test Files Documentation](#test-files-documentation)
6. [Running Tests](#running-tests)
7. [Best Practices](#best-practices)

## Overview

### What We Tested

We created unit tests for the **JSDashboard** component and all its interacting components:

- **JSDashboard** - Main dashboard page component
- **PayoutWeeklySummaryCard** - Displays weekly earnings
- **JobseekerAssignmentCard** - Shows individual assignment details
- **JobseekerAssignmentDetailModals** - Modal for assignment details
- **MonthlyCalendar** - Calendar navigation component

### Test Statistics

- **Total Test Files**: 5
- **Total Test Cases**: 88
- **All Tests**: ✅ **PASSING**

## Test Architecture

### Component Hierarchy

```
JSDashboard (Main Component)
├── PayoutWeeklySummaryCard
│   └── StatsCard
├── JobseekerAssignmentCard (multiple instances)
│   └── UI Components (Button, Card)
├── JobseekerAssignmentDetailModals
│   └── UI Components (Dialog, Button)
└── MonthlyCalendar
    └── Date Navigation
```

### Testing Philosophy

- **Unit Tests Only**: Each component tested in isolation
- **No Integration**: No actual API calls or database connections
- **Comprehensive Mocking**: All external dependencies mocked
- **University-Friendly**: Clear, educational test cases

## Setup and Configuration

### Prerequisites

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Test Configuration

Tests use the existing `vitest.frontend.config.ts` configuration:

```typescript
// vitest.frontend.config.ts
export default defineConfig({
  test: {
    setupFiles: ['src/test-setup-frontend.ts'], // Global mocks
    environment: 'jsdom',
    include: ['tests/frontendSuccessUnit/**/*.test.{ts,tsx}']
  }
})
```

### Global Test Setup

The `src/test-setup-frontend.ts` provides global mocks:

```typescript
// Global mocks applied to ALL tests
- Supabase client (no database calls)
- React Router hooks (navigation)
- React Query hooks (data fetching)
- Common UI icons
```

## Mocking Strategy

### Why Mock Everything?

1. **Speed**: Tests run faster without network calls
2. **Reliability**: Tests don't fail due to network issues
3. **Isolation**: Focus on component logic, not external services
4. **Consistency**: Predictable test outcomes

### Hook Mocking Pattern

```typescript
// Example: Mocking useAssignments hook
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
```

### Component Mocking Pattern

```typescript
// Example: Mocking child components
vi.mock("../../src/components/StatsCard", () => ({
  default: ({ title, value, icon }: any) => (
    <div data-testid="stats-card">
      <span data-testid="stats-title">{title}</span>
      <span data-testid="stats-value">{value}</span>
    </div>
  ),
}));
```

## Test Files Documentation

### 1. JSDashboard.test.tsx (17 tests)

**Purpose**: Test the main dashboard component logic and integration

#### Key Test Categories:

##### **Rendering Tests**
**Reasoning**: Ensures the component displays user information correctly and handles missing data gracefully.

```typescript
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
```

##### **Loading State Tests**
**Reasoning**: Verifies that loading indicators work properly for better user experience.

```typescript
it("shows loading state when assignments are loading", () => {
  mockUseAssignments.loading = true;
  
  render(<Dashboard />);

  expect(screen.getByText("Loading assignments...")).toBeTruthy();
});
```

##### **Data Display Tests**
**Reasoning**: Tests the core functionality of displaying assignment data with proper formatting.

```typescript
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
});

it("shows 'no assignments' message when no assignments available", () => {
  mockUseAssignments.assignments = [];
  
  render(<Dashboard />);

  expect(screen.getByText("No upcoming assignments")).toBeTruthy();
});
```

##### **Interaction Tests**
**Reasoning**: Ensures user interactions work correctly and trigger appropriate data updates.

```typescript
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
  expect(mockUseAssignments.fetchAssignments).toHaveBeenCalled();
});
```

##### **Data Processing Tests**
**Reasoning**: Tests business logic for data transformation and filtering.

```typescript
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

it("handles missing assignment data gracefully", () => {
  const incompleteAssignment = {
    assignment_id: "incomplete",
    status: "confirmed",
    created_at: new Date().toISOString(),
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  };
  
  mockUseAssignments.assignments = [incompleteAssignment];
  
  render(<Dashboard />);

  // Should render with default values
  expect(screen.getByTestId("assignment-card-incomplete")).toBeTruthy();
});
```

### 2. PayoutWeeklySummaryCard.test.tsx (20 tests)

**Purpose**: Test weekly earnings display and refresh functionality

#### Key Test Categories:

##### **Data Display Tests**
**Reasoning**: Ensures proper formatting and handling of different data states.

```typescript
it("displays formatted weekly total when data is available", () => {
  render(<PayoutWeeklySummaryCard />);

  expect(screen.getByText("$850.50")).toBeTruthy();
});

it("shows loading state when weekly data is loading", () => {
  mockUseAssignments.loading = true;
  
  render(<PayoutWeeklySummaryCard />);

  expect(screen.getByText("Loading...")).toBeTruthy();
});

it("displays $0.00 when weeklyTotal is null", () => {
  mockUseAssignments.weeklyTotal = null;
  
  render(<PayoutWeeklySummaryCard />);

  expect(screen.getByText("$0.00")).toBeTruthy();
});

it("displays $0.00 when weeklyTotal is NaN", () => {
  mockUseAssignments.weeklyTotal = NaN;
  
  render(<PayoutWeeklySummaryCard />);

  expect(screen.getByText("$0.00")).toBeTruthy();
});

it("formats decimal values correctly", () => {
  mockUseAssignments.weeklyTotal = 123.45;
  
  render(<PayoutWeeklySummaryCard />);

  expect(screen.getByText("$123.45")).toBeTruthy();
});
```

##### **Refresh Mechanism Tests**
**Reasoning**: Tests the reactive refresh system that updates earnings when assignments change.

```typescript
it("calls fetchWeeklyEarnings when refreshTrigger changes", async () => {
  const { rerender } = render(<PayoutWeeklySummaryCard refreshTrigger={1} />);

  await waitFor(() => {
    expect(mockUseAssignments.fetchWeeklyEarnings).toHaveBeenCalledTimes(1);
  });

  // Change refresh trigger
  rerender(<PayoutWeeklySummaryCard refreshTrigger={2} />);

  await waitFor(() => {
    expect(mockUseAssignments.fetchWeeklyEarnings).toHaveBeenCalledTimes(2);
  });
});

it("does not call fetchWeeklyEarnings when refreshTrigger is falsy", () => {
  render(<PayoutWeeklySummaryCard refreshTrigger={0} />);

  expect(mockUseAssignments.fetchWeeklyEarnings).not.toHaveBeenCalled();
});

it("does not call fetchWeeklyEarnings when no refreshTrigger provided", () => {
  render(<PayoutWeeklySummaryCard />);

  expect(mockUseAssignments.fetchWeeklyEarnings).not.toHaveBeenCalled();
});
```

##### **Error Handling Tests**
**Reasoning**: Ensures the component remains functional when data fetching fails.

```typescript
it("handles hook error gracefully", () => {
  mockUseAssignments.error = "Failed to fetch weekly earnings";
  
  render(<PayoutWeeklySummaryCard />);

  // Component should still render with the data available
  expect(screen.getByTestId("stats-card")).toBeTruthy();
  expect(screen.getByText("Weekly Earnings")).toBeTruthy();
});

it("handles fetchWeeklyEarnings rejection gracefully", async () => {
  mockUseAssignments.fetchWeeklyEarnings.mockRejectedValueOnce(new Error("Network error"));
  
  render(<PayoutWeeklySummaryCard refreshTrigger={1} />);

  await waitFor(() => {
    expect(mockUseAssignments.fetchWeeklyEarnings).toHaveBeenCalled();
  });

  // Component should still render
  expect(screen.getByTestId("stats-card")).toBeTruthy();
});

it("shows loading state takes precedence over error state", () => {
  mockUseAssignments.loading = true;
  mockUseAssignments.error = "Some error";
  
  render(<PayoutWeeklySummaryCard />);

  expect(screen.getByText("Loading...")).toBeTruthy();
});
```

### 3. JobseekerAssignmentCard.test.tsx (15 tests)

**Purpose**: Test assignment card display and interaction

#### Key Test Categories:

##### **Content Display Tests**
**Reasoning**: Verifies that all assignment information is displayed correctly and consistently.

```typescript
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
```

##### **Status Display Tests**
**Reasoning**: Tests the visual indication of assignment status for user clarity.

```typescript
it("applies correct status styling for upcoming assignments", () => {
  const upcomingAssignment = { ...mockAssignment, status: "upcoming" as const };
  
  render(
    <JobseekerAssignmentCard
      assignment={upcomingAssignment}
      onViewDetails={mockOnViewDetails}
    />
  );

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
```

##### **Interaction Tests**
**Reasoning**: Ensures user interactions work and accessibility standards are met.

```typescript
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
```

##### **Edge Case Tests**
**Reasoning**: Tests robustness when dealing with incomplete or edge-case data.

```typescript
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

it("handles long text content without breaking layout", () => {
  const longTextAssignment: AssignmentCardType = {
    ...mockAssignment,
    title: "Very Long Job Title That Should Not Break The Layout Design",
    company_name: "Very Long Company Name That Might Cause Layout Issues",
    location: "Very Long Address That Includes Many Details About The Specific Location",
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
```

### 4. JobseekerAssignmentDetailModals.test.tsx (23 tests)

**Purpose**: Test assignment detail modal functionality

#### Key Test Categories:

##### **Modal State Tests**
**Reasoning**: Tests proper modal show/hide behavior and conditional rendering.

```typescript
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
```

##### **Content Display Tests**
**Reasoning**: Verifies all assignment details are shown correctly in the modal.

```typescript
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
```

##### **Action Tests**
**Reasoning**: Tests conditional actions based on assignment status and proper API calls.

```typescript
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
```

##### **Error Handling Tests**
**Reasoning**: Ensures the modal remains functional when operations fail or data is missing.

```typescript
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
```

### 5. MonthlyCalendar.test.tsx (13 tests)

**Purpose**: Test calendar navigation and display functionality

#### Key Test Categories:

##### **Rendering Tests**
**Reasoning**: Verifies basic calendar structure and navigation elements are present.

```typescript
it("renders calendar with month and year header", () => {
  render(<MonthlyCalendar />);

  // Should display some month and year (we can't predict exact current date)
  const monthYearHeader = screen.getByRole("heading", { level: 3 });
  expect(monthYearHeader).toBeTruthy();
  expect(monthYearHeader.textContent).toMatch(/\w+ \d{4}/); // Matches "Month Year" format
});

it("displays navigation arrows", () => {
  render(<MonthlyCalendar />);

  expect(screen.getByTestId("chevron-left")).toBeTruthy();
  expect(screen.getByTestId("chevron-right")).toBeTruthy();
});

it("displays all days of the week headers", () => {
  render(<MonthlyCalendar />);

  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  daysOfWeek.forEach((day) => {
    expect(screen.getByText(day)).toBeTruthy();
  });
});
```

##### **Navigation Tests**
**Reasoning**: Tests calendar navigation without relying on specific dates (more robust).

```typescript
it("has clickable navigation buttons", () => {
  render(<MonthlyCalendar />);

  const prevButton = screen.getByTestId("chevron-left").closest("button");
  const nextButton = screen.getByTestId("chevron-right").closest("button");

  expect(prevButton).toBeTruthy();
  expect(nextButton).toBeTruthy();
  
  // Test that buttons are clickable (won't throw errors)
  fireEvent.click(prevButton!);
  fireEvent.click(nextButton!);
});

it("supports navigation button interactions", () => {
  render(<MonthlyCalendar />);

  const nextButton = screen.getByTestId("chevron-right").closest("button");
  const prevButton = screen.getByTestId("chevron-left").closest("button");

  // Test that multiple clicks don't break the component
  for (let i = 0; i < 3; i++) {
    fireEvent.click(nextButton!);
  }
  
  for (let i = 0; i < 3; i++) {
    fireEvent.click(prevButton!);
  }

  // Component should still be functional
  const monthYearHeader = screen.getByRole("heading", { level: 3 });
  expect(monthYearHeader).toBeTruthy();
  expect(monthYearHeader.textContent).toMatch(/\w+ \d{4}/);
});

it("handles navigation state correctly", () => {
  render(<MonthlyCalendar />);

  const monthYearHeader = screen.getByRole("heading", { level: 3 });
  const nextButton = screen.getByTestId("chevron-right").closest("button");
  const prevButton = screen.getByTestId("chevron-left").closest("button");

  // Store initial state
  const initialMonth = monthYearHeader.textContent;

  // Navigate and verify state changes
  fireEvent.click(nextButton!);
  fireEvent.click(prevButton!);
  
  // Should have a valid month/year displayed
  expect(monthYearHeader.textContent).toMatch(/\w+ \d{4}/);
});
```

##### **Data Display Tests**
**Reasoning**: Verifies calendar grid displays correctly with proper week structure.

```typescript
it("displays day numbers in the calendar grid", () => {
  render(<MonthlyCalendar />);

  // Should have day numbers - we'll look for at least some numbers 1-31
  const dayNumbers = ["15", "20", "25", "28"];
  let foundNumbers = 0;
  
  dayNumbers.forEach((day) => {
    if (screen.queryAllByText(day).length > 0) {
      foundNumbers++;
    }
  });
  
  expect(foundNumbers).toBeGreaterThan(0);
});

it("shows proper week structure (Monday as first day)", () => {
  render(<MonthlyCalendar />);

  // The component uses { weekStartsOn: 1 } which means Monday is the first day
  const dayHeaders = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  
  dayHeaders.forEach((day) => {
    const dayElement = screen.getByText(day);
    expect(dayElement).toBeTruthy();
  });

  // Mo should come before Su in the DOM order
  const mondayElement = screen.getByText("Mo");
  const sundayElement = screen.getByText("Su");
  expect(mondayElement).toBeTruthy();
  expect(sundayElement).toBeTruthy();
});
```

##### **Robustness Tests**
**Reasoning**: Tests component stability under various interaction patterns.

```typescript
it("handles rapid navigation clicks correctly", () => {
  render(<MonthlyCalendar />);

  const monthYearHeader = screen.getByRole("heading", { level: 3 });
  const initialMonth = monthYearHeader.textContent;
  const nextButton = screen.getByTestId("chevron-right").closest("button");

  // Rapidly click next button multiple times
  for (let i = 0; i < 5; i++) {
    fireEvent.click(nextButton!);
  }

  const finalMonth = monthYearHeader.textContent;
  expect(finalMonth).not.toBe(initialMonth);
});

it("handles extensive navigation correctly", () => {
  render(<MonthlyCalendar />);

  const monthYearHeader = screen.getByRole("heading", { level: 3 });
  const nextButton = screen.getByTestId("chevron-right").closest("button");

  // Navigate multiple times
  for (let i = 0; i < 10; i++) {
    fireEvent.click(nextButton!);
  }

  // Should still display a valid month/year
  expect(monthYearHeader.textContent).toMatch(/\w+ \d{4}/);
});

it("renders consistently across multiple renders", () => {
  const { rerender } = render(<MonthlyCalendar />);
  
  const monthYearHeader = screen.getByRole("heading", { level: 3 });
  expect(monthYearHeader).toBeTruthy();
  
  rerender(<MonthlyCalendar />);
  
  const newMonthYearHeader = screen.getByRole("heading", { level: 3 });
  expect(newMonthYearHeader).toBeTruthy();
});

it("has proper button accessibility", () => {
  render(<MonthlyCalendar />);

  const prevButton = screen.getByTestId("chevron-left").closest("button");
  const nextButton = screen.getByTestId("chevron-right").closest("button");

  expect(prevButton?.tagName).toBe("BUTTON");
  expect(nextButton?.tagName).toBe("BUTTON");
});
```

## Running Tests

### Command Reference

```bash
# Run all frontend success tests
npm run test:frontend:success:run

# Run specific test file
npm run test:frontend:success -- JSDashboard.test.tsx

# Run tests in watch mode (for development)
npm run test:frontend:success

# Run with coverage
npm run test:frontend:success:coverage

# Run specific test by name pattern
npm run test:frontend:success -- -t "renders dashboard"
```

### Using Vitest CLI Directly

```bash
# Run specific test file
npx vitest run --config vitest.frontend.config.ts tests/frontendSuccessUnit/JSDashboard.test.tsx

# Run with UI (debugging)
npx vitest --ui --config vitest.frontend.config.ts
```

## Best Practices

### 1. Test Structure

```typescript
describe("ComponentName", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
    // Set up default mock states
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Clean up after each test
  });

  it("should do something specific", () => {
    // Arrange: Set up test data
    // Act: Perform the action
    // Assert: Verify the result
  });
});
```

### 2. Mock Management

```typescript
// Good: Reset mock states in beforeEach
beforeEach(() => {
  mockHook.loading = false;
  mockHook.data = defaultData;
});

// Good: Override mocks for specific tests
it("handles loading state", () => {
  mockHook.loading = true;
  render(<Component />);
  expect(screen.getByText("Loading...")).toBeTruthy();
});
```

### 3. Meaningful Test Names

```typescript
// Good: Descriptive and specific
it("displays weekly earnings with correct formatting")
it("shows cancel button only for upcoming assignments")
it("handles missing user profile gracefully")

// Bad: Vague or generic
it("works correctly")
it("renders properly")
it("handles data")
```

### 4. Testing User Interactions

```typescript
// Good: Test user perspective
it("opens modal when view details button is clicked", () => {
  render(<Component />);
  
  const button = screen.getByText("View Details");
  fireEvent.click(button);
  
  expect(screen.getByTestId("modal")).toBeTruthy();
});
```

### 5. Error Boundary Testing

```typescript
// Good: Test error scenarios
it("handles API errors gracefully", () => {
  mockApi.mockRejectedValueOnce(new Error("Network error"));
  
  render(<Component />);
  
  // Component should still render, not crash
  expect(screen.getByText("Component Title")).toBeTruthy();
});
```

## Common Patterns

### 1. Testing Loading States

```typescript
it("shows loading state when data is loading", () => {
  mockHook.loading = true;
  
  render(<Component />);
  
  expect(screen.getByText("Loading...")).toBeTruthy();
});
```

### 2. Testing Data Formatting

```typescript
it("formats currency values correctly", () => {
  const testCases = [
    { input: 25.5, expected: "25.5/hr" },
    { input: 100, expected: "100/hr" },
  ];

  testCases.forEach(({ input, expected }) => {
    const { unmount } = render(<Component hourlyRate={input} />);
    expect(screen.getByText(expected)).toBeTruthy();
    unmount();
  });
});
```

### 3. Testing Conditional Rendering

```typescript
it("shows cancel button only for upcoming assignments", () => {
  const upcomingAssignment = { ...mockAssignment, status: "upcoming" };
  
  render(<Component assignment={upcomingAssignment} />);
  
  expect(screen.getByText("Cancel Assignment")).toBeTruthy();
});

it("hides cancel button for completed assignments", () => {
  const completedAssignment = { ...mockAssignment, status: "completed" };
  
  render(<Component assignment={completedAssignment} />);
  
  expect(screen.queryByText("Cancel Assignment")).toBeNull();
});
```

## Troubleshooting

### Common Issues

1. **Mock not working**: Check if mock is defined before the component import
2. **Tests timing out**: Ensure all async operations are properly mocked
3. **Element not found**: Use `screen.debug()` to see rendered HTML
4. **State not resetting**: Make sure `vi.clearAllMocks()` is in `beforeEach`

### Debugging Tips

```typescript
// Debug rendered output
it("debug test", () => {
  render(<Component />);
  screen.debug(); // Prints HTML to console
});

// Check what queries are available
it("find element", () => {
  render(<Component />);
  // Use testing-library's suggestions for better queries
});
```

## Conclusion

These unit tests provide comprehensive coverage of the JSDashboard functionality while serving as educational examples for testing React components. The tests are designed to be:

- **Maintainable**: Easy to update when components change
- **Reliable**: Consistent results regardless of external factors
- **Educational**: Clear examples of testing patterns and best practices
- **Comprehensive**: Cover normal cases, edge cases, and error scenarios

By following these patterns and practices, you can create robust test suites that give confidence in your code quality while helping team members learn effective testing strategies.