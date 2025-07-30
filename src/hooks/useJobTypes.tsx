/**
 * Job Types Hook
 * @description Simple hook for fetching job types grouped by category
 * @author OptiStaff Team
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { JobCategory, JobType, JobTypesByCategory } from "../types/hooks";

export const useJobTypes = () => {
  const [jobTypesByCategory, setJobTypesByCategory] =
    useState<JobTypesByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job types with categories and group them
  const fetchJobTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("job_types")
        .select(
          `
          *,
          job_categories (
            category_id,
            category_name,
            description
          )
        `,
        )
        .eq("is_active", true)
        .order("type_name");

      if (error) {
        setError(error.message);
        return;
      }

      const typedData = data as (JobType & { job_categories: JobCategory })[];
      const processedJobTypes = typedData.map((item) => ({
        ...item,
        category: item.job_categories,
      }));

      // Group job types by category
      const grouped = processedJobTypes.reduce((acc, jobType) => {
        const categoryName = jobType.category?.category_name || "Uncategorized";
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(jobType);
        return acc;
      }, {} as JobTypesByCategory);

      setJobTypesByCategory(grouped);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchJobTypes();
  }, [fetchJobTypes]);

  return {
    jobTypesByCategory,
    loading,
    error,
    fetchJobTypes,
  };
};
