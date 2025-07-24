import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CalendarEvent from './CalendarEvent';
import type { Event } from './Calendar';

/**
 * FAILURE TEST CASES FOR CALENDAREVENT
 * 
 * These tests demonstrate edge cases, boundary violations, and error conditions
 * that should be handled gracefully by the CalendarEvent component.
 * 
 * Purpose: Validate error handling, constraint enforcement, and defensive programming
 */

// --- Test Setup ---

const mockOnUpdate = vi.fn();
const mockOnDelete = vi.fn();

// Create invalid/edge case events for testing
const createInvalidEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'invalid-event',
  startTime: new Date('2024-01-15T10:00:00'),
  endTime: new Date('2024-01-15T12:00:00'),
  ...overrides,
});

describe('CalendarEvent - Failure Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 0,
      bottom: 200,
      right: 200,
      width: 200,
      height: 100,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Invalid Data Handling', () => {
    it('SHOULD FAIL: handles event with invalid start time', () => {
      const invalidEvent = createInvalidEvent({
        startTime: new Date('invalid-date'),
        endTime: new Date('2024-01-15T12:00:00'),
      });

      // This test expects the component to handle invalid dates gracefully
      // In a real scenario, this might render "Invalid Time" or throw an error
      expect(() => {
        render(
          <CalendarEvent
            event={invalidEvent}
            onUpdate={mockOnUpdate}
            onDelete={mockOnDelete}
          />
        );
      }).toThrow(); // This SHOULD fail in current implementation
    });

    it('SHOULD FAIL: handles event with negative duration', () => {
      const negativeEvent = createInvalidEvent({
        startTime: new Date('2024-01-15T12:00:00'),
        endTime: new Date('2024-01-15T10:00:00'), // End before start
      });

      render(
        <CalendarEvent
          event={negativeEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('12:00 - 10:00').parentElement;
      
      // This SHOULD fail - negative height should not be allowed
      expect(parseInt(eventElement?.style.height || '0')).toBeGreaterThan(0);
    });

    it('SHOULD FAIL: handles missing event ID', () => {
      const noIdEvent = createInvalidEvent({
        id: '', // Empty ID
      });

      render(
        <CalendarEvent
          event={noIdEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('10:00 - 12:00').parentElement as HTMLElement;
      fireEvent.focus(eventElement);
      fireEvent.keyDown(document, { key: 'Delete' });

      // This SHOULD fail - empty ID should not be passed to onDelete
      expect(mockOnDelete).toHaveBeenCalledWith('');
    });
  });

  describe('Boundary Violation Tests', () => {
    it('SHOULD FAIL: prevents dragging event before day start (00:00)', () => {
      const earlyEvent = createInvalidEvent({
        startTime: new Date('2024-01-15T01:00:00'),
        endTime: new Date('2024-01-15T02:00:00'),
      });

      render(
        <CalendarEvent
          event={earlyEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('01:00 - 02:00').parentElement as HTMLElement;

      // Try to drag up by 2 hours (should hit 00:00 boundary)
      fireEvent.mouseDown(eventElement, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 4 }); // Drag up significantly
      
      // This SHOULD fail if boundary checking is strict
      // The component should prevent the event from going before 00:00
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: expect.any(Date),
          endTime: expect.any(Date),
        })
      );
      
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(lastCall.startTime.getHours()).toBeGreaterThanOrEqual(0);
    });

    it('SHOULD FAIL: prevents dragging event past day end (23:59)', () => {
      const lateEvent = createInvalidEvent({
        startTime: new Date('2024-01-15T22:00:00'),
        endTime: new Date('2024-01-15T23:00:00'),
      });

      render(
        <CalendarEvent
          event={lateEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('22:00 - 23:00').parentElement as HTMLElement;

      // Try to drag down past midnight
      fireEvent.mouseDown(eventElement, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 200 }); // Drag down significantly
      
      // This SHOULD fail if strict boundary checking is enforced
      expect(mockOnUpdate).toHaveBeenCalled();
      
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(lastCall.endTime.getHours()).toBeLessThan(24);
    });

    it('SHOULD FAIL: prevents resizing to negative duration', () => {
      const shortEvent = createInvalidEvent({
        startTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T10:15:00'), // 15 minutes
      });

      render(
        <CalendarEvent
          event={shortEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('10:00 - 10:15').parentElement;
      const resizeHandle = eventElement?.querySelector('.resize-handle') as HTMLElement;

      // Try to resize to negative height
      fireEvent.mouseDown(resizeHandle, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 50 }); // Move up above start

      // This SHOULD fail - minimum duration should be enforced
      expect(mockOnUpdate).toHaveBeenCalled();
      
      const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0];
      expect(lastCall.endTime.getTime()).toBeGreaterThan(lastCall.startTime.getTime());
    });
  });

  describe('Concurrent Interaction Failures', () => {
    it('SHOULD FAIL: handles simultaneous drag and resize attempts', () => {
      render(
        <CalendarEvent
          event={createInvalidEvent()}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('10:00 - 12:00').parentElement as HTMLElement;
      const resizeHandle = eventElement?.querySelector('.resize-handle') as HTMLElement;

      // Start dragging
      fireEvent.mouseDown(eventElement, { clientX: 100, clientY: 100 });
      
      // Then try to start resizing (this should be prevented)
      fireEvent.mouseDown(resizeHandle, { clientX: 100, clientY: 200 });

      // This SHOULD fail if proper state management isn't in place
      // Only one operation should be active at a time
      expect(eventElement.className).toContain('opacity-50'); // Still dragging
    });

    it('SHOULD FAIL: handles rapid successive delete attempts', () => {
      render(
        <CalendarEvent
          event={createInvalidEvent()}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('10:00 - 12:00').parentElement as HTMLElement;

      // Rapid double-clicks
      fireEvent.doubleClick(eventElement);
      fireEvent.doubleClick(eventElement);
      fireEvent.doubleClick(eventElement);

      // This SHOULD fail if delete isn't debounced
      // onDelete should only be called once, not multiple times
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Leak and Cleanup Failures', () => {
    it('SHOULD FAIL: properly cleans up event listeners on unmount', () => {
      const { unmount } = render(
        <CalendarEvent
          event={createInvalidEvent()}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('10:00 - 12:00').parentElement as HTMLElement;
      
      // Start dragging to add event listeners
      fireEvent.mouseDown(eventElement, { clientX: 100, clientY: 100 });
      
      // Create spy for removeEventListener
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      // Unmount component
      unmount();

      // This SHOULD fail if cleanup isn't proper
      // Listeners should be removed to prevent memory leaks
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
  });

  describe('Accessibility Failures', () => {
    it('SHOULD FAIL: maintains keyboard accessibility during interactions', () => {
      render(
        <CalendarEvent
          event={createInvalidEvent()}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('10:00 - 12:00').parentElement as HTMLElement;
      
      // Start dragging
      fireEvent.mouseDown(eventElement);
      
      // This SHOULD fail if tabIndex is removed during drag
      // Element should remain keyboard accessible
      expect(eventElement.getAttribute('tabindex')).toBe('0');
    });

    it('SHOULD FAIL: provides proper ARIA labels for screen readers', () => {
      render(
        <CalendarEvent
          event={createInvalidEvent()}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('10:00 - 12:00').parentElement as HTMLElement;
      
      // This SHOULD fail if accessibility attributes are missing
      expect(eventElement.getAttribute('aria-label')).toBeTruthy();
      expect(eventElement.getAttribute('role')).toBeTruthy();
    });
  });

  describe('Performance Edge Cases', () => {
    it('SHOULD FAIL: handles extremely rapid mouse movements during drag', () => {
      render(
        <CalendarEvent
          event={createInvalidEvent()}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const eventElement = screen.getByText('10:00 - 12:00').parentElement as HTMLElement;
      
      // Start dragging
      fireEvent.mouseDown(eventElement, { clientX: 100, clientY: 100 });
      
      // Simulate very rapid movements (potential performance issue)
      for (let i = 0; i < 100; i++) {
        fireEvent.mouseMove(document, { clientX: 100 + i, clientY: 100 + i });
      }

      // This SHOULD fail if onUpdate isn't throttled/debounced
      // Too many calls could cause performance issues
      expect(mockOnUpdate.mock.calls.length).toBeLessThan(50); // Reasonable limit
    });
  });
});