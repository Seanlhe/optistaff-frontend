import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import CalendarEvent from "../../../src/components/CalendarEvent";
import type { Event } from "../../../src/components/Calendar";

// --- Test Setup ---

const mockOnUpdate = vi.fn();
const mockOnDelete = vi.fn();

// Create a mock event for testing
const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: "test-event-1",
  startTime: new Date("2024-01-15T10:00:00"),
  endTime: new Date("2024-01-15T12:00:00"),
  ...overrides,
});

// --- Test Suite ---

describe("CalendarEvent", () => {
  let mockEvent: Event;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvent = createMockEvent();

    // Mock getBoundingClientRect for resize tests
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 0,
      bottom: 200,
      right: 200,
      width: 200,
      height: 100,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly with event time display", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    // Check that time is displayed correctly
    expect(screen.getByText("10:00 - 12:00")).toBeTruthy();
  });

  it("calculates correct positioning and height based on event times", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00").parentElement;

    // Check positioning (10:00 AM = 10 * 48px = 480px from top)
    expect(eventElement?.style.top).toBe("480px");

    // Check height (2 hours = 2 * 48px = 96px)
    expect(eventElement?.style.height).toBe("96px");
  });

  it("applies correct CSS classes for unselected state", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00").parentElement;

    expect(eventElement?.className).toContain("bg-primary-blue/40");
    expect(eventElement?.className).toContain("border-primary-blue/60");
    expect(eventElement?.className).toContain("hover:bg-primary-blue/80");
    expect(eventElement?.className).toContain("cursor-grab");
  });

  it("toggles selection state when clicked", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    // Initially unselected
    expect(eventElement.className).toContain("bg-primary-blue/40");

    // Click to select
    fireEvent.mouseDown(eventElement);

    // Should be selected now
    expect(eventElement.className).toContain("bg-primary-blue");
    expect(eventElement.className).toContain("border-primary-blue");
    expect(eventElement.className).not.toContain("bg-primary-blue/40");
  });

  it("handles focus and blur events correctly", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    // Focus should select the event
    fireEvent.focus(eventElement);
    expect(eventElement.className).toContain("bg-primary-blue");

    // Blur should deselect (when not dragging)
    fireEvent.blur(eventElement);
    expect(eventElement.className).toContain("bg-primary-blue/40");
  });

  it("deletes event on double-click", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    fireEvent.doubleClick(eventElement);

    expect(mockOnDelete).toHaveBeenCalledWith("test-event-1");
  });

  it("deletes event on keyboard Delete key when selected", async () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    // First select the event
    fireEvent.focus(eventElement);

    // Then press Delete key
    fireEvent.keyDown(document, { key: "Delete" });

    expect(mockOnDelete).toHaveBeenCalledWith("test-event-1");
  });

  it("deletes event on keyboard Backspace key when selected", async () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    // First select the event
    fireEvent.focus(eventElement);

    // Then press Backspace key
    fireEvent.keyDown(document, { key: "Backspace" });

    expect(mockOnDelete).toHaveBeenCalledWith("test-event-1");
  });

  it("does not delete on keyboard press when not selected", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    // Press Delete without selecting the event
    fireEvent.keyDown(document, { key: "Delete" });

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("shows resize handle on hover", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00").parentElement;
    const resizeHandle = eventElement?.querySelector(".resize-handle");

    expect(resizeHandle).toBeTruthy();
    expect(resizeHandle?.className).toContain("cursor-ns-resize");
    expect(resizeHandle?.className).toContain("opacity-0");
    expect(resizeHandle?.className).toContain("hover:opacity-100");
  });

  it("initiates dragging state when mouse down", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    fireEvent.mouseDown(eventElement);

    // Should show dragging styles
    expect(eventElement.className).toContain("opacity-50");
    expect(eventElement.className).toContain("cursor-grabbing");
  });

  it("handles dragging with mouse move events", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    // Start dragging
    fireEvent.mouseDown(eventElement, { clientX: 100, clientY: 100 });

    // Move mouse (simulate dragging down by 48px = 1 hour)
    fireEvent.mouseMove(document, { clientX: 100, clientY: 148 });

    // Should call onUpdate with new times
    expect(mockOnUpdate).toHaveBeenCalled();

    // End dragging
    fireEvent.mouseUp(document);

    // Should no longer be dragging
    expect(eventElement.className).not.toContain("opacity-50");
  });

  it("handles horizontal dragging to move between days", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    // Start dragging
    fireEvent.mouseDown(eventElement, { clientX: 100, clientY: 100 });

    // Move mouse horizontally (200px = 1 day based on DAY_WIDTH constant)
    fireEvent.mouseMove(document, { clientX: 300, clientY: 100 });

    expect(mockOnUpdate).toHaveBeenCalled();

    // End dragging
    fireEvent.mouseUp(document);
  });

  it("handles resize functionality", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00").parentElement;
    const resizeHandle = eventElement?.querySelector(
      ".resize-handle",
    ) as HTMLElement;

    expect(resizeHandle).toBeTruthy();

    // Start resizing
    fireEvent.mouseDown(resizeHandle, { clientX: 100, clientY: 200 });

    // Move mouse to resize (increase height)
    fireEvent.mouseMove(document, { clientX: 100, clientY: 250 });

    expect(mockOnUpdate).toHaveBeenCalled();

    // End resizing
    fireEvent.mouseUp(document);
  });

  it("prevents event propagation on resize handle click", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;
    const resizeHandle = eventElement?.querySelector(
      ".resize-handle",
    ) as HTMLElement;

    expect(resizeHandle).toBeTruthy();

    const eventSpy = vi.fn();
    eventElement.addEventListener("mousedown", eventSpy);

    // Click on resize handle should not trigger main event mousedown
    fireEvent.mouseDown(resizeHandle);

    // The main event handler should not be triggered because resize handle prevents propagation
    expect(eventElement.className).not.toContain("opacity-50");
  });

  it("handles events with different durations correctly", () => {
    const shortEvent = createMockEvent({
      startTime: new Date("2024-01-15T10:00:00"),
      endTime: new Date("2024-01-15T10:30:00"), // 30 minutes
    });

    render(
      <CalendarEvent
        event={shortEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 10:30").parentElement;

    // 30 minutes = 0.5 hours = 0.5 * 48px = 24px
    expect(eventElement?.style.height).toBe("24px");
  });

  it("handles events at different times of day correctly", () => {
    const eveningEvent = createMockEvent({
      startTime: new Date("2024-01-15T18:00:00"),
      endTime: new Date("2024-01-15T20:00:00"),
    });

    render(
      <CalendarEvent
        event={eveningEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("18:00 - 20:00").parentElement;

    // 6 PM = 18 * 48px = 864px from top
    expect(eventElement?.style.top).toBe("864px");
  });

  it("handles events that span minutes correctly", () => {
    const preciseEvent = createMockEvent({
      startTime: new Date("2024-01-15T10:15:00"),
      endTime: new Date("2024-01-15T11:45:00"),
    });

    render(
      <CalendarEvent
        event={preciseEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:15 - 11:45").parentElement;

    // 10:15 = 10.25 hours = 10.25 * 48px = 492px
    expect(eventElement?.style.top).toBe("492px");

    // 1.5 hours = 1.5 * 48px = 72px
    expect(eventElement?.style.height).toBe("72px");
  });

  it("sets correct z-index when dragging", () => {
    render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = screen.getByText("10:00 - 12:00")
      .parentElement as HTMLElement;

    // Initially should have z-index 1
    expect(eventElement.style.zIndex).toBe("1");

    // Start dragging
    fireEvent.mouseDown(eventElement);

    // Should have higher z-index when dragging
    expect(eventElement.style.zIndex).toBe("10");

    // End dragging
    fireEvent.mouseUp(document);

    // Should return to normal z-index
    expect(eventElement.style.zIndex).toBe("1");
  });
});
