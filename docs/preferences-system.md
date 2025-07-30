# Preferences System Documentation

## Overview

The preferences system allows job seekers to set their work preferences, including pay rates, job types, working hours, and travel distance. These preferences are used to match job seekers with appropriate shifts.

## Database Schema

The preferences table has the following structure:

```sql
CREATE TABLE preferences (
  preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES job_seekers(user_id) UNIQUE,
  min_pay_rate NUMERIC DEFAULT 0.00 CHECK (min_pay_rate >= 0),
  max_travel_km INTEGER DEFAULT 50 CHECK (max_travel_km >= 0),
  desired_roles JSONB DEFAULT '[]'::jsonb,
  max_hours_per_week INTEGER CHECK (max_hours_per_week > 0 AND max_hours_per_week <= 44),
  max_hours_per_shift INTEGER CHECK (max_hours_per_shift > 0 AND max_hours_per_shift <= 12),
  consider_lower_rate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Recent Schema Updates (July 2025)

The following columns were added to the preferences table:

- `max_hours_per_week`: Maximum hours a job seeker is willing to work per week (1-44)
- `max_hours_per_shift`: Maximum hours a job seeker is willing to work per shift (1-12)
- `consider_lower_rate`: Whether the job seeker is willing to consider jobs with lower pay rates

These columns have default values (40, 8, and false respectively) and are now required fields in the TypeScript interface.

## TypeScript Interface

```typescript
export interface UserPreferences {
  preference_id?: string;
  user_id: string;
  min_pay_rate: number;
  max_travel_km: number;
  desired_roles: string[]; // Array of job_type_id UUIDs
  max_hours_per_week: number; // Required field with default value 40
  max_hours_per_shift: number; // Required field with default value 8
  consider_lower_rate: boolean; // Required field with default value false
  created_at?: string;
  updated_at?: string;
}
```

## Form Data Interface

```typescript
export interface PreferencesFormData {
  payRate: number;
  considerLowerRate: boolean;
  maxHoursPerWeek: number;
  maxHoursPerShift: number;
  maxTravelKm: number;
  selectedJobNames: string[]; // Job names from frontend
}
```

## Job Types Integration

The preferences system integrates with the job types system to allow job seekers to select their preferred job types. The job types are stored as UUIDs in the `desired_roles` JSONB array field.

## Hooks

### usePreferences

The `usePreferences` hook provides the following functionality:

- `fetchPreferences()`: Loads user preferences from the database
- `savePreferences(formData)`: Saves form data to the database
- `updatePreferences(updates)`: Updates specific preference fields
- `resetPreferences()`: Resets preferences to default values
- `getFormData()`: Converts database preferences to form format
- `hasJobPreference(jobTypeId)`: Checks if a specific job type is preferred
- `getPreferredJobTypes()`: Gets all preferred job types

### useJobTypes

The `useJobTypes` hook provides job category and type data:

- `fetchCategories()`: Loads job categories
- `fetchJobTypes()`: Loads job types with category information
- `convertJobNamesToIds(jobNames)`: Converts job names to UUIDs
- `convertJobIdsToNames(jobIds)`: Converts UUIDs to job names

## Utilities

### preferencesValidator

The `preferencesValidator` utility provides functions to validate preferences:

- `validatePreferences(preferences)`: Validates all preference fields
- `isPreferencesSchemaUpToDate(preferences)`: Checks if the schema is up to date

## Components

The preferences system includes the following components:

- `PreferencesForm`: Main form container
- `PreferencesMaximum`: Maximum hours settings
- `PreferencesPay`: Pay rate settings
- `PreferencesJobType`: Job type selection

## Usage Example

```tsx
import { usePreferences } from "../hooks/usePreferences";

const MyComponent = () => {
  const { preferences, savePreferences, loading, error } = usePreferences();

  // Use preferences data
  console.log(preferences?.min_pay_rate);

  // Save preferences
  const handleSave = async () => {
    const formData = {
      payRate: 25,
      considerLowerRate: true,
      maxHoursPerWeek: 40,
      maxHoursPerShift: 8,
      maxTravelKm: 30,
      selectedJobNames: ["Waiter/Waitress", "Bartender/Barista"],
    };

    const success = await savePreferences(formData);
    if (success) {
      console.log("Preferences saved successfully!");
    }
  };

  return <div>{/* Component content */}</div>;
};
```

## Troubleshooting

If you encounter the error "Could not find the 'consider_lower_rate' column of 'preferences' in the schema cache", it means your database schema is outdated. The following migration has been applied to fix this issue:

```sql
ALTER TABLE preferences
ADD COLUMN max_hours_per_week INTEGER CHECK (max_hours_per_week > 0 AND max_hours_per_week <= 44),
ADD COLUMN max_hours_per_shift INTEGER CHECK (max_hours_per_shift > 0 AND max_hours_per_shift <= 12),
ADD COLUMN consider_lower_rate BOOLEAN DEFAULT false;
```

After applying this migration, existing records were updated with default values:

- `max_hours_per_week`: 40
- `max_hours_per_shift`: 8
- `consider_lower_rate`: false
