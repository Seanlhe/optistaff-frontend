/**
 * User Profile Hook - Optimized Version
 * @description Custom hook for user profile management with database function optimization
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../integrations/supabase/client";
import {
  UserProfileData,
  ProfileDisplayData,
  PersonalInfoFormData,
  AccountSettingsFormData,
} from "../types/hooks";
import { useLocationGeocoding } from "./useLocationGeocoding";

// Feature flag for database function usage
const USE_DATABASE_FUNCTIONS = true;

export const useUserProfile = () => {
  // Main profile data
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  // Loading states (separate for different operations)
  const [loading, setLoading] = useState(false);
  const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
  const [accountSettingsLoading, setAccountSettingsLoading] = useState(false);

  // Error states (separate for different operations)
  const [error, setError] = useState<string | null>(null);
  const [personalInfoError, setPersonalInfoError] = useState<string | null>(
    null
  );
  const [accountSettingsError, setAccountSettingsError] = useState<
    string | null
  >(null);

  // Dependencies
  const { user } = useAuth();
  const { geocodeAddress } = useLocationGeocoding();

  const fetchProfileWithDatabaseFunction =
    useCallback(async (): Promise<UserProfileData | null> => {
      if (!user) throw new Error("User not authenticated");

      console.log(
        "Fetching profile using database function for user:",
        user.id
      );

      const { data, error } = await supabase.rpc("get_user_profile_data", {
        p_user_id: user.id,
      });

      if (error) throw new Error(`Database function error: ${error.message}`);
      if (!data || data.length === 0) throw new Error("Profile not found");

      const profile = data[0];

      // Validate required fields
      if (
        profile.user_role === "jobseeker" &&
        (!profile.first_name || !profile.last_name)
      ) {
        throw new Error(
          "Profile is incomplete. Please ensure your first name and last name are set."
        );
      }
      if (profile.user_role === "employer" && !profile.company_name) {
        throw new Error(
          "Company profile is incomplete. Please ensure your company name is set."
        );
      }

      // Build structured data
      const isJobSeeker = profile.user_role === "jobseeker";
      const fullName =
        profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`.trim()
          : "Name not set";

      const result: UserProfileData = {
        display: {
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          fullName,
          rating: isJobSeeker
            ? typeof profile.rating === "number"
              ? profile.rating
              : 0
            : undefined,
          accountStatus:
            (profile.status as "ACTIVE" | "SUSPENDED" | "INACTIVE") || "ACTIVE",
          email: profile.email || "",
          accountCreated: profile.created_at || "",
          ...(profile.user_role === "employer" && {
            companyName: profile.company_name || "",
          }),
        },
        personalInfo: {
          phoneNumber: profile.phone_number || "",
          homeAddress: profile.address || "",
          postalCode: profile.postal_code || "",
        },
        userRole: profile.user_role as "jobseeker" | "employer",
      };

      // Validate postal code format
      if (
        result.personalInfo.postalCode &&
        !/^\d{6}$/.test(result.personalInfo.postalCode)
      ) {
        console.warn(
          "Invalid postal code format in database:",
          result.personalInfo.postalCode
        );
      }

      console.log("Profile loaded successfully using database function");
      return result;
    }, [user]);

  // Fallback function: Direct queries for reliability
  const fetchProfileWithDirectQueries =
    useCallback(async (): Promise<UserProfileData | null> => {
      if (!user) throw new Error("User not authenticated");

      console.log(
        "Fetching profile using direct queries (fallback) for user:",
        user.id
      );

      // Get auth user data
      const { data: authUser, error: authError } =
        await supabase.auth.getUser();
      if (authError)
        throw new Error(`Authentication error: ${authError.message}`);
      if (!authUser?.user)
        throw new Error("Authentication session expired. Please log in again.");

      // Fetch profile data based on role
      const isJobSeeker = user.role === "jobseeker";
      const tableName = isJobSeeker ? "job_seekers" : "clients";
      const idField = isJobSeeker ? "user_id" : "client_id";
      const phoneField = isJobSeeker ? "phone_number" : "phone";

      const selectFields = isJobSeeker
        ? "first_name, last_name, phone_number, address, postal_code, rating, status"
        : "company_name, first_name, last_name, phone, address, postal_code";

      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq(idField, user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const roleText = isJobSeeker ? "Job seeker" : "Company";
          throw new Error(
            `${roleText} profile not found. Please contact support to set up your profile.`
          );
        }
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error("No profile data returned from database");
      }

      // Type-safe field access with proper validation
      const profileData = data as any; // Type assertion to handle dynamic table queries

      // Validate required fields
      if (isJobSeeker && (!profileData.first_name || !profileData.last_name)) {
        throw new Error(
          "Profile is incomplete. Please ensure your first name and last name are set."
        );
      }
      if (!isJobSeeker && !profileData.company_name) {
        throw new Error(
          "Company profile is incomplete. Please ensure your company name is set."
        );
      }

      // Build structured result
      const fullName =
        profileData.first_name && profileData.last_name
          ? `${profileData.first_name} ${profileData.last_name}`.trim()
          : "Name not set";

      const result: UserProfileData = {
        display: {
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          fullName,
          rating: isJobSeeker
            ? typeof profileData.rating === "number"
              ? profileData.rating
              : 0
            : undefined,
          accountStatus: isJobSeeker
            ? (profileData.status as "ACTIVE" | "SUSPENDED" | "INACTIVE") ||
              "ACTIVE"
            : "ACTIVE",
          email: authUser.user.email || "",
          accountCreated: authUser.user.created_at || "",
          ...(!isJobSeeker && { companyName: profileData.company_name }),
        },
        personalInfo: {
          phoneNumber: profileData[phoneField] || "",
          homeAddress: profileData.address || "",
          postalCode: profileData.postal_code || "",
        },
        userRole: user.role,
      };

      // Validate postal code format
      if (
        result.personalInfo.postalCode &&
        !/^\d{6}$/.test(result.personalInfo.postalCode)
      ) {
        console.warn(
          "Invalid postal code format in database:",
          result.personalInfo.postalCode
        );
      }

      console.log("Profile loaded successfully using direct queries");
      return result;
    }, [user]);

  // Main fetch function with reliability pattern
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: UserProfileData | null = null;

      // Try database function first, then fallback
      if (USE_DATABASE_FUNCTIONS) {
        try {
          result = await fetchProfileWithDatabaseFunction();
        } catch (error) {
          console.warn("Database function failed, using fallback:", error);
        }
      }

      if (!result) {
        result = await fetchProfileWithDirectQueries();
      }

      if (result) {
        setProfileData(result);
        console.log("Profile loaded successfully for user:", user.id);
      } else {
        throw new Error("Failed to load profile data");
      }
    } catch (err) {
      console.error("fetchProfile error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error occurred while loading profile"
      );
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfileWithDatabaseFunction, fetchProfileWithDirectQueries]);

  // Update personal info using database function
  const updatePersonalInfoWithDatabaseFunction = useCallback(
    async (
      formData: PersonalInfoFormData,
      coordinates?: string | null
    ): Promise<boolean> => {
      if (!user) throw new Error("User not authenticated");

      console.log("Updating personal info using database function");

      const { data, error } = await supabase.rpc("update_user_profile", {
        p_user_id: user.id,
        p_phone_number: formData.phoneNumber || null,
        p_address: formData.homeAddress || null,
        p_postal_code: formData.postalCode || null,
        p_address_coordinates: coordinates || null,
      });

      if (error) throw new Error(`Database function error: ${error.message}`);
      if (!data) throw new Error("Update failed - no rows affected");

      console.log("Personal info updated successfully using database function");
      return true;
    },
    [user]
  );

  // Fallback: Direct table update
  const updatePersonalInfoWithDirectQueries = useCallback(
    async (
      formData: PersonalInfoFormData,
      coordinates?: string | null
    ): Promise<boolean> => {
      if (!user) throw new Error("User not authenticated");

      console.log("Updating personal info using direct queries (fallback)");

      const isJobSeeker = user.role === "jobseeker";
      const tableName = isJobSeeker ? "job_seekers" : "clients";
      const idField = isJobSeeker ? "user_id" : "client_id";
      const phoneField = isJobSeeker ? "phone_number" : "phone";

      const updateData: any = {
        [phoneField]: formData.phoneNumber || null,
        address: formData.homeAddress || null,
        postal_code: formData.postalCode || null,
        updated_at: new Date().toISOString(),
      };

      // Add coordinates for job seekers only
      if (isJobSeeker && coordinates) {
        updateData.address_coordinates = coordinates;
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(idField, user.id)
        .select()
        .single();

      if (error) throw error;

      console.log("Personal info updated successfully using direct queries");
      return true;
    },
    [user]
  );

  // Revert optimistic update helper
  const revertOptimisticPersonalInfoUpdate = useCallback(
    (originalData: PersonalInfoFormData) => {
      console.log("Reverting optimistic personal info update");
      setProfileData((prev) => ({
        ...prev!,
        personalInfo: originalData,
      }));
    },
    []
  );

  // Main update function with optimistic updates and geocoding
  const updatePersonalInfo = async (
    formData: PersonalInfoFormData
  ): Promise<boolean> => {
    if (!user || !profileData) {
      setPersonalInfoError("User not authenticated or profile not loaded");
      return false;
    }

    setPersonalInfoLoading(true);
    setPersonalInfoError(null);

    const originalPersonalInfo = { ...profileData.personalInfo };

    try {
      // Validate input
      if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
        throw new Error("Postal code must be 6 digits");
      }

      // Optimistic update
      setProfileData((prev) => ({ ...prev!, personalInfo: formData }));

      // Geocode if needed (job seekers only)
      let newCoordinates: string | null = null;
      if (user.role === "jobseeker") {
        const addressChanged =
          formData.homeAddress !== originalPersonalInfo.homeAddress;
        const postalCodeChanged =
          formData.postalCode !== originalPersonalInfo.postalCode;

        if (addressChanged || postalCodeChanged) {
          const addressToGeocode = formData.postalCode || formData.homeAddress;
          if (addressToGeocode?.trim()) {
            try {
              console.log("Geocoding address:", addressToGeocode);
              const coordinates = await geocodeAddress(addressToGeocode);
              if (coordinates) {
                newCoordinates = `${coordinates[0]},${coordinates[1]}`;
                console.log(
                  "Successfully geocoded to coordinates:",
                  newCoordinates
                );
              }
            } catch (geocodeError) {
              console.warn("Geocoding failed:", geocodeError);
            }
          }
        }
      }

      // Try database function first, then fallback
      let updateSuccess = false;
      if (USE_DATABASE_FUNCTIONS) {
        try {
          updateSuccess = await updatePersonalInfoWithDatabaseFunction(
            formData,
            newCoordinates
          );
        } catch (error) {
          console.warn("Database function failed, using fallback:", error);
        }
      }

      if (!updateSuccess) {
        updateSuccess = await updatePersonalInfoWithDirectQueries(
          formData,
          newCoordinates
        );
      }

      if (!updateSuccess) throw new Error("All update methods failed");

      console.log(
        newCoordinates
          ? "Personal info and coordinates updated successfully"
          : "Personal info updated successfully"
      );
      return true;
    } catch (err) {
      console.error("updatePersonalInfo error:", err);
      revertOptimisticPersonalInfoUpdate(originalPersonalInfo);
      setPersonalInfoError(
        err instanceof Error
          ? err.message
          : "Failed to update personal information"
      );
      return false;
    } finally {
      setPersonalInfoLoading(false);
    }
  };

  // Revert optimistic account settings update helper
  const revertOptimisticAccountSettingsUpdate = useCallback(
    (originalEmail: string) => {
      console.log("Reverting optimistic account settings update");
      setProfileData((prev) => ({
        ...prev!,
        display: {
          ...prev!.display,
          email: originalEmail,
        },
      }));
    },
    []
  );

  // Update account settings with optimistic updates
  const updateAccountSettings = async (
    formData: AccountSettingsFormData
  ): Promise<boolean> => {
    if (!user) {
      setAccountSettingsError("User not authenticated");
      return false;
    }

    setAccountSettingsLoading(true);
    setAccountSettingsError(null);

    const originalEmail = profileData?.display.email || "";

    try {
      let emailChanged = false;
      let passwordChanged = false;

      // Handle email change
      if (formData.email && formData.email !== profileData?.display.email) {
        // Optimistic update
        setProfileData((prev) => ({
          ...prev!,
          display: { ...prev!.display, email: formData.email },
        }));

        try {
          const { error } = await supabase.auth.updateUser({
            email: formData.email,
          });
          if (error) throw error;
          emailChanged = true;
        } catch (error) {
          revertOptimisticAccountSettingsUpdate(originalEmail);
          throw error;
        }
      }

      // Handle password change
      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters");
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords do not match");
        }

        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (error) throw error;
        passwordChanged = true;
      }

      // Log success
      const changes = [
        emailChanged && "email",
        passwordChanged && "password",
      ].filter(Boolean);
      if (changes.length > 0) {
        console.log(`${changes.join(" and ")} updated successfully`);
      }

      return true;
    } catch (err) {
      console.error("updateAccountSettings error:", err);
      setAccountSettingsError(
        err instanceof Error ? err.message : "Failed to update account settings"
      );
      return false;
    } finally {
      setAccountSettingsLoading(false);
    }
  };

  // Upload profile image (placeholder for future implementation)
  const uploadProfileImage = async (imageFile: File): Promise<boolean> => {
    console.log("Profile image upload not yet implemented:", imageFile.name);
    // TODO: Implement profile image upload to Supabase Storage
    return false;
  };

  // Delete profile (placeholder for future implementation)
  const deleteProfile = async (): Promise<boolean> => {
    console.log("Profile deletion not yet implemented");
    // TODO: Implement profile deletion with proper cleanup
    return false;
  };

  // Helper functions
  const isJobSeeker = useCallback((): boolean => {
    return profileData?.userRole === "jobseeker";
  }, [profileData?.userRole]);

  const isClient = useCallback((): boolean => {
    return profileData?.userRole === "employer";
  }, [profileData?.userRole]);

  const getDisplayData = useCallback((): ProfileDisplayData | null => {
    return profileData?.display || null;
  }, [profileData?.display]);

  const getPersonalInfoData = useCallback((): PersonalInfoFormData | null => {
    return profileData?.personalInfo || null;
  }, [profileData?.personalInfo]);

  const getAccountFormData = useCallback((): AccountSettingsFormData => {
    return {
      email: profileData?.display.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  }, [profileData?.display.email]);

  // Load profile data when user changes or component mounts
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      // Clear data when user logs out
      setProfileData(null);
      setError(null);
      setPersonalInfoError(null);
      setAccountSettingsError(null);
    }
  }, [user, fetchProfile]);

  return {
    // Data
    profileData,

    // Loading states
    loading,
    personalInfoLoading,
    accountSettingsLoading,

    // Error states
    error,
    personalInfoError,
    accountSettingsError,

    // Actions
    fetchProfile,
    updatePersonalInfo,
    updateAccountSettings,
    uploadProfileImage,
    deleteProfile,

    // Helpers
    isJobSeeker,
    isClient,
    getDisplayData,
    getPersonalInfoData,
    getAccountFormData,
  };
};
