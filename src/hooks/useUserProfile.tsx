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

// Using database functions for optimized performance

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

  // Fetch profile data using optimized database function
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      setProfileData(result);
      console.log("Profile loaded successfully for user:", user.id);
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
  }, [user]);

  // Update personal info with geocoding and database function
  const updatePersonalInfo = async (
    formData: PersonalInfoFormData
  ): Promise<boolean> => {
    if (!user || !profileData) {
      setPersonalInfoError("User not authenticated or profile not loaded");
      return false;
    }

    setPersonalInfoLoading(true);
    setPersonalInfoError(null);

    try {
      // Validate input
      if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
        throw new Error("Postal code must be 6 digits");
      }

      // Geocode if needed (job seekers only)
      let newCoordinates: string | null = null;
      if (user.role === "jobseeker") {
        const addressChanged =
          formData.homeAddress !== profileData.personalInfo.homeAddress;
        const postalCodeChanged =
          formData.postalCode !== profileData.personalInfo.postalCode;

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

      // Update using database function
      console.log("Updating personal info using database function");

      const { data, error } = await supabase.rpc("update_user_profile", {
        p_user_id: user.id,
        p_phone_number: formData.phoneNumber || null,
        p_address: formData.homeAddress || null,
        p_postal_code: formData.postalCode || null,
        p_address_coordinates: newCoordinates || null,
      });

      if (error) throw new Error(`Database function error: ${error.message}`);
      if (!data) throw new Error("Update failed - no rows affected");

      // Update local state only after successful database update
      setProfileData((prev) => ({
        ...prev!,
        personalInfo: formData,
      }));

      console.log(
        newCoordinates
          ? "Personal info and coordinates updated successfully"
          : "Personal info updated successfully"
      );
      return true;
    } catch (err) {
      console.error("updatePersonalInfo error:", err);
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

  // Update account settings (email and password)
  const updateAccountSettings = async (
    formData: AccountSettingsFormData
  ): Promise<boolean> => {
    if (!user) {
      setAccountSettingsError("User not authenticated");
      return false;
    }

    setAccountSettingsLoading(true);
    setAccountSettingsError(null);

    try {
      let emailChanged = false;
      let passwordChanged = false;

      // Handle email change
      if (formData.email && formData.email !== profileData?.display.email) {
        const { error } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (error) throw error;
        emailChanged = true;

        // Update local state after successful email change
        setProfileData((prev) => ({
          ...prev!,
          display: { ...prev!.display, email: formData.email },
        }));
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
