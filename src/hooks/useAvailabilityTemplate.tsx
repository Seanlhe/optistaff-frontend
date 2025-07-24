import { useEffect, useState, useCallback } from "react";
import { supabase } from '../integrations/supabase/client';
import { useAuth } from "./useAuth";
import { AvailabilityTemplate } from '../types/hooks';

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
    [user, authLoading]
  );

    //   useEffect(() => {
    //     fetchTemplates();
    //   }, [fetchTemplates]);



const fetchAllTemplates = useCallback(async () => {
  if (authLoading || !user) return;

  setLoading(true);
  setError(null);

  const { data, error } = await supabase
    .from("availability_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all templates:", error.message);
    setError(error.message);
    setTemplates([]);
  } else {
    setTemplates(data as AvailabilityTemplate[]);
  }

  setLoading(false);
}, [user, authLoading]);


const fetchTemplate = useCallback(async (template_id: String) => {
  if (authLoading || !user) return;

  setLoading(true);
  setError(null);

  const { data, error } = await supabase
    .from("availability_templates")
    .select("*") 
    .eq("user_id", user.id)
    .eq("template_id", template_id)
    .single(); // expect only one

  if (error) {
    console.error("Error fetching template:", error.message);
    setError(error.message);
    return null
  } else {
    return data as AvailabilityTemplate;
  }

  setLoading(false);
}, [user, authLoading]);

  // Create a new availability template
 const createTemplate = useCallback(
  async (
    template: Omit<AvailabilityTemplate, "template_id" | "created_at" | "updated_at" | "user_id">
  ) => {
    setSaveLoading(true);
    setError(null);

    if (authLoading) {
      console.warn("Auth is still loading");
      setSaveLoading(false);
      return null;
    }

    if (!user) {
      console.error("User not authenticated");
      setSaveLoading(false);
      setError("User not authenticated");
      return null;
    }

    console.log("Attempting to create template with:", template);

    const { data, error: supaError } = await supabase
      .from("availability_templates")
      .insert([{ ...template, user_id: user.id }])
      .select()
      .single();

    console.log("Supabase response:", data, supaError);

    setSaveLoading(false);

    if (supaError) {
      console.error("Supabase insert error:", supaError);
      setError(supaError.message);
      return null;
    }

    

    await fetchAllTemplates();

    return data as AvailabilityTemplate;
  },
  [user, authLoading, fetchAllTemplates]
);
  
const deleteTemplate = useCallback(async (template_id: String) => {
  if (authLoading || !user) return;

  setLoading(true);
  setError(null);

  const { data, error } = await supabase
    .from("availability_templates")
    .delete() 
    .eq("template_id", template_id)

  if (error) {
    console.error("Error deleteing template:", error.message);
    setError(error.message);
    return null
  } else {
    return true;
  }

  setLoading(false);
}, [user, authLoading]);




  return {
    templates,
    loading,
    saveLoading,
    error,
    createTemplate,
    refetchTemplates: fetchTemplates,
    fetchTemplate,
    deleteTemplate,
    fetchAllTemplates
  };
}
