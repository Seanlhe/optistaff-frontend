import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PreferencesPay from './PreferencesPay';
import { PreferencesFormData } from '../types/hooks';

/**
 * FAILURE TEST CASES FOR PREFERENCESPAY
 * 
 * Tests boundary violations, input validation failures, and edge cases
 * for the pay rate slider component
 */

describe('PreferencesPay - Failure Cases', () => {
  const mockSetFormData = vi.fn();
  
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
  });

  describe('Boundary Violation Failures', () => {
    it('SHOULD FAIL: handles pay rate below minimum wage', () => {
      const belowMinimumData = {
        ...validFormData,
        payRate: 2, // Below Singapore minimum wage
      };

      render(
        <PreferencesPay
          formData={belowMinimumData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // Try to set even lower rate
      fireEvent.change(slider, { target: { value: '1' } });

      // This SHOULD fail - should enforce minimum wage
      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          payRate: expect.any(Number),
        })
      );

      const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
      expect(lastCall.payRate).toBeGreaterThanOrEqual(5); // Min should be enforced
    });

    it('SHOULD FAIL: handles pay rate exceeding maximum', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // Try to set rate above slider maximum
      fireEvent.change(slider, { target: { value: '999' } });

      // This SHOULD fail - should enforce maximum boundary
      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          payRate: 999, // Should not exceed slider max
        })
      );

      const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
      expect(lastCall.payRate).toBeLessThanOrEqual(30); // Max should be enforced
    });

    it('SHOULD FAIL: handles invalid numeric input', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // Test various invalid inputs
      const invalidInputs = ['abc', 'NaN', 'Infinity', '-Infinity', '', null, undefined];
      
      invalidInputs.forEach(invalidValue => {
        fireEvent.change(slider, { target: { value: invalidValue } });
      });

      // This SHOULD fail if Number() conversion isn't handled properly
      expect(mockSetFormData).toHaveBeenCalled();
      
      // All calls should result in valid numbers
      mockSetFormData.mock.calls.forEach(call => {
        const payRate = call[0].payRate;
        expect(typeof payRate).toBe('number');
        expect(isNaN(payRate)).toBe(false);
        expect(isFinite(payRate)).toBe(true);
      });
    });
  });

  describe('State Management Failures', () => {
    it('SHOULD FAIL: handles corrupted form data', () => {
      const corruptedData: any = {
        ...validFormData,
        payRate: { invalid: 'object' }, // Should be number
        considerLowerRate: 'yes', // Should be boolean
      };

      // This SHOULD fail - component should handle type mismatches
      expect(() => {
        render(
          <PreferencesPay
            formData={corruptedData}
            setFormData={mockSetFormData}
          />
        );
      }).toThrow();
    });

    it('SHOULD FAIL: handles rapid slider movements', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // Simulate rapid slider movements
      for (let i = 5; i <= 30; i++) {
        fireEvent.change(slider, { target: { value: i.toString() } });
      }

      // This SHOULD fail if not throttled/debounced
      // Should not call setFormData for every single change
      expect(mockSetFormData.mock.calls.length).toBeLessThan(10); // Should be throttled
    });

    it('SHOULD FAIL: handles concurrent pay rate and checkbox changes', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      const checkbox = screen.getByRole('checkbox');
      
      // Simultaneous changes
      fireEvent.change(slider, { target: { value: '25' } });
      fireEvent.click(checkbox);
      fireEvent.change(slider, { target: { value: '15' } });
      fireEvent.click(checkbox);

      // This SHOULD fail if state updates conflict
      // Final state should be consistent
      const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
      expect(typeof lastCall.payRate).toBe('number');
      expect(typeof lastCall.considerLowerRate).toBe('boolean');
    });
  });

  describe('Display and Formatting Failures', () => {
    it('SHOULD FAIL: handles extreme pay rate display formatting', () => {
      const extremeData = {
        ...validFormData,
        payRate: 999999.99999, // Very large decimal
      };

      render(
        <PreferencesPay
          formData={extremeData}
          setFormData={mockSetFormData}
        />
      );

      // This SHOULD fail if formatting isn't handled properly
      // Should format large numbers appropriately
      expect(screen.getByText(/\$999999\.99999/)).toBeTruthy();
    });

    it('SHOULD FAIL: handles floating point precision errors', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // Test floating point precision issues
      fireEvent.change(slider, { target: { value: '20.1' } });
      fireEvent.change(slider, { target: { value: '20.2' } });
      fireEvent.change(slider, { target: { value: '20.3' } });

      // This SHOULD fail if floating point arithmetic isn't handled
      expect(mockSetFormData).toHaveBeenCalled();
      
      const calls = mockSetFormData.mock.calls;
      calls.forEach(call => {
        const payRate = call[0].payRate;
        // Should handle floating point precision properly
        expect(payRate).toBe(Math.round(payRate * 100) / 100);
      });
    });

    it('SHOULD FAIL: handles negative zero and positive zero', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // Test edge cases with zero
      fireEvent.change(slider, { target: { value: '-0' } });
      fireEvent.change(slider, { target: { value: '+0' } });
      fireEvent.change(slider, { target: { value: '0.0' } });

      // This SHOULD fail if zero handling isn't consistent
      expect(mockSetFormData).toHaveBeenCalled();
      
      mockSetFormData.mock.calls.forEach(call => {
        const payRate = call[0].payRate;
        if (payRate === 0) {
          expect(Object.is(payRate, 0)).toBe(true); // Should be positive zero
        }
      });
    });
  });

  describe('Accessibility and UX Failures', () => {
    it('SHOULD FAIL: maintains proper ARIA attributes for slider', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // This SHOULD fail if ARIA attributes are missing
      expect(slider.getAttribute('aria-valuemin')).toBe('5');
      expect(slider.getAttribute('aria-valuemax')).toBe('30');
      expect(slider.getAttribute('aria-valuenow')).toBe('20');
      expect(slider.getAttribute('aria-label')).toBeTruthy();
    });

    it('SHOULD FAIL: provides keyboard navigation for slider', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      // Test keyboard navigation
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      fireEvent.keyDown(slider, { key: 'Home' });
      fireEvent.keyDown(slider, { key: 'End' });

      // This SHOULD fail if keyboard navigation isn't implemented
      expect(mockSetFormData).toHaveBeenCalled();
      
      // Should handle keyboard events
      const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
      expect(typeof lastCall.payRate).toBe('number');
    });

    it('SHOULD FAIL: handles focus management with invalid values', () => {
      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      const checkbox = screen.getByRole('checkbox');
      
      // Set invalid value and change focus
      fireEvent.change(slider, { target: { value: 'invalid' } });
      fireEvent.blur(slider);
      fireEvent.focus(checkbox);

      // This SHOULD fail if focus management doesn't handle errors
      // Should show error state or validation message
      expect(document.activeElement).toBe(checkbox);
    });
  });

  describe('Performance Failures', () => {
    it('SHOULD FAIL: handles memory leaks from slider events', () => {
      const { unmount } = render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // Add event listeners
      fireEvent.change(slider, { target: { value: '25' } });

      // Create spy for removeEventListener
      const removeEventListenerSpy = vi.spyOn(slider, 'removeEventListener');

      // Unmount component
      unmount();

      // This SHOULD fail if event listeners aren't cleaned up
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('SHOULD FAIL: handles excessive DOM updates from rapid changes', () => {
      const updateSpy = vi.fn();
      
      // Mock DOM update observer
      const originalTextContent = Object.getOwnPropertyDescriptor(Element.prototype, 'textContent');
      Object.defineProperty(Element.prototype, 'textContent', {
        set: function(value) {
          updateSpy();
          originalTextContent?.set?.call(this, value);
        },
        get: originalTextContent?.get,
        configurable: true,
      });

      render(
        <PreferencesPay
          formData={validFormData}
          setFormData={mockSetFormData}
        />
      );

      const slider = screen.getByRole('slider');
      
      // Rapid changes
      for (let i = 10; i <= 25; i++) {
        fireEvent.change(slider, { target: { value: i.toString() } });
      }

      // This SHOULD fail if DOM updates aren't optimized
      // Should batch DOM updates or use React optimizations
      expect(updateSpy.mock.calls.length).toBeLessThan(50);

      // Restore original property
      Object.defineProperty(Element.prototype, 'textContent', originalTextContent!);
    });
  });
});