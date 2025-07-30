# Refactoring: home_location → address_coordinates

## Summary

Successfully renamed the `home_location` field to `address_coordinates` across the entire codebase to better reflect its purpose of storing geocoded coordinates. Additionally enhanced the useUserProfile hook with automatic geocoding functionality.

## Changes Made

### Database Migration

- **Migration**: `rename_home_location_to_address_coordinates`
- **Action**: Renamed column `job_seekers.home_location` to `job_seekers.address_coordinates`
- **Added**: Column comment explaining the format: "latitude,longitude" string

### Code Changes

#### Type Definitions

- **src/types/hooks.ts**:

  - Updated `UserLocationData.home_location` → `UserLocationData.address_coordinates`
  - Updated comments in `PersonalInfoFormData` to reference new field name

- **src/types/database.ts**:
  - Updated all database type definitions for job_seekers table
  - Changed `home_location` to `address_coordinates` in Row, Insert, and Update types

#### Hook Updates

- **src/hooks/useUserProfile.tsx**:

  - Updated SQL select query to use `address_coordinates`
  - Updated comments referencing the field
  - **NEW**: Added automatic geocoding integration with `useLocationGeocoding`
  - **NEW**: Enhanced `updatePersonalInfo` to automatically update coordinates when address/postal code changes
  - **NEW**: Smart change detection - only geocodes when address or postal code actually changes
  - **NEW**: Prioritizes postal code over address for more reliable geocoding
  - **NEW**: Graceful error handling - geocoding failures don't prevent profile updates

- **src/hooks/usePreferences.tsx**:
  - Updated SQL select query to use `address_coordinates`
  - Updated coordinate parsing logic and error messages
  - Updated `UserLocationData` object construction

#### Documentation Updates

- **Design specs**: Updated location-aware preferences design documentation
- **Backend overview**: Updated field references in architecture docs
- **Database functions**: Updated field references in function documentation
- **Auth enhancement plan**: Updated field references
- **User profile implementation log**: Updated field references

## How Coordinates Are Generated

The `address_coordinates` field stores geocoded coordinates generated through this enhanced process:

### Original Process (usePreferences hook):

1. **User Input**: Users provide a `postal_code` or `address` in their profile
2. **Manual Geocoding**: The `usePreferences` hook uses `useLocationGeocoding` to convert postal code/address into coordinates
3. **Storage**: Coordinates are stored as a string in format `"latitude,longitude"` (e.g., "1.3521,103.8198")
4. **Usage**: The `usePreferences` hook parses this string back into coordinate arrays for map display

### Enhanced Process (useUserProfile hook - NEW):

1. **User Profile Update**: When users edit their address or postal code in PersonalInfoCard
2. **Automatic Change Detection**: Hook detects if address or postal code has changed
3. **Smart Geocoding**:
   - Prioritizes postal code (more reliable for Singapore addresses)
   - Falls back to address if postal code unavailable
   - Uses `useLocationGeocoding` hook with Google Maps Geocoding API
4. **Database Update**: Simultaneously updates both readable address AND coordinates
5. **Error Handling**: Geocoding failures don't prevent profile updates (graceful degradation)
6. **Real-time Sync**: Location-aware maps immediately reflect new coordinates

## Field Purpose Clarification

The renamed field `address_coordinates` better reflects its actual purpose:

- **Old name**: `home_location` (ambiguous - could mean address or coordinates)
- **New name**: `address_coordinates` (clear - specifically coordinates derived from address)
- **Format**: String containing "latitude,longitude"
- **Source**: Generated from user's postal code or address via Google Maps Geocoding API

## Verification

✅ Database migration successful
✅ All code references updated
✅ All documentation updated
✅ No remaining references to old field name
✅ Data integrity maintained (existing coordinate data preserved)

## Impact

This refactoring improves both code clarity and user experience by:

### Code Clarity:

1. Making the field purpose explicit (coordinates, not address text)
2. Reducing confusion between address text and coordinate data
3. Better aligning field names with their actual data content
4. Maintaining backward compatibility through proper migration

### User Experience:

1. **Automatic Coordinate Updates**: Users no longer need to manually refresh or re-enter data for maps to update
2. **Real-time Location Sync**: Location-aware maps immediately reflect address changes
3. **Reliable Geocoding**: Prioritizes postal codes for more accurate Singapore address geocoding
4. **Graceful Error Handling**: Profile updates succeed even if geocoding temporarily fails
5. **Seamless Integration**: Works transparently with existing PersonalInfoCard component

### Technical Benefits:

1. **Reduced Manual Intervention**: Eliminates need for users to manually trigger coordinate updates
2. **Data Consistency**: Ensures address and coordinates are always synchronized
3. **Performance**: Only geocodes when address actually changes (smart change detection)
4. **Reliability**: Robust error handling prevents geocoding issues from blocking profile updates
