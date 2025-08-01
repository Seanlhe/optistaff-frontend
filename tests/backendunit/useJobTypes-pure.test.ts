/**
 * useJobTypes Hook - Pure Function Unit Tests
 * @description Tests for pure data grouping and transformation functions
 * @testing-strategy Equivalence Class Testing (ECT) and Boundary Value Testing (BVT)
 */

import { describe, test, expect } from "vitest";
import {
  JobCategory,
  JobType,
  JobTypesByCategory,
} from "../../src/types/hooks";

// Pure helper functions extracted for testing
export const useJobTypesHelpers = {
  /**
   * Group job types by category
   * @param jobTypes - Array of job types with category information
   * @returns Grouped job types by category name
   */
  groupJobTypesByCategory: (
    jobTypes: (JobType & { job_categories: JobCategory })[]
  ): JobTypesByCategory => {
    return jobTypes.reduce((acc, jobType) => {
      const categoryName =
        jobType.job_categories?.category_name || "Uncategorized";
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push({
        ...jobType,
        category: jobType.job_categories,
      });
      return acc;
    }, {} as JobTypesByCategory);
  },

  /**
   * Filter active job types only
   * @param jobTypes - Array of job types
   * @returns Filtered array of active job types
   */
  filterActiveJobTypes: <T extends JobType>(jobTypes: T[]): T[] => {
    return jobTypes.filter((jobType) => jobType.is_active);
  },

  /**
   * Sort job types by name
   * @param jobTypes - Array of job types
   * @returns Sorted array of job types
   */
  sortJobTypesByName: (jobTypes: JobType[]): JobType[] => {
    return [...jobTypes].sort((a, b) => a.type_name.localeCompare(b.type_name));
  },
};

describe("useJobTypes - Pure Functions Unit Tests", () => {
  const mockJobTypes: (JobType & { job_categories: JobCategory })[] = [
    {
      job_type_id: "1",
      type_name: "Waiter/Waitress",
      category_id: "cat1",
      is_active: true,
      created_at: "2025-01-01",
      updated_at: "2025-01-01",
      job_categories: {
        category_id: "cat1",
        category_name: "Food Service",
        is_active: true,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
    },
    {
      job_type_id: "2",
      type_name: "Kitchen Helper",
      category_id: "cat1",
      is_active: true,
      created_at: "2025-01-01",
      updated_at: "2025-01-01",
      job_categories: {
        category_id: "cat1",
        category_name: "Food Service",
        is_active: true,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
    },
  ];

  describe("groupJobTypesByCategory - Equivalence Class Testing", () => {
    test("groups job types by single category", () => {
      const { groupJobTypesByCategory } = useJobTypesHelpers;

      const result = groupJobTypesByCategory(mockJobTypes);

      expect(Object.keys(result)).toEqual(["Food Service"]);
      expect(result["Food Service"]).toHaveLength(2);
      expect(result["Food Service"][0].type_name).toBe("Waiter/Waitress");
      expect(result["Food Service"][1].type_name).toBe("Kitchen Helper");
    });

    test("handles empty job types array", () => {
      const { groupJobTypesByCategory } = useJobTypesHelpers;

      const result = groupJobTypesByCategory([]);

      expect(Object.keys(result)).toHaveLength(0);
    });

    test("groups job types by multiple categories", () => {
      const { groupJobTypesByCategory } = useJobTypesHelpers;

      const multiCategoryJobTypes = [
        ...mockJobTypes,
        {
          job_type_id: "3",
          type_name: "Cashier",
          category_id: "cat2",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
          job_categories: {
            category_id: "cat2",
            category_name: "Retail",
            is_active: true,
            created_at: "2025-01-01",
            updated_at: "2025-01-01",
          },
        },
      ];

      const result = groupJobTypesByCategory(multiCategoryJobTypes);

      expect(Object.keys(result).sort()).toEqual(["Food Service", "Retail"]);
      expect(result["Food Service"]).toHaveLength(2);
      expect(result["Retail"]).toHaveLength(1);
      expect(result["Retail"][0].type_name).toBe("Cashier");
    });

    test("handles job types without categories", () => {
      const { groupJobTypesByCategory } = useJobTypesHelpers;

      const jobTypesWithoutCategory = [
        {
          job_type_id: "4",
          type_name: "General Worker",
          category_id: "cat3",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
          job_categories: null as any,
        },
      ];

      const result = groupJobTypesByCategory(jobTypesWithoutCategory);

      expect(result["Uncategorized"]).toHaveLength(1);
      expect(result["Uncategorized"][0].type_name).toBe("General Worker");
    });

    test("preserves job type properties in grouped result", () => {
      const { groupJobTypesByCategory } = useJobTypesHelpers;

      const result = groupJobTypesByCategory(mockJobTypes);
      const firstJobType = result["Food Service"][0];

      expect(firstJobType.job_type_id).toBe("1");
      expect(firstJobType.type_name).toBe("Waiter/Waitress");
      expect(firstJobType.category_id).toBe("cat1");
      expect(firstJobType.is_active).toBe(true);
      expect(firstJobType.category).toEqual(mockJobTypes[0].job_categories);
    });
  });

  describe("filterActiveJobTypes - Equivalence Class Testing", () => {
    const mixedJobTypes: JobType[] = [
      {
        job_type_id: "1",
        type_name: "Active Job",
        category_id: "cat1",
        is_active: true,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
      {
        job_type_id: "2",
        type_name: "Inactive Job",
        category_id: "cat1",
        is_active: false,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
      {
        job_type_id: "3",
        type_name: "Another Active Job",
        category_id: "cat2",
        is_active: true,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
    ];

    test("filters only active job types", () => {
      const { filterActiveJobTypes } = useJobTypesHelpers;

      const result = filterActiveJobTypes(mixedJobTypes);

      expect(result).toHaveLength(2);
      expect(result[0].type_name).toBe("Active Job");
      expect(result[1].type_name).toBe("Another Active Job");
      expect(result.every((job) => job.is_active)).toBe(true);
    });

    test("returns empty array when no active job types", () => {
      const { filterActiveJobTypes } = useJobTypesHelpers;

      const inactiveJobTypes: JobType[] = [
        {
          job_type_id: "1",
          type_name: "Inactive Job 1",
          category_id: "cat1",
          is_active: false,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
        },
        {
          job_type_id: "2",
          type_name: "Inactive Job 2",
          category_id: "cat1",
          is_active: false,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
        },
      ];

      const result = filterActiveJobTypes(inactiveJobTypes);
      expect(result).toHaveLength(0);
    });

    test("returns all job types when all are active", () => {
      const { filterActiveJobTypes } = useJobTypesHelpers;

      const allActiveJobTypes: JobType[] = mixedJobTypes.filter(
        (job) => job.is_active
      );
      const result = filterActiveJobTypes(allActiveJobTypes);

      expect(result).toHaveLength(2);
      expect(result).toEqual(allActiveJobTypes);
    });

    test("handles empty array", () => {
      const { filterActiveJobTypes } = useJobTypesHelpers;

      const result = filterActiveJobTypes([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("sortJobTypesByName - Pure Sorting", () => {
    const unsortedJobTypes: JobType[] = [
      {
        job_type_id: "1",
        type_name: "Zebra Job",
        category_id: "cat1",
        is_active: true,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
      {
        job_type_id: "2",
        type_name: "Alpha Job",
        category_id: "cat1",
        is_active: true,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
      {
        job_type_id: "3",
        type_name: "Beta Job",
        category_id: "cat2",
        is_active: true,
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
    ];

    test("sorts job types alphabetically by name", () => {
      const { sortJobTypesByName } = useJobTypesHelpers;

      const result = sortJobTypesByName(unsortedJobTypes);

      expect(result).toHaveLength(3);
      expect(result[0].type_name).toBe("Alpha Job");
      expect(result[1].type_name).toBe("Beta Job");
      expect(result[2].type_name).toBe("Zebra Job");
    });

    test("does not mutate original array", () => {
      const { sortJobTypesByName } = useJobTypesHelpers;

      const originalOrder = unsortedJobTypes.map((job) => job.type_name);
      const result = sortJobTypesByName(unsortedJobTypes);

      // Original array should remain unchanged
      expect(unsortedJobTypes.map((job) => job.type_name)).toEqual(
        originalOrder
      );

      // Result should be sorted
      expect(result[0].type_name).toBe("Alpha Job");
    });

    test("handles single job type", () => {
      const { sortJobTypesByName } = useJobTypesHelpers;

      const singleJobType = [unsortedJobTypes[0]];
      const result = sortJobTypesByName(singleJobType);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(singleJobType[0]);
    });

    test("handles empty array", () => {
      const { sortJobTypesByName } = useJobTypesHelpers;

      const result = sortJobTypesByName([]);
      expect(result).toHaveLength(0);
    });

    test("handles case-insensitive sorting", () => {
      const { sortJobTypesByName } = useJobTypesHelpers;

      const mixedCaseJobTypes: JobType[] = [
        {
          job_type_id: "1",
          type_name: "zebra Job",
          category_id: "cat1",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
        },
        {
          job_type_id: "2",
          type_name: "Alpha Job",
          category_id: "cat1",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
        },
      ];

      const result = sortJobTypesByName(mixedCaseJobTypes);

      expect(result[0].type_name).toBe("Alpha Job");
      expect(result[1].type_name).toBe("zebra Job");
    });

    test("handles special characters and numbers in names", () => {
      const { sortJobTypesByName } = useJobTypesHelpers;

      const specialJobTypes: JobType[] = [
        {
          job_type_id: "1",
          type_name: "Job-2",
          category_id: "cat1",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
        },
        {
          job_type_id: "2",
          type_name: "Job-1",
          category_id: "cat1",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
        },
        {
          job_type_id: "3",
          type_name: "Job/Helper",
          category_id: "cat2",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
        },
      ];

      const result = sortJobTypesByName(specialJobTypes);

      expect(result[0].type_name).toBe("Job-1");
      expect(result[1].type_name).toBe("Job-2");
      expect(result[2].type_name).toBe("Job/Helper");
    });
  });

  describe("Integration - Combined Operations", () => {
    test("filters active job types and groups by category", () => {
      const { filterActiveJobTypes, groupJobTypesByCategory } =
        useJobTypesHelpers;

      const mixedJobTypesWithCategories: (JobType & {
        job_categories: JobCategory;
      })[] = [
        {
          job_type_id: "1",
          type_name: "Active Waiter",
          category_id: "cat1",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
          job_categories: {
            category_id: "cat1",
            category_name: "Food Service",
            is_active: true,
            created_at: "2025-01-01",
            updated_at: "2025-01-01",
          },
        },
        {
          job_type_id: "2",
          type_name: "Inactive Cashier",
          category_id: "cat2",
          is_active: false,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
          job_categories: {
            category_id: "cat2",
            category_name: "Retail",
            is_active: true,
            created_at: "2025-01-01",
            updated_at: "2025-01-01",
          },
        },
      ];

      const activeJobTypes = filterActiveJobTypes(mixedJobTypesWithCategories);
      const groupedJobTypes = groupJobTypesByCategory(activeJobTypes);

      expect(Object.keys(groupedJobTypes)).toEqual(["Food Service"]);
      expect(groupedJobTypes["Food Service"]).toHaveLength(1);
      expect(groupedJobTypes["Food Service"][0].type_name).toBe(
        "Active Waiter"
      );
    });

    test("sorts job types within categories", () => {
      const { groupJobTypesByCategory, sortJobTypesByName } =
        useJobTypesHelpers;

      const unsortedJobTypesWithCategories: (JobType & {
        job_categories: JobCategory;
      })[] = [
        {
          job_type_id: "1",
          type_name: "Zebra Server",
          category_id: "cat1",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
          job_categories: {
            category_id: "cat1",
            category_name: "Food Service",
            is_active: true,
            created_at: "2025-01-01",
            updated_at: "2025-01-01",
          },
        },
        {
          job_type_id: "2",
          type_name: "Alpha Server",
          category_id: "cat1",
          is_active: true,
          created_at: "2025-01-01",
          updated_at: "2025-01-01",
          job_categories: {
            category_id: "cat1",
            category_name: "Food Service",
            is_active: true,
            created_at: "2025-01-01",
            updated_at: "2025-01-01",
          },
        },
      ];

      const groupedJobTypes = groupJobTypesByCategory(
        unsortedJobTypesWithCategories
      );
      const sortedFoodServiceJobs = sortJobTypesByName(
        groupedJobTypes["Food Service"]
      );

      expect(sortedFoodServiceJobs[0].type_name).toBe("Alpha Server");
      expect(sortedFoodServiceJobs[1].type_name).toBe("Zebra Server");
    });
  });
});
