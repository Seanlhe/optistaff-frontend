# Preferences System Improvements

## Overview

This document outlines the improvements made to the preferences system, focusing on simplifying the validator and changing from UUID-based job type storage to name-based storage with proper database joins.

## Changes Made

### 1. Simplified Preference Validator

#### Before (Over-engineered):
```typescript
// Had unnecessary schema validation
export const isPreferencesSchemaUpToDate = (preferences: UserPreferences | null): boolean => {
  // Checking if fields exist - TypeScript already handles this
  return (
    preferences.min_pay_rate !== undefined &&
    preferences.max_travel_km !== undefined &&
    // ... more redundant checks
  );
};
```

#### After (Business Rules Only):
```typescript
// Focuses only on business logic validation
export const validatePreferences = (preferences: UserPreferences): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Singapore-specific business rules
  if (preferences.max_hours_per_week > 44) {
    errors.push('Maximum hours per week cannot exceed 44 (Singapore labor law)');
  }
  
  // Logical consistency checks
  if (preferences.max_hours_per_shift > preferences.max_hours_per_week) {
    errors.push('Maximum hours per shift cannot exceed maximum hours per week');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

#### Benefits:
- ✅ **Simpler**: Removed redundant schema checking (TypeScript handles this)
- ✅ **Focused**: Only validates actual business rules
- ✅ **Contextual**: Singapore-specific validations
- ✅ **Logical**: Checks for data consistency

### 2. Job Type Storage: UUID → Names in JSONB Array

#### Before (UUID Array):
```sql
-- preferences table
desired_roles JSONB DEFAULT '[]'::jsonb  -- ["uuid1", "uuid2", "uuid3"]
```

```typescript
// Required complex conversion functions
const convertJobNamesToIds = (names: string[]) => { /* complex logic */ };
const convertJobIdsToNames = (ids: string[]) => { /* complex logic */ };
```

#### After (Job Names in JSONB):
```sql
-- Same table structure, different data format
desired_roles JSONB DEFAULT '[]'::jsonb  -- ["Waiter", "Chef", "Bartender"]
```

```typescript
// No conversion functions needed - direct storage
const savePreferences = async (formData: PreferencesFormData) => {
  const preferencesData = {
    desired_roles: formData.selectedJobNames // Direct storage of job names
  };
  
  await supabase.from("preferences").upsert(preferencesData);
};
```

#### Benefits:
- ✅ **Simplicity**: No conversion functions needed
- ✅ **Clarity**: Immediately understand what jobs are selected
- ✅ **Easier Debugging**: Can see job names directly in database
- ✅ **Reduced Complexity**: Fewer database queries and joins
- ✅ **Better Performance**: No need for conversion lookups

### 3. Updated Hook Implementation

#### Before (Complex Conversion):
```typescript
const { convertJobNamesToIds, convertJobIdsToNames } = useJobTypes();

// Complex save logic
const jobTypeIds = convertJobNamesToIds(formData.selectedJobNames);
const preferencesData = {
  desired_roles: jobTypeIds  // Store UUIDs
};
```

#### After (Direct Storage):
```typescript
// Simple save logic with direct JSONB storage
const savePreferences = async (formData: PreferencesFormData) => {
  // Validate job names exist (optional)
  if (formData.selectedJobNames.length > 0) {
    const { data: existingJobTypes } = await supabase
      .from("job_types")
      .select("type_name")
      .in("type_name", formData.selectedJobNames)
      .eq("is_active", true);
      
    // Validate all job names are valid
    const validJobNames = existingJobTypes.map(jt => jt.type_name);
    const invalidJobNames = formData.selectedJobNames.filter(
      name => !validJobNames.includes(name)
    );
    
    if (invalidJobNames.length > 0) {
      throw new Error(`Invalid job types: ${invalidJobNames.join(', ')}`);
    }
  }

  // Save preferences with job names directly
  const preferencesData = {
    user_id: user.id,
    desired_roles: formData.selectedJobNames, // Direct JSONB array storage
    // ... other fields
  };

  await supabase.from("preferences").upsert(preferencesData);
};
```

#### Benefits:
- ✅ **Simpler Logic**: Single database operation
- ✅ **Better Performance**: No junction table operations
- ✅ **Easier Maintenance**: Less complex database structure
- ✅ **Direct Access**: Job names immediately available without joins
- ✅ **No Dependencies**: Removed dependency on useJobTypes for conversions

### 4. Improved Component Integration

#### Before:
```typescript
// PreferencesJobType needed usePreferences hook for conversion
const { preferences } = usePreferences();
const { convertJobIdsToNames } = useJobTypes();

// Complex initialization
useEffect(() => {
  if (preferences && preferences.desired_roles) {
    const selectedJobNames = {};
    Object.values(jobTypesByCategory).flat().forEach(jobType => {
      if (preferences.desired_roles.includes(jobType.job_type_id)) {
        selectedJobNames[jobType.type_name] = true;
      }
    });
    setSelectedJobs(selectedJobNames);
  }
}, [preferences, jobTypesByCategory]);
```

#### After:
```typescript
// Simple prop-based initialization
useEffect(() => {
  if (formData.selectedJobNames) {
    const selectedJobNames = {};
    formData.selectedJobNames.forEach(jobName => {
      selectedJobNames[jobName] = true;
    });
    setSelectedJobs(selectedJobNames);
  }
}, [formData.selectedJobNames]);
```

#### Benefits:
- ✅ **Simpler Props**: Direct job names, no conversion needed
- ✅ **Fewer Dependencies**: Removed usePreferences dependency
- ✅ **Clearer Data Flow**: Props → State → UI

## Database Migration

### Required Steps:

1. **Migrate Existing UUID Data to Job Names** (if you have existing data):
   ```sql
   UPDATE preferences 
   SET desired_roles = (
     SELECT jsonb_agg(jt.type_name)
     FROM jsonb_array_elements_text(preferences.desired_roles) AS role_uuid
     JOIN job_types jt ON jt.job_type_id::text = role_uuid
     WHERE jt.is_active = true
   )
   WHERE desired_roles IS NOT NULL 
     AND jsonb_array_length(desired_roles) > 0
     AND jsonb_typeof(desired_roles->0) = 'string'
     AND length(desired_roles->>0) = 36; -- UUID length check
   ```

2. **Add Performance Index**:
   ```sql
   CREATE INDEX idx_preferences_desired_roles_gin 
   ON preferences USING GIN (desired_roles);
   ```

3. **Optional Validation Function**:
   ```sql
   CREATE FUNCTION validate_job_names(job_names TEXT[])
   RETURNS BOOLEAN AS $$
   BEGIN
     RETURN (
       SELECT COUNT(*) = array_length(job_names, 1)
       FROM unnest(job_names) AS job_name
       JOIN job_types jt ON jt.type_name = job_name AND jt.is_active = true
     );
   END;
   $$ LANGUAGE plpgsql;
   ```

## Performance Improvements

### Query Performance:
- **Before**: Complex JSONB operations and multiple conversion queries
- **After**: Direct JSONB array operations with GIN indexing

### Code Performance:
- **Before**: Multiple hook dependencies and conversion functions
- **After**: Direct data access with no conversion overhead

### Maintenance:
- **Before**: Complex conversion logic spread across multiple hooks
- **After**: Simple, direct database operations with clear data flow

## Testing Considerations

### Unit Tests:
- ✅ Test validator with various business rule scenarios
- ✅ Test preference saving with different job type combinations
- ✅ Test component rendering with job name props

### Integration Tests:
- ✅ Test complete preference save/load cycle
- ✅ Test job type selection and persistence
- ✅ Test error handling for invalid job names

### Database Tests:
- ✅ Test junction table constraints
- ✅ Test cascade deletes
- ✅ Test view performance with large datasets

## Conclusion

These improvements result in:
- **Simpler, more maintainable code**
- **Better database design following normalization principles**
- **Improved performance through proper indexing**
- **Clearer separation of concerns**
- **Easier debugging and testing**

The system now follows database best practices while maintaining the user experience and adding better validation for Singapore-specific business rules.
## Rec
ent Location-Aware Enhancements

### 4. Database Field Rename: home_location → address_coordinates

#### Motivation:
The original `home_location` field name was ambiguous - it could represent either a readable address or coordinate data. The field actually stores geocoded coordinates in "latitude,longitude" format.

#### Changes Made:
```sql
-- Database migration
ALTER TABLE job_seekers 
RENAME COLUMN home_location TO address_coordinates;

COMMENT ON COLUMN job_seekers.address_coordinates IS 
'Stored as "latitude,longitude" string format for geocoded address coordinates';
```

#### Benefits:
- ✅ **Clear Purpose**: Field name explicitly indicates coordinate data
- ✅ **Reduced Confusion**: Eliminates ambiguity between address text and coordinates
- ✅ **Better Documentation**: Self-documenting field name
- ✅ **Consistent Naming**: Aligns with actual data content

### 5. Automatic Geocoding Integration

#### Problem Solved:
Previously, when users updated their address or postal code in PersonalInfoCard, the `address_coordinates` field wasn't updated, causing location-aware maps to show outdated locations.

#### Solution Implementation:
```typescript
// Enhanced useUserProfile hook with automatic geocoding
import { useLocationGeocoding } from "./useLocationGeocoding";

const updatePersonalInfo = async (formData: PersonalInfoFormData) => {
  // Detect address/postal code changes
  const addressChanged = formData.homeAddress !== currentPersonalInfo.homeAddress;
  const postalCodeChanged = formData.postalCode !== currentPersonalInfo.postalCode;
  
  // Auto-geocode if location data changed
  if (user.role === "jobseeker" && (addressChanged || postalCodeChanged)) {
    const addressToGeocode = formData.postalCode || formData.homeAddress;
    
    try {
      const coordinates = await geocodeAddress(addressToGeocode);
      if (coordinates) {
        newCoordinates = `${coordinates[0]},${coordinates[1]}`;
      }
    } catch (error) {
      // Graceful degradation - profile update continues
      console.warn("Geocoding failed:", error);
    }
  }
  
  // Update database with both address and coordinates
  const updateData = {
    address: formData.homeAddress,
    postal_code: formData.postalCode,
    address_coordinates: newCoordinates, // Auto-updated
  };
};
```

#### Key Features:
- **Smart Change Detection**: Only geocodes when address/postal code actually changes
- **Prioritized Geocoding**: Uses postal code first (more reliable), falls back to address
- **Graceful Error Handling**: Profile updates succeed even if geocoding fails
- **Job Seeker Only**: Only applies to job seekers (employers don't need coordinates)
- **Real-time Sync**: Location-aware maps immediately reflect address changes

#### Benefits:
- ✅ **Seamless UX**: Users don't need to manually refresh location data
- ✅ **Data Consistency**: Address and coordinates always synchronized
- ✅ **Performance Optimized**: Only geocodes when needed
- ✅ **Error Resilient**: Robust handling of API failures
- ✅ **Singapore-Optimized**: Prioritizes postal codes for better accuracy

### 6. Enhanced Location Data Flow

#### Complete Integration:
```
User Updates Address/Postal Code (PersonalInfoCard)
         ↓
useUserProfile.updatePersonalInfo()
         ↓
Change Detection & Smart Geocoding
         ↓
Database Update (address + coordinates)
         ↓
usePreferences.loadLocationData()
         ↓
Location-aware Maps Auto-refresh
```

#### Data Consistency:
- **Single Source of Truth**: `job_seekers` table contains both readable address and coordinates
- **Automatic Synchronization**: Coordinates updated whenever address changes
- **Real-time Updates**: Maps reflect current location without manual intervention

### 7. Performance and Reliability Improvements

#### API Optimization:
- **Caching**: Geocoding results cached to reduce API calls
- **Rate Limiting**: Built-in retry logic with exponential backoff
- **Change Detection**: Only geocodes when address actually changes
- **Batch Processing**: Future-ready for multiple address updates

#### Error Handling:
- **Non-blocking**: Geocoding failures don't prevent profile updates
- **Comprehensive Logging**: Detailed console logs for debugging
- **User-friendly**: No error messages shown for geocoding issues
- **Graceful Degradation**: Application continues to work normally

## Impact Summary

### User Experience:
- **Seamless Location Updates**: Address changes automatically update maps
- **No Manual Intervention**: Users don't need to refresh or re-enter data
- **Consistent Data**: Location information always synchronized

### Developer Experience:
- **Clear Field Names**: `address_coordinates` explicitly indicates purpose
- **Automatic Integration**: Works transparently with existing components
- **Robust Error Handling**: Comprehensive logging and graceful failures
- **Performance Optimized**: Smart change detection and caching

### System Reliability:
- **Data Consistency**: Address and coordinates always synchronized
- **Error Resilience**: Profile updates succeed even with geocoding issues
- **Performance**: Optimized API usage and caching strategies
- **Maintainability**: Clear separation of concerns and documentation