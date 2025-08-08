import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PreferencesJobType from '../../src/components/PreferencesJobType';

// Mock the hook to return failing states
vi.mock('../../src/hooks/useJobTypes', () => ({
  useJobTypes: vi.fn(() => ({
    jobTypesByCategory: null, // Corrupted data
    loading: false,
    error: 'Failed to fetch job types from server',
    fetchJobTypes: vi.fn(() => Promise.reject(new Error('Network error')))
  }))
}));

// Mock React hooks to cause failures
const mockSetFormData = vi.fn(() => {
  throw new Error('Form data update failed');
});

describe('PreferencesJobType - Failure Scenarios', () => {
  const mockFormData = {
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 15,
    selectedJobNames: ['Cashier', 'Server'] // Valid initial data
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fail to render with hook error', () => {
    const { getByText } = render(
      <PreferencesJobType 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    );

    // Should display error message from failed hook
    expect(getByText('Failed to fetch job types from server')).toBeTruthy();
  });

  it('should fail to handle checkbox changes with corrupted form data updater', () => {
    // Mock hook to return working data but form updater to fail
    vi.mocked(require('../../src/hooks/useJobTypes').useJobTypes).mockReturnValue({
      jobTypesByCategory: {
        'Food Service': [
          { job_type_id: '1', type_name: 'Cashier', category_id: '1', is_active: true },
          { job_type_id: '2', type_name: 'Server', category_id: '1', is_active: true }
        ]
      },
      loading: false,
      error: null,
      fetchJobTypes: vi.fn()
    });

    const { getByLabelText } = render(
      <PreferencesJobType 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const cashierCheckbox = getByLabelText('Cashier');
    
    expect(() => {
      fireEvent.click(cashierCheckbox);
    }).toThrow('Form data update failed');
  });

  it('should fail with corrupted job types data structure', () => {
    // Mock hook to return malformed data
    vi.mocked(require('../../src/hooks/useJobTypes').useJobTypes).mockReturnValue({
      jobTypesByCategory: {
        'Food Service': [
          { job_type_id: null, type_name: undefined, category_id: '1' }, // Corrupted data
          { job_type_id: '2', type_name: 'Server', category_id: null } // Corrupted data
        ]
      },
      loading: false,
      error: null,
      fetchJobTypes: vi.fn()
    });

    expect(() => {
      render(
        <PreferencesJobType 
          formData={mockFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail with infinite loading state', () => {
    vi.mocked(require('../../src/hooks/useJobTypes').useJobTypes).mockReturnValue({
      jobTypesByCategory: {},
      loading: true, // Stuck in loading
      error: null,
      fetchJobTypes: vi.fn(() => Promise.reject(new Error('Timeout')))
    });

    const { getByText } = render(
      <PreferencesJobType 
        formData={mockFormData} 
        setFormData={vi.fn()} 
      />
    );

    // Should show loading skeleton indefinitely
    expect(getByText('Loading job types...')).toBeTruthy();
    
    // Simulate timeout scenario where loading never completes
    expect(() => {
      // This would typically cause the component to be stuck
      const skeletons = screen.getAllByTestId('job-type-skeleton');
      if (skeletons.length === 0) {
        throw new Error('Loading state failed to render properly');
      }
    }).toThrow();
  });

  it('should fail checkbox rendering with null selectedJobNames', () => {
    const corruptedFormData = {
      ...mockFormData,
      selectedJobNames: null as any // Corrupted selectedJobNames
    };

    vi.mocked(require('../../src/hooks/useJobTypes').useJobTypes).mockReturnValue({
      jobTypesByCategory: {
        'Food Service': [
          { job_type_id: '1', type_name: 'Cashier', category_id: '1', is_active: true }
        ]
      },
      loading: false,
      error: null,
      fetchJobTypes: vi.fn()
    });

    expect(() => {
      render(
        <PreferencesJobType 
          formData={corruptedFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail with circular dependency in job types', () => {
    // Create circular reference in job types data
    const circularJobType: any = { 
      job_type_id: '1', 
      type_name: 'Cashier', 
      category_id: '1', 
      is_active: true 
    };
    circularJobType.self = circularJobType; // Circular reference

    vi.mocked(require('../../src/hooks/useJobTypes').useJobTypes).mockReturnValue({
      jobTypesByCategory: {
        'Food Service': [circularJobType]
      },
      loading: false,
      error: null,
      fetchJobTypes: vi.fn()
    });

    expect(() => {
      render(
        <PreferencesJobType 
          formData={mockFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail with memory allocation error during rendering', () => {
    // Mock hook to return excessive data that would cause memory issues
    const massiveJobTypes = {};
    for (let i = 0; i < 10000; i++) {
      massiveJobTypes[`Category ${i}`] = Array(1000).fill({
        job_type_id: `${i}`,
        type_name: `Job ${i}`.repeat(1000), // Very long strings
        category_id: `${i}`,
        is_active: true
      });
    }

    vi.mocked(require('../../src/hooks/useJobTypes').useJobTypes).mockReturnValue({
      jobTypesByCategory: massiveJobTypes,
      loading: false,
      error: null,
      fetchJobTypes: vi.fn()
    });

    expect(() => {
      render(
        <PreferencesJobType 
          formData={mockFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });

  it('should fail event handling with corrupted event objects', () => {
    vi.mocked(require('../../src/hooks/useJobTypes').useJobTypes).mockReturnValue({
      jobTypesByCategory: {
        'Food Service': [
          { job_type_id: '1', type_name: 'Cashier', category_id: '1', is_active: true }
        ]
      },
      loading: false,
      error: null,
      fetchJobTypes: vi.fn()
    });

    const { getByLabelText } = render(
      <PreferencesJobType 
        formData={mockFormData} 
        setFormData={vi.fn()} 
      />
    );

    const checkbox = getByLabelText('Cashier');
    
    // Mock corrupted event object
    const corruptedEvent = {
      target: {
        checked: null, // Invalid checked state
        value: undefined
      }
    };

    expect(() => {
      fireEvent.click(checkbox, corruptedEvent);
    }).toThrow();
  });

  it('should fail category grouping with duplicate job type IDs', () => {
    vi.mocked(require('../../src/hooks/useJobTypes').useJobTypes).mockReturnValue({
      jobTypesByCategory: {
        'Food Service': [
          { job_type_id: '1', type_name: 'Cashier', category_id: '1', is_active: true },
          { job_type_id: '1', type_name: 'Different Job', category_id: '1', is_active: true } // Duplicate ID
        ]
      },
      loading: false,
      error: null,
      fetchJobTypes: vi.fn()
    });

    expect(() => {
      render(
        <PreferencesJobType 
          formData={mockFormData} 
          setFormData={vi.fn()} 
        />
      );
    }).toThrow();
  });
});