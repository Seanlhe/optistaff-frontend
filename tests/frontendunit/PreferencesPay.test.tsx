import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { PreferencesPay } from "../../src/components/PreferencesPay";
import { PreferencesFormData } from "../../src/types/hooks";

describe("PreferencesPay", () => {
  const mockSetFormData = vi.fn();

  const defaultFormData: PreferencesFormData = {
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 15,
    selectedJobNames: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with all elements", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    expect(screen.getByText("Desired Hourly Pay Rate ($):")).toBeTruthy();
    expect(screen.getByText("$20")).toBeTruthy();
    expect(screen.getByRole("slider")).toBeTruthy();
    expect(
      screen.getByRole("checkbox", {
        name: /consider me for a job with lower rate/i,
      }),
    ).toBeTruthy();
    expect(
      screen.getByText("Consider me for a job with lower rate"),
    ).toBeTruthy();
  });

  it("displays correct pay rate value", () => {
    const formDataWithHighPay: PreferencesFormData = {
      ...defaultFormData,
      payRate: 25,
    };

    render(
      <PreferencesPay
        formData={formDataWithHighPay}
        setFormData={mockSetFormData}
      />,
    );

    expect(screen.getByText("$25")).toBeTruthy();
  });

  it("has correct slider attributes and styling", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const slider = screen.getByRole("slider") as HTMLInputElement;

    expect(slider.type).toBe("range");
    expect(slider.min).toBe("5");
    expect(slider.max).toBe("30");
    expect(slider.value).toBe("20");
    expect(slider.className).toContain("w-1/3");
    expect(slider.className).toContain("h-2");
  });

  it("handles pay rate change correctly", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "25" } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      payRate: 25,
    });
  });

  it("handles minimum pay rate correctly", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "5" } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      payRate: 5,
    });

    // Check that setFormData was called with the correct value
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      payRate: 5,
    });
  });

  it("handles maximum pay rate correctly", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "30" } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      payRate: 30,
    });

    // Check that setFormData was called with the correct value
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      payRate: 30,
    });
  });

  it("displays checkbox in unchecked state by default", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it("displays checkbox in checked state when considerLowerRate is true", () => {
    const formDataWithLowerRate: PreferencesFormData = {
      ...defaultFormData,
      considerLowerRate: true,
    };

    render(
      <PreferencesPay
        formData={formDataWithLowerRate}
        setFormData={mockSetFormData}
      />,
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("handles checkbox change correctly when checking", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      considerLowerRate: true,
    });
  });

  it("handles checkbox change correctly when unchecking", () => {
    const formDataWithLowerRate: PreferencesFormData = {
      ...defaultFormData,
      considerLowerRate: true,
    };

    render(
      <PreferencesPay
        formData={formDataWithLowerRate}
        setFormData={mockSetFormData}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...formDataWithLowerRate,
      considerLowerRate: false,
    });
  });

  it("has correct checkbox attributes and styling", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

    expect(checkbox.type).toBe("checkbox");
    expect(checkbox.id).toBe("consider-lower-rate");
    expect(checkbox.className).toContain("h-5");
    expect(checkbox.className).toContain("w-5");
  });

  it("has correct label attributes", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const label = screen.getByText("Consider me for a job with lower rate");
    expect(label.closest("label")?.getAttribute("for")).toBe(
      "consider-lower-rate",
    );
    expect(label.className).toContain("ml-3");
    expect(label.className).toContain("text-sm");
  });

  it("renders with correct container styling", () => {
    const { container } = render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).toContain("p-6");
    expect(mainDiv.className).toContain("bg-card-color");
  });

  it("has correct header styling", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const header = screen.getByText("Desired Hourly Pay Rate ($):");
    expect(header.className).toContain("text-base");
    expect(header.className).toContain("font-semibold");
  });

  it("has correct pay rate display styling", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const payDisplay = screen.getByText("$20");
    expect(payDisplay.className).toContain("text-2xl");
    expect(payDisplay.className).toContain("font-bold");
  });

  it("handles string input for pay rate slider", () => {
    render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "15" } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      payRate: 15,
    });
  });

  it("updates pay rate display when slider changes", () => {
    const { rerender } = render(
      <PreferencesPay
        formData={defaultFormData}
        setFormData={mockSetFormData}
      />,
    );

    const updatedFormData = { ...defaultFormData, payRate: 25 };
    rerender(
      <PreferencesPay
        formData={updatedFormData}
        setFormData={mockSetFormData}
      />,
    );

    expect(screen.getByText("$25")).toBeTruthy();
    expect(screen.queryByText("$20")).toBeNull();
  });
});
