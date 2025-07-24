import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PreferencesMaximum from '../../src/components/PreferencesMaximum';

// Mock form data setter to fail
const mockSetFormData = vi.fn(() => {
  throw new Error('Form data state update failed');
});

describe('PreferencesMaximum - Failure Scenarios', () => {
  const mockFormData = {
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

  it('should fail when form data updater throws error on maxHoursPerWeek change', () => {
    const { getByLabelText } = render(
      <PreferencesMaximum 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const weekHoursInput = getByLabelText(/maximum hours per week/i);
    
    expect(() => {
      fireEvent.change(weekHoursInput, { target: { value: '35' } });
    }).toThrow('Form data state update failed');
  });

  it('should fail when form data updater throws error on maxHoursPerShift change', () => {
    const { getByLabelText } = render(
      <PreferencesMaximum 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const shiftHoursInput = getByLabelText(/maximum hours per shift/i);
    
    expect(() => {
      fireEvent.change(shiftHoursInput, { target: { value: '6' } });
    }).toThrow('Form data state update failed');
  });

  it('should fail with corrupted form data structure', () => {
    const corruptedFormData = null as any; // Null form data

    expect(() => {
      render(
        <PreferencesMaximum 
          formData={corruptedFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail with invalid form data values', () => {
    const invalidFormData = {
      ...mockFormData,
      maxHoursPerWeek: 'invalid' as any, // Non-numeric value
      maxHoursPerShift: NaN
    };

    expect(() => {
      render(
        <PreferencesMaximum 
          formData={invalidFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail with corrupted event object during input change', () => {
    const { getByLabelText } = render(
      <PreferencesMaximum 
        formData={mockFormData} 
        setFormData={vi.fn()} 
      />
    );

    const weekHoursInput = getByLabelText(/maximum hours per week/i);
    
    // Mock corrupted event object
    const corruptedEvent = {
      target: {
        value: { toString: () => { throw new Error('Corrupted value object'); } }
      }
    };

    expect(() => {
      fireEvent.change(weekHoursInput, corruptedEvent);
    }).toThrow('Corrupted value object');
  });

  it('should fail with extremely large input values causing overflow', () => {
    const { getByLabelText } = render(
      <PreferencesMaximum 
        formData={mockFormData} 
        setFormData={vi.fn((prevData) => {
          if (prevData.maxHoursPerWeek > Number.MAX_SAFE_INTEGER) {
            throw new Error('Integer overflow detected');
          }
          return prevData;
        })} 
      />
    );

    const weekHoursInput = getByLabelText(/maximum hours per week/i);
    
    expect(() => {
      fireEvent.change(weekHoursInput, { 
        target: { value: String(Number.MAX_SAFE_INTEGER + 1) } 
      });
    }).toThrow('Integer overflow detected');
  });

  it('should fail with negative input values causing validation error', () => {
    const { getByLabelText } = render(
      <PreferencesMaximum 
        formData={mockFormData} 
        setFormData={vi.fn((prevData) => {
          if (prevData.maxHoursPerWeek < 0) {
            throw new Error('Negative hours not allowed');
          }
          return prevData;
        })} 
      />
    );

    const weekHoursInput = getByLabelText(/maximum hours per week/i);
    
    expect(() => {
      fireEvent.change(weekHoursInput, { target: { value: '-5' } });
    }).toThrow('Negative hours not allowed');
  });

  it('should fail with circular reference in form data', () => {
    const circularFormData: any = { ...mockFormData };
    circularFormData.self = circularFormData; // Create circular reference

    expect(() => {
      render(
        <PreferencesMaximum 
          formData={circularFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail when input element is corrupted', () => {
    // Mock HTMLInputElement methods to fail
    const originalNumberType = HTMLInputElement.prototype.type;
    Object.defineProperty(HTMLInputElement.prototype, 'type', {
      get: () => { throw new Error('Input type property corrupted'); },
      configurable: true
    });

    expect(() => {
      render(
        <PreferencesMaximum 
          formData={mockFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow('Input type property corrupted');

    // Restore original property
    Object.defineProperty(HTMLInputElement.prototype, 'type', {
      value: originalNumberType,
      configurable: true
    });
  });

  it('should fail with memory allocation error during value processing', () => {
    const { getByLabelText } = render(
      <PreferencesMaximum 
        formData={mockFormData} 
        setFormData={vi.fn((prevData) => {
          // Simulate memory allocation failure during state update
          const largeArray = new Array(Number.MAX_SAFE_INTEGER);
          return { ...prevData, largeArray };
        })} 
      />
    );

    const weekHoursInput = getByLabelText(/maximum hours per week/i);
    
    expect(() => {
      fireEvent.change(weekHoursInput, { target: { value: '30' } });
    }).toThrow();
  });

  it('should fail with string manipulation error during number conversion', () => {
    const { getByLabelText } = render(
      <PreferencesMaximum 
        formData={mockFormData} 
        setFormData={vi.fn()} 
      />
    );

    const weekHoursInput = getByLabelText(/maximum hours per week/i);
    
    // Mock Number constructor to fail
    const originalNumber = global.Number;
    global.Number = class extends Number {
      constructor(value: any) {
        if (typeof value === 'string' && value === '25') {
          throw new Error('Number conversion failed for specific value');
        }
        return super(value);
      }
    } as any;

    expect(() => {
      fireEvent.change(weekHoursInput, { target: { value: '25' } });
    }).toThrow('Number conversion failed for specific value');

    global.Number = originalNumber;
  });

  it('should fail with DOM manipulation error during render', () => {
    // Mock createElement to fail for input elements
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'input') {
        throw new Error('Failed to create input element');
      }
      return originalCreateElement.call(document, tagName);
    });

    expect(() => {
      render(
        <PreferencesMaximum 
          formData={mockFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow('Failed to create input element');

    document.createElement = originalCreateElement;
  });
});