/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import PayoutWeeklySummaryCard from "../../../src/components/PayoutWeeklySummaryCard";

// Mock the useAssignments hook
const mockUseAssignments = {
  weeklyTotal: 850.50,
  loading: false,
  error: null,
  fetchWeeklyEarnings: vi.fn(),
};

vi.mock("../../src/hooks/useAssignments", () => ({
  useAssignments: () => mockUseAssignments,
}));

// Mock StatsCard component
vi.mock("../../src/components/StatsCard", () => ({
  default: ({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) => (
    <div data-testid="stats-card">
      <span data-testid="stats-title">{title}</span>
      <span data-testid="stats-value">{value}</span>
      {icon && <span data-testid="stats-icon">icon</span>}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
}));

describe("PayoutWeeklySummaryCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock states
    mockUseAssignments.weeklyTotal = 850.50;
    mockUseAssignments.loading = false;
    mockUseAssignments.error = null;
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders weekly earnings card with correct title", () => {
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByTestId("stats-card")).toBeTruthy();
    expect(screen.getByText("Weekly Earnings")).toBeTruthy();
  });

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

  it("displays $0.00 when weeklyTotal is undefined", () => {
    mockUseAssignments.weeklyTotal = undefined;
    
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByText("$0.00")).toBeTruthy();
  });

  it("displays $0.00 when weeklyTotal is NaN", () => {
    mockUseAssignments.weeklyTotal = NaN;
    
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByText("$0.00")).toBeTruthy();
  });

  it("formats zero value correctly", () => {
    mockUseAssignments.weeklyTotal = 0;
    
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByText("$0.00")).toBeTruthy();
  });

  it("formats decimal values correctly", () => {
    mockUseAssignments.weeklyTotal = 123.45;
    
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByText("$123.45")).toBeTruthy();
  });

  it("formats whole number values correctly", () => {
    mockUseAssignments.weeklyTotal = 500;
    
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByText("$500.00")).toBeTruthy();
  });

  it("formats large values correctly", () => {
    mockUseAssignments.weeklyTotal = 1234.56;
    
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByText("$1234.56")).toBeTruthy();
  });

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

  it("includes dollar sign icon", () => {
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByTestId("stats-icon")).toBeTruthy();
  });

  it("handles multiple rapid refresh triggers correctly", async () => {
    const { rerender } = render(<PayoutWeeklySummaryCard refreshTrigger={1} />);

    // Simulate multiple rapid updates
    rerender(<PayoutWeeklySummaryCard refreshTrigger={2} />);
    rerender(<PayoutWeeklySummaryCard refreshTrigger={3} />);
    rerender(<PayoutWeeklySummaryCard refreshTrigger={4} />);

    await waitFor(() => {
      expect(mockUseAssignments.fetchWeeklyEarnings).toHaveBeenCalledTimes(4);
    });
  });

  it("handles negative values correctly", () => {
    mockUseAssignments.weeklyTotal = -50.25;
    
    render(<PayoutWeeklySummaryCard />);

    expect(screen.getByText("$-50.25")).toBeTruthy();
  });

  it("resets refresh error when new refresh is triggered", async () => {
    // First, cause an error
    mockUseAssignments.fetchWeeklyEarnings.mockRejectedValueOnce(new Error("Network error"));
    
    const { rerender } = render(<PayoutWeeklySummaryCard refreshTrigger={1} />);

    await waitFor(() => {
      expect(mockUseAssignments.fetchWeeklyEarnings).toHaveBeenCalledTimes(1);
    });

    // Now trigger another refresh (should reset error state internally)
    mockUseAssignments.fetchWeeklyEarnings.mockResolvedValueOnce(undefined);
    rerender(<PayoutWeeklySummaryCard refreshTrigger={2} />);

    await waitFor(() => {
      expect(mockUseAssignments.fetchWeeklyEarnings).toHaveBeenCalledTimes(2);
    });

    // Component should still render normally
    expect(screen.getByTestId("stats-card")).toBeTruthy();
  });
});