// Unit tests for ClientCalendarHeader component
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ClientCalendarHeader from "../../../src/components/ClientCalendarHeader";

describe("ClientCalendarHeader", () => {
  const defaultProps = {
    selectedLocation: "All Locations",
    onLocationChange: vi.fn(),
    availableLocations: ["All Locations", "Downtown", "Uptown"],
    days: [
      { name: "Mon", date: "2024-07-29" },
      { name: "Tue", date: "2024-07-30" },
      { name: "Wed", date: "2024-07-31" },
      { name: "Thu", date: "2024-08-01" },
      { name: "Fri", date: "2024-08-02" },
      { name: "Sat", date: "2024-08-03" },
      { name: "Sun", date: "2024-08-04" },
    ],
    onNavigateWeek: vi.fn(),
    onGoToToday: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Section 1: UI Rendering Tests
  describe("UI Rendering", () => {
    it("renders all navigation buttons", () => {
      render(<ClientCalendarHeader {...defaultProps} />);

      expect(screen.getByText("←")).toBeTruthy();
      expect(screen.getByText("→")).toBeTruthy();
      expect(screen.getByText("Today")).toBeTruthy();
    });

    it("displays correct month and year from days prop", () => {
      render(<ClientCalendarHeader {...defaultProps} />);

      expect(screen.getByText("July 2024")).toBeTruthy();
    });

    it("renders location dropdown with selected value", () => {
      render(<ClientCalendarHeader {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeTruthy();
      expect(screen.getByDisplayValue("All Locations")).toBeTruthy();
    });

    it("renders all available locations in dropdown", () => {
      render(<ClientCalendarHeader {...defaultProps} />);

      const select = screen.getByRole("combobox");
      const options = select.querySelectorAll("option");

      expect(options).toHaveLength(3);
      expect(options[0].textContent).toBe("All Locations");
      expect(options[1].textContent).toBe("Downtown");
      expect(options[2].textContent).toBe("Uptown");
    });
  });

  // Section 2: User Interaction Tests
  describe("User Interactions", () => {
    it('calls onNavigateWeek with "prev" when left arrow clicked', () => {
      const mockNavigate = vi.fn();
      render(
        <ClientCalendarHeader {...defaultProps} onNavigateWeek={mockNavigate} />
      );

      fireEvent.click(screen.getByText("←"));
      expect(mockNavigate).toHaveBeenCalledWith("prev");
    });

    it('calls onNavigateWeek with "next" when right arrow clicked', () => {
      const mockNavigate = vi.fn();
      render(
        <ClientCalendarHeader {...defaultProps} onNavigateWeek={mockNavigate} />
      );

      fireEvent.click(screen.getByText("→"));
      expect(mockNavigate).toHaveBeenCalledWith("next");
    });

    it("calls onGoToToday when Today button clicked", () => {
      const mockGoToToday = vi.fn();
      render(
        <ClientCalendarHeader {...defaultProps} onGoToToday={mockGoToToday} />
      );

      fireEvent.click(screen.getByText("Today"));
      expect(mockGoToToday).toHaveBeenCalled();
    });

    it("calls onLocationChange when dropdown selection changes", () => {
      const mockLocationChange = vi.fn();
      render(
        <ClientCalendarHeader
          {...defaultProps}
          onLocationChange={mockLocationChange}
        />
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "Downtown" } });

      expect(mockLocationChange).toHaveBeenCalledWith("Downtown");
    });
  });

  // Section 3: CSS and Styling Tests
  describe("CSS and Styling", () => {
    it("applies correct CSS classes for navigation buttons", () => {
      render(<ClientCalendarHeader {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.className).toContain("bg-gray-50");
        expect(button.className).toContain("border");
        expect(button.className).toContain("px-3");
        expect(button.className).toContain("py-1");
        expect(button.className).toContain("rounded-lg");
      });
    });

    it("applies correct container styling", () => {
      render(<ClientCalendarHeader {...defaultProps} />);

      // Check for the actual container with the correct classes
      // The button is inside a flex container, and that container is inside the main p-4 container
      const buttonContainer = screen
        .getByRole("button", { name: "Today" })
        .closest("div");
      const mainContainer = buttonContainer?.parentElement;

      expect(mainContainer).toBeTruthy();
      expect(mainContainer?.className).toContain("p-4");
      expect(mainContainer?.className).toContain("flex");
      expect(mainContainer?.className).toContain("justify-between");
      expect(mainContainer?.className).toContain("items-center");
    });
  });

  // Section 4: Edge Cases and Error Handling
  describe("Edge Cases", () => {
    it("handles empty availableLocations array gracefully", () => {
      render(
        <ClientCalendarHeader {...defaultProps} availableLocations={[]} />
      );

      const select = screen.getByRole("combobox");
      expect(select).toBeTruthy();

      const options = select.querySelectorAll("option");
      expect(options).toHaveLength(0);
    });

    it("handles empty days array gracefully", () => {
      render(<ClientCalendarHeader {...defaultProps} days={[]} />);

      // Should still render without crashing
      expect(screen.getByText("Today")).toBeTruthy();
    });

    it("handles missing selectedLocation prop", () => {
      const propsWithoutSelected = { ...defaultProps, selectedLocation: "" };
      render(<ClientCalendarHeader {...propsWithoutSelected} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      // When selectedLocation is empty, component might default to first available option
      expect(select.value).toBe("All Locations"); // Component likely defaults to first option
    });

    it("handles rapid button clicking without breaking", () => {
      const mockNavigate = vi.fn();
      render(
        <ClientCalendarHeader {...defaultProps} onNavigateWeek={mockNavigate} />
      );

      const prevButton = screen.getByText("←");

      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(prevButton);
      }

      expect(mockNavigate).toHaveBeenCalledTimes(5);
      expect(prevButton).toBeTruthy(); // Component should still be functional
    });
  });

  // Section 5: Props Validation Tests
  describe("Props Validation", () => {
    it("displays different month when days prop changes", () => {
      const januaryDays = [
        { name: "Mon", date: "2024-01-01" },
        { name: "Tue", date: "2024-01-02" },
        { name: "Wed", date: "2024-01-03" },
        { name: "Thu", date: "2024-01-04" },
        { name: "Fri", date: "2024-01-05" },
        { name: "Sat", date: "2024-01-06" },
        { name: "Sun", date: "2024-01-07" },
      ];

      render(<ClientCalendarHeader {...defaultProps} days={januaryDays} />);

      expect(screen.getByText("January 2024")).toBeTruthy();
    });

    it("updates selected location when prop changes", () => {
      const { rerender } = render(<ClientCalendarHeader {...defaultProps} />);

      expect(screen.getByDisplayValue("All Locations")).toBeTruthy();

      rerender(
        <ClientCalendarHeader {...defaultProps} selectedLocation="Downtown" />
      );

      expect(screen.getByDisplayValue("Downtown")).toBeTruthy();
    });
  });
});
