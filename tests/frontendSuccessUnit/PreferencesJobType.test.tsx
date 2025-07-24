import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PreferenceJobType } from '../../src/components/PreferencesJobType';
import { useJobTypes } from '../../src/hooks/useJobTypes';
import { PreferencesFormData, JobTypesByCategory } from '../../src/types/hooks';

vi.mock('../../src/hooks/useJobTypes');

describe('PreferenceJobType', () => {
  const mockSetFormData = vi.fn();
  const mockUseJobTypes = vi.mocked(useJobTypes);

  const mockJobTypesByCategory: JobTypesByCategory = {
    'Food Service': [
      {
        job_type_id: '1',
        type_name: 'Waiter',
        category_id: 'cat1',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        job_type_id: '2',
        type_name: 'Chef',
        category_id: 'cat1',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ],
    'Retail': [
      {
        job_type_id: '3',
        type_name: 'Sales Associate',
        category_id: 'cat2',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ]
  };

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
    mockUseJobTypes.mockReturnValue({
      jobTypesByCategory: mockJobTypesByCategory,
      loading: false,
      error: null,
      fetchJobTypes: vi.fn()
    });
  });

  it('renders correctly with job types grouped by category', () => {
    render(
      <PreferenceJobType 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    expect(screen.getByText('Preferred Job Type')).toBeTruthy();
    expect(screen.getByText('Select all job types you\'re interested in')).toBeTruthy();
    expect(screen.getByText('Food Service')).toBeTruthy();
    expect(screen.getByText('Retail')).toBeTruthy();
    expect(screen.getByText('Waiter')).toBeTruthy();
    expect(screen.getByText('Chef')).toBeTruthy();
    expect(screen.getByText('Sales Associate')).toBeTruthy();
  });

  it('shows loading state when job types are loading', () => {
    mockUseJobTypes.mockReturnValue({
      jobTypesByCategory: {},
      loading: true,
      error: null,
      fetchJobTypes: vi.fn()
    });

    render(
      <PreferenceJobType 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    expect(screen.getByText((_, element) => 
      element?.className?.includes('animate-pulse') || false
    )).toBeTruthy();
  });

  it('shows error state when there is an error loading job types', () => {
    const errorMessage = 'Failed to load job types';
    mockUseJobTypes.mockReturnValue({
      jobTypesByCategory: {},
      loading: false,
      error: errorMessage,
      fetchJobTypes: vi.fn()
    });

    render(
      <PreferenceJobType 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    expect(screen.getByText('Error Loading Job Types')).toBeTruthy();
    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it('loads existing selected job names from form data', () => {
    const formDataWithSelections: PreferencesFormData = {
      ...defaultFormData,
      selectedJobNames: ['Waiter', 'Chef']
    };

    render(
      <PreferenceJobType 
        formData={formDataWithSelections} 
        setFormData={mockSetFormData} 
      />
    );

    const waiterCheckbox = screen.getByRole('checkbox', { name: /waiter/i }) as HTMLInputElement;
    const chefCheckbox = screen.getByRole('checkbox', { name: /chef/i }) as HTMLInputElement;
    const salesCheckbox = screen.getByRole('checkbox', { name: /sales associate/i }) as HTMLInputElement;

    expect(waiterCheckbox.checked).toBe(true);
    expect(chefCheckbox.checked).toBe(true);
    expect(salesCheckbox.checked).toBe(false);
  });

  it('handles checkbox selection correctly', () => {
    render(
      <PreferenceJobType 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const waiterCheckbox = screen.getByRole('checkbox', { name: /waiter/i });
    fireEvent.click(waiterCheckbox);

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...defaultFormData,
      selectedJobNames: ['Waiter']
    });
  });

  it('handles checkbox deselection correctly', () => {
    const formDataWithSelections: PreferencesFormData = {
      ...defaultFormData,
      selectedJobNames: ['Waiter', 'Chef']
    };

    render(
      <PreferenceJobType 
        formData={formDataWithSelections} 
        setFormData={mockSetFormData} 
      />
    );

    const waiterCheckbox = screen.getByRole('checkbox', { name: /waiter/i });
    fireEvent.click(waiterCheckbox);

    expect(mockSetFormData).toHaveBeenCalledWith({
      ...formDataWithSelections,
      selectedJobNames: ['Chef']
    });
  });

  it('handles multiple selections correctly', () => {
    render(
      <PreferenceJobType 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const waiterCheckbox = screen.getByRole('checkbox', { name: /waiter/i });
    const chefCheckbox = screen.getByRole('checkbox', { name: /chef/i });

    fireEvent.click(waiterCheckbox);
    fireEvent.click(chefCheckbox);

    expect(mockSetFormData).toHaveBeenCalledTimes(2);
    expect(mockSetFormData).toHaveBeenNthCalledWith(1, {
      ...defaultFormData,
      selectedJobNames: ['Waiter']
    });
    expect(mockSetFormData).toHaveBeenNthCalledWith(2, {
      ...defaultFormData,
      selectedJobNames: ['Waiter', 'Chef']
    });
  });

  it('applies correct styling for selected and unselected job types', () => {
    const formDataWithSelections: PreferencesFormData = {
      ...defaultFormData,
      selectedJobNames: ['Waiter']
    };

    render(
      <PreferenceJobType 
        formData={formDataWithSelections} 
        setFormData={mockSetFormData} 
      />
    );

    const waiterLabel = screen.getByText('Waiter').closest('label');
    const chefLabel = screen.getByText('Chef').closest('label');

    expect(waiterLabel?.className).toContain('bg-primary-blue/5');
    expect(waiterLabel?.className).toContain('text-gradient-end');
    expect(chefLabel?.className).toContain('bg-card-color');
    expect(chefLabel?.className).toContain('text-secondary-text');
  });

  it('renders all checkboxes with correct attributes', () => {
    render(
      <PreferenceJobType 
        formData={defaultFormData} 
        setFormData={mockSetFormData} 
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);

    checkboxes.forEach(checkbox => {
      expect(checkbox.getAttribute('type')).toBe('checkbox');
      expect(checkbox.className).toContain('h-4');
      expect(checkbox.className).toContain('w-4');
      expect(checkbox.className).toContain('rounded-sm');
    });
  });
});