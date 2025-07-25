import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CalendarEvent } from '../../src/components/CalendarEvent';
import { UI_Event } from '../../src/types/hooks';

// Mock date-fns to return invalid calculations
vi.mock('date-fns', () => ({
  getHours: vi.fn(() => NaN),
  getMinutes: vi.fn(() => NaN),
  setHours: vi.fn(() => new Date('invalid')),
  setMinutes: vi.fn(() => new Date('invalid')),
  format: vi.fn(() => 'Invalid Time')
}));

describe('CalendarEvent - Failure Scenarios', () => {
  const mockEvent: UI_Event = {
    id: 'event-1',
    startTime: new Date('invalid'), // Invalid date
    endTime: new Date('invalid'),   // Invalid date
    day_of_week: NaN // Invalid day
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fail to render due to invalid time calculations', () => {
    expect(() => {
      render(
        <CalendarEvent
          event={mockEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );
    }).toThrow();
  });

  it('should fail positioning calculations with NaN values', () => {
    // Mock successful date functions but return NaN for calculations
    const mockEvent: UI_Event = {
      id: 'event-1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      day_of_week: 1
    };

    vi.mocked(require('date-fns').getHours).mockReturnValue(NaN);
    vi.mocked(require('date-fns').getMinutes).mockReturnValue(NaN);

    expect(() => {
      render(
        <CalendarEvent
          event={mockEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );
    }).toThrow();
  });

  it('should fail drag operations with invalid coordinates', () => {
    const mockEvent: UI_Event = {
      id: 'event-1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      day_of_week: 1
    };

    // Mock getBoundingClientRect to return invalid values
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: NaN,
      left: NaN,
      bottom: NaN,
      right: NaN,
      width: NaN,
      height: NaN,
      x: NaN,
      y: NaN,
      toJSON: vi.fn()
    }));

    const { getByTestId } = render(
      <div style={{ position: 'relative', height: '1000px' }}>
        <CalendarEvent
          event={mockEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      </div>
    );

    const eventElement = getByTestId('calendar-event');
    
    expect(() => {
      fireEvent.mouseDown(eventElement, { clientY: 100 });
      fireEvent.mouseMove(eventElement, { clientY: 200 });
      fireEvent.mouseUp(eventElement);
    }).toThrow();
  });

  it('should fail to handle keyboard events with invalid key codes', () => {
    const mockEvent: UI_Event = {
      id: 'event-1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      day_of_week: 1
    };

    const { getByTestId } = render(
      <CalendarEvent
        event={mockEvent}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const eventElement = getByTestId('calendar-event');
    
    // Focus the element first
    eventElement.focus();
    
    // Test with invalid key event that should cause error
    expect(() => {
      fireEvent.keyDown(eventElement, { 
        key: null, 
        code: undefined,
        keyCode: NaN 
      });
    }).toThrow();
  });

  it('should fail resize operations with invalid mouse coordinates', () => {
    const mockEvent: UI_Event = {
      id: 'event-1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      day_of_week: 1
    };

    const { getByTestId } = render(
      <div style={{ position: 'relative', height: '1000px' }}>
        <CalendarEvent
          event={mockEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      </div>
    );

    const resizeHandle = getByTestId('resize-handle');

    expect(() => {
      fireEvent.mouseDown(resizeHandle, { clientY: NaN });
      fireEvent.mouseMove(document, { clientY: NaN });
      fireEvent.mouseUp(document);
    }).toThrow();
  });

  it('should fail time formatting with corrupted date objects', () => {
    const corruptedEvent: UI_Event = {
      id: 'event-1',
      startTime: { toString: () => { throw new Error('Corrupted date object') } } as any,
      endTime: { toString: () => { throw new Error('Corrupted date object') } } as any,
      day_of_week: 1
    };

    expect(() => {
      render(
        <CalendarEvent
          event={corruptedEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );
    }).toThrow('Corrupted date object');
  });

  it('should fail to calculate height with negative duration', () => {
    const invalidEvent: UI_Event = {
      id: 'event-1',
      startTime: new Date('2024-01-01T11:00:00Z'), // End before start
      endTime: new Date('2024-01-01T10:00:00Z'),
      day_of_week: 1
    };

    expect(() => {
      render(
        <CalendarEvent
          event={invalidEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );
    }).toThrow();
  });

  it('should fail drag validation with boundary checks', () => {
    const mockEvent: UI_Event = {
      id: 'event-1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T11:00:00Z'),
      day_of_week: 8 // Invalid day (should be 1-7)
    };

    expect(() => {
      render(
        <CalendarEvent
          event={mockEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );
    }).toThrow();
  });
});