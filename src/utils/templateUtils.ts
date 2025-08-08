// src/utils/templateUtils.ts

/**
 * Check if user is authenticated and auth is done loading
 */
export function isUserReady(
  user: any,
  authLoading: boolean
): user is { id: string } {
  return !authLoading && !!user && typeof user.id === "string";
}

/**
 * Format a template object for insertion into DB
 */
export function prepareTemplateForInsert(template: any, userId: string) {
  return {
    ...template,
    template_name: (template.template_name ?? "").trim(),
    user_id: userId,
  };
}

/**
 * Extract useful error message
 */
export function handleSupabaseError(error: any): string {
  if (!error) {
    console.error("Supabase error: Unknown error");
    return "An unknown error occurred";
  }
  console.error("Supabase error:", error.message || error);
  return error.message || "An unknown error occurred";
}
