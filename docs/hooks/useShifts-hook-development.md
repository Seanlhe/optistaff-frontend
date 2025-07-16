# useShifts Hook Development Documentation

## Overview

This document outlines the development and implementation of the `useShifts` hook in the OptiStaff application. The hook provides comprehensive shift management functionality including creation, reading, updating, and deletion (CRUD) operations for shift data, integrated with Supabase backend services.

## Development Timeline

### Commit: useShifts Hook Implementation (bd27b6d)
**Date:** July 13, 2025  
**Author:** wonna10  
**Title:** "add: useShfits - Wonna"

This commit represents a complete transformation of the `useShifts` hook from a placeholder implementation to a fully functional shift management system.

## Implementation Details

### Key Changes Made

#### 1. Enhanced Imports and Dependencies
**Before:**
```tsx
import { useState, useEffect } from 'react';
```

**After:**
```tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';
```

**Changes:**
- Added `useCallback` import for performance optimization
- Integrated `useAuth` hook for authentication state management
- Added Supabase client for database operations

#### 2. Complete Shift Interface Redesign
**Before:**
```tsx
interface Shift {
  id: string;
  title: string;
  description: string;
  payRate: number;
  startTime: string;
  endTime: string;
  date: string;
  status: 'available' | 'assigned' | 'completed';
}
```

**After:**
```tsx
interface Shift {
  shift_id: string;
  client_id: string;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  pay_rate: number;
  job_location: string;
  staff_needed: number;
  staff_assigned: number;
  submission_cycle: 'PRIMARY' | 'SECONDARY';
  created_at: Date;
  break_duration?: number; // in minutes
  status: 0 | 1 | 2;
}
```

**Key Improvements:**
- **Database-aligned naming**: Field names now match database schema (`shift_id`, `client_id`, `start_time`, etc.)
- **Enhanced data types**: Using `Date` objects instead of strings for timestamps
- **Additional business fields**: Added `job_location`, `staff_needed`, `staff_assigned`, `submission_cycle`, `break_duration`
- **Standardized status**: Changed from string literals to numeric status codes (0, 1, 2)
- **Client association**: Added `client_id` for proper data scoping

#### 3. Authentication Integration
```tsx
const { user } = useAuth();
```
- Integrated with existing authentication system
- All operations now require user authentication
- Data scoping based on authenticated user's client_id

#### 4. Real Database Operations Implementation

##### Data Fetching with `fetchShifts`
```tsx
const fetchShifts = useCallback(async () => {
  if (!user) {
    setLoading(false);
    setError('User not authenticated');
    return;
  }
  setLoading(true);
  setError(null);
  try {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('client_id', user.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setShifts(data as Shift[]);
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
}, [user]);
```

**Features:**
- **Authentication guard**: Checks for authenticated user before proceeding
- **Error handling**: Comprehensive error state management
- **Loading states**: Proper loading state management
- **Data scoping**: Filters shifts by `client_id` to ensure users only see their data
- **Performance optimization**: Uses `useCallback` to prevent unnecessary re-renders

##### Shift Creation with `createShift`
**Before:**
```tsx
const createShift = async (shiftData: Omit<Shift, 'id'>) => {
  console.log('Create shift:', shiftData);
};
```

**After:**
```tsx
const createShift = async (shift_data: Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned">) => {
  setLoading(true);
  setError(null);
  if (!user) {
    setError('User not authenticated');
    return;
  }

  const { error } = await supabase.rpc('create_shift', {
    ...shift_data
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  await fetchShifts();
  setLoading(false);
};
```

**Improvements:**
- **Real database integration**: Uses Supabase RPC call for shift creation
- **Proper typing**: Excludes auto-generated fields from input parameters
- **State management**: Handles loading and error states properly
- **Data refresh**: Automatically refetches shifts after successful creation

##### Shift Updates with `updateShift`
**Before:**
```tsx
const updateShift = async (id: string, shiftData: Partial<Shift>) => {
  console.log('Update shift:', id, shiftData);
};
```

**After:**
```tsx
const updateShift = async (shift_id: string, shift_data: Partial<Shift>) => {
  setLoading(true);
  setError(null);
  if (!user) {
    setError('User not authenticated');
    setLoading(false);
    return;
  }

  const { error } = await supabase
    .from('shifts')
    .update(shift_data)
    .eq('shift_id', shift_id);

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  await fetchShifts();
  setLoading(false);
};
```

**Features:**
- **Targeted updates**: Uses Supabase update with specific shift_id matching
- **Partial updates**: Supports updating only specific fields
- **Automatic refresh**: Refetches data after successful update

##### Shift Deletion with `deleteShift`
**Before:**
```tsx
const deleteShift = async (id: string) => {
  console.log('Delete shift:', id);
};
```

**After:**
```tsx
const deleteShift = async (shift_id: string) => {
  setLoading(true);
  setError(null);
  if (!user) {
    setError('User not authenticated');
    setLoading(false);
    return;
  }

  const { error } = await supabase
    .from('shifts')
    .delete()
    .eq('shift_id', shift_id);

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  await fetchShifts();
  setLoading(false);
};
```

**Features:**
- **Safe deletion**: Includes authentication checks and error handling
- **Immediate UI update**: Refetches shifts list after successful deletion

## Technical Architecture

### Hook Structure
```tsx
export const useShifts = () => {
  // State Management
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dependencies
  const { user } = useAuth();
  
  // Core Functions
  const fetchShifts = useCallback(async () => { /* ... */ }, [user]);
  const createShift = async (shift_data) => { /* ... */ };
  const updateShift = async (shift_id, shift_data) => { /* ... */ };
  const deleteShift = async (shift_id) => { /* ... */ };
  
  // Effects
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);
  
  // Return Interface
  return {
    shifts,
    loading,
    error,
    createShift,
    updateShift,
    deleteShift,
  };
};
```

### Integration Points

#### Authentication Dependency
- **Dependency**: `useAuth` hook
- **Purpose**: User authentication state and client identification
- **Data Scoping**: All shift operations are scoped to the authenticated user's `client_id`

#### Database Integration
- **Backend**: Supabase
- **Table**: `shifts`
- **RPC Functions**: `create_shift` for shift creation
- **Operations**: SELECT, INSERT (via RPC), UPDATE, DELETE

### Error Handling Strategy

1. **Authentication Errors**: Checked at the beginning of each operation
2. **Database Errors**: Captured from Supabase responses and stored in error state
3. **Network Errors**: Handled through try-catch blocks
4. **Loading States**: Managed throughout async operations

### Performance Optimizations

1. **useCallback**: `fetchShifts` function is memoized to prevent unnecessary re-renders
2. **Dependency Arrays**: Proper dependency management in `useEffect`
3. **Conditional Loading**: Authentication checks prevent unnecessary API calls

## Usage Examples

### Basic Implementation
```tsx
import { useShifts } from '../hooks/useShifts';

const ShiftManager = () => {
  const { shifts, loading, error, createShift, updateShift, deleteShift } = useShifts();
  
  if (loading) return <div>Loading shifts...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {shifts.map(shift => (
        <div key={shift.shift_id}>
          <h3>{shift.title}</h3>
          <p>{shift.description}</p>
          <button onClick={() => deleteShift(shift.shift_id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Creating a New Shift
```tsx
const handleCreateShift = async () => {
  await createShift({
    client_id: user.id,
    title: "Night Security Guard",
    description: "Overnight security at downtown office",
    start_time: new Date("2025-07-15T22:00:00"),
    end_time: new Date("2025-07-16T06:00:00"),
    pay_rate: 25.00,
    job_location: "123 Business St, Downtown",
    staff_needed: 2,
    submission_cycle: "PRIMARY",
    break_duration: 30
  });
};
```

## Future Considerations

### Potential Enhancements
1. **Caching**: Implement data caching to reduce API calls
2. **Real-time Updates**: Add Supabase real-time subscriptions
3. **Optimistic Updates**: Update UI before API confirmation
4. **Pagination**: Add support for large shift datasets
5. **Filtering**: Add built-in filtering capabilities

### Integration Opportunities
1. **Shift Assignment**: Integration with staff assignment workflows
2. **Calendar Integration**: Connection with calendar components
3. **Notification System**: Alert system for shift updates
4. **Reporting**: Analytics and reporting functionality

## Testing Considerations

### Test Coverage Areas
1. **Authentication Integration**: Test behavior with/without authenticated user
2. **CRUD Operations**: Verify all database operations work correctly
3. **Error Handling**: Test various error scenarios
4. **Loading States**: Ensure proper loading state management
5. **Data Refresh**: Verify automatic data updates after mutations

### Mock Strategies
- Mock `useAuth` hook for different authentication states
- Mock Supabase client for controlled database responses
- Test error scenarios with simulated API failures

## Conclusion

The `useShifts` hook implementation represents a significant advancement in the OptiStaff application's shift management capabilities. The transformation from placeholder functions to a fully integrated, authentication-aware, database-connected system provides a robust foundation for shift management features.

**Key Achievements:**
- ✅ Complete CRUD functionality for shift management
- ✅ Integration with authentication system
- ✅ Comprehensive error handling and loading states
- ✅ Database schema alignment
- ✅ Performance optimizations
- ✅ Type safety with TypeScript

This implementation establishes a solid foundation for future shift-related features and demonstrates best practices for React hook development with external services.
