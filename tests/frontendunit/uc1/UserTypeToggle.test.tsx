/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { UserTypeToggle } from "../../../src/components/auth/UserTypeToggle";

// Mock UI components
vi.mock("../../src/components/ui/button", () => ({
  Button: ({ children, onClick, className, variant, type, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      type={type}
      data-testid="mock-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock the cn utility function
vi.mock("../../src/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

describe("UserTypeToggle", () => {
  const mockSetUserType = vi.fn();

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
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      expect(screen.getByText("I am a...")).toBeTruthy();
      expect(screen.getByText("🔍 Job Seeker")).toBeTruthy();
      expect(screen.getByText("🏢 Employer")).toBeTruthy();
    });

    it("displays the label text correctly", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      expect(screen.getByText("I am a...")).toBeTruthy();
    });

    it("displays both toggle buttons", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      expect(screen.getByText("🔍 Job Seeker")).toBeTruthy();
      expect(screen.getByText("🏢 Employer")).toBeTruthy();
    });

    it("renders buttons with correct type attribute", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const buttons = screen.getAllByTestId("mock-button");
      buttons.forEach(button => {
        expect(button.getAttribute("type")).toBe("button");
      });
    });
  });

  describe("Button State Tests", () => {
    it("shows jobseeker as selected when userType is jobseeker", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const jobseekerButton = screen.getByText("🔍 Job Seeker");
      expect(jobseekerButton.className).toContain("border-primary-blue");
      expect(jobseekerButton.className).toContain("bg-primary-blue/10");
      expect(jobseekerButton.className).toContain("text-primary-blue");
      expect(jobseekerButton.className).toContain("shadow-md");
    });

    it("shows employer as selected when userType is employer", () => {
      render(
        <UserTypeToggle
          userType="employer"
          setUserType={mockSetUserType}
        />
      );

      const employerButton = screen.getByText("🏢 Employer");
      expect(employerButton.className).toContain("border-green");
      expect(employerButton.className).toContain("bg-green/10");
      expect(employerButton.className).toContain("text-green-dark");
      expect(employerButton.className).toContain("shadow-md");
    });

    it("shows employer as unselected when userType is jobseeker", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const employerButton = screen.getByText("🏢 Employer");
      expect(employerButton.className).toContain("border-border");
      expect(employerButton.className).toContain("hover:border-green/50");
      expect(employerButton.className).toContain("hover:bg-green/5");
    });

    it("shows jobseeker as unselected when userType is employer", () => {
      render(
        <UserTypeToggle
          userType="employer"
          setUserType={mockSetUserType}
        />
      );

      const jobseekerButton = screen.getByText("🔍 Job Seeker");
      expect(jobseekerButton.className).toContain("border-border");
      expect(jobseekerButton.className).toContain("hover:border-primary-blue/50");
      expect(jobseekerButton.className).toContain("hover:bg-primary-blue/5");
    });
  });

  describe("CSS Classes Tests", () => {
    it("applies correct base CSS classes to both buttons", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const buttons = screen.getAllByTestId("mock-button");
      buttons.forEach(button => {
        expect(button.className).toContain("h-12");
        expect(button.className).toContain("text-sm");
        expect(button.className).toContain("font-montserrat-smb");
        expect(button.className).toContain("transition-all");
        expect(button.className).toContain("border-2");
      });
    });

    it("applies correct variant to both buttons", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const buttons = screen.getAllByTestId("mock-button");
      buttons.forEach(button => {
        expect(button.getAttribute("data-variant")).toBe("outline");
      });
    });

    it("applies correct container CSS classes", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const container = screen.getByText("I am a...").closest("div");
      expect(container?.className).toContain("space-y-3");

      const buttonContainer = screen.getByText("🔍 Job Seeker").closest("div");
      expect(buttonContainer?.className).toContain("grid");
      expect(buttonContainer?.className).toContain("grid-cols-2");
      expect(buttonContainer?.className).toContain("gap-3");
    });

    it("applies correct label CSS classes", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const label = screen.getByText("I am a...");
      expect(label.className).toContain("text-sm");
      expect(label.className).toContain("font-montserrat-smb");
      expect(label.className).toContain("text-primary-text");
    });
  });

  describe("Interaction Tests", () => {
    it("calls setUserType with 'jobseeker' when jobseeker button is clicked", () => {
      render(
        <UserTypeToggle
          userType="employer"
          setUserType={mockSetUserType}
        />
      );

      const jobseekerButton = screen.getByText("🔍 Job Seeker");
      fireEvent.click(jobseekerButton);

      expect(mockSetUserType).toHaveBeenCalledWith("jobseeker");
    });

    it("calls setUserType with 'employer' when employer button is clicked", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const employerButton = screen.getByText("🏢 Employer");
      fireEvent.click(employerButton);

      expect(mockSetUserType).toHaveBeenCalledWith("employer");
    });

    it("allows clicking the same button multiple times", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const jobseekerButton = screen.getByText("🔍 Job Seeker");
      fireEvent.click(jobseekerButton);
      fireEvent.click(jobseekerButton);

      expect(mockSetUserType).toHaveBeenCalledTimes(2);
      expect(mockSetUserType).toHaveBeenNthCalledWith(1, "jobseeker");
      expect(mockSetUserType).toHaveBeenNthCalledWith(2, "jobseeker");
    });

    it("handles rapid clicking between buttons", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const jobseekerButton = screen.getByText("🔍 Job Seeker");
      const employerButton = screen.getByText("🏢 Employer");

      fireEvent.click(employerButton);
      fireEvent.click(jobseekerButton);
      fireEvent.click(employerButton);

      expect(mockSetUserType).toHaveBeenCalledTimes(3);
      expect(mockSetUserType).toHaveBeenNthCalledWith(1, "employer");
      expect(mockSetUserType).toHaveBeenNthCalledWith(2, "jobseeker");
      expect(mockSetUserType).toHaveBeenNthCalledWith(3, "employer");
    });
  });

  describe("Props Change Tests", () => {
    it("updates button appearance when userType prop changes", () => {
      const { rerender } = render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      let jobseekerButton = screen.getByText("🔍 Job Seeker");
      let employerButton = screen.getByText("🏢 Employer");

      // Initially jobseeker is selected
      expect(jobseekerButton.className).toContain("border-primary-blue");
      expect(employerButton.className).toContain("border-border");

      // Change to employer
      rerender(
        <UserTypeToggle
          userType="employer"
          setUserType={mockSetUserType}
        />
      );

      jobseekerButton = screen.getByText("🔍 Job Seeker");
      employerButton = screen.getByText("🏢 Employer");

      // Now employer is selected
      expect(jobseekerButton.className).toContain("border-border");
      expect(employerButton.className).toContain("border-green");
    });

    it("maintains button functionality after prop changes", () => {
      const { rerender } = render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      rerender(
        <UserTypeToggle
          userType="employer"
          setUserType={mockSetUserType}
        />
      );

      const jobseekerButton = screen.getByText("🔍 Job Seeker");
      fireEvent.click(jobseekerButton);

      expect(mockSetUserType).toHaveBeenCalledWith("jobseeker");
    });
  });

  describe("Visual Content Tests", () => {
    it("displays correct emoji and text for jobseeker button", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const jobseekerButton = screen.getByText("🔍 Job Seeker");
      expect(jobseekerButton.textContent).toBe("🔍 Job Seeker");
    });

    it("displays correct emoji and text for employer button", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const employerButton = screen.getByText("🏢 Employer");
      expect(employerButton.textContent).toBe("🏢 Employer");
    });

    it("maintains consistent button text across state changes", () => {
      const { rerender } = render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      expect(screen.getByText("🔍 Job Seeker")).toBeTruthy();
      expect(screen.getByText("🏢 Employer")).toBeTruthy();

      rerender(
        <UserTypeToggle
          userType="employer"
          setUserType={mockSetUserType}
        />
      );

      expect(screen.getByText("🔍 Job Seeker")).toBeTruthy();
      expect(screen.getByText("🏢 Employer")).toBeTruthy();
    });
  });

  describe("Component Structure Tests", () => {
    it("renders with correct HTML structure", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const mainContainer = screen.getByText("I am a...").closest("div");
      expect(mainContainer?.className).toContain("space-y-3");

      const buttonContainer = screen.getByText("🔍 Job Seeker").closest("div");
      expect(buttonContainer?.className).toContain("grid");
      expect(buttonContainer?.className).toContain("grid-cols-2");
      expect(buttonContainer?.className).toContain("gap-3");
    });

    it("contains exactly two buttons", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons).toHaveLength(2);
    });

    it("contains exactly one label", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const labels = screen.getAllByText("I am a...");
      expect(labels).toHaveLength(1);
    });
  });

  describe("Accessibility Tests", () => {
    it("uses semantic button elements", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);

      buttons.forEach(button => {
        expect(button.tagName).toBe("BUTTON");
      });
    });

    it("provides meaningful button text", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      expect(screen.getByRole("button", { name: "🔍 Job Seeker" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "🏢 Employer" })).toBeTruthy();
    });

    it("uses proper label element", () => {
      render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      const label = screen.getByText("I am a...");
      expect(label.tagName).toBe("LABEL");
    });
  });

  describe("Edge Cases Tests", () => {
    it("handles missing setUserType prop gracefully", () => {
      // This test ensures the component doesn't crash if setUserType is undefined
      expect(() => {
        render(
          <UserTypeToggle
            userType="jobseeker"
            setUserType={undefined as any}
          />
        );
      }).not.toThrow();
    });
  });

  describe("State Consistency Tests", () => {
    it("maintains visual state consistency with userType prop", () => {
      const { rerender } = render(
        <UserTypeToggle
          userType="jobseeker"
          setUserType={mockSetUserType}
        />
      );

      // Verify initial state
      let jobseekerButton = screen.getByText("🔍 Job Seeker");
      let employerButton = screen.getByText("🏢 Employer");
      
      expect(jobseekerButton.className).toContain("border-primary-blue");
      expect(employerButton.className).toContain("border-border");

      // Change state and verify
      rerender(
        <UserTypeToggle
          userType="employer"
          setUserType={mockSetUserType}
        />
      );

      jobseekerButton = screen.getByText("🔍 Job Seeker");
      employerButton = screen.getByText("🏢 Employer");

      expect(jobseekerButton.className).toContain("border-border");
      expect(employerButton.className).toContain("border-green");
    });
  });
});