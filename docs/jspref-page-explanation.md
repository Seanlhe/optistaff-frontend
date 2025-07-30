# JSPref Page - Complete Implementation Guide for Beginners

## Overview

The **JSPref page** (Job Seeker Preferences) is a React component that allows job seekers to set their work preferences in the OptiStaff application. This page combines multiple UI components, custom hooks, and database integration to create a comprehensive user experience for managing job preferences.

**Location:** `src/pages/employee/JSPref.tsx`

---

## 🏗️ Page Architecture Overview

The JSPref page follows a **hierarchical component structure**:

```
JSPref (Main Page)
├── Tab Navigation (Preferences/Availability)
├── PreferencesForm (Main Form Container)
    ├── PreferencesMaximum (Hours Settings)
    ├── PreferencesPay (Pay Rate Settings)
    ├── PreferencesJobType (Job Selection)
    └── Map (Location Selection)
```

---

## 📱 Step 1: Main Page Component (JSPref.tsx)

### What is JSPref?

JSPref is the **main page component** that acts as a container for two different sections: Preferences and Availability.

### Key Concepts for Beginners:

#### **React State Management**

```typescript
const [activeTab, setActiveTab] = useState<Tab>("PreferencesForm");
```

**What this means:**

- `useState` is a React **hook** that lets us store and update data
- `activeTab` is the **current value** (which tab is selected)
- `setActiveTab` is the **function** to change the value
- `<Tab>` is a **TypeScript type** that ensures we only use valid tab names

#### **Conditional Rendering**

```typescript
{activeTab === "PreferencesForm" && <PreferencesPage />}
{activeTab === "Availability" && <AvailabilityPage />}
```

**What this means:**

- Only show the PreferencesPage component **if** the active tab is "PreferencesForm"
- Only show the AvailabilityPage component **if** the active tab is "Availability"
- This creates a **tab-switching interface**

#### **Event Handling**

```typescript
onClick={() => setActiveTab("PreferencesForm")}
```

**What this means:**

- When the button is clicked, **call the function** `setActiveTab`
- **Pass the value** "PreferencesForm" to switch to that tab
- This **updates the state** and triggers a re-render

---

## 🎨 Step 2: PreferencesForm Component

### What is PreferencesForm?

PreferencesForm is the **main container** that holds all the preference settings. It manages the overall form state and coordinates between different sections.

### Key Concepts:

#### **Custom Hooks Integration**

```typescript
const { preferences, savePreferences, loading, error, getFormData } =
  usePreferences();
```

**What this means:**

- `usePreferences()` is a **custom hook** (a reusable function with state)
- It returns an **object** with multiple properties:
  - `preferences`: Current user preferences from database
  - `savePreferences`: Function to save data to database
  - `loading`: Boolean indicating if data is being loaded
  - `error`: Any error messages
  - `getFormData`: Function to convert database data to form format

#### **Form State Management**

```typescript
const [formData, setFormData] = useState<PreferencesFormData>({
  payRate: 20,
  considerLowerRate: false,
  maxHoursPerWeek: 40,
  maxHoursPerShift: 8,
  maxTravelKm: 50,
  selectedJobNames: [],
});
```

**What this means:**

- `formData` holds **all the form values** in one object
- Each property represents a **different preference setting**
- `setFormData` is used to **update any of these values**
- **TypeScript interface** `PreferencesFormData` ensures data structure consistency

#### **Effect Hooks for Data Loading**

```typescript
useEffect(() => {
  const existingFormData = getFormData();
  if (existingFormData) {
    setFormData(existingFormData);
  }
}, [getFormData]);
```

**What this means:**

- `useEffect` runs code **when the component loads** or when dependencies change
- When `getFormData` changes, **load existing preferences** from the database
- **Populate the form** with the user's saved preferences
- This ensures users see their **previously saved settings**

#### **Async Form Submission**

```typescript
const handleSubmit = async () => {
  setIsSubmitting(true);
  const success = await savePreferences(formData);
  if (success) {
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  }
  setIsSubmitting(false);
};
```

**What this means:**

- `async/await` handles **asynchronous operations** (database calls)
- Set loading state **before** starting the save operation
- **Wait for** the save operation to complete
- Show success message **if** save was successful
- **Hide success message** after 3 seconds
- **Reset loading state** when done

---

## ⚙️ Step 3: Child Components

### PreferencesMaximum Component

**Purpose:** Allows users to set maximum working hours per week and per shift.

#### **Controlled Input Pattern**

```typescript
const handleMaxHoursPerWeekChange = (
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  const value = parseInt(e.target.value) || 0;
  setFormData({
    ...formData,
    maxHoursPerWeek: value,
  });
};
```

**What this means:**

- **Event handler** function that runs when input value changes
- `e.target.value` gets the **new value** from the input field
- `parseInt()` converts **string to number**
- `...formData` **spreads** (copies) all existing form data
- **Updates only** the `maxHoursPerWeek` property
- This is called a **controlled component** because React controls the input value

### PreferencesPay Component

**Purpose:** Manages pay rate preferences with a slider and checkbox.

#### **Range Slider Implementation**

```typescript
<input
  type="range"
  min="5"
  max="30"
  value={formData.payRate}
  onChange={handlePayRateChange}
  className="w-1/3 h-2 bg-secondary-bg rounded-full appearance-none cursor-pointer accent-primary-blue"
/>
```

**What this means:**

- `type="range"` creates a **slider input**
- `min` and `max` set the **allowed range** ($5-$30)
- `value={formData.payRate}` **binds** the slider to form state
- `onChange` **updates** the form state when slider moves
- **CSS classes** style the slider appearance

#### **Checkbox Handling**

```typescript
const handleConsiderLowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    considerLowerRate: e.target.checked,
  });
};
```

**What this means:**

- `e.target.checked` gets the **boolean value** (true/false) of checkbox
- **Updates** the `considerLowerRate` property in form state
- **Preserves** all other form data using spread operator

### PreferencesJobType Component

**Purpose:** Allows users to select preferred job types from categorized lists.

#### **Multiple Hook Integration**

```typescript
const {
  jobTypesByCategory,
  loading: jobTypesLoading,
  error: jobTypesError,
} = useJobTypes();
const { preferences, loading: preferencesLoading } = usePreferences();
```

**What this means:**

- Uses **two different hooks** to get different data
- `useJobTypes()` provides **available job categories and types**
- `usePreferences()` provides **user's current preferences**
- **Renames** loading variables to avoid conflicts (`loading: jobTypesLoading`)

#### **Complex State Management**

```typescript
const [selectedJobs, setSelectedJobs] = useState<{ [key: string]: boolean }>(
  {},
);
```

**What this means:**

- Creates a **local state object** where:
  - **Keys** are job names (strings)
  - **Values** are selection status (boolean: true/false)
- Example: `{ "Waiter": true, "Chef": false, "Bartender": true }`

#### **Dynamic Checkbox Generation**

```typescript
{Object.entries(jobTypesByCategory).map(([categoryName, jobTypes]) => (
  <div key={categoryName}>
    <h4>{categoryName}</h4>
    {jobTypes.map((jobType) => (
      <label key={jobType.job_type_id}>
        <input
          type="checkbox"
          name={jobType.type_name}
          checked={selectedJobs[jobType.type_name] || false}
          onChange={handleCheckboxChange}
        />
        {jobType.type_name}
      </label>
    ))}
  </div>
))}
```

**What this means:**

- `Object.entries()` converts object to **array of [key, value] pairs**
- **First map()** creates a section for each job category
- **Second map()** creates a checkbox for each job type in that category
- `key` prop helps React **track each element** for efficient updates
- **Checkbox state** is controlled by the `selectedJobs` object

### Map Component

**Purpose:** Interactive map for selecting preferred work locations.

#### **Leaflet Map Integration**

```typescript
import {
  MapContainer,
  TileLayer,
  useMap,
  Circle,
  useMapEvents,
} from "react-leaflet";
```

**What this means:**

- **React Leaflet** is a library for interactive maps
- `MapContainer` is the **main map component**
- `TileLayer` provides the **map tiles** (the actual map images)
- `Circle` draws **circular areas** on the map
- `useMapEvents` handles **user interactions** with the map

#### **Map Click Handling**

```typescript
const MapClickHandler = () => {
  useMapEvents({
    click: (e) => {
      setSelectedLocation([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};
```

**What this means:**

- **Custom component** that handles map clicks
- `useMapEvents` is a **hook** that listens for map events
- When user **clicks the map**, get the **latitude and longitude**
- **Update state** with the new location coordinates
- **Returns null** because it doesn't render anything visible

---

## 🔗 Step 4: Custom Hooks Deep Dive

### usePreferences Hook

**Purpose:** Manages all database operations for user preferences.

#### **Hook Structure**

```typescript
export const usePreferences = () => {
  // State management
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dependencies
  const { user } = useAuth();
  const { convertJobNamesToIds, convertJobIdsToNames } = useJobTypes();

  // Functions
  const fetchPreferences = useCallback(async () => {
    /* ... */
  }, [user]);
  const savePreferences = useCallback(
    async (formData) => {
      /* ... */
    },
    [user],
  );

  // Return interface
  return {
    preferences,
    loading,
    error,
    savePreferences,
    fetchPreferences,
    // ... other functions
  };
};
```

**What this means:**

- **Custom hook** that encapsulates all preference-related logic
- **State variables** track data, loading status, and errors
- **Dependencies** on other hooks for authentication and job types
- **useCallback** optimizes functions to prevent unnecessary re-renders
- **Returns object** with data and functions for components to use

#### **Database Operations**

```typescript
const fetchPreferences = useCallback(async () => {
  const { data, error } = await supabase
    .from("preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      await createDefaultPreferences();
      return;
    }
    setError(error.message);
    return;
  }

  setPreferences(data);
}, [user]);
```

**What this means:**

- **Async function** that fetches data from Supabase database
- `supabase.from("preferences")` **selects the table**
- `.select("*")` **gets all columns**
- `.eq("user_id", user.id)` **filters** by current user
- `.single()` **expects one result**
- **Error handling**: If no preferences exist (PGRST116), create defaults
- **Success**: Store the data in state

### useJobTypes Hook

**Purpose:** Manages job categories and job types data.

#### **Data Transformation**

```typescript
const convertJobNamesToIds = useCallback(
  (jobNames: string[]): string[] => {
    return jobTypes
      .filter((jobType) => jobNames.includes(jobType.type_name))
      .map((jobType) => jobType.job_type_id);
  },
  [jobTypes],
);
```

**What this means:**

- **Helper function** that converts job names to database IDs
- `filter()` **finds job types** whose names are in the input array
- `map()` **extracts the IDs** from the filtered job types
- **Returns array** of UUID strings for database storage

### useAuth Hook

**Purpose:** Manages user authentication state.

#### **Authentication State**

```typescript
const [authState, setAuthState] = useState<AuthState>({
  user: null,
  loading: true,
  error: null,
});
```

**What this means:**

- **Centralized state** for authentication information
- `user` contains **user data** (id, email, role) or null if not logged in
- `loading` indicates if **authentication check** is in progress
- `error` contains any **authentication error messages**

---

## 🗄️ Step 5: Database Integration (Supabase)

### Database Tables

#### **preferences table**

```sql
CREATE TABLE preferences (
  preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES job_seekers(user_id) UNIQUE,
  min_pay_rate NUMERIC DEFAULT 0.00,
  max_travel_km INTEGER DEFAULT 50,
  desired_roles JSONB DEFAULT '[]'::jsonb,
  max_hours_per_week INTEGER,
  max_hours_per_shift INTEGER,
  consider_lower_rate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**What this means:**

- **Primary key**: `preference_id` uniquely identifies each record
- **Foreign key**: `user_id` links to the job_seekers table
- **Data types**: NUMERIC for money, INTEGER for numbers, BOOLEAN for true/false
- **JSONB**: Stores array of job type IDs efficiently
- **Timestamps**: Track when records are created and updated

#### **job_types and job_categories tables**

```sql
-- Simplified structure
job_categories: category_id, category_name, description
job_types: job_type_id, type_name, category_id, description
```

**What this means:**

- **Normalized database design**: Categories and types are separate tables
- **Relationship**: job_types references job_categories via category_id
- **Benefits**: Easy to add new categories/types, consistent data

### Database Operations

#### **Upsert Operation**

```typescript
const { data, error } = await supabase
  .from("preferences")
  .upsert(preferencesData, { onConflict: "user_id" })
  .select()
  .single();
```

**What this means:**

- **Upsert** = UPDATE if exists, INSERT if doesn't exist
- `onConflict: "user_id"` means **if user already has preferences, update them**
- **Otherwise**, create new preferences record
- `.select()` **returns the saved data**
- `.single()` **expects one result**

#### **Joined Queries**

```typescript
const { data, error } = await supabase.from("job_types").select(`
    *,
    job_categories (
      category_id,
      category_name,
      description
    )
  `);
```

**What this means:**

- **Joins** job_types table with job_categories table
- **Gets all job_types columns** plus related category information
- **Nested object structure** in the result
- **More efficient** than separate queries

---

## 🔄 Step 6: Data Flow Explanation

### Complete Data Flow Process:

1. **Page Load**:

   - JSPref component mounts
   - usePreferences hook initializes
   - Checks if user is authenticated
   - Fetches existing preferences from database
   - Loads job types and categories
   - Populates form with existing data

2. **User Interaction**:

   - User changes a preference (e.g., moves pay rate slider)
   - Event handler function is called
   - Form state is updated with new value
   - UI re-renders to show new value

3. **Form Submission**:

   - User clicks Submit button
   - handleSubmit function is called
   - Form data is validated
   - Job names are converted to IDs
   - Data is sent to Supabase database
   - Success/error message is displayed

4. **Real-time Updates**:
   - Database operation completes
   - Hook state is updated with new data
   - Components re-render with fresh data
   - User sees confirmation of changes

### Error Handling Flow:

1. **Network Errors**: Caught by try-catch blocks
2. **Validation Errors**: Checked before database operations
3. **Database Errors**: Returned by Supabase and displayed to user
4. **Loading States**: Managed throughout async operations

---

## 🎯 Step 7: Key React Concepts Demonstrated

### **State Management Patterns**

- **Local State**: Component-specific data (form inputs)
- **Shared State**: Data shared between components (via hooks)
- **Derived State**: Computed values based on other state

### **Component Communication**

- **Props Down**: Parent passes data to children
- **Callbacks Up**: Children notify parents of changes
- **Context/Hooks**: Shared state across component tree

### **Performance Optimizations**

- **useCallback**: Prevents function recreation on every render
- **useMemo**: Caches expensive calculations
- **Conditional Rendering**: Only renders necessary components

### **TypeScript Benefits**

- **Type Safety**: Prevents runtime errors
- **IntelliSense**: Better development experience
- **Interface Contracts**: Clear component APIs

---

## 🚀 Summary for Beginners

The JSPref page demonstrates several important web development concepts:

1. **Component Architecture**: Breaking complex UI into smaller, manageable pieces
2. **State Management**: Tracking and updating data throughout the application
3. **Database Integration**: Storing and retrieving user data persistently
4. **User Experience**: Providing feedback, loading states, and error handling
5. **Type Safety**: Using TypeScript to prevent bugs and improve code quality

**Key Takeaways:**

- **Separation of Concerns**: UI components, business logic (hooks), and data storage are separate
- **Reusability**: Custom hooks can be used across multiple components
- **Maintainability**: Clear structure makes code easy to understand and modify
- **User-Centric Design**: Focus on providing smooth, intuitive user experience

This implementation showcases modern React development practices and provides a solid foundation for building complex, data-driven web applications.
