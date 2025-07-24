import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PreferencesForm from '../../src/components/PreferencesForm';
import { usePreferencesForm } from '../../src/hooks/usePreferencesForm';
import { PreferencesFormData } from '../../src/types/hooks';

// --- Mocks ---

// Mock the custom hook to isolate the component.
vi.mock('../../src/hooks/usePreferencesForm');

// Mock child components to simplify the test.
vi.mock('../../src/components/LocationAwareMap', () => ({
  LocationAwareMap: vi.fn(({ onLocationError, onRadiusChange }) => (
    <div data-testid="mock-map">
      <button onClick={() => onRadiusChange(25)}>Change Radius</button>
      <button onClick={() => onLocationError({ type: 'PERMISSION_DENIED', message: 'User denied location access.', canRetry: true })}>
        Trigger Location Error
      </button>
    </div>
  )),
}));
vi.mock('../../src/components/PreferencesMaximum', () => ({ default: vi.fn(() => <div data-testid="mock-prefs-max"></div>) }));
vi.mock('../../src/components/PreferencesPay', () => ({ default: vi.fn(() => <div data-testid="mock-prefs-pay"></div>) }));
vi.mock('../../src/components/PreferencesJobType', () => ({ default: vi.fn(() => <div data-testid="mock-prefs-jobtype"></div>) }));
vi.mock('../../src/components/LocationErrorBoundary', () => ({ default: vi.fn(({ children }) => <>{children}</>) }));


// --- Test Suite ---

describe('PreferencesForm', () => {
  const mockSavePreferences = vi.fn();
  const mockGetFormData = vi.fn();

  const defaultMockData: PreferencesFormData = {
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 15,
    selectedJobNames: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFormData.mockReturnValue(defaultMockData);
    vi.mocked(usePreferencesForm).mockReturnValue({
      savePreferences: mockSavePreferences,
      getFormData: mockGetFormData,
      loading: false,
      validating: false,
      error: null,
      homeLocation: { lat: 1.3521, lng: 103.8198 },
    });
  });

  it('renders correctly and displays child components', () => {
    render(<PreferencesForm />);
    
    // getBy... queries throw an error if not found.
    // Asserting that the returned element is truthy confirms it was found.
    expect(screen.getByTestId('mock-prefs-max')).toBeTruthy();
    expect(screen.getByTestId('mock-prefs-pay')).toBeTruthy();
    expect(screen.getByTestId('mock-prefs-jobtype')).toBeTruthy();
    expect(screen.getByTestId('mock-map')).toBeTruthy();
    expect(screen.getByRole('button', { name: /submit/i })).toBeTruthy();
  });

  it('handles successful form submission', async () => {
    mockSavePreferences.mockResolvedValue(true);
    render(<PreferencesForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(mockSavePreferences).toHaveBeenCalledWith(defaultMockData);

    await waitFor(() => {
      // Check for the success message's presence.
      expect(screen.getByText(/preferences saved successfully!/i)).toBeTruthy();
    });
  });

  it('handles failed form submission', async () => {
    mockSavePreferences.mockResolvedValue(false);
    render(<PreferencesForm />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockSavePreferences).toHaveBeenCalled();
    });

    // queryBy... returns null if not found. This is how we test for absence.
    expect(screen.queryByText(/preferences saved successfully!/i)).toBeNull();
    
    const submitButton = screen.getByRole('button', { name: /submit/i }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  it('displays a general error message from the hook', () => {
    vi.mocked(usePreferencesForm).mockReturnValue({
      savePreferences: mockSavePreferences,
      getFormData: mockGetFormData,
      loading: false,
      validating: false,
      error: 'Failed to connect to the server.',
      homeLocation: { lat: 1.3521, lng: 103.8198 },
    });

    render(<PreferencesForm />);

    expect(screen.getByText('Error Loading Preferences')).toBeTruthy();
    expect(screen.getByText('Failed to connect to the server.')).toBeTruthy();
  });

  it('displays and handles a location-specific error', async () => {
    render(<PreferencesForm />);

    fireEvent.click(screen.getByRole('button', { name: /trigger location error/i }));

    await waitFor(() => {
      expect(screen.getByText('Location Service Issue')).toBeTruthy();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeTruthy();
    fireEvent.click(retryButton);

    await waitFor(() => {
      // Assert the error message is now gone.
      expect(screen.queryByText('Location Service Issue')).toBeNull();
    });
    
    // The retry button should clear the error, which is the expected behavior
    expect(screen.queryByText('Location Service Issue')).toBeNull();
  });
});     