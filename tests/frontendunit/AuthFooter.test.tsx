/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthFooter } from "../../src/components/auth/AuthFooter";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: ({ children, to, className, ...props }: any) => (
      <a href={to} className={className} data-testid="mock-link" {...props}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
  };
});

// Wrapper component for routing context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("AuthFooter", () => {
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
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("Don't have an account?")).toBeTruthy();
    });

    it("displays login mode text and link when isSignup is false", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("Don't have an account?")).toBeTruthy();
      expect(screen.getByText("Sign Up")).toBeTruthy();
    });

    it("displays signup mode text and link when isSignup is true", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={true} />
        </RouterWrapper>
      );

      expect(screen.getByText("Already have an account?")).toBeTruthy();
      expect(screen.getByText("Sign In")).toBeTruthy();
    });

    it("displays back to home link", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("← Back to home")).toBeTruthy();
    });
  });

  describe("Link Navigation Tests", () => {
    it("has correct signup link URL when in login mode", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const signupLink = screen.getByText("Sign Up").closest("a");
      expect(signupLink?.getAttribute("href")).toBe("/auth?mode=signup");
    });

    it("has correct login link URL when in signup mode", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={true} />
        </RouterWrapper>
      );

      const loginLink = screen.getByText("Sign In").closest("a");
      expect(loginLink?.getAttribute("href")).toBe("/auth?mode=login");
    });

    it("has correct home link URL", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const homeLink = screen.getByText("← Back to home").closest("a");
      expect(homeLink?.getAttribute("href")).toBe("/");
    });
  });

  describe("CSS Classes and Styling Tests", () => {
    it("applies correct CSS classes to toggle mode link", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const signupLink = screen.getByText("Sign Up").closest("a");
      expect(signupLink?.className).toContain("text-primary-blue");
      expect(signupLink?.className).toContain("hover:text-primary-blue/80");
      expect(signupLink?.className).toContain("font-montserrat-smb");
      expect(signupLink?.className).toContain("transition-colors");
    });

    it("applies correct CSS classes to home link", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const homeLink = screen.getByText("← Back to home").closest("a");
      expect(homeLink?.className).toContain("text-secondary-text");
      expect(homeLink?.className).toContain("hover:text-primary-text");
      expect(homeLink?.className).toContain("transition-colors");
    });
  });

  describe("Interaction Tests", () => {
    it("handles click events on signup link", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const signupLink = screen.getByText("Sign Up");
      fireEvent.click(signupLink);

      // Test passes if no errors are thrown
      expect(signupLink).toBeTruthy();
    });

    it("handles click events on login link", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={true} />
        </RouterWrapper>
      );

      const loginLink = screen.getByText("Sign In");
      fireEvent.click(loginLink);

      // Test passes if no errors are thrown
      expect(loginLink).toBeTruthy();
    });

    it("handles click events on home link", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const homeLink = screen.getByText("← Back to home");
      fireEvent.click(homeLink);

      // Test passes if no errors are thrown
      expect(homeLink).toBeTruthy();
    });
  });

  describe("Edge Cases and Prop Variations", () => {
    it("handles isSignup prop changes correctly", () => {
      const { rerender } = render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("Don't have an account?")).toBeTruthy();
      expect(screen.getByText("Sign Up")).toBeTruthy();

      rerender(
        <RouterWrapper>
          <AuthFooter isSignup={true} />
        </RouterWrapper>
      );

      expect(screen.getByText("Already have an account?")).toBeTruthy();
      expect(screen.getByText("Sign In")).toBeTruthy();
    });

    it("maintains consistent structure across prop changes", () => {
      const { rerender } = render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const homeLink = screen.getByText("← Back to home");
      expect(homeLink).toBeTruthy();

      rerender(
        <RouterWrapper>
          <AuthFooter isSignup={true} />
        </RouterWrapper>
      );

      const homeLinkAfter = screen.getByText("← Back to home");
      expect(homeLinkAfter).toBeTruthy();
    });
  });

  describe("Accessibility Tests", () => {
    it("has proper link accessibility attributes", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);

      links.forEach((link) => {
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBeTruthy();
      });
    });

    it("provides meaningful link text", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      expect(screen.getByText("Sign Up")).toBeTruthy();
      expect(screen.getByText("← Back to home")).toBeTruthy();
    });
  });

  describe("Text Content Tests", () => {
    it("displays complete text content correctly for login mode", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const paragraph = screen.getByText(/Don't have an account\?/);
      expect(paragraph.textContent).toContain("Don't have an account?");
      expect(paragraph.textContent).toContain("Sign Up");
    });

    it("displays complete text content correctly for signup mode", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={true} />
        </RouterWrapper>
      );

      const paragraph = screen.getByText(/Already have an account\?/);
      expect(paragraph.textContent).toContain("Already have an account?");
      expect(paragraph.textContent).toContain("Sign In");
    });
  });

  describe("Component Structure Tests", () => {
    it("renders with correct HTML structure", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const container = screen.getByText("Don't have an account?").closest("div");
      expect(container?.className).toContain("space-y-4");
      expect(container?.className).toContain("text-center");
    });

    it("contains exactly two links", () => {
      render(
        <RouterWrapper>
          <AuthFooter isSignup={false} />
        </RouterWrapper>
      );

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);
    });
  });
});