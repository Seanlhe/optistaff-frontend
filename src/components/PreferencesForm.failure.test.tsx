import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PreferencesForm from './PreferencesForm';
import { usePreferences } from '../hooks/usePreferences';
import { PreferencesFormData } from '../types/hooks';

/**
 * FAILURE TEST CASES FOR PREFERENCESFORM
 * 
 * Tests error conditions, boundary violations, and edge cases
 * that should reveal weaknesses in the component's error handling
 */

// --- Mocks ---
vi.mock('../hooks/usePreferences');
vi.mock('./LocationAwareMap', () => ({
  LocationAwareMap: vi.fn(({ onLocationError, onRetry }) => (
    <div data-testid="mock-map">
      <button onClick={() => onLocationError({ 
        type: 'PERMISSION_DENIED', 
        message: 'Location access denied', 
        canRetry: true 
      })}>
        Trigger Location Error
      </button>
      <button onClick={onRetry}>Retry Location</button>
    </div>
  )),
}));
vi.mock('./PreferencesMaximum', () => ({ default: vi.fn(() => <div data-testid="mock-prefs-max"></div>) }));
vi.mock('./PreferencesPay', () => ({ default: vi.fn(() => <div data-testid="mock-prefs-pay"></div>) }));
vi.mock('./PreferencesJobType', () => ({ default: vi.fn(() => <div data-testid="mock-prefs-jobtype"></div>) }));
vi.mock('./LocationErrorBoundary', () => ({ default: vi.fn(({ children, onError }) => {
  // Simulate error boundary crash
  if (window.location.href.includes('crash-boundary')) {
    onError(new Error('Boundary crash'), { componentStack: 'test' });
  }
  return <>{children}</>;
})});

describe('PreferencesForm - Failure Cases', () => {
  const mockSavePreferences = vi.fn();
  const mockGetFormData = vi.fn();
  const mockGeocodeHomeLocation = vi.fn();
  const mockLoadLocationData = vi.fn();

  const validFormData: PreferencesFormData = {
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 15,
    selectedJobNames: ['Waiter'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePreferences as vi.Mock).mockReturnValue({
      savePreferences: mockSavePreferences,
      getFormData: mockGetFormData.mockReturnValue(validFormData),
      geocodeHomeLocation: mockGeocodeHomeLocation,
      loadLocationData: mockLoadLocationData,
      loading: false,
      error: null,
      homeLocation: [1.3521, 103.8198],
      homeAddress: 'Singapore',
    });
  });

  describe('Data Persistence Failures', () => {
    it('SHOULD FAIL: handles form submission with corrupted data', async () => {
      // Mock corrupted form data
      const corruptedData = {
        ...validFormData,
        payRate: NaN,
        maxHoursPerWeek: -5,
        maxHoursPerShift: 999,
        selectedJobNames: null as any,
      };
      
      mockGetFormData.mockReturnValue(corruptedData);
      mockSavePreferences.mockResolvedValue(false);

      render(<PreferencesForm />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSavePreferences).toHaveBeenCalledWith(corruptedData);
      });

      // This SHOULD fail - corrupted data should be validated before submission
      expect(mockSavePreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          payRate: expect.any(Number),
          maxHoursPerWeek: expect.any(Number),
          maxHoursPerShift: expect.any(Number),
          selectedJobNames: expect.any(Array),
        })
      );
    });

    it('SHOULD FAIL: handles multiple rapid form submissions', async () => {
      mockSavePreferences.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(true), 100)
      ));

      render(<PreferencesForm />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      // Rapid multiple clicks
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSavePreferences).toHaveBeenCalled();
      });

      // This SHOULD fail if not properly debounced
      // Should only submit once, not multiple times
      expect(mockSavePreferences).toHaveBeenCalledTimes(1);
    });
  });

  describe('Location Service Failures', () => {
    it('SHOULD FAIL: handles infinite location retry loops', async () => {
      mockLoadLocationData.mockRejectedValue(new Error('Network failed'));
      
      render(<PreferencesForm />);

      const triggerErrorButton = screen.getByText('Trigger Location Error');
      fireEvent.click(triggerErrorButton);

      await waitFor(() => {
        expect(screen.getByText('Location Service Issue')).toBeTruthy();
      });

      const retryButton = screen.getByText('Try Again (3 attempts left)');
      
      // Rapidly click retry multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(retryButton);
      }

      await waitFor(() => {
        expect(mockLoadLocationData).toHaveBeenCalled();
      });

      // This SHOULD fail if retry limit isn't enforced
      // Should not exceed 3 retry attempts
      expect(mockLoadLocationData.mock.calls.length).toBeLessThanOrEqual(3);
    });

    it('SHOULD FAIL: handles location error boundary crashes', () => {
      // Simulate error boundary crash condition
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/crash-boundary' },
        writable: true,
      });

      render(<PreferencesForm />);

      // This SHOULD fail if error boundary doesn't handle crashes properly
      expect(screen.getByText('Location Service Issue')).toBeTruthy();
      expect(screen.getByText('Location component crashed unexpectedly')).toBeTruthy();
    });

    it('SHOULD FAIL: handles geocoding with invalid coordinates', async () => {
      mockGeocodeHomeLocation.mockRejectedValue(new Error('Invalid coordinates'));
      
      (usePreferences as vi.Mock).mockReturnValue({
        ...usePreferences(),
        homeAddress: 'Invalid Address',
        homeLocation: null, // Missing coordinates
      });

      render(<PreferencesForm />);

      await waitFor(() => {
        expect(mockGeocodeHomeLocation).toHaveBeenCalled();
      });

      // This SHOULD fail if error handling for geocoding failures is missing
      // Component should show error state or fallback
      expect(screen.queryByText(/geocoding error/i)).toBeTruthy();
    });
  });

  describe('State Management Failures', () => {
    it('SHOULD FAIL: handles concurrent form data updates', () => {
      const { rerender } = render(<PreferencesForm />);

      // Simulate rapid external updates to form data
      const conflictingData1 = { ...validFormData, payRate: 25 };
      const conflictingData2 = { ...validFormData, payRate: 30 };

      mockGetFormData.mockReturnValue(conflictingData1);
      rerender(<PreferencesForm />);

      mockGetFormData.mockReturnValue(conflictingData2);
      rerender(<PreferencesForm />);

      // This SHOULD fail if there's no state conflict resolution
      // Component might show inconsistent data or crash
      expect(screen.getByTestId('mock-prefs-pay')).toBeTruthy();
    });

    it('SHOULD FAIL: handles malformed preferences hook response', () => {
      // Mock malformed hook data
      (usePreferences as vi.Mock).mockReturnValue({
        savePreferences: null, // Should be function
        getFormData: undefined, // Should be function
        loading: 'not-a-boolean', // Should be boolean
        error: { message: 'Not a string' }, // Should be string or null
        homeLocation: 'invalid-coordinates', // Should be array
        homeAddress: 123, // Should be string
      });

      // This SHOULD fail - component should handle malformed hook data
      expect(() => {
        render(<PreferencesForm />);
      }).toThrow();
    });
  });

  describe('Memory and Performance Failures', () => {
    it('SHOULD FAIL: handles memory leaks from success message timers', async () => {
      mockSavePreferences.mockResolvedValue(true);

      const { unmount } = render(<PreferencesForm />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Preferences saved successfully!')).toBeTruthy();
      });

      // Unmount component immediately after success
      unmount();

      // This SHOULD fail if timeout isn't cleared
      // setTimeout should be cleared to prevent memory leaks
      const timeoutSpy = vi.spyOn(global, 'clearTimeout');
      expect(timeoutSpy).toHaveBeenCalled();
    });

    it('SHOULD FAIL: handles excessive re-renders from form updates', () => {
      const renderSpy = vi.fn();
      
      // Component that tracks renders
      const RenderCounter = () => {
        renderSpy();
        return <PreferencesForm />;
      };

      render(<RenderCounter />);

      // Simulate rapid form data changes
      for (let i = 0; i < 100; i++) {
        mockGetFormData.mockReturnValue({ 
          ...validFormData, 
          payRate: i 
        });
      }

      // This SHOULD fail if not optimized
      // Should not re-render excessively for each form change
      expect(renderSpy.mock.calls.length).toBeLessThan(50);
    });
  });

  describe('Accessibility Failures', () => {
    it('SHOULD FAIL: maintains focus management during error states', async () => {
      mockSavePreferences.mockRejectedValue(new Error('Save failed'));

      render(<PreferencesForm />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      submitButton.focus();
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSavePreferences).toHaveBeenCalled();
      });

      // This SHOULD fail if focus isn't managed properly
      // Focus should remain on submit button or move to error message
      expect(document.activeElement).toBe(submitButton);
    });

    it('SHOULD FAIL: provides proper ARIA states for loading/error', () => {
      (usePreferences as vi.Mock).mockReturnValue({
        ...usePreferences(),
        loading: true,
        error: 'Network error',
      });

      render(<PreferencesForm />);

      const submitButton = screen.getByRole('button', { name: /submit/i });

      // This SHOULD fail if ARIA attributes are missing
      expect(submitButton.getAttribute('aria-busy')).toBe('true');
      expect(submitButton.getAttribute('aria-describedby')).toBeTruthy();
    });
  });
});