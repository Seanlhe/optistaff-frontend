import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Star } from "lucide-react";
import StatsCard from "../../../src/components/StatsCard";

describe("StatsCard - Essential Tests", () => {
  it("renders title and value correctly", () => {
    render(<StatsCard title="Rating" value="4.5" />);
    
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders with icon when provided", () => {
    render(<StatsCard title="Rating" value="4.5" icon={<Star data-testid="star-icon" />} />);
    
    expect(screen.getByTestId("star-icon")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders without icon when not provided", () => {
    render(<StatsCard title="Hours" value="40" />);
    
    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
  });
});