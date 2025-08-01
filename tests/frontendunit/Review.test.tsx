import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Review from '../../src/pages/employer/Review';

// Mock useFeedback hook
vi.mock('../../src/hooks/useFeedback', () => ({
  useFeedback: vi.fn(() => ({
    feedback: [],
    loading: false,
    error: null,
    submitFeedback: vi.fn(),
    updateFeedback: vi.fn(),
    deleteFeedback: vi.fn()
  }))
}));

describe('Review Component', () => {
  it('renders form correctly', () => {
    render(<Review />);
    
    expect(screen.getByText('Feedback Review Test')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Reviewee ID')).toBeInTheDocument();
    expect(screen.getByText('Submit Feedback')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const { useFeedback } = require('../../src/hooks/useFeedback');
    useFeedback.mockReturnValue({
      feedback: [],
      loading: true,
      error: null,
      submitFeedback: vi.fn(),
      updateFeedback: vi.fn(),
      deleteFeedback: vi.fn()
    });
    
    render(<Review />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    const { useFeedback } = require('../../src/hooks/useFeedback');
    useFeedback.mockReturnValue({
      feedback: [],
      loading: false,
      error: 'Test error',
      submitFeedback: vi.fn(),
      updateFeedback: vi.fn(),
      deleteFeedback: vi.fn()
    });
    
    render(<Review />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('submits feedback', async () => {
    const mockSubmit = vi.fn();
    const { useFeedback } = require('../../src/hooks/useFeedback');
    useFeedback.mockReturnValue({
      feedback: [],
      loading: false,
      error: null,
      submitFeedback: mockSubmit,
      updateFeedback: vi.fn(),
      deleteFeedback: vi.fn()
    });

    render(<Review />);

    await userEvent.type(screen.getByPlaceholderText('Reviewee ID'), 'user123');
    await userEvent.type(screen.getByPlaceholderText('Feedback content'), 'Good work');
    await userEvent.type(screen.getByPlaceholderText('Assignment ID'), 'assign123');
    await userEvent.click(screen.getByText('Submit Feedback'));

    expect(mockSubmit).toHaveBeenCalled();
  });

  it('displays feedback list', () => {
    const { useFeedback } = require('../../src/hooks/useFeedback');
    useFeedback.mockReturnValue({
      feedback: [{
        feedback_id: '1',
        reviewee_id: 'user123',
        comment: 'Test comment',
        rating_score: 5
      }],
      loading: false,
      error: null,
      submitFeedback: vi.fn(),
      updateFeedback: vi.fn(),
      deleteFeedback: vi.fn()
    });

    render(<Review />);
    expect(screen.getByText('user123')).toBeInTheDocument();
    expect(screen.getByText('Test comment')).toBeInTheDocument();
  });
});