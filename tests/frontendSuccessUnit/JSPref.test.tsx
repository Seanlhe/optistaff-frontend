import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Preferences from '../../src/pages/employee/JSPref';

// --- Mocks ---

// Mock child components to isolate the main component
vi.mock('../../src/components/PreferencesForm', () => ({
  default: vi.fn(() => <div data-testid="mock-preferences-form">Preferences Form</div>)
}));

vi.mock('../../src/components/Availability', () => ({
  default: vi.fn(() => <div data-testid="mock-availability">Availability Component</div>)
}));

// --- Test Suite ---

describe('Preferences (JSPref)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default tab selected', () => {
    render(<Preferences />);
    
    // Check that both tab buttons are rendered
    expect(screen.getByRole('button', { name: 'Preferences' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Availability' })).toBeTruthy();
    
    // Check that PreferencesForm is rendered by default
    expect(screen.getByTestId('mock-preferences-form')).toBeTruthy();
    
    // Check that Availability component is not rendered initially
    expect(screen.queryByTestId('mock-availability')).toBeNull();
  });

  it('applies correct CSS classes to active tab', () => {
    render(<Preferences />);
    
    const preferencesButton = screen.getByRole('button', { name: 'Preferences' });
    const availabilityButton = screen.getByRole('button', { name: 'Availability' });
    
    // Check that Preferences tab has active styles
    expect(preferencesButton.className).toContain('bg-white');
    expect(preferencesButton.className).not.toContain('hover:');
    
    // Check that Availability tab has inactive styles
    expect(availabilityButton.className).toContain('hover:bg-white/60');
    expect(availabilityButton.className).not.toContain('bg-white ');
  });

  it('switches to Availability tab when clicked', () => {
    render(<Preferences />);
    
    const availabilityButton = screen.getByRole('button', { name: 'Availability' });
    
    // Click the Availability tab
    fireEvent.click(availabilityButton);
    
    // Check that Availability component is now rendered
    expect(screen.getByTestId('mock-availability')).toBeTruthy();
    
    // Check that PreferencesForm is no longer rendered
    expect(screen.queryByTestId('mock-preferences-form')).toBeNull();
  });

  it('switches back to Preferences tab when clicked', () => {
    render(<Preferences />);
    
    const preferencesButton = screen.getByRole('button', { name: 'Preferences' });
    const availabilityButton = screen.getByRole('button', { name: 'Availability' });
    
    // First switch to Availability
    fireEvent.click(availabilityButton);
    expect(screen.getByTestId('mock-availability')).toBeTruthy();
    
    // Then switch back to Preferences
    fireEvent.click(preferencesButton);
    
    // Check that PreferencesForm is rendered again
    expect(screen.getByTestId('mock-preferences-form')).toBeTruthy();
    
    // Check that Availability component is no longer rendered
    expect(screen.queryByTestId('mock-availability')).toBeNull();
  });

  it('updates CSS classes when switching tabs', () => {
    render(<Preferences />);
    
    const preferencesButton = screen.getByRole('button', { name: 'Preferences' });
    const availabilityButton = screen.getByRole('button', { name: 'Availability' });
    
    // Initially, Preferences should be active
    expect(preferencesButton.className).toContain('bg-white');
    expect(preferencesButton.className).not.toContain('hover:');
    expect(availabilityButton.className).toContain('hover:bg-white/60');
    
    // Click Availability tab
    fireEvent.click(availabilityButton);
    
    // Now Availability should be active
    expect(availabilityButton.className).toContain('bg-white');
    expect(availabilityButton.className).not.toContain('hover:');
    expect(preferencesButton.className).toContain('hover:bg-white/60');
  });

  it('renders with correct container structure and styling', () => {
    render(<Preferences />);
    
    // Check for main container with correct classes
    const mainContainer = screen.getByRole('button', { name: 'Preferences' }).closest('.bg-tertiary-bg');
    expect(mainContainer).toBeTruthy();
    expect(mainContainer?.className).toContain('min-h-full');
    expect(mainContainer?.className).toContain('p-4');
    
    // Check for max-width container
    const maxWidthContainer = screen.getByRole('button', { name: 'Preferences' }).closest('.max-w-5xl');
    expect(maxWidthContainer).toBeTruthy();
    expect(maxWidthContainer?.className).toContain('mx-auto');
  });

  it('renders tab buttons with correct styling structure', () => {
    render(<Preferences />);
    
    const preferencesButton = screen.getByRole('button', { name: 'Preferences' });
    const availabilityButton = screen.getByRole('button', { name: 'Availability' });
    
    // Check that both buttons have common classes
    [preferencesButton, availabilityButton].forEach(button => {
      expect(button.className).toContain('px-3');
      expect(button.className).toContain('py-2');
      expect(button.className).toContain('rounded-lg');
      expect(button.className).toContain('text-sm');
    });
    
    // Check that buttons are in a container with correct classes
    const buttonContainer = preferencesButton.parentElement;
    expect(buttonContainer?.className).toContain('inline-flex');
    expect(buttonContainer?.className).toContain('p-1');
    expect(buttonContainer?.className).toContain('bg-secondary-bg');
    expect(buttonContainer?.className).toContain('rounded-lg');
    expect(buttonContainer?.className).toContain('gap-1');
  });

  it('maintains tab state across multiple clicks', () => {
    render(<Preferences />);
    
    const preferencesButton = screen.getByRole('button', { name: 'Preferences' });
    const availabilityButton = screen.getByRole('button', { name: 'Availability' });
    
    // Click Availability multiple times
    fireEvent.click(availabilityButton);
    fireEvent.click(availabilityButton);
    
    // Should still show Availability component
    expect(screen.getByTestId('mock-availability')).toBeTruthy();
    expect(screen.queryByTestId('mock-preferences-form')).toBeNull();
    
    // Click Preferences multiple times
    fireEvent.click(preferencesButton);
    fireEvent.click(preferencesButton);
    
    // Should still show Preferences component
    expect(screen.getByTestId('mock-preferences-form')).toBeTruthy();
    expect(screen.queryByTestId('mock-availability')).toBeNull();
  });

  it('only renders one component at a time', () => {
    render(<Preferences />);
    
    // Initially should only show PreferencesForm
    expect(screen.getByTestId('mock-preferences-form')).toBeTruthy();
    expect(screen.queryByTestId('mock-availability')).toBeNull();
    
    // After switching should only show Availability
    fireEvent.click(screen.getByRole('button', { name: 'Availability' }));
    expect(screen.getByTestId('mock-availability')).toBeTruthy();
    expect(screen.queryByTestId('mock-preferences-form')).toBeNull();
  });
});