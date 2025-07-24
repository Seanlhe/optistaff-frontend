import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PreferencesMaximum from '../../src/components/PreferencesMaximum';
import { PreferencesFormData } from '../../src/types/hooks';

describe('PreferencesMaximum', () => {
  const mockSetFormData = vi.fn();

  const defaultFormData: PreferencesFormData = {
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 15,
    selectedJobNames: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both input fields with correct labels', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    expect(screen.getByText('Maximum Hours per Week')).toBeTruthy();
    expect(screen.getByText('Maximum Hours per Shift')).toBeTruthy();
    
    const weeklyInput = screen.getByDisplayValue('40');
    const shiftInput = screen.getByDisplayValue('8');
    
    expect(weeklyInput).toBeTruthy();
    expect(shiftInput).toBeTruthy();
  });

  it('displays correct input attributes for maximum hours per week', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const weeklyInput = screen.getByDisplayValue('40') as HTMLInputElement;
    
    expect(weeklyInput.type).toBe('number');
    expect(weeklyInput.min).toBe('1');
    expect(weeklyInput.max).toBe('44');
    expect(weeklyInput.placeholder).toBe('20');
    expect(weeklyInput.className).toContain('p-2');
    expect(weeklyInput.className).toContain('border');
    expect(weeklyInput.className).toContain('border-border');
    expect(weeklyInput.className).toContain('bg-card-color');
    expect(weeklyInput.className).toContain('text-main');
    expect(weeklyInput.className).toContain('rounded-lg');
    expect(weeklyInput.className).toContain('w-24');
  });

  it('displays correct input attributes for maximum hours per shift', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const shiftInput = screen.getByDisplayValue('8') as HTMLInputElement;
    
    expect(shiftInput.type).toBe('number');
    expect(shiftInput.min).toBe('1');
    expect(shiftInput.max).toBe('12');
    expect(shiftInput.placeholder).toBe('8');
    expect(shiftInput.className).toContain('p-2');
    expect(shiftInput.className).toContain('border');
    expect(shiftInput.className).toContain('border-border');
    expect(shiftInput.className).toContain('bg-card-color');
    expect(shiftInput.className).toContain('text-main');
    expect(shiftInput.className).toContain('rounded-lg');
    expect(shiftInput.className).toContain('w-24');
  });

  it('handles maximum hours per week change correctly', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const weeklyInput = screen.getByDisplayValue('40');
    fireEvent.change(weeklyInput, { target: { value: '35' } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      maxHoursPerWeek: 35
    });
  });

  it('handles maximum hours per shift change correctly', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const shiftInput = screen.getByDisplayValue('8');
    fireEvent.change(shiftInput, { target: { value: '6' } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      maxHoursPerShift: 6
    });
  });

  it('handles empty input values by setting to 0', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const weeklyInput = screen.getByDisplayValue('40');
    fireEvent.change(weeklyInput, { target: { value: '' } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      maxHoursPerWeek: 0
    });
  });

  it('handles non-numeric input by setting to 0', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const shiftInput = screen.getByDisplayValue('8');
    fireEvent.change(shiftInput, { target: { value: 'abc' } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      maxHoursPerShift: 0
    });
  });

  it('displays empty string when form data values are 0 or undefined', () => {
    const formDataWithZeros: PreferencesFormData = {
      ...defaultFormData,
      maxHoursPerWeek: 0,
      maxHoursPerShift: 0
    };

    render(
      <PreferencesMaximum 
        formData={formDataWithZeros} 
        setFormData={mockSetFormData} 
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    expect((inputs[0] as HTMLInputElement).value).toBe('');
    expect((inputs[1] as HTMLInputElement).value).toBe('');
  });

  it('displays empty string when form data values are undefined', () => {
    const formDataWithUndefined: PreferencesFormData = {
      ...defaultFormData,
      maxHoursPerWeek: undefined as any,
      maxHoursPerShift: undefined as any
    };

    render(
      <PreferencesMaximum 
        formData={formDataWithUndefined} 
        setFormData={mockSetFormData} 
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    expect((inputs[0] as HTMLInputElement).value).toBe('');
    expect((inputs[1] as HTMLInputElement).value).toBe('');
  });

  it('handles decimal input by converting to integer', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const weeklyInput = screen.getByDisplayValue('40');
    fireEvent.change(weeklyInput, { target: { value: '25.7' } });

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      maxHoursPerWeek: 25
    });
  });

  it('renders with correct layout classes', () => {
    const { container } = render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).toContain('flex');
    expect(mainDiv.className).toContain('gap-8');
    expect(mainDiv.className).toContain('mb-5');
    expect(mainDiv.className).toContain('items-end');

    const fieldDivs = screen.getAllByRole('spinbutton').map(input => input.closest('.flex.flex-col'));
    fieldDivs.forEach(div => {
      expect(div?.className).toContain('flex');
      expect(div?.className).toContain('flex-col');
    });
  });

  it('has correct label styling', () => {
    render(
      <PreferencesMaximum 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const labels = screen.getAllByText(/Maximum Hours per/);
    labels.forEach(label => {
      expect(label.className).toContain('block');
      expect(label.className).toContain('text-base');
      expect(label.className).toContain('font-semibold');
      expect(label.className).toContain('mb-2');
      expect(label.className).toContain('text-main');
    });
  });
});