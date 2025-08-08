import { useEffect, useState, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./useAuth";
import { AvailabilityTemplate } from "../types/hooks";
import {
  isUserReady,
  prepareTemplateForInsert,
  handleSupabaseError,
} from "../utils/templateUtils";


export function useAvailabilityTemplate() {
  const [templates, setTemplates] = useState<AvailabilityTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  // State to indicate loading state of different operations
  const [fetchLoading, setFetchLoading] = useState(false);
  // Fetch all templates for the user
  const fetchTemplates = useCallback(
    async (templateId: string) => {
      setFetchLoading(true);
      setError(null);

      // Wait for auth to complete first
      if (authLoading) {
        setFetchLoading(false);
        return null;
      }

      if (!user) {
        setFetchLoading(false);
        setError("User not authenticated");
        return null;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("availability_templates")
        .select("*")
        .eq("user_id", user.id)
        .eq("template_id", templateId)
        .single(); // Because we expect only one row

      if (error) {
        console.error("Error fetching template:", error.message);
        setError(error.message);
        setTemplates([]);
      } else {
        setTemplates([data as AvailabilityTemplate]);
        setError(null);
      }

      setLoading(false);
      setFetchLoading(false);
      return data;
    },
    [user, authLoading],
  );

  //   useEffect(() => {
  //     fetchTemplates();
  //   }, [fetchTemplates]);

  
  const fetchAllTemplates = useCallback(async () => {
    if (!isUserReady(user, authLoading)) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("availability_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(handleSupabaseError(error));
      setTemplates([]);
    } else {
      setTemplates(data as AvailabilityTemplate[]);
    }

    setLoading(false);
  }, [user, authLoading]);

  const fetchTemplate = useCallback(
    async (template_id: string) => {
      if (!isUserReady(user, authLoading)) return null;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("availability_templates")
        .select("*")
        .eq("user_id", user.id)
        .eq("template_id", template_id)
        .single();

      setLoading(false);

      if (error) {
        setError(handleSupabaseError(error));
        return null;
      }

      return data as AvailabilityTemplate;
    },
    [user, authLoading]
  );


  // Create a new availability template
  // Create a new availability template
  const createTemplate = useCallback(
    async (
      template: Omit<
        AvailabilityTemplate,
        "template_id" | "created_at" | "updated_at" | "user_id"
      >
    ) => {
      setSaveLoading(true);
      setError(null);

      if (!isUserReady(user, authLoading)) {
        setSaveLoading(false);
        setError("User not authenticated or still loading");
        return null;
      }

      const insertPayload = prepareTemplateForInsert(template, user.id);
      const { data, error: supaError } = await supabase
        .from("availability_templates")
        .insert([insertPayload])
        .select()
        .single();

      setSaveLoading(false);

      if (supaError) {
        setError(handleSupabaseError(supaError));
        return null;
      }

      await fetchAllTemplates();

      return data as AvailabilityTemplate;
    },
    [user, authLoading, fetchAllTemplates]
  );






  const deleteTemplate = useCallback(
    async (template_id: String) => {
      if (authLoading || !user) return false;

      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from("availability_templates")
        .delete()
        .eq("template_id", template_id);

      setLoading(false); // Move BEFORE return statements

      if (error) {
        console.error("Error deleting template:", error.message);
        setError(error.message);
        return false;
      }
      
      return true;
    },
    [user, authLoading],
  );

  return {
    templates,
    loading,
    saveLoading,
    error,
    createTemplate,
    refetchTemplates: fetchTemplates,
    fetchTemplate,
    deleteTemplate,
    fetchAllTemplates,
  };
}

