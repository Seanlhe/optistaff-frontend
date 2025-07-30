# Geocoding Integration Guide

## Overview

This document describes the automatic geocoding system that keeps location coordinates synchronized with user address data across the OptiStaff application.

## Architecture

### Components Involved

1. **useLocationGeocoding Hook**: Core geocoding functionality using Google Maps API
2. **useUserProfile Hook**: Enhanced with automatic coordinate updates
3. **usePreferences Hook**: Reads and parses stored coordinates for map display
4. **PersonalInfoCard Component**: User interface for address editing
5. **Database**: `job_seekers.address_coordinates` field stores geocoded data

### Data Flow

```
User Updates Address/Postal Code
         ↓
PersonalInfoCard Form Submission
         ↓
useUserProfile.updatePersonalInfo()
         ↓
Change Detection (address/postal_code)
         ↓
useLocationGeocoding.geocodeAddress()
         ↓
Google Maps Geocoding API
         ↓
Database Update (address + coordinates)
         ↓
Location-aware Maps Auto-refresh
```

## Implementation Details

### Automatic Geocoding Trigger

The system automatically geocodes when:

- User updates their address in PersonalInfoCard
- User updates their postal code in PersonalInfoCard
- Changes are detected by comparing current vs. new values
- Only applies to job seekers (employers don't need coordinates)

### Geocoding Priority

1. **Postal Code** (preferred): More reliable for Singapore addresses
2. **Address Text** (fallback): Used when postal code unavailable
3. **Combined**: Appends "Singapore" to improve geocoding accuracy

### Error Handling Strategy

- **Non-blocking**: Geocoding failures don't prevent profile updates
- **Graceful degradation**: User can still update profile information
- **Logging**: Detailed console logs for debugging
- **Silent failures**: No error messages shown to users for geocoding issues

## Code Examples

### Hook Integration

```typescript
// useUserProfile.tsx
import { useLocationGeocoding } from "./useLocationGeocoding";

export const useUserProfile = () => {
  const { geocodeAddress } = useLocationGeocoding();

  const updatePersonalInfo = async (formData: PersonalInfoFormData) => {
    // Detect changes
    const addressChanged =
      formData.homeAddress !== currentPersonalInfo.homeAddress;
    const postalCodeChanged =
      formData.postalCode !== currentPersonalInfo.postalCode;

    // Geocode if needed
    if (addressChanged || postalCodeChanged) {
      const addressToGeocode = formData.postalCode || formData.homeAddress;
      const coordinates = await geocodeAddress(addressToGeocode);

      if (coordinates) {
        newCoordinates = `${coordinates[0]},${coordinates[1]}`;
      }
    }

    // Update database with both address and coordinates
    const updateData = {
      address: formData.homeAddress,
      postal_code: formData.postalCode,
      address_coordinates: newCoordinates, // Auto-geocoded
    };
  };
};
```

### Database Schema

```sql
-- job_seekers table
CREATE TABLE job_seekers (
  user_id UUID PRIMARY KEY,
  address TEXT,                    -- Human-readable address
  postal_code VARCHAR(6),          -- Singapore postal code
  address_coordinates VARCHAR(50), -- "latitude,longitude" format
  -- other fields...
);

-- Example data
INSERT INTO job_seekers VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '8 Somapah Road',
  '487372',
  '1.3043,103.8318'  -- Auto-geocoded from postal code
);
```

## Integration Points

### PersonalInfoCard Component

- **No changes required**: Works transparently with existing form
- **Automatic updates**: Coordinates updated on successful form submission
- **User experience**: Seamless - users don't see geocoding process

### Location-aware Maps

- **Real-time updates**: Maps immediately reflect new coordinates
- **Data consistency**: Always shows current address location
- **No manual refresh**: Automatic synchronization

### usePreferences Hook

- **Coordinate parsing**: Reads `address_coordinates` string format
- **Map display**: Converts to coordinate arrays for map components
- **Validation**: Ensures coordinates are within Singapore bounds

## Configuration

### Environment Variables

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### API Limits and Caching

- **Caching**: Results cached to reduce API calls
- **Rate limiting**: Built-in retry logic with exponential backoff
- **Quota management**: Only geocodes when addresses actually change

## Testing

### Manual Testing Scenarios

1. **Address Update**: Change address, verify coordinates update
2. **Postal Code Update**: Change postal code, verify coordinates update
3. **Invalid Address**: Enter invalid address, verify profile still updates
4. **Network Failure**: Simulate API failure, verify graceful handling

### Automated Testing

```typescript
// Example test cases
describe("useUserProfile geocoding", () => {
  it("should update coordinates when postal code changes", async () => {
    // Test implementation
  });

  it("should handle geocoding failures gracefully", async () => {
    // Test implementation
  });

  it("should not geocode when address unchanged", async () => {
    // Test implementation
  });
});
```

## Monitoring and Debugging

### Console Logs

- **Geocoding attempts**: "Geocoding address: 487372"
- **Success**: "Successfully geocoded to coordinates: 1.3043,103.8318"
- **Failures**: "Geocoding failed: [error details]"
- **Warnings**: "Geocoding returned null for address: invalid_address"

### Database Verification

```sql
-- Check coordinate updates
SELECT user_id, address, postal_code, address_coordinates, updated_at
FROM job_seekers
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

## Performance Considerations

### Optimization Strategies

- **Change detection**: Only geocode when address actually changes
- **Caching**: Avoid duplicate API calls for same addresses
- **Async processing**: Non-blocking geocoding doesn't delay profile updates
- **Batch processing**: Future enhancement for multiple address updates

### API Usage

- **Efficient calls**: Prioritize postal codes (more reliable, faster)
- **Error handling**: Robust retry logic with exponential backoff
- **Quota management**: Monitor usage to stay within Google Maps API limits

## Future Enhancements

### Planned Improvements

1. **Batch geocoding**: Handle multiple addresses efficiently
2. **Coordinate validation**: Verify results are within expected bounds
3. **Alternative providers**: Fallback geocoding services
4. **User feedback**: Optional notifications about coordinate updates
5. **Background processing**: Queue geocoding for better performance

### Potential Features

- **Address suggestions**: Auto-complete during address entry
- **Coordinate verification**: Allow users to verify/adjust map pins
- **Bulk updates**: Admin tools for batch coordinate updates
- **Analytics**: Track geocoding success rates and performance
