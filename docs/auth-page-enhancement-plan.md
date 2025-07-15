# Auth Page Enhancement Plan

## Overview
Update the current Auth page to include all missing fields from the original Signup page implementation and integrate Google Maps API for automatic address lookup based on Singapore postal codes.

## Current State Analysis

### Missing Fields Comparison

**Current Auth Page Fields:**
- Email, Password
- First Name, Last Name (signup only)
- Phone Number (job seekers)
- Company Name (employers)

**Original Signup Page Fields:**
- **Job Seekers:** First Name, Last Name, Date of Birth, Address, Postal Code, Mobile No., Email, Password, Confirm Password
- **Employers:** Company Name, Address, Postal Code, Mobile No., Office No., Email, Password, Confirm Password

### Fields to Add

**For Job Seekers:**
- Date of Birth
- Address
- Postal Code
- Confirm Password

**For Employers:**
- Address
- Postal Code
- Office Number
- Confirm Password

## Database Schema Analysis

### Current Supabase Tables

**job_seekers table:**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- first_name (text)
- last_name (text)
- phone_number (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**clients table:**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- company_name (text)
- phone_number (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### Required Database Changes

**Missing fields in job_seekers table:**
- `date_of_birth` (DATE)
- `address` (TEXT)
- `postal_code` (VARCHAR(6))

**Missing fields in clients table:**
- `address` (TEXT)
- `postal_code` (VARCHAR(6))
- `office_number` (VARCHAR(20))

### Database Migration Scripts

```sql
-- Add missing columns to job_seekers table
ALTER TABLE job_seekers 
ADD COLUMN date_of_birth DATE,
ADD COLUMN address TEXT,
ADD COLUMN postal_code VARCHAR(6);

-- Add missing columns to clients table  
ALTER TABLE clients
ADD COLUMN address TEXT,
ADD COLUMN postal_code VARCHAR(6),
ADD COLUMN office_number VARCHAR(20);

-- Add postal code validation for Singapore format (6 digits)
ALTER TABLE job_seekers 
ADD CONSTRAINT check_postal_code_format 
CHECK (postal_code ~ '^[0-9]{6}$');

ALTER TABLE clients
ADD CONSTRAINT check_postal_code_format 
CHECK (postal_code ~ '^[0-9]{6}$');

-- Add indexes for performance
CREATE INDEX idx_job_seekers_postal_code ON job_seekers(postal_code);
CREATE INDEX idx_clients_postal_code ON clients(postal_code);
```

## Google Maps API Integration

### Setup Requirements

1. **Google Cloud Console Setup:**
   - Enable Geocoding API
   - Enable Places API (optional, for address suggestions)
   - Create API key with Singapore restrictions
   - Set up billing account

2. **Environment Variables:**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Implementation Strategy

**Use Google Geocoding API** to convert Singapore postal codes to full addresses:

```typescript
// Example API call
const response = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}+Singapore&key=${apiKey}`
);
```

### Custom Hook: useAddressLookup

```typescript
interface AddressResult {
  address: string;
  postalCode: string;
  loading: boolean;
  error: string | null;
}

export const useAddressLookup = () => {
  const [result, setResult] = useState<AddressResult>({
    address: '',
    postalCode: '',
    loading: false,
    error: null,
  });

  const lookupAddress = async (postalCode: string) => {
    // Implementation for Google Geocoding API
  };

  return { ...result, lookupAddress };
};
```

## Implementation Plan

### Phase 1: Database Migration (Priority 1)
**Timeline: 1-2 days**

1. **Execute Database Migrations**
   - Run SQL scripts to add missing columns
   - Add validation constraints
   - Create performance indexes
   - Test data integrity

2. **Update Database Types**
   - Regenerate Supabase types
   - Update TypeScript interfaces
   - Verify type safety

### Phase 2: Data Structure Updates
**Timeline: 1-2 days**

1. **Update SignupData Interface**
   ```typescript
   interface SignupData {
     email: string;
     password: string;
     confirmPassword: string;
     userType: 'jobseeker' | 'employer';
     firstName: string;
     lastName: string;
     phoneNumber?: string;
     dateOfBirth?: string;        // New field
     address?: string;            // New field
     postalCode?: string;         // New field
     companyName?: string;
     officeNumber?: string;       // New field
   }
   ```

2. **Update useAuth Hook**
   - Extend signup function to handle new fields
   - Add validation for required fields
   - Update Supabase metadata structure
   - Add confirm password validation

### Phase 3: Google Maps Integration
**Timeline: 2-3 days**

1. **Setup Google Maps API**
   - Configure API key and restrictions
   - Add environment variables
   - Install necessary dependencies

2. **Create Address Lookup Hook**
   - Implement useAddressLookup custom hook
   - Add Singapore postal code validation (6 digits)
   - Handle API errors and loading states
   - Add debouncing for API calls

3. **Create Smart Address Component**
   - Auto-populate address field when postal code is entered
   - Show loading indicator during lookup
   - Display error messages for invalid postal codes
   - Allow manual address override

### Phase 4: UI Components Update
**Timeline: 3-4 days**

1. **Update AuthFormFields Component**
   ```typescript
   // Add new field components
   <DateInput 
     label="Date of Birth"
     value={formData.dateOfBirth}
     onChange={setFormData.setDateOfBirth}
     required={isSignup && userType === 'jobseeker'}
   />
   
   <AddressLookupField
     postalCode={formData.postalCode}
     address={formData.address}
     onPostalCodeChange={setFormData.setPostalCode}
     onAddressChange={setFormData.setAddress}
     required={isSignup}
   />
   ```

2. **Create New Components**
   - `DateInput` - Date picker for date of birth
   - `AddressLookupField` - Smart postal code + address input
   - `ConfirmPasswordField` - Password confirmation with validation

3. **Update Form Layout**
   - Organize fields logically (personal info → contact → credentials)
   - Implement responsive design for mobile
   - Add progressive disclosure for better UX

### Phase 5: Form Validation Enhancement
**Timeline: 1-2 days**

1. **Client-side Validation**
   - Singapore postal code format (6 digits)
   - Date of birth validation (age restrictions)
   - Password confirmation matching
   - Required field validation per user type

2. **Real-time Validation**
   - Show validation errors as user types
   - Enable/disable submit button based on form validity
   - Clear validation errors when corrected

### Phase 6: Testing & Polish
**Timeline: 1-2 days**

1. **Integration Testing**
   - Test complete signup flow for both user types
   - Verify Google Maps API integration
   - Test form validation scenarios
   - Test error handling and edge cases

2. **UI/UX Polish**
   - Smooth animations and transitions
   - Loading states and progress indicators
   - Error message improvements
   - Mobile responsiveness testing

## Technical Considerations

### Singapore Postal Code Format
- **Format:** 6-digit numeric code (e.g., 123456)
- **Validation regex:** `^[0-9]{6}$`
- **Google Maps query:** `{postal_code}+Singapore`

### Error Handling
- Network connectivity issues
- Invalid postal codes
- Google Maps API rate limits
- Supabase database errors

### Performance Optimization
- Debounce address lookup calls (300ms)
- Cache successful address lookups
- Lazy load Google Maps API
- Optimize bundle size

### Security Considerations
- Restrict Google Maps API key to specific domains
- Validate all inputs server-side
- Sanitize address data before storage
- Rate limit API calls per user

## Dependencies

### New NPM Packages
```json
{
  "react-datepicker": "^4.8.0",
  "@types/react-datepicker": "^4.8.0"
}
```

### Environment Variables
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Success Criteria

1. ✅ All original Signup page fields are implemented
2. ✅ Google Maps integration works for Singapore postal codes
3. ✅ Form validation provides clear user feedback
4. ✅ Database properly stores all new field data
5. ✅ Responsive design works on mobile devices
6. ✅ Error handling covers all edge cases
7. ✅ Performance meets acceptable standards (< 2s form submission)

## Timeline Summary

**Total Estimated Time: 9-14 days**

- Phase 1 (Database): 1-2 days
- Phase 2 (Data Structures): 1-2 days  
- Phase 3 (Google Maps): 2-3 days
- Phase 4 (UI Components): 3-4 days
- Phase 5 (Validation): 1-2 days
- Phase 6 (Testing): 1-2 days

## Next Steps

1. **CRITICAL FIRST STEP:** Execute database migrations to add missing columns
2. Set up Google Maps API key and environment configuration
3. Update TypeScript interfaces and regenerate Supabase types
4. Begin implementing the useAddressLookup hook
5. Create the enhanced AuthFormFields component
6. Implement comprehensive form validation
7. Conduct thorough testing across all user scenarios

---

*This plan provides a comprehensive roadmap for enhancing the Auth page with complete feature parity to the original Signup implementation, plus modern UX improvements through Google Maps integration.*