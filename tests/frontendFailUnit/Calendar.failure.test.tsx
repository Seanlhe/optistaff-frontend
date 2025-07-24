import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Calendar } from '../../src/components/Calendar';

// Mock the hooks with failing scenarios
vi.mock('../../src/hooks/useAvailability', () => ({
  useAvailability: vi.fn(() => ({
    getAvailability: vi.fn(() => Promise.reject(new Error('Database connection failed'))),
    setAvailability: vi.fn(() => Promise.reject(new Error('Save operation failed'))),
    fetchLoading: false,
    saveLoading: false,
    loading: false,
    error: 'Failed to connect to database'
  }))
}));

vi.mock('../../src/hooks/useAvailabilityTemplate', () => ({
  useAvailabilityTemplate: vi.fn(() => ({
    createTemplate: vi.fn(() => Promise.reject(new Error('Template creation failed'))),
    fetchTemplate: vi.fn(() => Promise.reject(new Error('Template not found'))),
    deleteTemplate: vi.fn(() => Promise.reject(new Error('Template deletion failed'))),
    fetchAllTemplates: vi.fn(() => Promise.reject(new Error('Failed to fetch templates')))
  }))
}));

// Mock date-fns functions to return invalid dates
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Invalid Date'),
  startOfWeek: vi.fn(() => new Date('invalid')),
  addDays: vi.fn(() => new Date('invalid')),
  isSameDay: vi.fn(() => false),
  set: vi.fn(() => new Date('invalid'))
}));

// Mock icons to fail rendering
vi.mock('lucide-react', () => ({
  ChevronLeft: vi.fn(() => { throw new Error('Icon failed to render') }),
  ChevronRight: vi.fn(() => { throw new Error('Icon failed to render') }),
  Save: vi.fn(() => { throw new Error('Icon failed to render') }),
  File: vi.fn(() => { throw new Error('Icon failed to render') }),
  RefreshCw: vi.fn(() => { throw new Error('Icon failed to render') })
}));

// Mock child components to fail
vi.mock('../../src/components/CalendarEvent', () => ({
  CalendarEvent: vi.fn(() => { throw new Error('CalendarEvent component crashed') })
}));

vi.mock('../../src/components/TemplateNameDialog', () => ({
  TemplateNameDialog: vi.fn(() => { throw new Error('TemplateNameDialog component crashed') })
}));

vi.mock('../../src/components/TemplateSelectDialog', () => ({
  TemplateSelectDialog: vi.fn(() => { throw new Error('TemplateSelectDialog component crashed') })
}));

describe('Calendar - Failure Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fail to render due to date formatting errors', () => {
    expect(() => {
      render(<Calendar />);
    }).toThrow('Invalid Date');
  });

  it('should fail to load initial availability with database error', async () => {
    // Mock successful date functions for this test
    const { format, startOfWeek, addDays, set } = await vi.importActual('date-fns') as any;
    vi.mocked(require('date-fns').format).mockImplementation(format);
    vi.mocked(require('date-fns').startOfWeek).mockImplementation(startOfWeek);
    vi.mocked(require('date-fns').addDays).mockImplementation(addDays);
    vi.mocked(require('date-fns').set).mockImplementation(set);

    render(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to connect to database')).toBeTruthy();
    });
  });

  it('should fail to save availability with network error', async () => {
    // Mock successful date functions for this test
    const { format, startOfWeek, addDays, set } = await vi.importActual('date-fns') as any;
    vi.mocked(require('date-fns').format).mockImplementation(format);
    vi.mocked(require('date-fns').startOfWeek).mockImplementation(startOfWeek);
    vi.mocked(require('date-fns').addDays).mockImplementation(addDays);
    vi.mocked(require('date-fns').set).mockImplementation(set);

    // Mock icons to not throw
    vi.mocked(require('lucide-react').Save).mockImplementation(() => null);
    vi.mocked(require('lucide-react').ChevronLeft).mockImplementation(() => null);
    vi.mocked(require('lucide-react').ChevronRight).mockImplementation(() => null);
    vi.mocked(require('lucide-react').File).mockImplementation(() => null);
    vi.mocked(require('lucide-react').RefreshCw).mockImplementation(() => null);

    render(<Calendar />);
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // This should fail and show error
    await waitFor(() => {
      expect(screen.getByText('Failed to connect to database')).toBeTruthy();
    });
  });

  it('should fail navigation due to invalid date operations', () => {
    expect(() => {
      render(<Calendar />);
      const nextButton = screen.getByRole('button');
      fireEvent.click(nextButton);
    }).toThrow();
  });

  it('should fail to create new availability slot with invalid time', async () => {
    // This test expects the component to fail when trying to create events
    const { format, startOfWeek, addDays, set } = await vi.importActual('date-fns') as any;
    vi.mocked(require('date-fns').format).mockImplementation(format);
    vi.mocked(require('date-fns').startOfWeek).mockImplementation(startOfWeek);
    vi.mocked(require('date-fns').addDays).mockImplementation(addDays);
    // Keep set function mocked to return invalid date
    vi.mocked(require('date-fns').set).mockImplementation(() => new Date('invalid'));

    render(<Calendar />);
    
    // Try to double-click to create a slot - should fail due to invalid date
    const timeSlot = screen.getAllByRole('cell')[0]; // First time slot
    expect(() => {
      fireEvent.doubleClick(timeSlot);
    }).toThrow();
  });

  it('should fail template operations with server errors', async () => {
    const { format, startOfWeek, addDays, set } = await vi.importActual('date-fns') as any;
    vi.mocked(require('date-fns').format).mockImplementation(format);
    vi.mocked(require('date-fns').startOfWeek).mockImplementation(startOfWeek);
    vi.mocked(require('date-fns').addDays).mockImplementation(addDays);
    vi.mocked(require('date-fns').set).mockImplementation(set);

    // Mock icons to not throw
    vi.mocked(require('lucide-react').File).mockImplementation(() => null);
    vi.mocked(require('lucide-react').ChevronLeft).mockImplementation(() => null);
    vi.mocked(require('lucide-react').ChevronRight).mockImplementation(() => null);
    vi.mocked(require('lucide-react').Save).mockImplementation(() => null);
    vi.mocked(require('lucide-react').RefreshCw).mockImplementation(() => null);

    render(<Calendar />);
    
    const templatesButton = screen.getByText('Templates');
    
    // This should fail when trying to open template dialog
    expect(() => {
      fireEvent.click(templatesButton);
    }).toThrow('TemplateSelectDialog component crashed');
  });
});