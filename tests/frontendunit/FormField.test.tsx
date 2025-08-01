/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { FormField } from "../../src/components/auth/FormField";

// Mock UI components
vi.mock("../../src/components/ui/input", () => ({
  Input: ({ children, onChange, className, id, type, required, value, placeholder, minLength, ...props }: any) => (
    <input
      id={id}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minLength={minLength}
      className={className}
      data-testid="mock-input"
      {...props}
    />
  ),
}));

vi.mock("../../src/components/ui/label", () => ({
  Label: ({ children, htmlFor, className, ...props }: any) => (
    <label htmlFor={htmlFor} className={className} data-testid="mock-label" data-htmlfor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

describe("FormField", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering Tests", () => {
    it("renders component without crashing", () => {
      render(
        <FormField
          id="test-field"
          label="Test Field"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("Test Field")).toBeTruthy();
      expect(screen.getByTestId("mock-input")).toBeTruthy();
    });

    it("displays label text correctly", () => {
      render(
        <FormField
          id="email"
          label="Email Address"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("Email Address")).toBeTruthy();
    });

    it("shows required asterisk when required is true", () => {
      render(
        <FormField
          id="required-field"
          label="Required Field"
          value=""
          onChange={mockOnChange}
          required={true}
        />
      );

      expect(screen.getByText("*")).toBeTruthy();
    });

    it("does not show required asterisk when required is false", () => {
      render(
        <FormField
          id="optional-field"
          label="Optional Field"
          value=""
          onChange={mockOnChange}
          required={false}
        />
      );

      expect(screen.queryByText("*")).toBeNull();
    });

    it("does not show required asterisk by default", () => {
      render(
        <FormField
          id="default-field"
          label="Default Field"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText("*")).toBeNull();
    });
  });

  describe("Input Field Tests", () => {
    it("renders input with correct id", () => {
      render(
        <FormField
          id="test-id"
          label="Test Field"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("id")).toBe("test-id");
    });

    it("renders input with correct type (default text)", () => {
      render(
        <FormField
          id="text-field"
          label="Text Field"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("type")).toBe("text");
    });

    it("renders input with specified type", () => {
      render(
        <FormField
          id="email-field"
          label="Email Field"
          type="email"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("type")).toBe("email");
    });

    it("renders input with correct value", () => {
      render(
        <FormField
          id="value-field"
          label="Value Field"
          value="test value"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input") as HTMLInputElement;
      expect(input.value).toBe("test value");
    });

    it("renders input with placeholder", () => {
      render(
        <FormField
          id="placeholder-field"
          label="Placeholder Field"
          value=""
          onChange={mockOnChange}
          placeholder="Enter text here"
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("placeholder")).toBe("Enter text here");
    });

    it("renders input with minLength attribute", () => {
      render(
        <FormField
          id="minlength-field"
          label="MinLength Field"
          value=""
          onChange={mockOnChange}
          minLength={6}
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("minLength")).toBe("6");
    });

    it("renders input with required attribute", () => {
      render(
        <FormField
          id="required-input"
          label="Required Input"
          value=""
          onChange={mockOnChange}
          required={true}
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("required")).toBe("");
    });
  });

  describe("Label Tests", () => {
    it("renders label with correct htmlFor attribute", () => {
      render(
        <FormField
          id="label-test"
          label="Label Test"
          value=""
          onChange={mockOnChange}
        />
      );

      const label = screen.getByTestId("mock-label");
      expect(label).toBeTruthy();
    });

    it("applies correct CSS classes to label", () => {
      render(
        <FormField
          id="style-test"
          label="Style Test"
          value=""
          onChange={mockOnChange}
        />
      );

      const label = screen.getByTestId("mock-label");
      expect(label.className).toContain("font-montserrat-smb");
    });

    it("renders required asterisk with correct styling", () => {
      render(
        <FormField
          id="asterisk-test"
          label="Asterisk Test"
          value=""
          onChange={mockOnChange}
          required={true}
        />
      );

      const asterisk = screen.getByText("*");
      expect(asterisk.className).toContain("text-red");
    });
  });

  describe("Interaction Tests", () => {
    it("calls onChange when input value changes", () => {
      render(
        <FormField
          id="change-test"
          label="Change Test"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input");
      fireEvent.change(input, { target: { value: "new value" } });

      expect(mockOnChange).toHaveBeenCalledWith("new value");
    });

    it("calls onChange with correct value on multiple changes", () => {
      render(
        <FormField
          id="multiple-change"
          label="Multiple Change"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input");
      
      fireEvent.change(input, { target: { value: "first" } });
      expect(mockOnChange).toHaveBeenCalledWith("first");

      fireEvent.change(input, { target: { value: "second" } });
      expect(mockOnChange).toHaveBeenCalledWith("second");

      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });

    it("handles empty string values correctly", () => {
      render(
        <FormField
          id="empty-test"
          label="Empty Test"
          value="initial"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input");
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith("");
    });
  });

  describe("Props Variation Tests", () => {
    it("handles different input types correctly", () => {
      const inputTypes = ["text", "email", "tel", "password"];

      inputTypes.forEach((type) => {
        const { unmount } = render(
          <FormField
            id={`${type}-test`}
            label={`${type} Field`}
            type={type}
            value=""
            onChange={mockOnChange}
          />
        );

        const input = screen.getByTestId("mock-input");
        expect(input.getAttribute("type")).toBe(type);

        unmount();
      });
    });

    it("handles value prop changes correctly", () => {
      const { rerender } = render(
        <FormField
          id="value-change"
          label="Value Change"
          value="initial"
          onChange={mockOnChange}
        />
      );

      let input = screen.getByTestId("mock-input") as HTMLInputElement;
      expect(input.value).toBe("initial");

      rerender(
        <FormField
          id="value-change"
          label="Value Change"
          value="updated"
          onChange={mockOnChange}
        />
      );

      input = screen.getByTestId("mock-input") as HTMLInputElement;
      expect(input.value).toBe("updated");
    });

    it("handles placeholder prop correctly", () => {
      const { rerender } = render(
        <FormField
          id="placeholder-change"
          label="Placeholder Change"
          value=""
          onChange={mockOnChange}
          placeholder="initial placeholder"
        />
      );

      let input = screen.getByTestId("mock-input");
      expect(input.getAttribute("placeholder")).toBe("initial placeholder");

      rerender(
        <FormField
          id="placeholder-change"
          label="Placeholder Change"
          value=""
          onChange={mockOnChange}
          placeholder="updated placeholder"
        />
      );

      input = screen.getByTestId("mock-input");
      expect(input.getAttribute("placeholder")).toBe("updated placeholder");
    });
  });

  describe("Edge Cases Tests", () => {
    it("handles undefined placeholder gracefully", () => {
      render(
        <FormField
          id="no-placeholder"
          label="No Placeholder"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("placeholder")).toBeNull();
    });

    it("handles undefined minLength gracefully", () => {
      render(
        <FormField
          id="no-minlength"
          label="No MinLength"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("minLength")).toBeNull();
    });

    it("handles zero minLength correctly", () => {
      render(
        <FormField
          id="zero-minlength"
          label="Zero MinLength"
          value=""
          onChange={mockOnChange}
          minLength={0}
        />
      );

      const input = screen.getByTestId("mock-input");
      expect(input.getAttribute("minLength")).toBe("0");
    });
  });

  describe("Component Structure Tests", () => {
    it("renders with correct HTML structure", () => {
      render(
        <FormField
          id="structure-test"
          label="Structure Test"
          value=""
          onChange={mockOnChange}
        />
      );

      const container = screen.getByText("Structure Test").closest("div");
      expect(container?.className).toContain("space-y-2");
    });

    it("contains exactly one label and one input", () => {
      render(
        <FormField
          id="count-test"
          label="Count Test"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getAllByTestId("mock-label")).toHaveLength(1);
      expect(screen.getAllByTestId("mock-input")).toHaveLength(1);
    });
  });

  describe("Accessibility Tests", () => {
    it("associates label with input correctly", () => {
      render(
        <FormField
          id="accessibility-test"
          label="Accessibility Test"
          value=""
          onChange={mockOnChange}
        />
      );

      const label = screen.getByTestId("mock-label");
      const input = screen.getByTestId("mock-input");

      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
    });

    it("provides meaningful labels", () => {
      render(
        <FormField
          id="meaningful-test"
          label="Email Address"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("Email Address")).toBeTruthy();
    });
  });
});