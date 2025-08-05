import { render, screen, fireEvent } from "@testing-library/react";
import Login from "@/pages/Login";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import * as useAuthHook from "@/hooks/useAuth";

// Helper to wrap in Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Login Page", () => {
  it("renders email and password fields", () => {
    renderWithRouter(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("disables submit if email or password invalid", () => {
    renderWithRouter(<Login />);
    const submitBtn = screen.getByRole("button", { name: /log in/i });
    expect(submitBtn).toBeDisabled();
  });

  it("calls login function on valid form submission", async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(useAuthHook, "useAuth").mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
    });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "StrongPass123!" },
    });

    const button = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(button);

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "StrongPass123!");
  });
});
