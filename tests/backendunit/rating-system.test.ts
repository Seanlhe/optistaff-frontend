/**
 * Rating System - Pure Function Unit Tests
 * @description Tests for rating calculation logic and utilities
 * @testing-strategy Decision Table Testing and Boundary Value Testing (BVT)
 */

import { describe, test, expect } from "vitest";

// Pure rating calculation functions extracted for testing
export const ratingSystemHelpers = {
  /**
   * Calculate average rating from feedback scores
   * @param feedbackScores - Array of rating scores (1-5)
   * @returns Average rating
   */
  calculateAverageRating: (feedbackScores: number[]): number => {
    if (feedbackScores.length === 0) return 0;
    const sum = feedbackScores.reduce((acc, score) => acc + score, 0);
    return sum / feedbackScores.length;
  },

  /**
   * Calculate reliability penalty based on cancellations and no-shows
   * @param cancellations - Number of user cancellations
   * @param noShows - Number of no-shows
   * @param totalAssignments - Total number of assignments
   * @returns Penalty amount to subtract from rating
   */
  calculateReliabilityPenalty: (
    cancellations: number, 
    noShows: number, 
    totalAssignments: number
  ): number => {
    if (totalAssignments === 0) return 0;
    
    // Base penalties
    const cancellationPenalty = cancellations * 0.1;
    const noShowPenalty = noShows * 0.3;
    const basePenalty = cancellationPenalty + noShowPenalty;
    
    // Scale by experience level (new users get lighter penalties)
    const experienceScaling = Math.min(totalAssignments / 10.0, 1.0);
    
    return basePenalty * experienceScaling;
  },

  /**
   * Calculate final rating with bounds checking
   * @param baseRating - Base rating from feedback
   * @param penalty - Reliability penalty
   * @returns Final rating clamped between 0.0 and 5.0
   */
  calculateFinalRating: (baseRating: number, penalty: number): number => {
    const finalRating = baseRating - penalty;
    return Math.max(0.0, Math.min(5.0, finalRating));
  },

  /**
   * Validate rating score input
   * @param score - Rating score to validate
   * @returns Validation result
   */
  validateRatingScore: (score: number): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (score < 1) {
      errors.push("Rating score cannot be less than 1");
    }
    if (score > 5) {
      errors.push("Rating score cannot be greater than 5");
    }
    if (!Number.isInteger(score)) {
      errors.push("Rating score must be a whole number");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format rating for display
   * @param rating - Numeric rating
   * @param decimals - Number of decimal places
   * @returns Formatted rating string
   */
  formatRating: (rating: number, decimals: number = 1): string => {
    return rating.toFixed(decimals);
  },

  /**
   * Get rating category based on score
   * @param rating - Numeric rating
   * @returns Rating category string
   */
  getRatingCategory: (rating: number): string => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3.0) return "Average";
    if (rating >= 2.0) return "Below Average";
    return "Poor";
  }
};

describe("Rating System - Pure Functions Unit Tests", () => {
  describe("calculateAverageRating - Boundary Value Testing", () => {
    test("calculates average for single rating", () => {
      const { calculateAverageRating } = ratingSystemHelpers;
      
      expect(calculateAverageRating([5])).toBe(5);
      expect(calculateAverageRating([1])).toBe(1);
      expect(calculateAverageRating([3])).toBe(3);
    });

    test("calculates average for multiple ratings", () => {
      const { calculateAverageRating } = ratingSystemHelpers;
      
      expect(calculateAverageRating([4, 5, 3])).toBe(4);
      expect(calculateAverageRating([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateAverageRating([5, 5, 5, 5])).toBe(5);
    });

    test("handles empty array", () => {
      const { calculateAverageRating } = ratingSystemHelpers;
      
      expect(calculateAverageRating([])).toBe(0);
    });

    test("handles decimal results", () => {
      const { calculateAverageRating } = ratingSystemHelpers;
      
      expect(calculateAverageRating([4, 5])).toBe(4.5);
      expect(calculateAverageRating([1, 2, 3])).toBeCloseTo(2, 1);
    });
  });

  describe("calculateReliabilityPenalty - Decision Table Testing", () => {
    test("no penalty for perfect record", () => {
      const { calculateReliabilityPenalty } = ratingSystemHelpers;
      
      const penalty = calculateReliabilityPenalty(0, 0, 10);
      expect(penalty).toBe(0);
    });

    test("calculates penalty for cancellations only", () => {
      const { calculateReliabilityPenalty } = ratingSystemHelpers;
      
      // 2 cancellations out of 10 assignments (experienced user)
      const penalty = calculateReliabilityPenalty(2, 0, 10);
      expect(penalty).toBe(0.2); // 2 * 0.1 * 1.0 (full scaling)
    });

    test("calculates penalty for no-shows only", () => {
      const { calculateReliabilityPenalty } = ratingSystemHelpers;
      
      // 1 no-show out of 10 assignments
      const penalty = calculateReliabilityPenalty(0, 1, 10);
      expect(penalty).toBe(0.3); // 1 * 0.3 * 1.0
    });

    test("calculates combined penalty", () => {
      const { calculateReliabilityPenalty } = ratingSystemHelpers;
      
      // 1 cancellation + 1 no-show out of 10 assignments
      const penalty = calculateReliabilityPenalty(1, 1, 10);
      expect(penalty).toBe(0.4); // (1 * 0.1 + 1 * 0.3) * 1.0
    });

    test("applies experience scaling for new users", () => {
      const { calculateReliabilityPenalty } = ratingSystemHelpers;
      
      // 1 cancellation out of 5 assignments (new user gets 50% scaling)
      const penalty = calculateReliabilityPenalty(1, 0, 5);
      expect(penalty).toBe(0.05); // 1 * 0.1 * 0.5
    });

    test("handles zero assignments", () => {
      const { calculateReliabilityPenalty } = ratingSystemHelpers;
      
      const penalty = calculateReliabilityPenalty(1, 1, 0);
      expect(penalty).toBe(0);
    });
  });

  describe("calculateFinalRating - Boundary Value Testing", () => {
    test("calculates final rating without penalty", () => {
      const { calculateFinalRating } = ratingSystemHelpers;
      
      expect(calculateFinalRating(4.5, 0)).toBe(4.5);
      expect(calculateFinalRating(5.0, 0)).toBe(5.0);
    });

    test("calculates final rating with penalty", () => {
      const { calculateFinalRating } = ratingSystemHelpers;
      
      expect(calculateFinalRating(4.0, 0.2)).toBe(3.8);
      expect(calculateFinalRating(3.5, 0.5)).toBe(3.0);
    });

    test("enforces minimum rating boundary (0.0)", () => {
      const { calculateFinalRating } = ratingSystemHelpers;
      
      expect(calculateFinalRating(2.0, 3.0)).toBe(0.0);
      expect(calculateFinalRating(1.0, 2.0)).toBe(0.0);
    });

    test("enforces maximum rating boundary (5.0)", () => {
      const { calculateFinalRating } = ratingSystemHelpers;
      
      expect(calculateFinalRating(6.0, 0)).toBe(5.0);
      expect(calculateFinalRating(5.5, 0)).toBe(5.0);
    });
  });

  describe("validateRatingScore - Equivalence Class Testing", () => {
    test("validates valid rating scores", () => {
      const { validateRatingScore } = ratingSystemHelpers;
      
      for (let score = 1; score <= 5; score++) {
        const result = validateRatingScore(score);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    test("rejects scores below minimum", () => {
      const { validateRatingScore } = ratingSystemHelpers;
      
      const result = validateRatingScore(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Rating score cannot be less than 1");
    });

    test("rejects scores above maximum", () => {
      const { validateRatingScore } = ratingSystemHelpers;
      
      const result = validateRatingScore(6);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Rating score cannot be greater than 5");
    });

    test("rejects non-integer scores", () => {
      const { validateRatingScore } = ratingSystemHelpers;
      
      const result = validateRatingScore(3.5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Rating score must be a whole number");
    });
  });

  describe("formatRating - Pure String Transformation", () => {
    test("formats rating with default decimal places", () => {
      const { formatRating } = ratingSystemHelpers;
      
      expect(formatRating(4.567)).toBe("4.6");
      expect(formatRating(3.0)).toBe("3.0");
      expect(formatRating(5)).toBe("5.0");
    });

    test("formats rating with custom decimal places", () => {
      const { formatRating } = ratingSystemHelpers;
      
      expect(formatRating(4.567, 2)).toBe("4.57");
      expect(formatRating(4.567, 0)).toBe("5");
      expect(formatRating(3.14159, 3)).toBe("3.142");
    });
  });

  describe("getRatingCategory - Equivalence Class Testing", () => {
    test("categorizes excellent ratings", () => {
      const { getRatingCategory } = ratingSystemHelpers;
      
      expect(getRatingCategory(4.5)).toBe("Excellent");
      expect(getRatingCategory(5.0)).toBe("Excellent");
      expect(getRatingCategory(4.8)).toBe("Excellent");
    });

    test("categorizes very good ratings", () => {
      const { getRatingCategory } = ratingSystemHelpers;
      
      expect(getRatingCategory(4.0)).toBe("Very Good");
      expect(getRatingCategory(4.4)).toBe("Very Good");
    });

    test("categorizes good ratings", () => {
      const { getRatingCategory } = ratingSystemHelpers;
      
      expect(getRatingCategory(3.5)).toBe("Good");
      expect(getRatingCategory(3.9)).toBe("Good");
    });

    test("categorizes average ratings", () => {
      const { getRatingCategory } = ratingSystemHelpers;
      
      expect(getRatingCategory(3.0)).toBe("Average");
      expect(getRatingCategory(3.4)).toBe("Average");
    });

    test("categorizes below average ratings", () => {
      const { getRatingCategory } = ratingSystemHelpers;
      
      expect(getRatingCategory(2.0)).toBe("Below Average");
      expect(getRatingCategory(2.9)).toBe("Below Average");
    });

    test("categorizes poor ratings", () => {
      const { getRatingCategory } = ratingSystemHelpers;
      
      expect(getRatingCategory(0.0)).toBe("Poor");
      expect(getRatingCategory(1.9)).toBe("Poor");
      expect(getRatingCategory(1.0)).toBe("Poor");
    });
  });
});