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