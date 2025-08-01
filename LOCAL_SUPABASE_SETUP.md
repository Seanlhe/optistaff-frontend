# Local Supabase Development Setup

This guide walks you through setting up a local Supabase instance that mirrors your remote database for development and testing.

## Prerequisites

- Node.js (v18 or higher)
- Docker Desktop
- Git

## Step 1: Install Supabase CLI

Install the Supabase CLI globally via npm:

```bash
npm install -g supabase
```

Verify the installation:

```bash
supabase --version
```

## Step 2: Start Docker Desktop

Make sure Docker Desktop is running on your machine. You can download it from [docker.com](https://www.docker.com/products/docker-desktop/) if you don't have it installed.

## Step 3: Initialize Supabase in Your Project

Navigate to your project root and initialize Supabase:

```bash
cd /path/to/your/project
supabase init
```

This creates a `supabase/` directory with configuration files.

## Step 4: Link to Remote Supabase Project

### Login to Supabase CLI

First, login to Supabase CLI:

```bash
supabase login
```

This will:
1. Open your browser to the Supabase dashboard
2. Ask you to generate an access token
3. Prompt you to paste the token in the terminal

**To get your access token:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your profile icon (top right)
3. Go to "Access Tokens"
4. Click "Generate new token"
5. Give it a name (e.g., "Local Development")
6. Copy the generated token
7. Paste it in your terminal when prompted

### Link to Your Project

Now link your local setup to your remote Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your project reference:**
1. Go to your Supabase dashboard
2. Select your project
3. Go to Settings > General
4. Copy the "Reference ID" (it looks like `abcdefghijklmnop`)

## Step 5: Pull Remote Database Schema

Pull the database schema and seed data from your remote instance:

```bash
supabase db pull
```

This downloads:
- Database schema (tables, functions, triggers, etc.)
- Row Level Security (RLS) policies
- Database functions

## Step 6: Start Local Supabase

Start the local Supabase stack:

```bash
supabase start
```

This will:
- Start PostgreSQL database
- Start Supabase services (Auth, API, etc.)
- Apply your database schema
- Display local URLs and keys

**Important URLs and Keys:**
- API URL: `http://127.0.0.1:54321`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (displayed in terminal)
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (displayed in terminal)

## Step 7: Apply Migrations (if any)

If you have pending migrations, apply them:

```bash
supabase db push
```

## Running Tests

### Pure Function Tests (No Supabase Required)

For testing pure functions that don't interact with the database:

```bash
# Run once
npm run test:pure

# Run in watch mode
npm run test:pure:watch
```

### Integration Tests (Requires Supabase)

For tests that interact with the database:

```bash
# Run all backend tests (includes integration tests)
npm run test:backend:run

# Run specific database function tests
npm run test:db-functions

# Run tests in watch mode
npm run test:backend
```

### Frontend Tests

For frontend component tests:

```bash
# Run frontend tests
npm run test:frontend:run

# Run in watch mode
npm run test:frontend
```

## Using Test Setup Utilities

The `src/test-setup.ts` file provides utilities for integration testing:

### Test Database Clients

```typescript
import { testSupabase, testSupabaseAdmin } from '../src/test-setup';

// Regular client (anon key)
const { data, error } = await testSupabase
  .from('job_seekers')
  .select('*');

// Admin client (service role key) - for auth operations
const { data: users } = await testSupabaseAdmin.auth.admin.listUsers();
```

### Data Cleanup

```typescript
import { cleanupTestData } from '../src/test-setup';

// Clean all test data (called automatically in beforeEach/afterEach)
await cleanupTestData();
```

### Test Data Factories

#### Create Test Job Seeker

```typescript
import { createTestJobSeeker } from '../src/test-setup';

// Create with defaults
const jobSeeker = await createTestJobSeeker();

// Create with custom data
const customJobSeeker = await createTestJobSeeker({
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '98765432',
  rating: 4.5
});
```

#### Create Job Seeker with Preferences

```typescript
import { createTestJobSeekerWithPreferences } from '../src/test-setup';

const { jobSeeker, preferences } = await createTestJobSeekerWithPreferences(
  { first_name: 'Jane' }, // job seeker overrides
  { pay_rate: 25.0 }      // preferences overrides
);
```

#### Create Test Client

```typescript
import { createTestClient } from '../src/test-setup';

const client = await createTestClient({
  company_name: 'Test Corp',
  contact_email: 'test@testcorp.com'
});
```

#### Create Test Shift

```typescript
import { createTestShift } from '../src/test-setup';

const client = await createTestClient();
const { shift_id } = await createTestShift(client.client_id, {
  title: 'Evening Shift',
  pay_rate: 22.0,
  staff_needed: 3
});
```

#### Create Test Assignment

```typescript
import { createTestAssignment } from '../src/test-setup';

const jobSeeker = await createTestJobSeeker();
const client = await createTestClient();
const { shift_id } = await createTestShift(client.client_id);

const assignment = await createTestAssignment(
  jobSeeker.user_id,
  shift_id,
  { status: 5 } // CONFIRMED
);
```

#### Ensure Test Job Types

```typescript
import { ensureTestJobTypes } from '../src/test-setup';

// Ensures these job types exist in the database
const jobTypes = await ensureTestJobTypes();
// Returns: ['Waiter/Waitress', 'Kitchen Helper', 'Cashier', 'Cleaner']
```

### Example Integration Test

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { 
  testSupabase, 
  createTestJobSeeker, 
  createTestJobSeekerWithPreferences,
  cleanupTestData 
} from '../src/test-setup';

describe('Job Seeker Integration Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  test('creates job seeker with preferences', async () => {
    const { jobSeeker, preferences } = await createTestJobSeekerWithPreferences({
      first_name: 'Test',
      last_name: 'User'
    });

    expect(jobSeeker.first_name).toBe('Test');
    expect(preferences.user_id).toBe(jobSeeker.user_id);
    
    // Verify in database
    const { data } = await testSupabase
      .from('job_seekers')
      .select('*')
      .eq('user_id', jobSeeker.user_id)
      .single();
      
    expect(data.first_name).toBe('Test');
  });
});
```

## Troubleshooting

### Common Issues

1. **"Local Supabase is not running"**
   - Make sure Docker is running
   - Run `supabase start`
   - Check if ports 54321-54329 are available

2. **Database schema mismatch**
   - Run `supabase db pull` to sync with remote
   - Run `supabase db push` to apply local changes

3. **Test failures due to missing data**
   - Use `ensureTestJobTypes()` to create required job types
   - Check that test cleanup is working properly

4. **Auth errors in tests**
   - Use `testSupabaseAdmin` for admin operations
   - Use `testSupabase` for regular user operations

### Useful Commands

```bash
# Stop local Supabase
supabase stop

# Reset local database (destructive)
supabase db reset

# View local database
supabase db diff

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.ts

# View logs
supabase logs
```

## Environment Variables

Make sure your `.env.local` or test environment has:

```env
# Local Supabase (for testing)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Production Supabase (for deployment)
VITE_SUPABASE_URL_PROD=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY_PROD=your-production-anon-key
```

## Best Practices

1. **Always clean up test data** - The setup automatically cleans before/after each test
2. **Use factories for consistent test data** - Don't create data manually in tests
3. **Test in isolation** - Each test should be independent
4. **Use appropriate client** - `testSupabase` for user operations, `testSupabaseAdmin` for admin operations
5. **Keep tests fast** - Use pure function tests when possible, integration tests only when necessary

## Next Steps

- Run `npm run test:backend:run` to verify your setup
- Check the `tests/unit/` and `tests/integration/` directories for examples
- Start writing your own integration tests using the provided utilities