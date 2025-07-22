/**
 * User Profile Hook
 * @description Custom hook for user profile management
 * @author OptiStaff Team
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

  // Core function: Fetch profile data from both database and auth
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Get current auth user data
      const { data: authUser, error: authError } =
        await supabase.auth.getUser();
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!authUser?.user) {
        throw new Error("Authentication session expired. Please log in again.");
      }

      let profileTableData: any;
      let displayData: ProfileDisplayData;

      // Step 2: Fetch from appropriate profile table based on user role
      if (user.role === "jobseeker") {
        const { data, error } = await supabase
          .from("job_seekers")
          .select(
            "first_name, last_name, phone_number, address_coordinates, address, postal_code, rating, status"
          )
          .eq("user_id", user.id)
          .single();

        // Note: address_coordinates stores coordinates (lat,lng), address stores readable address

        if (error) {
          if (error.code === "PGRST116") {
            throw new Error(
              "Job seeker profile not found. Please contact support to set up your profile."
            );
          }
          throw new Error(`Database error: ${error.message}`);
        }

        // Validate required fields for job seekers
        if (!data.first_name || !data.last_name) {
          throw new Error(
            "Profile is incomplete. Please ensure your first name and last name are set."
          );
        }

        profileTableData = data;

        // Build display data for job seeker with proper defaults
        displayData = {
          firstName: data.first_name,
          lastName: data.last_name,
          fullName: `${data.first_name} ${data.last_name}`,
          rating: typeof data.rating === "number" ? data.rating : 0,
          accountStatus:
            (data.status as "ACTIVE" | "SUSPENDED" | "INACTIVE") || "ACTIVE",
          email: authUser.user.email || "",
          accountCreated: authUser.user.created_at || "",
        };
      } else if (user.role === "employer") {
        const { data, error } = await supabase
          .from("clients")
          .select(
            "company_name, first_name, last_name, phone, address, postal_code"
          )
          .eq("client_id", user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            throw new Error(
              "Company profile not found. Please contact support to set up your profile."
            );
          }
          throw new Error(`Database error: ${error.message}`);
        }

        // Validate required fields for clients
        if (!data.company_name) {
          throw new Error(
            "Company profile is incomplete. Please ensure your company name is set."
          );
        }

        profileTableData = data;

        // Build display data for client with proper defaults
        const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();

        displayData = {
          firstName,
          lastName,
          fullName: fullName || "Name not set",
          companyName: data.company_name,
          email: authUser.user.email || "",
          accountCreated: authUser.user.created_at || "",
        };
      } else {
        throw new Error(
          `Invalid user role: ${user.role}. Expected 'jobseeker' or 'employer'.`
        );
      }

      // Step 3: Build personal info data with proper field mapping and validation
      const personalInfo: PersonalInfoFormData = {
        phoneNumber:
          user.role === "jobseeker"
            ? profileTableData.phone_number || ""
            : profileTableData.phone || "",
        homeAddress:
          user.role === "jobseeker"
            ? profileTableData.address || ""
            : profileTableData.address || "",
        postalCode: profileTableData.postal_code || "",
      };

      // Step 4: Validate postal code format if it exists
      if (personalInfo.postalCode && !/^\d{6}$/.test(personalInfo.postalCode)) {
        console.warn(
          "Invalid postal code format in database:",
          personalInfo.postalCode
        );
        // Don't throw error, just warn - let user fix it in the form
      }

      // Step 5: Combine all data
      setProfileData({
        display: displayData,
        personalInfo: personalInfo,
        userRole: user.role,
      });

      console.log("Profile loaded successfully for user:", user.id);
    } catch (err) {
      console.error("fetchProfile error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error occurred while loading profile";
      setError(errorMessage);

      // Clear profile data on error
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update personal information (phone, address, postal code)
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
      // Step 1: Validate input data
      if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
        throw new Error("Postal code must be 6 digits");
      }

      // Step 2: Geocode address if postal code or address changed (for job seekers only)
      let newCoordinates: string | null = null;
      if (user.role === "jobseeker") {
        const currentPersonalInfo = profileData.personalInfo;
        const addressChanged =
          formData.homeAddress !== currentPersonalInfo.homeAddress;
        const postalCodeChanged =
          formData.postalCode !== currentPersonalInfo.postalCode;

        if (addressChanged || postalCodeChanged) {
          // Try to geocode using postal code first (more reliable), then address
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
              } else {
                console.warn(
                  "Geocoding returned null for address:",
                  addressToGeocode
                );
                // Don't fail the update if geocoding fails - just warn
              }
            } catch (geocodeError) {
              console.warn("Geocoding failed:", geocodeError);
              // Don't fail the update if geocoding fails - just warn
            }
          }
        }
      }

      // Step 3: Prepare update data based on user role
      let updateData: any;
      let tableName: string;
      let whereClause: any;

      if (user.role === "jobseeker") {
        updateData = {
          phone_number: formData.phoneNumber || null,
          address: formData.homeAddress || null, // Store readable address, not coordinates
          postal_code: formData.postalCode || null,
          updated_at: new Date().toISOString(),
        };

        // Add coordinates if geocoding was successful
        if (newCoordinates) {
          updateData.address_coordinates = newCoordinates;
        }

        tableName = "job_seekers";
        whereClause = { user_id: user.id };
      } else if (user.role === "employer") {
        updateData = {
          phone: formData.phoneNumber || null,
          address: formData.homeAddress || null,
          postal_code: formData.postalCode || null,
          updated_at: new Date().toISOString(),
        };
        tableName = "clients";
        whereClause = { client_id: user.id };
      } else {
        throw new Error("Invalid user role");
      }

      // Step 4: Execute database update
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .match(whereClause)
        .select()
        .single();

      if (error) throw error;

      // Step 5: Update local state with new data
      setProfileData((prev) => ({
        ...prev!,
        personalInfo: formData,
      }));

      if (newCoordinates) {
        console.log("Personal info and coordinates updated successfully");
      } else {
        console.log("Personal info updated successfully");
      }

      return true;
    } catch (err) {
      console.error("updatePersonalInfo error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update personal information";
      setPersonalInfoError(errorMessage);
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

      // Step 1: Handle email change if different from current
      if (formData.email && formData.email !== profileData?.display.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });

        if (emailError) throw emailError;
        emailChanged = true;
      }

      // Step 2: Handle password change if new password provided
      if (formData.newPassword) {
        // Validate password requirements
        if (formData.newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters");
        }

        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords do not match");
        }

        // Update password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (passwordError) throw passwordError;
        passwordChanged = true;
      }

      // Step 3: Update local state if email changed
      if (emailChanged) {
        setProfileData((prev) => ({
          ...prev!,
          display: {
            ...prev!.display,
            email: formData.email,
          },
        }));
      }

      // Step 4: Log success
      if (emailChanged && passwordChanged) {
        console.log("Email and password updated successfully");
      } else if (emailChanged) {
        console.log("Email updated successfully");
      } else if (passwordChanged) {
        console.log("Password updated successfully");
      }

      return true;
    } catch (err) {
      console.error("updateAccountSettings error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update account settings";
      setAccountSettingsError(errorMessage);
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
