# Auth Routing Issue - Diagnosis and Fix

## Problem Summary
User `5338ab04-7955-4a16-89d5-e9aee541d343` with email `focox77692@coderdir.com`:
- ✅ Exists in `job_seekers` table 
- ✅ Has correct metadata: `"user_type": "job-seeker"`
- ❌ But gets redirected to client portal instead of employee portal

## Database Verification
```sql
-- User metadata is correct
SELECT raw_user_meta_data->>'user_type' FROM auth.users 
WHERE id = '5338ab04-7955-4a16-89d5-e9aee541d343';
-- Result: "job-seeker" ✅

-- User exists in job_seekers table
SELECT * FROM job_seekers 
WHERE user_id = '5338ab04-7955-4a16-89d5-e9aee541d343';
-- Result: Record exists ✅

-- User does NOT exist in clients table  
SELECT * FROM clients 
WHERE client_id = '5338ab04-7955-4a16-89d5-e9aee541d343';
-- Result: No records ✅
```

## Root Cause Analysis

The issue is likely in one of these areas:

### 1. Role Mapping Logic
```typescript
// Current logic in useAuth.tsx
const userType = user.user_metadata?.user_type;
const role = userType === 'job-seeker' ? 'jobseeker' : 'employer';
```
This should map "job-seeker" → "jobseeker" ✅

### 2. Navigation Logic  
```typescript
// Current navigation in useAuth.tsx
if (shouldNavigate) {
  navigate(role === 'jobseeker' ? '/employee/preferences' : '/employer/dashboard');
}
```
This should navigate to `/employee/preferences` for jobseekers ✅

### 3. Route Protection
```typescript
// App.tsx route structure
<Route path="/employee" element={
  <ProtectedRoute allowedRoles={['jobseeker']}>
    <JSLayout/>
  </ProtectedRoute>
}>
```
This should allow jobseeker role ✅

## Hypothesis: Session State Issue

The most likely cause is that the user's session state isn't being properly updated or there's a timing issue with the navigation.

## Debugging Steps

1. **Add debug logging** to see exact auth flow
2. **Test login flow** step by step  
3. **Check session persistence** 
4. **Verify navigation timing**

## Solutions

### Solution 1: Add Debug Logging (IMPLEMENTED)
- Added console.log statements to track auth flow
- Added AuthDebugger component to show current state

### Solution 2: Force Session Refresh
Try manually refreshing the session for this user:

```sql
-- Force session refresh in Supabase
UPDATE auth.users 
SET updated_at = NOW() 
WHERE id = '5338ab04-7955-4a16-89d5-e9aee541d343';
```

### Solution 3: Re-create User Through Signup
Instead of manually creating in database, use the signup flow to ensure proper initialization.

### Solution 4: Clear Browser Storage
Clear localStorage/sessionStorage that might have cached incorrect auth state.

## Testing Protocol

1. Login with the test user email: `focox77692@coderdir.com`
2. Check browser console for debug logs
3. Verify AuthDebugger shows correct role
4. Check network tab for auth API calls
5. Verify final landing page

## Expected Result
User should land on `/employee/preferences` with role showing as "jobseeker"
