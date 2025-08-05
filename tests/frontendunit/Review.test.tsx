
//Test UC7 - Review Employees

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Review from '../../src/pages/employer/Review';

// Mock useFeedback hook with consistent pattern
const mockUseFeedback = {
  feedback: [],
  loading: false,
  error: null as string | null,
  submitFeedback: vi.fn(),
  updateFeedback: vi.fn(),
  deleteFeedback: vi.fn(),
  fetchFeedbackAssignID: vi.fn(),
  fetchFeedbackReviewAssignID: vi.fn(),
};

vi.mock('../../src/hooks/useFeedback', () => ({
  useFeedback: () => mockUseFeedback,
}));

describe('Review Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockUseFeedback.loading = false;
    mockUseFeedback.error = null;
    mockUseFeedback.feedback = [];
  });

  // UC7 TRIGGERS: Shows "Rate Employee" interface
  it('renders form correctly', () => {
    render(<Review />);
    
    // UC7 Triggers: "Rate Employee" interface rendering correctly
    expect(screen.getByText('Feedback Review Test')).toBeDefined();
    expect(screen.getByPlaceholderText('Reviewee ID')).toBeDefined();
    expect(screen.getByText('Submit Feedback')).toBeDefined();
  });

  // UC7 FLOW STEP 4: System processing during rating update
  it('shows loading state', () => {
    mockUseFeedback.loading = true;
    
    render(<Review />);
    // UC7 Step 4: "Rating updated" - system processing state
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  // UC7 ERROR HANDLING: System error states during review process
  it('shows error message', () => {
    mockUseFeedback.error = 'Test error';
    
    render(<Review />);
    // UC7: Error handling during review submission process
    expect(screen.getByText('Test error')).toBeDefined();
  });

  // UC7 FLOW STEP 3: Click submit functionality
  it('submits feedback', async () => {
    const mockSubmit = vi.fn();
    mockUseFeedback.submitFeedback = mockSubmit;

    render(<Review />);

    // UC7 Step 2: Select rating and UC7 Step 3: Click submit
    await userEvent.type(screen.getByPlaceholderText('Reviewee ID'), 'user123');
    await userEvent.type(screen.getByPlaceholderText('Feedback content'), 'Good work');
    await userEvent.type(screen.getByPlaceholderText('Assignment ID'), 'assign123');
    await userEvent.click(screen.getByText('Submit Feedback'));

    // UC7 Step 3: Submit functionality validation
    expect(mockSubmit).toHaveBeenCalled();
  });

  // UC7 POSTCONDITION: Review and rating saved - display functionality
  it('displays feedback list', () => {
    mockUseFeedback.feedback = [{
      feedback_id: '1',
      reviewee_id: 'user123',
      comment: 'Test comment',
      rating_score: 5
    }];

    render(<Review />);
    // UC7 Postcondition: "Review and rating saved" - displays saved reviews
    expect(screen.getByText('user123')).toBeDefined();
    expect(screen.getByText('Test comment')).toBeDefined();
  });
});