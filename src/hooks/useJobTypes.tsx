/**
 * Job Types Hook
 * @description Custom hook for managing job categories and job types
 * @author OptiStaff Team
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { JobCategory, JobType, JobTypesByCategory } from '../types/hooks';

export const useJobTypes = () => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobTypesByCategory, setJobTypesByCategory] = useState<JobTypesByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all job categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('category_name');

      if (error) {
        setError(error.message);
        return;
      }

      setCategories(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // Fetch all job types with category information
  const fetchJobTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('job_types')
        .select(`
          *,
          job_categories (
            category_id,
            category_name,
            description
          )
        `)
        .eq('is_active', true)
        .order('type_name');

      if (error) {
        setError(error.message);
        return;
      }

      const typedData = data as (JobType & { job_categories: JobCategory })[];
      const processedJobTypes = typedData.map(item => ({
        ...item,
        category: item.job_categories
      }));

      setJobTypes(processedJobTypes);
      
      // Group job types by category
      const grouped = processedJobTypes.reduce((acc, jobType) => {
        const categoryName = jobType.category?.category_name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(jobType);
        return acc;
      }, {} as JobTypesByCategory);

      setJobTypesByCategory(grouped);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // Fetch all data
  const fetchAllJobData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchCategories(),
      fetchJobTypes()
    ]);
    
    setLoading(false);
  }, [fetchCategories, fetchJobTypes]);

  // Helper function to get job type by ID
  const getJobTypeById = useCallback((jobTypeId: string): JobType | undefined => {
    return jobTypes.find(jobType => jobType.job_type_id === jobTypeId);
  }, [jobTypes]);

  // Helper function to get job types by IDs
  const getJobTypesByIds = useCallback((jobTypeIds: string[]): JobType[] => {
    return jobTypes.filter(jobType => jobTypeIds.includes(jobType.job_type_id));
  }, [jobTypes]);

  // Helper function to convert job names to IDs
  const convertJobNamesToIds = useCallback((jobNames: string[]): string[] => {
    return jobTypes
      .filter(jobType => jobNames.includes(jobType.type_name))
      .map(jobType => jobType.job_type_id);
  }, [jobTypes]);

  // Helper function to convert job IDs to names
  const convertJobIdsToNames = useCallback((jobIds: string[]): string[] => {
    return jobTypes
      .filter(jobType => jobIds.includes(jobType.job_type_id))
      .map(jobType => jobType.type_name);
  }, [jobTypes]);

  // Load data on mount
  useEffect(() => {
    fetchAllJobData();
  }, [fetchAllJobData]);

  return {
    // Data
    categories,
    jobTypes,
    jobTypesByCategory,
    
    // State
    loading,
    error,
    
    // Actions
    fetchAllJobData,
    fetchCategories,
    fetchJobTypes,
    
    // Helpers
    getJobTypeById,
    getJobTypesByIds,
    convertJobNamesToIds,
    convertJobIdsToNames,
  };
};