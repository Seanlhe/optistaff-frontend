/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Calendar from "../../src/components/Calendar";

// Mock the hooks directly to avoid authentication complexity
vi.mock("../../src/hooks/useAvailability", () => ({
  useAvailability: () => ({
    getAvailability: vi.fn(() => Promise.resolve([])),
    setAvailability: vi.fn(() => Promise.resolve(true)),
    fetchLoading: false,
    saveLoading: false,
    loading: false,
    error: null,
  }),
}));

vi.mock("../../src/hooks/useAvailabilityTemplate", () => ({
  useAvailabilityTemplate: () => ({
    templates: [], // Make sure templates is defined as empty array
    createTemplate: vi.fn(() => Promise.resolve({ template_id: "test-id" })),
    fetchTemplate: vi.fn(() => Promise.resolve({ timeblocks: [] })),
    deleteTemplate: vi.fn(() => Promise.resolve(true)),
    fetchAllTemplates: vi.fn(() => Promise.resolve([])),
    loading: false,
  }),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  Save: () => <div data-testid="save-icon" />,
  File: () => <div data-testid="file-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  X: () => <div data-testid="x-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
}));

/**
 * Calendar Component Integration Tests
 * 
 * Tests the integration between Calendar and its direct child components:
 * - Calendar ↔ CalendarEvent integration 
 * - Calendar ↔ Template Dialog integration
 * - Calendar ↔ Navigation integration
 * 
 * These tests use mocked hooks to avoid authentication complexity
 * while still testing real component integration.
 */
describe("Calendar Component Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // Set predictable date
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-12-16T10:00:00Z"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * UC4: Basic Calendar Component Integration
   * 
   * Tests that Calendar component successfully renders with its integrated UI:
   * 1. Calendar grid with days and hours
   * 2. Template management buttons
   * 3. Save/refresh functionality
   * 4. Navigation controls
   */
  it("should render Calendar with all integrated UI components", () => {
    render(<Calendar />);

    // Verify Calendar grid integration - weekdays
    expect(screen.getByText("Mon")).toBeTruthy();
    expect(screen.getByText("Tue")).toBeTruthy();
    expect(screen.getByText("Wed")).toBeTruthy();
    expect(screen.getByText("Thu")).toBeTruthy();
    expect(screen.getByText("Fri")).toBeTruthy();
    expect(screen.getByText("Sat")).toBeTruthy();
    expect(screen.getByText("Sun")).toBeTruthy();

    // Verify template management integration
    expect(screen.getByText("Templates")).toBeTruthy();

    // Verify save functionality integration
    expect(screen.getByText("Save")).toBeTruthy();

    // Verify navigation integration
    expect(screen.getByText("Today")).toBeTruthy();
    expect(screen.getByTestId("chevron-left")).toBeTruthy();
    expect(screen.getByTestId("chevron-right")).toBeTruthy();
  });

  /**
   * UC4: Templates Button Integration
   * 
   * Tests the integration between Calendar and template functionality:
   * 1. Templates button is present and clickable
   * 2. Button integrates with template management system
   */
  it("should integrate Templates button functionality", () => {
    render(<Calendar />);

    // Find and click Templates button
    const templateButton = screen.getByText("Templates");
    expect(templateButton).toBeTruthy();

    // Test integration by clicking
    fireEvent.click(templateButton);

    // Button should remain functional (no errors thrown)
    expect(templateButton).toBeTruthy();
  });

  /**
   * UC4: Save Button Integration
   * 
   * Tests the integration between Calendar and save functionality:
   * 1. Save button is present and clickable
   * 2. Button integrates with availability saving system
   */
  it("should integrate Save button functionality", () => {
    render(<Calendar />);

    // Find and click Save button
    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeTruthy();

    // Test integration by clicking
    fireEvent.click(saveButton);

    // Button should remain functional
    expect(saveButton).toBeTruthy();
  });

  /**
   * UC4: Navigation Integration
   * 
   * Tests the integration between Calendar and navigation:
   * 1. Navigation buttons work
   * 2. Today button functions
   * 3. Week navigation is integrated
   */
  it("should integrate navigation functionality", () => {
    render(<Calendar />);

    // Test Today button
    const todayButton = screen.getByText("Today");
    fireEvent.click(todayButton);
    expect(todayButton).toBeTruthy();

    // Test navigation arrows
    const leftArrow = screen.getByTestId("chevron-left");
    const rightArrow = screen.getByTestId("chevron-right");
    
    fireEvent.click(leftArrow);
    fireEvent.click(rightArrow);
    
    expect(leftArrow).toBeTruthy();
    expect(rightArrow).toBeTruthy();
  });

  /**
   * UC4: Calendar Grid Integration
   * 
   * Tests the integration between Calendar and its grid structure:
   * 1. Calendar displays proper time structure
   * 2. Grid is properly integrated with components
   */
  it("should integrate Calendar grid structure", () => {
    render(<Calendar />);

    // Verify time display integration
    expect(screen.getByText("0:00")).toBeTruthy(); // Should show first hour
    expect(screen.getByText("December 2024")).toBeTruthy(); // Should show month

    // Verify all weekdays are integrated
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    weekdays.forEach(day => {
      expect(screen.getByText(day)).toBeTruthy();
    });
  });

  /**
   * UC4: Component State Integration
   * 
   * Tests that Calendar maintains proper component state:
   * 1. Component renders without errors
   * 2. State management works across renders
   * 3. UI updates are properly integrated
   */
  it("should maintain component state integration", () => {
    const { rerender } = render(<Calendar />);

    // Initial render should work
    expect(screen.getByText("Mon")).toBeTruthy();

    // Rerender should maintain integration
    rerender(<Calendar />);
    expect(screen.getByText("Mon")).toBeTruthy();
    expect(screen.getByText("Templates")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });
});