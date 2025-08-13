import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import CalendarEvent from "../../../src/components/CalendarEvent";
import { UI_Event } from "../../../src/types/hooks";

// Mock date-fns functions used by CalendarEvent
vi.mock("date-fns", () => ({
  format: vi.fn(),
  differenceInMinutes: vi.fn(),
  addMinutes: vi.fn(),
  addDays: vi.fn(),
  set: vi.fn(),
  isSameDay: vi.fn(),
}));

describe("CalendarEvent - Failure Scenarios", () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset date-fns mocks to working defaults
    const dateFns = await import("date-fns");
    (dateFns.format as any).mockImplementation(
      (date: Date, formatStr: string) => date.toLocaleTimeString(),
    );
    (dateFns.differenceInMinutes as any).mockImplementation(
      (dateLeft: Date, dateRight: Date) => {
        return Math.abs(dateLeft.getTime() - dateRight.getTime()) / (1000 * 60);
      },
    );
    (dateFns.addMinutes as any).mockImplementation(
      (date: Date, amount: number) => {
        return new Date(date.getTime() + amount * 60 * 1000);
      },
    );
    (dateFns.addDays as any).mockImplementation(
      (date: Date, amount: number) => {
        return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000);
      },
    );
    (dateFns.set as any).mockImplementation((date: Date, values: any) => {
      const newDate = new Date(date);
      if (values.hours !== undefined) newDate.setHours(values.hours);
      if (values.minutes !== undefined) newDate.setMinutes(values.minutes);
      if (values.seconds !== undefined) newDate.setSeconds(values.seconds);
      if (values.milliseconds !== undefined)
        newDate.setMilliseconds(values.milliseconds);
      return newDate;
    });
    (dateFns.isSameDay as any).mockImplementation(
      (dateLeft: Date, dateRight: Date) => {
        return dateLeft.toDateString() === dateRight.toDateString();
      },
    );
  });

  it("TC-UC4-U22: should handle invalid date objects gracefully", () => {
    const invalidEvent: UI_Event = {
      id: "event-1",
      startTime: new Date("invalid"), // Invalid date
      endTime: new Date("invalid"), // Invalid date
      day_of_week: 1,
    };

    // Component should render and handle invalid dates gracefully
    render(
      <CalendarEvent
        event={invalidEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    // Should still render event element, possibly with fallback display
    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(eventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle missing event properties gracefully", () => {
    const incompleteEvent: UI_Event = {
      id: "", // Empty ID
      startTime: null as any, // Null time
      endTime: undefined as any, // Undefined time
      day_of_week: 1,
    };

    // Component should handle missing properties without crashing
    render(
      <CalendarEvent
        event={incompleteEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(eventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle negative duration events gracefully", () => {
    const negativeEvent: UI_Event = {
      id: "event-1",
      startTime: new Date("2024-01-01T11:00:00Z"), // End before start
      endTime: new Date("2024-01-01T10:00:00Z"),
      day_of_week: 1,
    };

    // Component should handle negative duration gracefully
    render(
      <CalendarEvent
        event={negativeEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    // Should render with minimum height or corrected times
    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(eventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle invalid day_of_week values gracefully", () => {
    const invalidDayEvent: UI_Event = {
      id: "event-1",
      startTime: new Date("2024-01-01T10:00:00Z"),
      endTime: new Date("2024-01-01T11:00:00Z"),
      day_of_week: 8, // Invalid day (should be 1-7)
    };

    // Component should handle invalid day gracefully
    render(
      <CalendarEvent
        event={invalidDayEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(eventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle drag operations with invalid coordinates gracefully", () => {
    const validEvent: UI_Event = {
      id: "event-1",
      startTime: new Date("2024-01-01T10:00:00Z"),
      endTime: new Date("2024-01-01T11:00:00Z"),
      day_of_week: 1,
    };

    render(
      <div style={{ position: "relative", height: "1000px" }}>
        <CalendarEvent
          event={validEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      </div>,
    );

    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    ) as HTMLElement;

    // Test dragging with extreme coordinates (but still valid numbers)
    fireEvent.mouseDown(eventElement, { clientY: -1000 });
    fireEvent.mouseMove(eventElement, { clientY: 5000 });
    fireEvent.mouseUp(eventElement);

    // Component should handle invalid coordinates without crashing
    expect(eventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle keyboard events with invalid properties gracefully", () => {
    const validEvent: UI_Event = {
      id: "event-1",
      startTime: new Date("2024-01-01T10:00:00Z"),
      endTime: new Date("2024-01-01T11:00:00Z"),
      day_of_week: 1,
    };

    render(
      <CalendarEvent
        event={validEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    ) as HTMLElement;

    // Test with invalid key event properties
    fireEvent.keyDown(eventElement, {
      key: null as any,
      code: undefined,
      keyCode: NaN,
    });

    // Component should handle invalid key events gracefully
    expect(eventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle resize operations with boundary violations gracefully", () => {
    const validEvent: UI_Event = {
      id: "event-1",
      startTime: new Date("2024-01-01T10:00:00Z"),
      endTime: new Date("2024-01-01T11:00:00Z"),
      day_of_week: 1,
    };

    render(
      <div style={{ position: "relative", height: "1000px" }}>
        <CalendarEvent
          event={validEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      </div>,
    );

    const resizeHandle = document.querySelector(
      ".resize-handle",
    ) as HTMLElement;

    // Test resizing beyond boundaries
    fireEvent.mouseDown(resizeHandle, { clientY: 100 });
    fireEvent.mouseMove(document, { clientY: -1000 }); // Far beyond top
    fireEvent.mouseUp(document);

    // Component should handle boundary violations gracefully
    const updatedEventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(updatedEventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle null or undefined callback functions gracefully", () => {
    const validEvent: UI_Event = {
      id: "event-1",
      startTime: new Date("2024-01-01T10:00:00Z"),
      endTime: new Date("2024-01-01T11:00:00Z"),
      day_of_week: 1,
    };

    // Pass null callbacks
    render(
      <CalendarEvent
        event={validEvent}
        onUpdate={null as any}
        onDelete={undefined as any}
      />,
    );

    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    ) as HTMLElement;

    // Try to trigger callbacks
    fireEvent.click(eventElement);
    fireEvent.keyDown(eventElement, { key: "Delete" });

    // Component should handle null callbacks gracefully
    const finalEventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(finalEventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle extreme time values gracefully", () => {
    const extremeEvent: UI_Event = {
      id: "event-1",
      startTime: new Date(0), // Unix epoch start
      endTime: new Date(8640000000000000), // Max safe date
      day_of_week: 1,
    };

    // Component should handle extreme dates gracefully
    render(
      <CalendarEvent
        event={extremeEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(eventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle rapid interaction events gracefully", () => {
    const validEvent: UI_Event = {
      id: "event-1",
      startTime: new Date("2024-01-01T10:00:00Z"),
      endTime: new Date("2024-01-01T11:00:00Z"),
      day_of_week: 1,
    };

    render(
      <CalendarEvent
        event={validEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    ) as HTMLElement;

    // Simulate rapid interactions
    for (let i = 0; i < 50; i++) {
      fireEvent.mouseDown(eventElement, { clientY: i * 10 });
      fireEvent.mouseMove(eventElement, { clientY: i * 15 });
      fireEvent.mouseUp(eventElement);
      fireEvent.click(eventElement);
      fireEvent.keyDown(eventElement, { key: "Delete" });
    }

    // Component should handle rapid interactions gracefully
    const rapidEventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(rapidEventElement).toBeTruthy();
  });

  it("TC-UC4-U22: should handle corrupted event data structure gracefully", () => {
    const corruptedEvent = {
      id: { toString: () => "corrupted-id" }, // Non-string ID
      startTime: "2024-01-01T10:00:00Z", // String instead of Date
      endTime: 1234567890, // Number instead of Date
      day_of_week: "1", // String instead of number
      extraField: { nested: { data: "should be ignored" } },
    } as any;

    // Component should handle corrupted data structure gracefully
    render(
      <CalendarEvent
        event={corruptedEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    const eventElement = document.querySelector(
      ".absolute.left-1.right-1.rounded.border",
    );
    expect(eventElement).toBeTruthy();
  });
});
