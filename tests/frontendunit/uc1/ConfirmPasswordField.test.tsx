/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ConfirmPasswordField } from "../../../src/components/ConfirmPasswordField";

// Import jest-dom matchers
import "@testing-library/jest-dom";

describe("ConfirmPasswordField Component - UC1 Step 3: Core Features", () => {
  const mockOnConfirmPasswordChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders confirm password field with label and input", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword=""
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      // Check for separate elements - component renders label text and asterisk separately
      expect(screen.getByText("Confirm Password")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Re-enter your password")).toBeInTheDocument();
    });

    it("displays current confirm password value", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword="test123"
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      const confirmInput = screen.getByDisplayValue("test123");
      expect(confirmInput).toBeInTheDocument();
      expect(confirmInput).toHaveAttribute("type", "password");
    });
  });

  describe("Password Matching Validation", () => {
    it("shows success message when passwords match", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword="password123"
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      expect(screen.getByText("Passwords match")).toBeInTheDocument();
      expect(screen.queryByText("Passwords do not match")).not.toBeInTheDocument();
    });

    it("shows error message when passwords do not match", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword="different123"
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      expect(screen.queryByText("Passwords match")).not.toBeInTheDocument();
    });

    it("shows no validation message when confirm password is empty", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword=""
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      expect(screen.queryByText("Passwords do not match")).not.toBeInTheDocument();
      expect(screen.queryByText("Passwords match")).not.toBeInTheDocument();
    });
  });

  describe("Input Interaction", () => {
    it("calls onConfirmPasswordChange when typing", async () => {
      const user = userEvent.setup();

      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword=""
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      const confirmInput = screen.getByPlaceholderText("Re-enter your password");
      await user.type(confirmInput, "test");

      // userEvent.type() calls onChange for each character typed
      expect(mockOnConfirmPasswordChange).toHaveBeenCalledTimes(4);
      // The last call should be with the last character typed
      expect(mockOnConfirmPasswordChange).toHaveBeenLastCalledWith("t");
    });
  });

  describe("Visual States", () => {
    it("applies green border when passwords match", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword="password123"
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      const confirmInput = screen.getByDisplayValue("password123");
      expect(confirmInput).toHaveClass("border-green");
    });

    it("applies red border when passwords do not match", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword="different"
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      const confirmInput = screen.getByDisplayValue("different");
      expect(confirmInput).toHaveClass("border-red");
    });
  });

  describe("Password Visibility Toggle", () => {
    it("toggles password visibility when eye button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword="test123"
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      const confirmInput = screen.getByDisplayValue("test123");
      const toggleButton = screen.getByRole("button");

      // Initially password type
      expect(confirmInput).toHaveAttribute("type", "password");

      // Click to show password
      await user.click(toggleButton);
      expect(confirmInput).toHaveAttribute("type", "text");

      // Click to hide password again
      await user.click(toggleButton);
      expect(confirmInput).toHaveAttribute("type", "password");
    });
  });

  describe("Required Field", () => {
    it("shows required asterisk and message by default", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword=""
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
        />
      );

      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("Password confirmation is required")).toBeInTheDocument();
    });

    // Note: Optional confirm password testing removed - covered by AuthFormFields integration tests
  });

  describe("Disabled State", () => {
    it("disables input and button when disabled", () => {
      render(
        <ConfirmPasswordField
          password="password123"
          confirmPassword=""
          onConfirmPasswordChange={mockOnConfirmPasswordChange}
          disabled={true}
        />
      );

      const confirmInput = screen.getByPlaceholderText("Re-enter your password");
      const toggleButton = screen.getByRole("button");

      expect(confirmInput).toBeDisabled();
      expect(toggleButton).toBeDisabled();
    });
  });
});
