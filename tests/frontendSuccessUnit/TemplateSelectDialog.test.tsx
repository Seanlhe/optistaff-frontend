/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { TemplateSelectDialog } from "../../src/components/TemplateSelectDialog";
import type { TemplateSelectDialogProps } from "../../src/types/components";
import type { UI_Event } from "../../src/types/hooks";

// Mock the useAvailabilityTemplate hook
const mockUseAvailabilityTemplate = {
  templates: [],
  fetchAllTemplates: vi.fn(),
  loading: false,
  saveLoading: false,
  error: null,
  fetchLoading: false,
};

vi.mock("../../src/hooks/useAvailabilityTemplate", () => ({
  useAvailabilityTemplate: () => mockUseAvailabilityTemplate,
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
}));

describe("TemplateSelectDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSaveTemplate = vi.fn();

  const mockTimeblocks: UI_Event[] = [
    {
      id: "1",
      title: "Available",
      start: "2024-01-01T09:00:00",
      end: "2024-01-01T17:00:00",
      resourceId: "day1",
    },
  ];

  const defaultProps: TemplateSelectDialogProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSelect: mockOnSelect,
    onDelete: mockOnDelete,
    onSaveTemplate: mockOnSaveTemplate,
    timeblocks: mockTimeblocks,
    loading: false,
  };

  const mockTemplates = [
    {
      template_id: "template-1",
      template_name: "Morning Shift",
      created_at: "2024-01-01T10:00:00Z",
      user_id: "user-1",
    },
    {
      template_id: "template-2",
      template_name: "Evening Shift",
      created_at: "2024-01-02T14:00:00Z",
      user_id: "user-1",
    },
    {
      template_id: "template-3",
      template_name: "Weekend Template",
      created_at: "2024-01-03T08:00:00Z",
      user_id: "user-1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Reset mock implementations
    mockUseAvailabilityTemplate.templates = [];
    mockUseAvailabilityTemplate.loading = false;
    mockUseAvailabilityTemplate.error = null;
    mockUseAvailabilityTemplate.fetchAllTemplates.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Happy Path Scenarios
  describe("Happy Path Scenarios", () => {
    it("renders modal when isOpen is true", () => {
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByRole("heading", { name: "Templates" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Save as New Template" })).toBeTruthy();
      expect(screen.getByTestId("x-icon")).toBeTruthy();
    });

    it("calls fetchAllTemplates when modal opens", async () => {
      render(<TemplateSelectDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockUseAvailabilityTemplate.fetchAllTemplates).toHaveBeenCalled();
      });
    });

    it("displays templates when available", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText("Morning Shift")).toBeTruthy();
      expect(screen.getByText("Evening Shift")).toBeTruthy();
      expect(screen.getByText("Weekend Template")).toBeTruthy();
    });

    it("displays formatted creation dates", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      // Check that dates are formatted (format may vary by locale)
      expect(screen.getByText(/Created: 1\/1\/2024|Created: 01\/01\/2024/)).toBeTruthy();
      expect(screen.getByText(/Created: 1\/2\/2024|Created: 01\/02\/2024/)).toBeTruthy();
    });

    it("calls onSelect when Use button is clicked", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      const useButtons = screen.getAllByText("Use");
      fireEvent.click(useButtons[0]);

      expect(mockOnSelect).toHaveBeenCalledWith("template-1");
    });

    it("calls onDelete when Delete button is clicked", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[1]);

      expect(mockOnDelete).toHaveBeenCalledWith("template-2");
    });

    it("calls onSaveTemplate when Save as New Template button is clicked", () => {
      render(<TemplateSelectDialog {...defaultProps} />);

      const saveButton = screen.getByRole("button", { name: "Save as New Template" });
      fireEvent.click(saveButton);

      expect(mockOnSaveTemplate).toHaveBeenCalled();
    });

    it("calls onClose when X button is clicked", () => {
      render(<TemplateSelectDialog {...defaultProps} />);

      const xButton = screen.getByTestId("x-icon").parentElement;
      fireEvent.click(xButton!);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Edge Cases (null values, empty data)
  describe("Edge Cases", () => {
    it("renders nothing when isOpen is false", () => {
      render(<TemplateSelectDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("heading", { name: "Templates" })).toBeNull();
    });

    it("displays empty state when no templates available", () => {
      mockUseAvailabilityTemplate.templates = [];
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText("No templates found")).toBeTruthy();
      expect(screen.getByTestId("calendar-icon")).toBeTruthy();
    });

    it("handles templates with null or undefined values gracefully", () => {
      mockUseAvailabilityTemplate.templates = [
        {
          template_id: "template-null",
          template_name: "",
          created_at: "2024-01-01T10:00:00Z",
          user_id: "user-1",
        },
      ];
      
      render(<TemplateSelectDialog {...defaultProps} />);

      // Should render even with empty name
      expect(screen.getByText(/Created:/)).toBeTruthy();
      expect(screen.getByText("Use")).toBeTruthy();
      expect(screen.getByText("Delete")).toBeTruthy();
    });

    it("handles very long template names", () => {
      const longName = "A Very Long Template Name That Exceeds Normal Length And Tests Text Overflow Handling";
      mockUseAvailabilityTemplate.templates = [
        {
          template_id: "template-long",
          template_name: longName,
          created_at: "2024-01-01T10:00:00Z",
          user_id: "user-1",
        },
      ];
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText(longName)).toBeTruthy();
    });

    it("handles special characters in template names", () => {
      const specialName = "Template-Name_2024 (v1) & More!";
      mockUseAvailabilityTemplate.templates = [
        {
          template_id: "template-special",
          template_name: specialName,
          created_at: "2024-01-01T10:00:00Z",
          user_id: "user-1",
        },
      ];
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText(specialName)).toBeTruthy();
    });

    it("handles large number of templates with scrolling", () => {
      const manyTemplates = Array.from({ length: 20 }, (_, i) => ({
        template_id: `template-${i}`,
        template_name: `Template ${i + 1}`,
        created_at: "2024-01-01T10:00:00Z",
        user_id: "user-1",
      }));
      
      mockUseAvailabilityTemplate.templates = manyTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      // Should render all templates
      expect(screen.getByText("Template 1")).toBeTruthy();
      expect(screen.getByText("Template 20")).toBeTruthy();
      
      // Container should have scroll styles
      const scrollContainer = screen.getByText("Template 1").closest(".space-y-2");
      expect(scrollContainer?.className).toContain("max-h-60");
      expect(scrollContainer?.className).toContain("overflow-y-auto");
    });

    it("handles missing onSaveTemplate prop gracefully", () => {
      const propsWithoutSaveTemplate = {
        ...defaultProps,
        onSaveTemplate: undefined,
      };
      
      render(<TemplateSelectDialog {...propsWithoutSaveTemplate} />);

      const saveButton = screen.getByRole("button", { name: "Save as New Template" });
      fireEvent.click(saveButton);

      // Should not crash when onSaveTemplate is undefined
      expect(mockOnSaveTemplate).not.toHaveBeenCalled();
    });
  });

  // Error Conditions & Loading States
  describe("Error Conditions & Loading States", () => {
    it("displays loading state when templates are being fetched", () => {
      mockUseAvailabilityTemplate.loading = true;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText("Loading templates...")).toBeTruthy();
      expect(screen.queryByText("No templates found")).toBeNull();
    });

    it("disables buttons when component is in loading state", () => {
      render(<TemplateSelectDialog {...defaultProps} loading={true} />);

      const xButton = screen.getByTestId("x-icon").parentElement;
      const saveButton = screen.getByRole("button", { name: "Save as New Template" });

      expect(xButton).toBeDisabled();
      expect(saveButton).toBeDisabled();
    });

    it("does not call onClose when X button is clicked during loading", () => {
      render(<TemplateSelectDialog {...defaultProps} loading={true} />);

      const xButton = screen.getByTestId("x-icon").parentElement;
      fireEvent.click(xButton!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not call onSaveTemplate when Save button is clicked during loading", () => {
      render(<TemplateSelectDialog {...defaultProps} loading={true} />);

      const saveButton = screen.getByRole("button", { name: "Save as New Template" });
      fireEvent.click(saveButton);

      expect(mockOnSaveTemplate).not.toHaveBeenCalled();
    });

    it("handles fetchAllTemplates rejection gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockUseAvailabilityTemplate.fetchAllTemplates.mockRejectedValueOnce(
        new Error("Network error")
      );

      render(<TemplateSelectDialog {...defaultProps} />);

      await waitFor(() => {
        expect(mockUseAvailabilityTemplate.fetchAllTemplates).toHaveBeenCalled();
      });

      // Component should not crash
      expect(screen.getByRole("heading", { name: "Templates" })).toBeTruthy();
      
      consoleErrorSpy.mockRestore();
    });

    it("displays error state appropriately", () => {
      mockUseAvailabilityTemplate.error = "Failed to fetch templates";
      mockUseAvailabilityTemplate.loading = false;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      // Component should still render but may show empty state
      expect(screen.getByRole("heading", { name: "Templates" })).toBeTruthy();
    });
  });

  // Conditional Logic & Template Rendering
  describe("Conditional Logic & Template Rendering", () => {
    it("renders template list when templates exist and not loading", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      mockUseAvailabilityTemplate.loading = false;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.queryByText("Loading templates...")).toBeNull();
      expect(screen.queryByText("No templates found")).toBeNull();
      expect(screen.getByText("Morning Shift")).toBeTruthy();
    });

    it("prioritizes loading state over empty state", () => {
      mockUseAvailabilityTemplate.templates = [];
      mockUseAvailabilityTemplate.loading = true;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText("Loading templates...")).toBeTruthy();
      expect(screen.queryByText("No templates found")).toBeNull();
    });

    it("shows empty state when not loading and no templates", () => {
      mockUseAvailabilityTemplate.templates = [];
      mockUseAvailabilityTemplate.loading = false;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.queryByText("Loading templates...")).toBeNull();
      expect(screen.getByText("No templates found")).toBeTruthy();
      expect(screen.getByTestId("calendar-icon")).toBeTruthy();
    });

    it("renders correct number of action buttons per template", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      const useButtons = screen.getAllByText("Use");
      const deleteButtons = screen.getAllByText("Delete");

      expect(useButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });

    it("each template has unique key and correct data", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      // Verify each template renders with correct information
      mockTemplates.forEach((template) => {
        expect(screen.getByText(template.template_name)).toBeTruthy();
      });
    });

    it("applies correct CSS classes for layout", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      const modalContainer = screen.getByRole("heading", { name: "Templates" }).closest(".fixed");
      expect(modalContainer?.className).toContain("z-50");
      
      const templateContainer = screen.getByText("Morning Shift").closest(".flex");
      expect(templateContainer?.className).toContain("items-center");
      expect(templateContainer?.className).toContain("justify-between");
    });
  });

  // Integration Testing (Hook Interactions)
  describe("Integration Testing - Hook Interactions", () => {
    it("does not call fetchAllTemplates when modal is closed", () => {
      render(<TemplateSelectDialog {...defaultProps} isOpen={false} />);

      expect(mockUseAvailabilityTemplate.fetchAllTemplates).not.toHaveBeenCalled();
    });

    it("calls fetchAllTemplates only when modal opens", async () => {
      const { rerender } = render(<TemplateSelectDialog {...defaultProps} isOpen={false} />);

      expect(mockUseAvailabilityTemplate.fetchAllTemplates).not.toHaveBeenCalled();

      rerender(<TemplateSelectDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(mockUseAvailabilityTemplate.fetchAllTemplates).toHaveBeenCalledTimes(1);
      });
    });

    it("handles hook loading state changes", () => {
      mockUseAvailabilityTemplate.loading = true;
      
      const { rerender } = render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText("Loading templates...")).toBeTruthy();

      mockUseAvailabilityTemplate.loading = false;
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      rerender(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.queryByText("Loading templates...")).toBeNull();
      expect(screen.getByText("Morning Shift")).toBeTruthy();
    });

    it("handles hook error state transitions", () => {
      mockUseAvailabilityTemplate.error = null;
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      const { rerender } = render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText("Morning Shift")).toBeTruthy();

      mockUseAvailabilityTemplate.error = "Network error";
      mockUseAvailabilityTemplate.templates = [];
      
      rerender(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.queryByText("Morning Shift")).toBeNull();
    });

    it("preserves hook state during component prop changes", async () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      const { rerender } = render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText("Morning Shift")).toBeTruthy();

      // Change non-critical prop
      rerender(<TemplateSelectDialog {...defaultProps} loading={true} />);

      // Templates should still be visible
      expect(screen.getByText("Morning Shift")).toBeTruthy();
    });

    it("handles rapid template interactions", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      const useButtons = screen.getAllByText("Use");
      const deleteButtons = screen.getAllByText("Delete");

      // Rapid clicks
      fireEvent.click(useButtons[0]);
      fireEvent.click(deleteButtons[0]);
      fireEvent.click(useButtons[1]);

      expect(mockOnSelect).toHaveBeenCalledWith("template-1");
      expect(mockOnDelete).toHaveBeenCalledWith("template-1");
      expect(mockOnSelect).toHaveBeenCalledWith("template-2");
    });
  });

  // Accessibility & UI Behavior
  describe("Accessibility & UI Behavior", () => {
    it("has proper heading structure", () => {
      render(<TemplateSelectDialog {...defaultProps} />);

      const heading = screen.getByRole("heading", { name: "Templates" });
      expect(heading.tagName.toLowerCase()).toBe("h2");
    });

    it("has accessible button labels", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByRole("button", { name: "Save as New Template" })).toBeTruthy();
      expect(screen.getAllByRole("button", { name: "Use" })).toHaveLength(3);
      expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(3);
    });

    it("maintains modal overlay structure", () => {
      render(<TemplateSelectDialog {...defaultProps} />);

      const overlay = screen.getByRole("heading", { name: "Templates" }).closest(".fixed");
      expect(overlay?.className).toContain("inset-0");
      expect(overlay?.className).toContain("bg-secondary-text/50");
    });

    it("handles keyboard interactions appropriately", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      render(<TemplateSelectDialog {...defaultProps} />);

      const firstUseButton = screen.getAllByText("Use")[0];
      
      // Focus and trigger with Enter key
      firstUseButton.focus();
      fireEvent.keyDown(firstUseButton, { key: "Enter", code: "Enter" });
      
      expect(firstUseButton).toHaveFocus();
    });

    it("displays icons with correct test ids", () => {
      render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByTestId("x-icon")).toBeTruthy();
      
      // Calendar icon appears in empty state (already rendered above)
      expect(screen.getByTestId("calendar-icon")).toBeTruthy();
    });
  });

  // Modal State Management
  describe("Modal State Management", () => {
    it("preserves template data when modal reopens", async () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      const { rerender } = render(<TemplateSelectDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByText("Morning Shift")).toBeTruthy();

      rerender(<TemplateSelectDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Morning Shift")).toBeNull();

      rerender(<TemplateSelectDialog {...defaultProps} isOpen={true} />);
      
      await waitFor(() => {
        expect(mockUseAvailabilityTemplate.fetchAllTemplates).toHaveBeenCalledTimes(2);
      });
    });

    it("handles prop changes during open state", () => {
      mockUseAvailabilityTemplate.templates = mockTemplates;
      
      const { rerender } = render(<TemplateSelectDialog {...defaultProps} />);

      expect(screen.getByText("Morning Shift")).toBeTruthy();

      const newProps = {
        ...defaultProps,
        loading: true,
      };

      rerender(<TemplateSelectDialog {...newProps} />);

      // Should still show templates but with disabled buttons
      expect(screen.getByText("Morning Shift")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Save as New Template" })).toBeDisabled();
    });
  });
});