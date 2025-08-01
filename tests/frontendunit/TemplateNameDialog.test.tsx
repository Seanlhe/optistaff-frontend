/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { TemplateNameDialog } from "../../src/components/TemplateNameDialog";
import type { TemplateNameDialogProps } from "../../src/types/components";

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
}));

describe("TemplateNameDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const defaultProps: TemplateNameDialogProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Happy Path Scenarios
  describe("Happy Path Scenarios", () => {
    it("renders modal when isOpen is true", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      expect(screen.getByRole("heading", { name: "Save Template" })).toBeTruthy();
      expect(screen.getByLabelText("Template Name")).toBeTruthy();
      expect(screen.getByPlaceholderText("Enter template name...")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Save Template" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    });

    it("allows user to enter template name", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "My Template" } });

      expect(input.value).toBe("My Template");
    });

    it("calls onSave with trimmed template name when form is submitted", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: "  My Template  " } });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith("My Template");
    });

    it("calls onSave when form is submitted via Enter key", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      fireEvent.change(input, { target: { value: "Test Template" } });
      
      // Submit via form element directly
      const form = input.closest("form")!;
      fireEvent.submit(form);

      expect(mockOnSave).toHaveBeenCalledWith("Test Template");
    });

    it("clears input field after successful save", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name") as HTMLInputElement;
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: "Test Template" } });
      fireEvent.click(saveButton);

      // Input should be cleared after save
      expect(input.value).toBe("");
    });

    it("calls onClose when Cancel button is clicked", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when X button is clicked", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const xButton = screen.getByTestId("x-icon").parentElement;
      fireEvent.click(xButton!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("focuses on input field when modal opens", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      expect(input).toHaveFocus();
    });
  });

  // Edge Cases (null values, empty data, whitespace handling)
  describe("Edge Cases", () => {
    it("renders nothing when isOpen is false", () => {
      render(<TemplateNameDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("heading", { name: "Save Template" })).toBeNull();
    });

    it("does not call onSave when template name is empty", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const saveButton = screen.getByRole("button", { name: "Save Template" });
      fireEvent.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("does not call onSave when template name is only whitespace", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("trims whitespace from template name before saving", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: "  Template Name  " } });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith("Template Name");
    });

    it("handles very long template names", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const longName = "A".repeat(100);
      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: longName } });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(longName);
    });

    it("handles special characters in template name", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const specialName = "Template-Name_2024 (v1)";
      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: specialName } });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(specialName);
    });

    it("clears input when modal is closed via onClose", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name") as HTMLInputElement;
      const cancelButton = screen.getByRole("button", { name: "Cancel" });

      fireEvent.change(input, { target: { value: "Test Template" } });
      fireEvent.click(cancelButton);

      expect(input.value).toBe("");
    });

    it("clears input when modal is closed via X button", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name") as HTMLInputElement;
      const xButton = screen.getByTestId("x-icon").parentElement;

      fireEvent.change(input, { target: { value: "Test Template" } });
      fireEvent.click(xButton!);

      expect(input.value).toBe("");
    });
  });

  // Error Conditions (loading states, disabled states)
  describe("Loading States and Error Conditions", () => {
    it("shows loading state when loading prop is true", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      expect(screen.getByRole("button", { name: "Saving..." })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Save Template" })).toBeNull();
    });

    it("disables input field when loading", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      const input = screen.getByLabelText("Template Name");
      expect(input).toBeDisabled();
    });

    it("disables save button when loading", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      const saveButton = screen.getByRole("button", { name: "Saving..." });
      expect(saveButton).toBeDisabled();
    });

    it("disables cancel button when loading", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      expect(cancelButton).toBeDisabled();
    });

    it("disables X button when loading", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      const xButton = screen.getByTestId("x-icon").parentElement;
      expect(xButton).toBeDisabled();
    });

    it("does not call onClose when X button is clicked during loading", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      const xButton = screen.getByTestId("x-icon").parentElement;
      fireEvent.click(xButton!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when Cancel button is clicked during loading", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("form submission still works during loading (only UI prevents it)", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      const input = screen.getByLabelText("Template Name");
      fireEvent.change(input, { target: { value: "Test Template" } });
      
      // Submit via form element directly (bypasses disabled button)
      const form = input.closest("form")!;
      fireEvent.submit(form);

      // The form submission logic itself doesn't check loading state
      // The component relies on disabled buttons for prevention
      expect(mockOnSave).toHaveBeenCalledWith("Test Template");
    });
  });

  // Conditional Logic (modal visibility, button states)
  describe("Conditional Logic and Button States", () => {
    it("save button is disabled when template name is empty", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const saveButton = screen.getByRole("button", { name: "Save Template" });
      expect(saveButton).toBeDisabled();
    });

    it("save button is disabled when template name is only whitespace", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: "   " } });
      expect(saveButton).toBeDisabled();
    });

    it("save button is enabled when template name has valid content", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: "Valid Template" } });
      expect(saveButton).not.toBeDisabled();
    });

    it("save button is disabled when both loading and has valid content", () => {
      render(<TemplateNameDialog {...defaultProps} loading={true} />);

      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Saving..." });

      fireEvent.change(input, { target: { value: "Valid Template" } });
      expect(saveButton).toBeDisabled();
    });

    it("displays correct CSS classes for disabled save button", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const saveButton = screen.getByRole("button", { name: "Save Template" });
      expect(saveButton.className).toContain("disabled:opacity-50");
      expect(saveButton.className).toContain("disabled:cursor-not-allowed");
    });

    it("displays correct CSS classes for enabled save button", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: "Valid Template" } });
      expect(saveButton.className).toContain("bg-primary-blue");
      expect(saveButton.className).toContain("hover:bg-primary-blue/80");
    });

    it("modal container has correct z-index for overlay", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const modalContainer = screen.getByRole("heading", { name: "Save Template" }).closest(".fixed");
      expect(modalContainer?.className).toContain("z-50");
    });

    it("displays X icon correctly", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      expect(screen.getByTestId("x-icon")).toBeTruthy();
    });
  });

  // Form Behavior and Accessibility
  describe("Form Behavior and Accessibility", () => {
    it("form has correct structure", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      const form = input.closest("form");
      expect(form).toBeTruthy();
      expect(form?.tagName.toLowerCase()).toBe("form");
    });

    it("input has correct accessibility attributes", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      expect(input.getAttribute("id")).toBe("templateName");
      expect(input.getAttribute("type")).toBe("text");
      expect(input.getAttribute("placeholder")).toBe("Enter template name...");
    });

    it("handles rapid typing correctly", async () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      
      // Simulate rapid typing
      fireEvent.change(input, { target: { value: "T" } });
      fireEvent.change(input, { target: { value: "Te" } });
      fireEvent.change(input, { target: { value: "Tes" } });
      fireEvent.change(input, { target: { value: "Test" } });

      expect((input as HTMLInputElement).value).toBe("Test");
    });

    it("prevents form submission with preventDefault", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      fireEvent.change(input, { target: { value: "Test Template" } });

      const form = input.closest("form")!;
      const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
      
      form.dispatchEvent(submitEvent);
      
      expect(submitEvent.defaultPrevented).toBe(true);
    });

    it("handles multiple rapid clicks on save button", () => {
      render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name");
      const saveButton = screen.getByRole("button", { name: "Save Template" });

      fireEvent.change(input, { target: { value: "Test Template" } });
      
      // Multiple rapid clicks
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      // Should only call onSave once (since input gets cleared after first save)
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });

  // Loading prop variations
  describe("Loading Prop Variations", () => {
    it("handles loading prop defaulting to false", () => {
      const propsWithoutLoading = {
        isOpen: true,
        onClose: mockOnClose,
        onSave: mockOnSave,
      };

      render(<TemplateNameDialog {...propsWithoutLoading} />);

      expect(screen.getByRole("button", { name: "Save Template" })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Saving..." })).toBeNull();
    });

    it("transitions from loading to not loading", () => {
      const { rerender } = render(<TemplateNameDialog {...defaultProps} loading={true} />);

      expect(screen.getByRole("button", { name: "Saving..." })).toBeTruthy();

      rerender(<TemplateNameDialog {...defaultProps} loading={false} />);

      expect(screen.getByRole("button", { name: "Save Template" })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Saving..." })).toBeNull();
    });

    it("transitions from not loading to loading", () => {
      const { rerender } = render(<TemplateNameDialog {...defaultProps} loading={false} />);

      expect(screen.getByRole("button", { name: "Save Template" })).toBeTruthy();

      rerender(<TemplateNameDialog {...defaultProps} loading={true} />);

      expect(screen.getByRole("button", { name: "Saving..." })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Save Template" })).toBeNull();
    });
  });

  // Modal State Management
  describe("Modal State Management", () => {
    it("preserves input value when props change but modal stays open", () => {
      const { rerender } = render(<TemplateNameDialog {...defaultProps} />);

      const input = screen.getByLabelText("Template Name") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Persistent Value" } });

      expect(input.value).toBe("Persistent Value");

      // Rerender with different loading state
      rerender(<TemplateNameDialog {...defaultProps} loading={true} />);

      expect(input.value).toBe("Persistent Value");
    });

    it("handles prop changes correctly", () => {
      const { rerender } = render(<TemplateNameDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("heading", { name: "Save Template" })).toBeNull();

      rerender(<TemplateNameDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("heading", { name: "Save Template" })).toBeTruthy();
    });
  });
});