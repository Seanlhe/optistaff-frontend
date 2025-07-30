# User Profile Management System Implementation Log

**Project**: OptiStaff Workforce Management Platform  
**Implementation Date**: July 20, 2025  
**Developer**: OptiStaff Team  
**Branch**: `devnew`

## 📋 Overview

This document details the complete implementation of the user profile management system for OptiStaff, including the creation of a comprehensive profile management interface for job seekers with read-only profile display, editable personal information, and account settings management.

---

## 🎯 Implementation Goals

### **Primary Objectives:**

1. **Profile Display**: View name, rating, account status (read-only)
2. **Personal Information Management**: Edit phone number, home address, postal code
3. **Account Settings**: Change email and password
4. **Role-Based Features**: Different functionality for job seekers vs employers
5. **Integration**: Seamless integration with existing JSSettings page

### **Technical Requirements:**

- Type-safe TypeScript implementation
- Real-time validation and error handling
- Optimistic UI updates
- Performance optimization with proper memoization
- Clean separation of concerns

---

## 🏗️ Architecture Changes

### **1. Type System Enhancement**

#### **File**: `src/types/hooks.ts`

**Added New Interfaces:**

```typescript
// Profile display data (read-only)
export interface ProfileDisplayData {
  firstName: string;
  lastName: string;
  fullName: string;
  rating?: number; // Job seekers only
  accountStatus?: "ACTIVE" | "SUSPENDED" | "INACTIVE"; // Job seekers only
  companyName?: string; // Clients only
  email: string;
  accountCreated: string;
}

// Editable personal information
export interface PersonalInfoFormData {
  phoneNumber: string;
  homeAddress: string;
  postalCode: string;
}

// Account settings management
export interface AccountSettingsFormData {
  email: string;
  currentPassword: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Complete profile data structure
export interface UserProfileData {
  display: ProfileDisplayData;
  personalInfo: PersonalInfoFormData;
  userRole: "jobseeker" | "employer";
}
```

**Impact:**

- ✅ **Type Safety**: Complete TypeScript coverage for all profile operations
- ✅ **Role-Based Types**: Different interfaces for job seekers vs employers
- ✅ **Form Validation**: Structured data for form handling and validation

---

## 🔧 Core Hook Implementation

### **2. useUserProfile Hook**

#### **File**: `src/hooks/useUserProfile.tsx`

**Complete Implementation Features:**

#### **State Management:**

```typescript
// Granular state management for better UX
const [profileData, setProfileData] = useState<UserProfileData | null>(null);
const [loading, setLoading] = useState(false);
const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
const [accountSettingsLoading, setAccountSettingsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [personalInfoError, setPersonalInfoError] = useState<string | null>(null);
const [accountSettingsError, setAccountSettingsError] = useState<string | null>(
  null,
);
```

#### **Core Functions Implemented:**

##### **fetchProfile() - Enhanced Data Fetching**

```typescript
const fetchProfile = useCallback(async () => {
  // 1. Get auth user data from Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.getUser();

  // 2. Fetch profile data based on user role
  if (user.role === "jobseeker") {
    // Fetch from job_seekers table
    const { data, error } = await supabase
      .from("job_seekers")
      .select(
        "first_name, last_name, phone_number, address_coordinates, postal_code, rating, status",
      )
      .eq("user_id", user.id)
      .single();
  } else if (user.role === "employer") {
    // Fetch from clients table
    const { data, error } = await supabase
      .from("clients")
      .select(
        "company_name, first_name, last_name, phone, address, postal_code",
      )
      .eq("client_id", user.id)
      .single();
  }

  // 3. Combine auth + profile data into structured format
  // 4. Validate required fields and data integrity
  // 5. Update local state with combined data
}, [user]);
```

**Key Features:**

- ✅ **Role-Based Queries**: Different database tables for job seekers vs employers
- ✅ **Data Validation**: Validates required fields and postal code format
- ✅ **Error Handling**: Specific error messages for different failure scenarios
- ✅ **Data Transformation**: Combines auth and profile data into structured format

##### **updatePersonalInfo() - Personal Information Updates**

```typescript
const updatePersonalInfo = async (
  formData: PersonalInfoFormData,
): Promise<boolean> => {
  // 1. Input validation (postal code format)
  if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
    throw new Error("Postal code must be 6 digits");
  }

  // 2. Role-based database updates
  if (user.role === "jobseeker") {
    updateData = {
      phone_number: formData.phoneNumber || null,
      address: formData.homeAddress || null, // Store readable address
      postal_code: formData.postalCode || null,
      address_coordinates: newCoordinates || null, // Auto-geocoded coordinates
      updated_at: new Date().toISOString(),
    };
    tableName = "job_seekers";
  } else if (user.role === "employer") {
    updateData = {
      phone: formData.phoneNumber || null,
      address: formData.homeAddress || null,
      postal_code: formData.postalCode || null,
      updated_at: new Date().toISOString(),
    };
    tableName = "clients";
  }

  // 3. Execute database update
  // 4. Optimistic UI update
};
```

**Key Features:**

- ✅ **Input Validation**: Real-time validation with user feedback
- ✅ **Role-Based Updates**: Different field mappings for job seekers vs employers
- ✅ **Optimistic Updates**: Immediate UI feedback after successful operations
- ✅ **Error Isolation**: Errors only affect personal info section

##### **updateAccountSettings() - Account Management**

```typescript
const updateAccountSettings = async (
  formData: AccountSettingsFormData,
): Promise<boolean> => {
  // 1. Handle email changes via Supabase Auth
  if (formData.email !== profileData?.display.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: formData.email,
    });
  }

  // 2. Handle password changes with validation
  if (formData.newPassword) {
    if (formData.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }
    if (formData.newPassword !== formData.confirmPassword) {
      throw new Error("New passwords do not match");
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: formData.newPassword,
    });
  }

  // 3. Update local state and provide user feedback
};
```

**Key Features:**

- ✅ **Email Updates**: Uses Supabase Auth with confirmation email
- ✅ **Password Security**: Validation and confirmation matching
- ✅ **Conditional Updates**: Only updates what actually changed
- ✅ **User Feedback**: Different success messages based on what was changed

##### **Helper Functions - Memoized for Performance**

```typescript
const isJobSeeker = useCallback((): boolean => {
  return profileData?.userRole === "jobseeker";
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
```

**Key Features:**

- ✅ **Performance Optimization**: All helpers wrapped in useCallback
- ✅ **Proper Dependencies**: Minimal, specific dependencies to prevent re-renders
- ✅ **Type Safety**: Full TypeScript support with proper return types

---

## 🎨 UI Component Implementation

### **3. ProfilePage Component**

#### **File**: `src/components/ProfilePage.tsx`

**Main Container Component:**

```typescript
const ProfilePage = () => {
  const {
    profileData,
    loading,
    error,
    isJobSeeker,
    isClient
  } = useUserProfile();

  // Loading state with skeleton UI
  if (loading) return <ProfileSkeleton />;

  // Error state with retry option
  if (error) return <ProfileError error={error} />;

  // Main content with three cards
  return (
    <div className="space-y-6">
      <ProfileDisplayCard />      {/* Read-only profile info */}
      <PersonalInfoCard />        {/* Editable personal info */}
      <AccountSettingsCard />     {/* Account settings */}
    </div>
  );
};
```

**Key Features:**

- ✅ **Loading States**: Skeleton UI for smooth loading experience
- ✅ **Error Handling**: User-friendly error messages with retry options
- ✅ **Component Orchestration**: Manages three profile cards
- ✅ **Development Debug**: Debug info in development mode

### **4. ProfileDisplayCard Component**

#### **File**: `src/components/ProfileDisplayCard.tsx`

**Read-Only Profile Information Display:**

```typescript
const ProfileDisplayCard = () => {
  const { getDisplayData, isJobSeeker, isClient } = useUserProfile();
  const displayData = getDisplayData();

  return (
    <div className="bg-card-color p-6 rounded-xl border border-border">
      <h2>Profile Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Name, Email, Company */}
        <div>
          <div>Full Name: {displayData.fullName}</div>
          <div>Email: {displayData.email}</div>
          {isClient() && <div>Company: {displayData.companyName}</div>}
        </div>

        {/* Right Column: Rating, Status, Member Since */}
        <div>
          {isJobSeeker() && (
            <>
              <div>Rating: {formatRating(displayData.rating)}</div>
              <div>Status: <StatusBadge status={displayData.accountStatus} /></div>
            </>
          )}
          <div>Member Since: {formatDate(displayData.accountCreated)}</div>
        </div>
      </div>
    </div>
  );
};
```

**Key Features:**

- ✅ **Role-Based Display**: Different information for job seekers vs employers
- ✅ **Visual Elements**: Star ratings, status badges, formatted dates
- ✅ **Responsive Design**: Grid layout that adapts to screen size
- ✅ **Data Formatting**: Proper date and rating formatting

### **5. PersonalInfoCard Component**

#### **File**: `src/components/PersonalInfoCard.tsx`

**Editable Personal Information Form:**

```typescript
const PersonalInfoCard = () => {
  const {
    getPersonalInfoData,
    updatePersonalInfo,
    personalInfoLoading,
    personalInfoError,
    isJobSeeker
  } = useUserProfile();

  const [formData, setFormData] = useState<PersonalInfoFormData>({
    phoneNumber: '',
    homeAddress: '',
    postalCode: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updatePersonalInfo(formData);
    if (success) {
      setIsEditing(false);
      // Show success message
    }
  };

  return (
    <div className="bg-card-color p-6 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2>Personal Information</h2>
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <PhoneNumberField />
          <AddressField label={isJobSeeker() ? 'Home Address' : 'Office Address'} />
          <PostalCodeField />
        </div>

        {isEditing && (
          <button type="submit" disabled={!hasChanges() || !isValid()}>
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
};
```

**Key Features:**

- ✅ **Edit Mode Toggle**: Switch between view and edit modes
- ✅ **Real-time Validation**: Postal code format validation with visual feedback
- ✅ **Change Detection**: Only enables save when changes are made
- ✅ **Role-Specific Labels**: Different labels for job seekers vs employers
- ✅ **Success/Error Feedback**: Clear user feedback for all operations

### **6. AccountSettingsCard Component**

#### **File**: `src/components/AccountSettingsCard.tsx`

**Account Settings Management:**

```typescript
const AccountSettingsCard = () => {
  const {
    getAccountFormData,
    updateAccountSettings,
    accountSettingsLoading,
    accountSettingsError
  } = useUserProfile();

  const [formData, setFormData] = useState<AccountSettingsFormData>({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateAccountSettings(formData);
    if (success) {
      setIsChangingPassword(false);
      // Clear password fields and show success
    }
  };

  return (
    <div className="bg-card-color p-6 rounded-xl border border-border">
      <h2>Account Settings</h2>

      <form onSubmit={handleSubmit}>
        {/* Email Change Section */}
        <EmailField />

        {/* Password Change Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <h3>Change Password</h3>
            <button onClick={() => setIsChangingPassword(!isChangingPassword)}>
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword && (
            <div className="space-y-4">
              <CurrentPasswordField />
              <NewPasswordField />
              <ConfirmPasswordField />
            </div>
          )}
        </div>

        <button type="submit" disabled={!hasChanges() || !isValid()}>
          Update Account
        </button>
      </form>
    </div>
  );
};
```

**Key Features:**

- ✅ **Progressive Disclosure**: Password fields only show when needed
- ✅ **Email Confirmation**: Notifies users about confirmation emails
- ✅ **Password Validation**: Requirements and confirmation matching
- ✅ **Smart Success Messages**: Different messages based on what changed
- ✅ **Security**: Password requirements and validation

---

## 🔄 Integration Changes

### **7. JSSettings Page Integration**

#### **File**: `src/pages/employee/JSSettings.tsx`

**Complete Replacement:**

```typescript
// Before: Complex hardcoded implementation with modal
const JSSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ /* hardcoded fields */ });
  // ... 200+ lines of hardcoded logic
};

// After: Clean, simple integration
const JSSettings = () => {
  return (
    <div className="bg-tertiary-bg min-h-full p-4">
      <div className="max-w-5xl mx-auto">
        <div className="py-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile information and account settings
          </p>
        </div>
        <ProfilePage />
      </div>
    </div>
  );
};
```

**Changes Made:**

- ✅ **Simplified Implementation**: Replaced 200+ lines with clean ProfilePage integration
- ✅ **Removed Hardcoded Data**: Now uses real data from useUserProfile hook
- ✅ **Better UX**: Consistent styling and improved user experience
- ✅ **Maintainable Code**: Clean separation of concerns

### **8. JSPref Page Cleanup**

#### **File**: `src/pages/employee/JSPref.tsx`

**Removed Profile Tab:**

```typescript
// Removed ProfilePage import
// Removed "Profile" from Tab type
// Removed Profile tab button
// Removed Profile tab content

// Now focuses only on job preferences and availability
type Tab = "PreferencesForm" | "Availability";
```

**Impact:**

- ✅ **Clear Separation**: JSPref handles job preferences, JSSettings handles profile
- ✅ **Reduced Complexity**: Each page has a single, focused responsibility
- ✅ **Better Navigation**: Users know where to find profile vs preference settings

---

## 🐛 Performance Optimizations & Bug Fixes

### **9. useAuth Hook Optimization**

#### **File**: `src/hooks/useAuth.tsx`

**Issue**: Excessive auth debug logs due to infinite re-render loops

**Root Cause:**

```typescript
// Before: Caused infinite re-renders
useEffect(() => {
  // Auth logic
}, [updateUserState, clearUserState]); // Functions recreated on every render
```

**Solution Applied:**

```typescript
// After: Runs only once with proper auth listener
useEffect(() => {
  let isMounted = true;

  // Set up auth state listener
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!isMounted) return;

    if (event === "SIGNED_IN" && session?.user) {
      await updateUserState(session.user);
    } else if (event === "SIGNED_OUT") {
      clearUserState();
    }
  });

  // Get initial session
  getInitialSession();

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []); // Empty dependency array
```

**Optimizations Made:**

- ✅ **Removed Problematic Dependencies**: Empty dependency array prevents re-renders
- ✅ **Added Auth State Listener**: Proper Supabase auth change handling
- ✅ **Component Unmount Protection**: Prevents memory leaks
- ✅ **State Change Prevention**: Only updates when state actually changes

### **10. useUserProfile Hook Memoization**

**Issue**: "Maximum update depth exceeded" error in AccountSettingsCard

**Root Cause:**

```typescript
// Before: Functions recreated on every render
const getAccountFormData = (): AccountSettingsFormData => {
  return {
    /* data */
  };
};

// Used in component:
useEffect(() => {
  const accountData = getAccountFormData();
  setFormData(accountData);
}, [getAccountFormData]); // Caused infinite loop
```

**Solution Applied:**

```typescript
// After: Properly memoized functions
const getAccountFormData = useCallback((): AccountSettingsFormData => {
  return {
    email: profileData?.display.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}, [profileData?.display.email]); // Minimal, specific dependencies
```

**All Helper Functions Memoized:**

- ✅ `isJobSeeker()` - Memoized with `[profileData?.userRole]`
- ✅ `isClient()` - Memoized with `[profileData?.userRole]`
- ✅ `getDisplayData()` - Memoized with `[profileData?.display]`
- ✅ `getPersonalInfoData()` - Memoized with `[profileData?.personalInfo]`
- ✅ `getAccountFormData()` - Memoized with `[profileData?.display.email]`

---

## 📊 Implementation Statistics

### **Files Created:**

- ✅ `src/components/ProfilePage.tsx` (122 lines)
- ✅ `src/components/ProfileDisplayCard.tsx` (168 lines)
- ✅ `src/components/PersonalInfoCard.tsx` (246 lines)
- ✅ `src/components/AccountSettingsCard.tsx` (282 lines)

### **Files Modified:**

- ✅ `src/types/hooks.ts` - Added profile-related interfaces
- ✅ `src/hooks/useUserProfile.tsx` - Complete implementation (431 lines)
- ✅ `src/pages/employee/JSSettings.tsx` - Simplified integration (31 lines)
- ✅ `src/pages/employee/JSPref.tsx` - Removed profile tab
- ✅ `src/hooks/useAuth.tsx` - Performance optimizations

### **Total Lines of Code:**

- **New Code**: ~1,100 lines
- **Refactored Code**: ~200 lines
- **Removed Code**: ~150 lines (hardcoded JSSettings implementation)

---

## 🎯 Features Implemented

### **✅ Core Functionality:**

1. **Profile Display**: Name, email, rating, account status, member since
2. **Personal Info Editing**: Phone number, home/office address, postal code
3. **Account Settings**: Email and password changes
4. **Role-Based Features**: Different UI and data for job seekers vs employers
5. **Real-time Validation**: Postal code format, password requirements
6. **Error Handling**: Granular error states with user-friendly messages
7. **Loading States**: Skeleton UI and loading indicators
8. **Success Feedback**: Confirmation messages for all operations

### **✅ Technical Features:**

1. **Type Safety**: Complete TypeScript coverage
2. **Performance Optimization**: Memoized functions and minimal re-renders
3. **Error Boundaries**: Isolated error handling per section
4. **Responsive Design**: Mobile-first approach with grid layouts
5. **Accessibility**: Proper form labels and keyboard navigation
6. **Security**: Password validation and confirmation emails
7. **Data Integrity**: Input validation and database constraints
8. **Memory Management**: Proper cleanup and unmount protection

---

## 🚀 User Experience Improvements

### **Before Implementation:**

- ❌ Hardcoded profile data
- ❌ No real database integration
- ❌ Complex modal-based password changes
- ❌ No role-based features
- ❌ Poor error handling
- ❌ No loading states

### **After Implementation:**

- ✅ **Real Data Integration**: Live data from Supabase
- ✅ **Intuitive Interface**: Three clear sections for different functions
- ✅ **Smooth Interactions**: Loading states and optimistic updates
- ✅ **Clear Feedback**: Success messages and error handling
- ✅ **Role-Appropriate**: Different features for job seekers vs employers
- ✅ **Professional Design**: Consistent with application theme

---

## 🔮 Future Enhancements

### **Potential Improvements:**

1. **Profile Image Upload**: Integration with Supabase Storage
2. **Profile Completion Tracking**: Progress indicators for incomplete profiles
3. **Notification Settings**: Email and push notification preferences
4. **Privacy Settings**: Control over profile visibility
5. **Account Deletion**: Self-service account deletion with confirmation
6. **Audit Log**: Track profile changes for security
7. **Two-Factor Authentication**: Enhanced security options
8. **Export Data**: GDPR compliance with data export

### **Technical Debt:**

1. **Testing**: Add comprehensive unit and integration tests
2. **Internationalization**: Multi-language support
3. **Offline Support**: Cached profile data for offline viewing
4. **Performance Monitoring**: Track component render times
5. **Error Reporting**: Integration with error tracking service

---

## 📝 Conclusion

The user profile management system has been successfully implemented with a focus on:

- **User Experience**: Intuitive, responsive interface with clear feedback
- **Performance**: Optimized hooks and components with minimal re-renders
- **Maintainability**: Clean code architecture with proper separation of concerns
- **Type Safety**: Complete TypeScript coverage for all operations
- **Security**: Proper validation and secure account management
- **Scalability**: Extensible architecture for future enhancements

The implementation provides a solid foundation for user profile management that can be easily extended and maintained as the OptiStaff platform grows.

---

**Implementation Completed**: July 20, 2025  
**Status**: ✅ Ready for Production  
**Next Steps**: Testing and user feedback collection

#

# Enhanced Personal Info Updates with Automatic Geocoding

### Overview

Enhanced the `useUserProfile` hook to automatically update location coordinates when users modify their address or postal code, ensuring location-aware maps always display current location data.

### Implementation Details

#### Automatic Geocoding Integration

```typescript
// Import geocoding functionality
import { useLocationGeocoding } from "./useLocationGeocoding";

// Initialize geocoding hook
const { geocodeAddress } = useLocationGeocoding();
```

#### Smart Change Detection

```typescript
// Detect if address or postal code changed
const currentPersonalInfo = profileData.personalInfo;
const addressChanged = formData.homeAddress !== currentPersonalInfo.homeAddress;
const postalCodeChanged =
  formData.postalCode !== currentPersonalInfo.postalCode;

if (addressChanged || postalCodeChanged) {
  // Trigger geocoding only when needed
}
```

#### Prioritized Geocoding Strategy

```typescript
// Try postal code first (more reliable), then address
const addressToGeocode = formData.postalCode || formData.homeAddress;

if (addressToGeocode?.trim()) {
  const coordinates = await geocodeAddress(addressToGeocode);
  if (coordinates) {
    newCoordinates = `${coordinates[0]},${coordinates[1]}`;
  }
}
```

#### Database Update with Coordinates

```typescript
// For job seekers, include coordinates in update
if (user.role === "jobseeker") {
  updateData = {
    phone_number: formData.phoneNumber || null,
    address: formData.homeAddress || null, // Readable address
    postal_code: formData.postalCode || null,
    updated_at: new Date().toISOString(),
  };

  // Add coordinates if geocoding successful
  if (newCoordinates) {
    updateData.address_coordinates = newCoordinates;
  }
}
```

### Benefits

#### User Experience

- **Seamless Updates**: Location-aware maps automatically reflect address changes
- **No Manual Intervention**: Users don't need to manually refresh or re-enter data
- **Real-time Sync**: Coordinates update immediately when profile is saved

#### Technical Advantages

- **Smart Optimization**: Only geocodes when address actually changes
- **Reliable Geocoding**: Prioritizes postal codes for Singapore addresses
- **Graceful Degradation**: Profile updates succeed even if geocoding fails
- **Data Consistency**: Ensures address and coordinates are always synchronized

#### Error Handling

- **Non-blocking**: Geocoding failures don't prevent profile updates
- **Comprehensive Logging**: Detailed console logs for debugging
- **User-friendly**: No error messages shown to users for geocoding issues

### Integration Points

#### PersonalInfoCard Component

- Works transparently with existing form submission
- No changes required to component logic
- Automatic coordinate updates on successful form submission

#### Location-aware Maps

- Immediately reflect new coordinates after profile updates
- No need for manual refresh or data reload
- Consistent with user's current address information

### Testing Scenarios

#### Successful Geocoding

1. User updates address from "123 Old Street" to "8 Somapah Road"
2. User updates postal code to "487372"
3. Hook detects changes and geocodes "487372"
4. Database updated with both readable address and new coordinates
5. Maps display new location immediately

#### Geocoding Failure Handling

1. User updates to invalid or non-existent address
2. Geocoding fails or returns null
3. Profile update still succeeds with readable address
4. Warning logged to console
5. User can still use the application normally

### Future Enhancements

- **Batch Geocoding**: Handle multiple address updates efficiently
- **Coordinate Validation**: Verify coordinates are within expected geographic bounds
- **Fallback Strategies**: Alternative geocoding services if primary fails
- **User Feedback**: Optional notifications about coordinate update status
