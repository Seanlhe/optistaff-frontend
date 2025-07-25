import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PreferencesPay from '../../src/components/PreferencesPay';

// Mock form data setter to fail
const mockSetFormData = vi.fn(() => {
  throw new Error('Form state update mechanism failed');
});

describe('PreferencesPay - Failure Scenarios', () => {
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

  it('should fail when form data updater throws error on pay rate change', () => {
    const { getByRole } = render(
      <PreferencesPay 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const slider = getByRole('slider');
    
    expect(() => {
      fireEvent.change(slider, { target: { value: '25' } });
    }).toThrow('Form state update mechanism failed');
  });

  it('should fail when form data updater throws error on checkbox change', () => {
    const { getByRole } = render(
      <PreferencesPay 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const checkbox = getByRole('checkbox');
    
    expect(() => {
      fireEvent.click(checkbox);
    }).toThrow('Form state update mechanism failed');
  });

  it('should fail with corrupted form data structure', () => {
    const corruptedFormData = {
      payRate: { valueOf: () => { throw new Error('Corrupted payRate object'); } },
      considerLowerRate: 'invalid' as any
    } as any;

    expect(() => {
      render(
        <PreferencesPay 
          formData={corruptedFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow('Corrupted payRate object');
  });

  it('should fail with null form data', () => {
    const nullFormData = null as any;

    expect(() => {
      render(
        <PreferencesPay 
          formData={nullFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail with invalid payRate values', () => {
    const invalidFormData = {
      ...mockFormData,
      payRate: NaN,
      considerLowerRate: null as any
    };

    expect(() => {
      render(
        <PreferencesPay 
          formData={invalidFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail with corrupted event object during slider change', () => {
    const { getByRole } = render(
      <PreferencesPay 
        formData={mockFormData} 
        setFormData={vi.fn()} 
      />
    );

    const slider = getByRole('slider');
    
    // Mock corrupted event with faulty target
    const corruptedEvent = {
      target: {
        get value() { throw new Error('Event target value corrupted'); }
      }
    };

    expect(() => {
      fireEvent.change(slider, corruptedEvent);
    }).toThrow('Event target value corrupted');
  });

  it('should fail with corrupted event object during checkbox change', () => {
    const { getByRole } = render(
      <PreferencesPay 
        formData={mockFormData} 
        setFormData={vi.fn()} 
      />
    );

    const checkbox = getByRole('checkbox');
    
    // Mock corrupted event with faulty checked property
    const corruptedEvent = {
      target: {
        get checked() { throw new Error('Event target checked property corrupted'); }
      }
    };

    expect(() => {
      fireEvent.click(checkbox, corruptedEvent);
    }).toThrow('Event target checked property corrupted');
  });

  it('should fail with number conversion error', () => {
    // Mock Number constructor to fail
    const originalNumber = global.Number;
    global.Number = class extends Number {
      constructor(value: any) {
        if (value === '22') {
          throw new Error('Number conversion failed for value 22');
        }
        return super(value);
      }
    } as any;

    const { getByRole } = render(
      <PreferencesPay 
        formData={mockFormData} 
        setFormData={vi.fn()} 
      />
    );

    const slider = getByRole('slider');
    
    expect(() => {
      fireEvent.change(slider, { target: { value: '22' } });
    }).toThrow('Number conversion failed for value 22');

    global.Number = originalNumber;
  });

  it('should fail with circular reference in form data', () => {
    const circularFormData: any = { ...mockFormData };
    circularFormData.self = circularFormData; // Create circular reference

    expect(() => {
      render(
        <PreferencesPay 
          formData={circularFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail with memory allocation error during state spread', () => {
    const { getByRole } = render(
      <PreferencesPay 
        formData={mockFormData} 
        setFormData={vi.fn((prevData) => {
          // Simulate memory allocation failure during object spread
          return { ...prevData, ...new Array(Number.MAX_SAFE_INTEGER) };
        })} 
      />
    );

    const slider = getByRole('slider');
    
    expect(() => {
      fireEvent.change(slider, { target: { value: '18' } });
    }).toThrow();
  });

  it('should fail with slider range validation error', () => {
    const { getByRole } = render(
      <PreferencesPay 
        formData={mockFormData} 
        setFormData={vi.fn((prevData) => {
          const newValue = Number(prevData.payRate);
          if (newValue < 5 || newValue > 30) {
            throw new Error('Pay rate out of valid range');
          }
          return prevData;
        })} 
      />
    );

    const slider = getByRole('slider');
    
    expect(() => {
      fireEvent.change(slider, { target: { value: '100' } }); // Out of range
    }).toThrow('Pay rate out of valid range');
  });

  it('should fail with CSS class application error', () => {
    // Mock element className setter to fail
    const originalClassNameDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'className');
    Object.defineProperty(Element.prototype, 'className', {
      set: function(value: string) {
        if (value.includes('accent-primary-blue')) {
          throw new Error('CSS class application failed');
        }
        return originalClassNameDescriptor?.set?.call(this, value);
      },
      get: originalClassNameDescriptor?.get,
      configurable: true
    });

    expect(() => {
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow('CSS class application failed');

    // Restore original descriptor
    if (originalClassNameDescriptor) {
      Object.defineProperty(Element.prototype, 'className', originalClassNameDescriptor);
    }
  });

  it('should fail with label-input association error', () => {
    // Mock HTML element getAttribute to fail for specific attributes
    const originalGetAttribute = Element.prototype.getAttribute;
    Element.prototype.getAttribute = vi.fn((name: string) => {
      if (name === 'htmlFor' || name === 'id') {
        throw new Error('Label-input association failed');
      }
      return originalGetAttribute.call(this, name);
    });

    expect(() => {
      render(
        <PreferencesPay 
          formData={mockFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow('Label-input association failed');

    Element.prototype.getAttribute = originalGetAttribute;
  });

  it('should fail with boolean conversion error for checkbox', () => {
    const { getByRole } = render(
      <PreferencesPay 
        formData={mockFormData} 
        setFormData={vi.fn((prevData) => {
          // Simulate boolean conversion failure
          if (typeof prevData.considerLowerRate !== 'boolean') {
            throw new Error('Boolean conversion failed');
          }
          return prevData;
        })} 
      />
    );

    const checkbox = getByRole('checkbox');
    
    // Force a non-boolean value scenario
    Object.defineProperty(checkbox, 'checked', {
      get: () => 'not-a-boolean' as any
    });

    expect(() => {
      fireEvent.click(checkbox);
    }).toThrow('Boolean conversion failed');
  });
});