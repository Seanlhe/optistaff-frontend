# Auth Page Enhancement Plan

## Overview
This plan outlines the necessary updates to align the current Auth page with the original Signup page functionality, including missing fields and Google Maps API integration for Singapore postal code address lookup.

## Missing Fields Analysis

### Current Auth Page Fields
- ✅ Email
- ✅ Password  
- ✅ First Name
- ✅ Last Name
- ✅ Phone Number (jobseeker only)
- ✅ Company Name (employer only)

### Missing Fields from Original Signup Page

#### For Job Seekers (Employees)
- ❌ **Date of Birth** - Date input field
- ❌ **Address** - Text input field  
- ❌ **Postal Code** - Text input field
- ❌ **Confirm Password** - Password confirmation field

#### For Employers (Companies)
- ❌ **Address** - Text input field
- ❌ **Postal Code** - Text input field  
- ❌ **Office Number** - Text input field
- ❌ **Confirm Password** - Password confirmation field

## Implementation Plan

### Phase 1: Update Data Structures

#### 1.1 Update SignupData Interface in useAuth.tsx
```typescript
interface SignupData {
  email: string;
  password: string;
  confirmPassword: string; // Add confirmation
  userType: 'jobseeker' | 'employer';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  
  // Job seeker specific
  dateOfBirth?: string;
  address?: string;
  postalCode?: string;
  
  // Employer specific  
  companyName?: string;
  officeNumber?: string;
  companyAddress?: string;
  companyPostalCode?: string;
}
```

#### 1.2 Update Auth.tsx State Variables
Add missing state variables for all new fields and separate address fields for employers vs job seekers.

#### 1.3 Update AuthFormFields Component
Extend the component to include all missing fields with proper conditional rendering.

### Phase 2: Google Maps API Integration for Singapore Postal Codes

#### 2.1 Setup Google Maps API
- Obtain Google Maps API key with Geocoding API access
- Install required dependencies:
  ```bash
  npm install @googlemaps/google-maps-services-js
  ```

#### 2.2 Create Address Lookup Hook
Create `hooks/useAddressLookup.ts`:
```typescript
interface AddressLookupHook {
  lookupAddress: (postalCode: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}
```

#### 2.3 Singapore Postal Code Integration
- Create utility function for Singapore postal code validation (6 digits)
- Implement Google Geocoding API call for SG postal codes
- Auto-populate address field when valid postal code is entered
- Add debouncing to prevent excessive API calls

#### 2.4 Enhanced Address Components
Create smart address input components:
- `PostalCodeInput` - Validates SG postal codes and triggers lookup
- `AddressInput` - Displays resolved address with edit capability
- Error handling for invalid postal codes or API failures

### Phase 3: Form Validation Enhancement

#### 3.1 Password Confirmation Validation
- Add real-time password confirmation validation
- Update validation utilities in `utils/authentication.tsx`

#### 3.2 Date of Birth Validation
- Add date validation for job seekers
- Ensure age requirements are met (18+ for employment)

#### 3.3 Singapore-specific Validations
- Postal code format validation (6 digits)
- Phone number format validation (SG format)

### Phase 4: UI/UX Improvements

#### 4.1 Progressive Form Layout
- Group related fields (Personal Info, Contact Info, Address Info)
- Use collapsible sections for better mobile experience

#### 4.2 Smart Form Behavior
- Auto-focus next field after postal code lookup
- Show loading state during address resolution
- Clear address when postal code changes

#### 4.3 Error Handling
- Graceful fallback when Google Maps API is unavailable
- Clear error messages for each field
- Success indicators when address is auto-populated

### Phase 5: Backend Integration Updates

#### 5.1 Update Supabase User Metadata
Extend the signup metadata to include all new fields:
```typescript
data: {
  user_type: signupData.userType === 'jobseeker' ? 'job-seeker' : 'client',
  first_name: signupData.firstName,
  last_name: signupData.lastName,
  phone_number: signupData.phoneNumber,
  date_of_birth: signupData.dateOfBirth, // For job seekers
  address: signupData.address,
  postal_code: signupData.postalCode,
  company_name: signupData.companyName, // For employers
  office_number: signupData.officeNumber,
}
```

#### 5.2 Database Schema Updates Required
**Job Seekers Table Missing Fields:**
The current `job_seekers` table needs additional columns:
```sql
-- Add missing fields to job_seekers table
ALTER TABLE job_seekers 
ADD COLUMN date_of_birth DATE,
ADD COLUMN address TEXT,
ADD COLUMN postal_code VARCHAR(6);
```

**Clients Table Updates:**
The current `clients` table needs additional columns:
```sql
-- Add missing fields to clients table  
ALTER TABLE clients
ADD COLUMN postal_code VARCHAR(6),
ADD COLUMN office_number VARCHAR(20);
```

#### 5.3 Database Migration Plan
1. **Create migration scripts** for adding missing columns
2. **Update existing records** with default values where applicable
3. **Add constraints** for postal code validation (6 digits for Singapore)
4. **Update indexes** for better query performance on new fields

## Database Implementation

### Required Migrations

#### Migration 1: Add Missing Fields to Job Seekers Table
```sql
-- Add date_of_birth, address, and postal_code to job_seekers table
ALTER TABLE job_seekers 
ADD COLUMN date_of_birth DATE,
ADD COLUMN address TEXT,
ADD COLUMN postal_code VARCHAR(6);

-- Add constraint for Singapore postal code format
ALTER TABLE job_seekers 
ADD CONSTRAINT check_postal_code_format 
CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{6}$');
```

#### Migration 2: Add Missing Fields to Clients Table
```sql
-- Add postal_code and office_number to clients table
ALTER TABLE clients
ADD COLUMN postal_code VARCHAR(6),
ADD COLUMN office_number VARCHAR(20);

-- Add constraint for Singapore postal code format
ALTER TABLE clients 
ADD CONSTRAINT check_client_postal_code_format 
CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{6}$');
```

#### Migration 3: Create Indexes for Performance
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_job_seekers_postal_code ON job_seekers(postal_code);
CREATE INDEX idx_clients_postal_code ON clients(postal_code);
CREATE INDEX idx_job_seekers_date_of_birth ON job_seekers(date_of_birth);
```

### Current Database Status
Based on the Supabase table analysis:

**Job Seekers Table Current Fields:**
- ✅ user_id (UUID, PK)
- ✅ first_name (VARCHAR)
- ✅ last_name (VARCHAR) 
- ✅ phone_number (VARCHAR)
- ✅ address_coordinates (VARCHAR)
- ✅ rating (NUMERIC)
- ✅ client_id_internal (UUID)
- ✅ status (VARCHAR)
- ✅ created_at (TIMESTAMPTZ)
- ❌ **date_of_birth** (missing)
- ❌ **address** (missing)
- ❌ **postal_code** (missing)

**Clients Table Current Fields:**
- ✅ client_id (UUID, PK)
- ✅ company_name (VARCHAR)
- ✅ first_name (VARCHAR)
- ✅ last_name (VARCHAR)
- ✅ phone (VARCHAR)
- ✅ address (TEXT)
- ✅ contact_email (VARCHAR)
- ✅ created_at (TIMESTAMPTZ)
- ✅ updated_at (TIMESTAMPTZ)
- ❌ **postal_code** (missing)
- ❌ **office_number** (missing)

## Technical Implementation Details

### Google Maps API Configuration

#### Environment Variables
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### API Usage for Singapore
```typescript
const geocodePostalCode = async (postalCode: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}+Singapore&key=${API_KEY}`
    );
    const data = await response.json();
    
    if (data.results?.[0]) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
```

### Form Field Structure
```typescript
// Address section for both user types
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Address Information</h3>
  <div className="grid grid-cols-2 gap-4">
    <PostalCodeInput
      value={postalCode}
      onChange={setPostalCode}
      onAddressResolved={setAddress}
    />
    <AddressInput
      value={address}
      onChange={setAddress}
      readOnly={isAddressFromPostalCode}
    />
  </div>
</div>
```

## Benefits of This Implementation

1. **Complete Feature Parity** - Matches original signup functionality
2. **Enhanced UX** - Auto-address lookup reduces user effort
3. **Data Quality** - Standardized Singapore addresses
4. **Mobile Friendly** - Smart form layout and validation
5. **Scalable** - Easy to extend for other countries later

## Testing Strategy

1. **Unit Tests** - Address lookup hook and validation functions
2. **Integration Tests** - Full signup flow with Google Maps API
3. **E2E Tests** - Complete user registration journey
4. **API Resilience** - Fallback behavior when API is down

## Timeline Estimate

- **Phase 1**: 2-3 days (Data structures and basic fields)
- **Phase 2**: 3-4 days (Google Maps integration)  
- **Phase 3**: 1-2 days (Enhanced validations)
- **Phase 4**: 2-3 days (UI/UX improvements)
- **Phase 5**: 1-2 days (Backend integration)

**Total**: 9-14 days

## Next Steps

1. **Execute Database Migrations**
   - Add missing fields to job_seekers table (date_of_birth, address, postal_code)
   - Add missing fields to clients table (postal_code, office_number)
   - Add postal code format constraints
   - Create performance indexes
2. Set up Google Maps API credentials
3. Update TypeScript interfaces and types
4. Implement missing form fields
5. Create address lookup functionality
6. Test thoroughly with Singapore postal codes
7. Deploy and monitor API usage

## Critical Database Changes Required

⚠️ **Important**: Before implementing the frontend changes, the following database migrations must be executed:

1. **job_seekers table** needs 3 additional columns
2. **clients table** needs 2 additional columns  
3. **Postal code validation** constraints for Singapore format
4. **Performance indexes** for new fields

These changes are required for the signup process to work correctly with all the fields from the original Signup page.
