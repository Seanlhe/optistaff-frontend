/**
 * Feedback Hook
 * @description Custom hook for feedback and review management
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Feedback } from '../types/hooks';
import { supabase } from '../integrations/supabase/client';
import { set } from 'date-fns';

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // TODO: Implement feedback management functions
  const fetchFeedback = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try{
      // Fetch feedback from the database
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('reviewee_id', user.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setFeedback(data as Feedback[]);
    } catch(err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const submitFeedback = async (feedbackData: Partial<Feedback>) => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    // Ensure the feedbackData includes the reviewer_id (current user)
    const feedbackToInsert = {
      ...feedbackData,
      reviewer_id: user.id,
    };

    const { error } = await supabase
      .from('feedback')
      .insert([feedbackToInsert]);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await fetchFeedback();
    setLoading(false);
  };

  const updateFeedback = async (feedbackId: string, feedbackData: Partial<Feedback>) => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    } m

    const { error } = await supabase
      .from('feedback')   
      .update(feedbackData)
      .eq('feedback_id', feedbackId);

      
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await fetchFeedback();
    setLoading(false);

  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('feedback_id', feedbackId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await fetchFeedback();
    setLoading(false);
  };

  return {
    feedback,
    loading,
    error,
    fetchFeedback,
    submitFeedback,
    updateFeedback,
    deleteFeedback,
  };
};
