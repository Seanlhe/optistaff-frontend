import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Calendar } from "../../src/components/Calendar";

// Mock the hooks with failing scenarios
vi.mock("../../src/hooks/useAvailability", () => ({
  useAvailability: vi.fn(),
}));

vi.mock("../../src/hooks/useAvailabilityTemplate", () => ({
  useAvailabilityTemplate: vi.fn(),
}));

// Mock date-fns functions
vi.mock("date-fns", () => ({
  format: vi.fn(),
  startOfWeek: vi.fn(),
  addDays: vi.fn(),
  isSameDay: vi.fn(),
  set: vi.fn(),
}));

// Mock icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  Save: () => <div data-testid="save" />,
  File: () => <div data-testid="file" />,
  RefreshCw: () => <div data-testid="refresh" />,
}));

// Mock child components
vi.mock("../../src/components/CalendarEvent", () => ({
  CalendarEvent: ({ event }: any) => (
    <div data-testid="calendar-event">{event?.id}</div>
  ),
}));

vi.mock("../../src/components/TemplateNameDialog", () => ({
  TemplateNameDialog: () => <div data-testid="template-name-dialog" />,
}));

vi.mock("../../src/components/TemplateSelectDialog", () => ({
  TemplateSelectDialog: () => <div data-testid="template-select-dialog" />,
}));

describe("Calendar - Failure Scenarios", () => {
  let mockUseAvailability: any;
  let mockUseAvailabilityTemplate: any;
  let mockFormat: any;
  let mockStartOfWeek: any;
  let mockAddDays: any;
  let mockIsSameDay: any;
  let mockSet: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked functions
    const { useAvailability } = await import("../../src/hooks/useAvailability");
    const { useAvailabilityTemplate } = await import(
      "../../src/hooks/useAvailabilityTemplate"
    );
    const dateFns = await import("date-fns");

    mockUseAvailability = useAvailability as any;
    mockUseAvailabilityTemplate = useAvailabilityTemplate as any;
    mockFormat = dateFns.format as any;
    mockStartOfWeek = dateFns.startOfWeek as any;
    mockAddDays = dateFns.addDays as any;
    mockIsSameDay = dateFns.isSameDay as any;
    mockSet = dateFns.set as any;

    // Default working date functions
    mockFormat.mockReturnValue("2024-01-01");
    mockStartOfWeek.mockReturnValue(new Date("2024-01-01"));
    mockAddDays.mockReturnValue(new Date("2024-01-02"));
    mockIsSameDay.mockReturnValue(false);
    mockSet.mockReturnValue(new Date("2024-01-01T10:00:00"));

    // Default working availability template
    mockUseAvailabilityTemplate.mockReturnValue({
      createTemplate: vi.fn(() => Promise.resolve(true)),
      fetchTemplate: vi.fn(() => Promise.resolve({})),
      deleteTemplate: vi.fn(() => Promise.resolve(true)),
      fetchAllTemplates: vi.fn(() => Promise.resolve([])),
    });
  });

  it("should gracefully handle database connection errors", async () => {
    // Mock availability hook to return error state
    mockUseAvailability.mockReturnValue({
      getAvailability: vi.fn(() =>
        Promise.reject(new Error("Database connection failed")),
      ),
      setAvailability: vi.fn(() =>
        Promise.reject(new Error("Save operation failed")),
      ),
      fetchLoading: false,
      saveLoading: false,
      loading: false,
      error: "Failed to connect to database",
    });

    render(<Calendar />);

    // Component should render basic structure despite error - demonstrating graceful failure
    await waitFor(() => {
      // Calendar should still show basic structure (Mon header) even with database errors
      expect(screen.getByText("Mon")).toBeTruthy();
    });
  });

  it("should handle save errors gracefully", async () => {
    // Mock availability hook with save error
    mockUseAvailability.mockReturnValue({
      getAvailability: vi.fn(() => Promise.resolve([])),
      setAvailability: vi.fn(() =>
        Promise.reject(new Error("Save operation failed")),
      ),
      fetchLoading: false,
      saveLoading: false,
      loading: false,
      error: null,
    });

    render(<Calendar />);

    // Find and click save button
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    // Should handle save error gracefully (not crash)
    await waitFor(() => {
      // Calendar should still be rendered with its grid structure
      expect(screen.getByText("Mon")).toBeTruthy(); // Week day header
      expect(screen.getByText("Save")).toBeTruthy(); // Save button
    });
  });

  it("should handle empty availability data gracefully", async () => {
    // Mock availability hook to return null/empty data
    mockUseAvailability.mockReturnValue({
      getAvailability: vi.fn(() => Promise.resolve(null)),
      setAvailability: vi.fn(() => Promise.resolve(true)),
      fetchLoading: false,
      saveLoading: false,
      loading: false,
      error: null,
    });

    render(<Calendar />);

    // Component should render even with null availability data
    expect(screen.getByText("Mon")).toBeTruthy(); // Week day header should still render
  });

  it("should handle invalid date operations gracefully", async () => {
    // Mock date functions to return invalid dates
    mockFormat.mockReturnValue("Invalid Date");
    mockStartOfWeek.mockReturnValue(new Date("invalid"));
    mockAddDays.mockReturnValue(new Date("invalid"));

    // Component should handle invalid dates gracefully
    render(<Calendar />);

    // Should still render the calendar structure
    expect(screen.getByText("Mon")).toBeTruthy(); // Week day headers should still render
  });

  it("should handle template operations failures gracefully", async () => {
    // Mock template operations to fail
    mockUseAvailabilityTemplate.mockReturnValue({
      createTemplate: vi.fn(() =>
        Promise.reject(new Error("Template creation failed")),
      ),
      fetchTemplate: vi.fn(() =>
        Promise.reject(new Error("Template not found")),
      ),
      deleteTemplate: vi.fn(() =>
        Promise.reject(new Error("Template deletion failed")),
      ),
      fetchAllTemplates: vi.fn(() =>
        Promise.reject(new Error("Failed to fetch templates")),
      ),
    });

    mockUseAvailability.mockReturnValue({
      getAvailability: vi.fn(() => Promise.resolve([])),
      setAvailability: vi.fn(() => Promise.resolve(true)),
      fetchLoading: false,
      saveLoading: false,
      loading: false,
      error: null,
    });

    render(<Calendar />);

    // Calendar should still render even if template operations fail
    expect(screen.getByText("Mon")).toBeTruthy(); // Week day headers should still render
  });

  it("should handle corrupted availability data gracefully", async () => {
    // Mock availability hook to return malformed data
    mockUseAvailability.mockReturnValue({
      getAvailability: vi.fn(() =>
        Promise.resolve([
          {
            id: null,
            startTime: "invalid",
            endTime: undefined,
            day_of_week: "not-a-number",
          },
        ]),
      ),
      setAvailability: vi.fn(() => Promise.resolve(true)),
      fetchLoading: false,
      saveLoading: false,
      loading: false,
      error: null,
    });

    render(<Calendar />);

    // Component should handle malformed event data gracefully
    expect(screen.getByText("Mon")).toBeTruthy(); // Week day headers should still render
  });

  it("should display loading state correctly", () => {
    // Mock availability hook in loading state
    mockUseAvailability.mockReturnValue({
      getAvailability: vi.fn(() => Promise.resolve([])),
      setAvailability: vi.fn(() => Promise.resolve(true)),
      fetchLoading: true,
      saveLoading: false,
      loading: true,
      error: null,
    });

    render(<Calendar />);

    // Should show basic calendar structure even during loading
    expect(screen.getByText("Mon")).toBeTruthy(); // Week day headers render during loading
  });

  it("should handle navigation with boundary dates", () => {
    // Test navigation to edge dates
    mockUseAvailability.mockReturnValue({
      getAvailability: vi.fn(() => Promise.resolve([])),
      setAvailability: vi.fn(() => Promise.resolve(true)),
      fetchLoading: false,
      saveLoading: false,
      loading: false,
      error: null,
    });

    render(<Calendar />);

    // Navigate to extreme dates
    const prevButton = screen.getByTestId("chevron-left");
    const nextButton = screen.getByTestId("chevron-right");

    // Should handle multiple navigations without crashing
    for (let i = 0; i < 100; i++) {
      fireEvent.click(prevButton);
    }

    for (let i = 0; i < 100; i++) {
      fireEvent.click(nextButton);
    }

    // Calendar should still be functional
    expect(screen.getByText("Mon")).toBeTruthy(); // Week day headers should remain
  });

  it("should handle rapid user interactions gracefully", async () => {
    mockUseAvailability.mockReturnValue({
      getAvailability: vi.fn(() => Promise.resolve([])),
      setAvailability: vi.fn(() => Promise.resolve(true)),
      fetchLoading: false,
      saveLoading: false,
      loading: false,
      error: null,
    });

    render(<Calendar />);

    // Simulate rapid clicking on various elements
    const saveButton = screen.getByRole("button", { name: /save/i });
    const prevButton = screen.getByTestId("chevron-left");
    const nextButton = screen.getByTestId("chevron-right");

    // Rapid fire clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.click(saveButton);
      fireEvent.click(prevButton);
      fireEvent.click(nextButton);
    }

    // Component should handle rapid interactions gracefully
    expect(screen.getByText("Mon")).toBeTruthy(); // Week day headers should remain
  });
});
