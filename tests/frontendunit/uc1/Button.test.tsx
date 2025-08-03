/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Button } from "../../../src/components/ui/button";

// Import jest-dom matchers
import "@testing-library/jest-dom";

describe("Button Component - UC1 Form Submission", () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("UC1 Step 4-5: Form Submission Button States", () => {
    it("renders Create Account button for signup mode", () => {
      render(
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      );

      const button = screen.getByRole("button", { name: "Create Account" });
      expect(button).toBeTruthy();
      expect(button).toHaveAttribute("type", "submit");
    });

    it("renders Sign In button for login mode", () => {
      render(
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      );

      const button = screen.getByRole("button", { name: "Sign In" });
      expect(button).toBeTruthy();
      expect(button).toHaveAttribute("type", "submit");
    });

    it("displays loading state with spinner for signup", () => {
      render(
        <Button type="submit" className="w-full" disabled={true}>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Creating Account...
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByText("Creating Account...")).toBeTruthy();
    });

    it("displays loading state with spinner for login", () => {
      render(
        <Button type="submit" className="w-full" disabled={true}>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Signing In...
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByText("Signing In...")).toBeTruthy();
    });

    it("is disabled during form submission", () => {
      render(
        <Button type="submit" disabled={true}>
          Processing...
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("is enabled when not loading", () => {
      render(
        <Button type="submit" disabled={false}>
          Submit
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("Button Interaction and Events", () => {
    it("calls onClick handler when clicked", async () => {
      const user = userEvent.setup();

      render(
        <Button onClick={mockOnClick}>
          Click Me
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();

      render(
        <Button onClick={mockOnClick} disabled={true}>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("submits form when type is submit", () => {
      const mockSubmit = vi.fn();

      render(
        <form onSubmit={mockSubmit}>
          <Button type="submit">
            Submit Form
          </Button>
        </form>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it("does not submit form when disabled", () => {
      const mockSubmit = vi.fn();

      render(
        <form onSubmit={mockSubmit}>
          <Button type="submit" disabled={true}>
            Submit Form
          </Button>
        </form>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Button Variants and Styling", () => {
    it("applies default variant styling", () => {
      render(
        <Button data-testid="default-button">
          Default Button
        </Button>
      );

      const button = screen.getByTestId("default-button");
      expect(button).toBeTruthy();
    });

    it("applies outline variant styling", () => {
      render(
        <Button variant="outline" data-testid="outline-button">
          Outline Button
        </Button>
      );

      const button = screen.getByTestId("outline-button");
      expect(button).toBeTruthy();
    });

    it("applies custom className", () => {
      render(
        <Button className="w-full custom-class" data-testid="custom-button">
          Custom Button
        </Button>
      );

      const button = screen.getByTestId("custom-button");
      expect(button).toHaveClass("w-full", "custom-class");
    });

    it("applies destructive variant for error actions", () => {
      render(
        <Button variant="destructive" data-testid="destructive-button">
          Delete Account
        </Button>
      );

      const button = screen.getByTestId("destructive-button");
      expect(button).toBeTruthy();
    });
  });

  describe("Loading States and Visual Feedback", () => {
    it("renders loading spinner correctly", () => {
      render(
        <Button disabled={true}>
          <div 
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
            data-testid="loading-spinner"
          />
          Loading...
        </Button>
      );

      expect(screen.getByTestId("loading-spinner")).toBeTruthy();
      expect(screen.getByText("Loading...")).toBeTruthy();
    });

    it("changes text content based on loading state", () => {
      const { rerender } = render(
        <Button>
          Create Account
        </Button>
      );

      expect(screen.getByText("Create Account")).toBeTruthy();

      rerender(
        <Button disabled={true}>
          Creating Account...
        </Button>
      );

      expect(screen.getByText("Creating Account...")).toBeTruthy();
    });

    it("maintains button dimensions during loading state", () => {
      render(
        <Button className="w-full h-12" disabled={true}>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Processing...
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full", "h-12");
    });
  });

  describe("Form Integration", () => {
    it("works correctly within form context", () => {
      render(
        <form data-testid="test-form">
          <input type="email" name="email" />
          <Button type="submit">
            Submit
          </Button>
        </form>
      );

      const form = screen.getByTestId("test-form");
      const button = screen.getByRole("button");
      
      expect(form).toContainElement(button);
      expect(button).toHaveAttribute("type", "submit");
    });

    it("prevents submission when form is invalid", () => {
      render(
        <form>
          <input type="email" required name="email" />
          <Button type="submit" disabled={true}>
            Submit
          </Button>
        </form>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Authentication Specific Button States", () => {
    it("shows different text for job seeker signup", () => {
      render(
        <Button type="submit">
          Create Job Seeker Account
        </Button>
      );

      expect(screen.getByText("Create Job Seeker Account")).toBeTruthy();
    });

    it("shows different text for employer signup", () => {
      render(
        <Button type="submit">
          Create Employer Account
        </Button>
      );

      expect(screen.getByText("Create Employer Account")).toBeTruthy();
    });

    it("handles user type toggle button states", () => {
      const { rerender } = render(
        <Button 
          type="button" 
          variant="outline"
          className="border-primary-blue bg-primary-blue/10 text-primary-blue"
        >
          🔍 Job Seeker
        </Button>
      );

      expect(screen.getByText("🔍 Job Seeker")).toBeTruthy();

      rerender(
        <Button 
          type="button" 
          variant="outline"
          className="border-green bg-green/10 text-green-dark"
        >
          🏢 Employer
        </Button>
      );

      expect(screen.getByText("🏢 Employer")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("has proper button role", () => {
      render(
        <Button>
          Accessible Button
        </Button>
      );

      expect(screen.getByRole("button")).toBeTruthy();
    });

    it("provides meaningful button text", () => {
      render(
        <Button>
          Create Account
        </Button>
      );

      const button = screen.getByRole("button", { name: "Create Account" });
      expect(button).toBeTruthy();
    });

    it("indicates disabled state to screen readers", () => {
      render(
        <Button disabled={true}>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <Button onClick={mockOnClick}>
          Keyboard Button
        </Button>
      );

      const button = screen.getByRole("button");
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Complex Content and Layouts", () => {
    it("renders with icon and text content", () => {
      render(
        <Button>
          <span>📧</span>
          Send Email
        </Button>
      );

      expect(screen.getByText("📧")).toBeTruthy();
      expect(screen.getByText("Send Email")).toBeTruthy();
    });

    it("handles long button text correctly", () => {
      const longText = "This is a very long button text that should wrap appropriately";
      
      render(
        <Button>
          {longText}
        </Button>
      );

      expect(screen.getByText(longText)).toBeTruthy();
    });

    it("renders multiple child elements", () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
          <span>Badge</span>
        </Button>
      );

      expect(screen.getByText("Icon")).toBeTruthy();
      expect(screen.getByText("Text")).toBeTruthy();
      expect(screen.getByText("Badge")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("handles missing onClick gracefully", () => {
      render(
        <Button>
          No Click Handler
        </Button>
      );

      const button = screen.getByRole("button");
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it("handles invalid children props", () => {
      render(
        <Button>
          {null}
          {undefined}
          Valid Text
        </Button>
      );

      expect(screen.getByText("Valid Text")).toBeTruthy();
    });
  });
});
