// Unit tests for ClientShiftCard component
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ClientShiftCard from "../../../src/components/ClientShiftCard";
import { Shift } from "../../../src/types/hooks";

// Mock date-fns to control date formatting in tests
vi.mock("date-fns", () => ({
  format: vi.fn((date, formatString) => {
    if (formatString === "h:mm a") {
      if (date.toString().includes("09:00")) return "9:00 AM";
      if (date.toString().includes("17:00")) return "5:00 PM";
      return "12:00 PM";
    }
    return "formatted-date";
  }),
}));

describe("ClientShiftCard", () => {
  const mockShift: Shift = {
    shift_id: "shift-123",
    job_title: "Software Engineer",
    job_location: "Downtown Office",
    job_description: "Full-stack development",
    job_requirements: "React, Node.js",
    start_time: new Date("2024-07-30T09:00:00Z"),
    end_time: new Date("2024-07-30T17:00:00Z"),
    pay_rate: 25.5,
    staff_needed: 3,
    staff_assigned: 2,
    status: "active",
    created_at: new Date("2024-07-25T10:00:00Z"),
    postal_code: 12345,
    break_duration: 30,
    employer_name: "Tech Corp",
    company_name: "Tech Corp Inc",
    job_type: "contract",
    submission_cycle: "PRIMARY",
  };

  const mockOnShiftClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Section 1: Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      expect(screen.getByText("Software Engineer")).toBeTruthy();
    });

    it("displays job title correctly", () => {
      render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      expect(screen.getByText("Software Engineer")).toBeTruthy();
    });

    it("displays formatted time range", () => {
      render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      // Times are displayed with whitespace and line breaks in the HTML
      expect(screen.getByText(/5:00 PM/)).toBeTruthy();
      expect(screen.getByText(/to/)).toBeTruthy();
      expect(screen.getByText(/12:00 PM/)).toBeTruthy();
    });

    it("displays staff ratio correctly", () => {
      render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      expect(screen.getByText("2/3")).toBeTruthy();
    });

    it("displays person icon", () => {
      render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      const icon = screen.getByAltText("Calendar Icon");
      expect(icon).toBeTruthy();
      expect(icon.getAttribute("src")).toBe("/icons/person.svg");
    });
  });

  // Section 2: Conditional Styling Tests
  describe("Conditional Styling", () => {
    it("applies understaffed styling when staff_assigned < staff_needed", () => {
      const understaffedShift = {
        ...mockShift,
        staff_assigned: 1,
        staff_needed: 3,
      };

      const { container } = render(
        <ClientShiftCard
          shiftData={understaffedShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain("border-l-red-dark");
      expect(cardElement.className).toContain("bg-red");
    });

    it("applies fully staffed styling when staff_assigned >= staff_needed", () => {
      const fullyStaffedShift = {
        ...mockShift,
        staff_assigned: 3,
        staff_needed: 3,
      };

      const { container } = render(
        <ClientShiftCard
          shiftData={fullyStaffedShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain("border-l-green-dark");
      expect(cardElement.className).toContain("bg-green");
    });

    it("applies cancelled styling when status is cancel_by_employer", () => {
      const cancelledShift = { ...mockShift, status: "cancel_by_employer" };

      const { container } = render(
        <ClientShiftCard
          shiftData={cancelledShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain("border-l-gray-400");
      expect(cardElement.className).toContain("bg-gray-100");
    });

    it("applies selected styling when isSelected is true", () => {
      const { container } = render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
          isSelected={true}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain("ring-2");
      expect(cardElement.className).toContain("ring-gray-300");
    });

    it("applies hover styling when not selected", () => {
      const { container } = render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
          isSelected={false}
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain("hover:shadow-sm");
    });
  });

  // Section 3: User Interaction Tests
  describe("User Interactions", () => {
    it("calls onShiftClick when card is clicked", () => {
      render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      const cardElement = screen.getByText("Software Engineer").closest("div");
      fireEvent.click(cardElement!);

      expect(mockOnShiftClick).toHaveBeenCalledWith(mockShift);
      expect(mockOnShiftClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onShiftClick when shift is cancelled", () => {
      const cancelledShift = { ...mockShift, status: "cancel_by_employer" };

      render(
        <ClientShiftCard
          shiftData={cancelledShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      const cardElement = screen.getByText("Software Engineer").closest("div");
      fireEvent.click(cardElement!);

      expect(mockOnShiftClick).not.toHaveBeenCalled();
    });

    it("does not call onShiftClick when onShiftClick prop is not provided", () => {
      render(<ClientShiftCard shiftData={mockShift} />);

      const cardElement = screen.getByText("Software Engineer").closest("div");
      // Should not crash when clicked without onShiftClick prop
      expect(() => fireEvent.click(cardElement!)).not.toThrow();
    });

    it("handles rapid clicking without issues", () => {
      render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      const cardElement = screen.getByText("Software Engineer").closest("div");

      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(cardElement!);
      }

      expect(mockOnShiftClick).toHaveBeenCalledTimes(5);
    });
  });

  // Section 4: Props Validation Tests
  describe("Props Validation", () => {
    it("handles different job titles", () => {
      const shiftWithLongTitle = {
        ...mockShift,
        job_title:
          "Senior Full-Stack Software Engineer with React and Node.js Experience",
      };

      render(
        <ClientShiftCard
          shiftData={shiftWithLongTitle}
          onShiftClick={mockOnShiftClick}
        />
      );

      expect(screen.getByText(shiftWithLongTitle.job_title)).toBeTruthy();
    });

    it("handles different time formats", () => {
      const shiftWithDifferentTimes = {
        ...mockShift,
        start_time: new Date("2024-07-30T14:30:00Z"),
        end_time: new Date("2024-07-30T22:45:00Z"),
      };

      render(
        <ClientShiftCard
          shiftData={shiftWithDifferentTimes}
          onShiftClick={mockOnShiftClick}
        />
      );

      // Should render without crashing (exact time format depends on mock)
      expect(screen.getByText("Software Engineer")).toBeTruthy();
    });

    it("handles zero staff assignments", () => {
      const shiftWithNoStaff = {
        ...mockShift,
        staff_assigned: 0,
        staff_needed: 5,
      };

      render(
        <ClientShiftCard
          shiftData={shiftWithNoStaff}
          onShiftClick={mockOnShiftClick}
        />
      );

      expect(screen.getByText("0/5")).toBeTruthy();
    });

    it("handles overstaffed situations", () => {
      const overstaffedShift = {
        ...mockShift,
        staff_assigned: 5,
        staff_needed: 3,
      };

      render(
        <ClientShiftCard
          shiftData={overstaffedShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      expect(screen.getByText("5/3")).toBeTruthy();
      // Should still apply "filled" styling since staff_assigned >= staff_needed
      const { container } = render(
        <ClientShiftCard
          shiftData={overstaffedShift}
          onShiftClick={mockOnShiftClick}
        />
      );
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.className).toContain("bg-green");
    });
  });

  // Section 5: Edge Cases and Error Handling
  describe("Edge Cases", () => {
    it("handles missing or null job title", () => {
      const shiftWithEmptyTitle = { ...mockShift, job_title: "" };

      render(
        <ClientShiftCard
          shiftData={shiftWithEmptyTitle}
          onShiftClick={mockOnShiftClick}
        />
      );

      // Should render without crashing and show staff ratio
      expect(screen.getByText("2/3")).toBeTruthy();
    });

    it("handles special characters in job title", () => {
      const shiftWithSpecialChars = {
        ...mockShift,
        job_title: "Software Engineer & Developer (Part-time) - 50% Remote",
      };

      render(
        <ClientShiftCard
          shiftData={shiftWithSpecialChars}
          onShiftClick={mockOnShiftClick}
        />
      );

      expect(screen.getByText(shiftWithSpecialChars.job_title)).toBeTruthy();
    });

    it("handles different status values", () => {
      const statusVariations = ["active", "completed", "pending", "cancelled"];

      statusVariations.forEach((status) => {
        const shiftWithStatus = { ...mockShift, status };

        expect(() => {
          render(
            <ClientShiftCard
              shiftData={shiftWithStatus}
              onShiftClick={mockOnShiftClick}
            />
          );
        }).not.toThrow();
      });
    });

    it("maintains accessibility attributes", () => {
      render(
        <ClientShiftCard
          shiftData={mockShift}
          onShiftClick={mockOnShiftClick}
        />
      );

      const icon = screen.getByAltText("Calendar Icon");
      expect(icon).toBeTruthy();

      // Card should be clickable
      const cardElement = screen.getByText("Software Engineer").closest("div");
      expect(cardElement?.className).toContain("cursor-pointer");
    });
  });
});
