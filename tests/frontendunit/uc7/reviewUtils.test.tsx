import { describe, it, expect } from 'vitest';
import { validateReview } from '../../../src/utils/review';

describe('Review Utils', () => {
  it('validates valid review, UC7 Steps 15-16', () => {
    const validFeedback = {
      rating_score: 5,
      comment: 'Great work!'
    };

    const result = validateReview(validFeedback);

    expect(result.rating_score).toBeNull();
    expect(result.comment).toBeNull();
  });

  it('rejects zero rating, UC7 Steps 15-16', () => {
    const invalidFeedback = {
      rating_score: 0,
      comment: 'Good work'
    };

    const result = validateReview(invalidFeedback);

    expect(result.rating_score).toBe('Please provide a valid rating.');
    expect(result.comment).toBeNull();
  });

  it('rejects empty comment, UC7 Steps 15-16', () => {
    const invalidFeedback = {
      rating_score: 4,
      comment: ''
    };

    const result = validateReview(invalidFeedback);

    expect(result.rating_score).toBeNull();
    expect(result.comment).toBe('Please provide a valid comment.');
  });

  it('rejects whitespace-only comment, UC7 Steps 15-16', () => {
    const invalidFeedback = {
      rating_score: 3,
      comment: '   '
    };

    const result = validateReview(invalidFeedback);

    expect(result.comment).toBe('Please provide a valid comment.');
  });

  it('rejects missing comment, UC7 Steps 15-16', () => {
    const invalidFeedback = {
      rating_score: 4
      // no comment field
    };

    const result = validateReview(invalidFeedback);

    expect(result.comment).toBe('Please provide a valid comment.');
  });

  it('handles multiple validation errors, UC7 Steps 15-16', () => {
    const invalidFeedback = {
      rating_score: 0,
      comment: ''
    };

    const result = validateReview(invalidFeedback);

    expect(result.rating_score).toBe('Please provide a valid rating.');
    expect(result.comment).toBe('Please provide a valid comment.');
  });
});