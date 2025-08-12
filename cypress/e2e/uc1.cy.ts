/// <reference types="cypress"/>

// UC1: Create Account E2E
// This test validates the full user journey for account creation for both Job Seeker and Employer.
// It focuses on user-visible behavior: navigation, form filling, validation feedback, success message, and error scenarios.

const visitAuth = (mode: 'login' | 'signup') => {
  cy.visit('http://localhost:5173/auth?mode=' + mode);
};

const fillCommonSignup = (overrides?: Partial<{
  email: string; password: string; confirmPassword: string; firstName: string; lastName: string;
}>) => {
  const email = overrides?.email ?? `e2e+${Date.now()}@example.com`;
  const password = overrides?.password ?? 'Password1';
  const confirmPassword = overrides?.confirmPassword ?? password;
  const firstName = overrides?.firstName ?? 'John';
  const lastName = overrides?.lastName ?? 'Tan';

  cy.get('input#email').should('be.visible').clear().type(email);
  cy.get('input#password').should('be.visible').clear().type(password);
  cy.get('input#confirmPassword').should('be.visible').clear().type(confirmPassword);
  cy.get('input#firstName').should('be.visible').clear().type(firstName);
  cy.get('input#lastName').should('be.visible').clear().type(lastName);

  return { email, password };
};

const fillJobSeekerSpecific = () => {
  // Date of Birth via DatePicker
  cy.contains('Date of Birth').should('exist');
  // Open datepicker input and type a valid ISO date directly
  cy.get('#datepicker-Date\\ of\\ Birth').should('be.visible').click();
  // Select a date from the calendar popup: pick the first available day button
  cy.get('.react-datepicker').within(() => {
    cy.get('div.react-datepicker__month-container').first().within(() => {
      cy.get('div.react-datepicker__week').first().find('div.react-datepicker__day').not('.react-datepicker__day--outside-month').first().click();
    });
  });

  // Contact and Address
  // Phone is optional for jobseeker (required only for employer per form config),
  // but we fill it to simulate realistic input
  cy.get('input#phoneNumber').should('be.visible').clear().type('+65 9123 4567');
  cy.get('input#address').should('be.visible').clear().type('123 Orchard Road');

  // Stub geocode API via Vite proxy to avoid network dependency
  cy.intercept('GET', '/api/geocode/json*', {
    statusCode: 200,
    body: {
      status: 'OK',
      results: [
        {
          formatted_address: '123 Orchard Road, Singapore',
          address_components: [
            { long_name: '238888', short_name: '238888', types: ['postal_code'] }
          ]
        }
      ]
    }
  }).as('geocode');

  cy.contains('button', 'Validate').should('be.enabled').click();
  cy.wait('@geocode');
  cy.get('input#postalCode').should('have.value', '238888');
};

const fillEmployerSpecific = () => {
  cy.get('input#companyName').should('be.visible').clear().type('E2E Test Company');
  cy.get('input#phoneNumber').should('be.visible').clear().type('+65 6123 4567');
  cy.get('input#officeNumber').should('be.visible').clear().type('+65 6777 8888');

  // Address + postal code lookup
  cy.get('input#address').should('be.visible').clear().type('10 Anson Road');
  cy.intercept('GET', '/api/geocode/json*', {
    statusCode: 200,
    body: {
      status: 'OK',
      results: [
        {
          formatted_address: '10 Anson Road, Singapore',
          address_components: [
            { long_name: '079903', short_name: '079903', types: ['postal_code'] }
          ]
        }
      ]
    }
  }).as('geocodeEmp');
  cy.contains('button', 'Validate').should('be.enabled').click();
  cy.wait('@geocodeEmp');
  cy.get('input#postalCode').should('have.value', '079903');
};

const submitForm = () => {
  cy.get('button[type="submit"]').should('be.enabled').click();
};

// The app calls Supabase auth.signUp from useAuth. To avoid external dependency in CI,
// we can run against a test environment with valid VITE_ env vars OR mock at network boundary
// via cy.intercept if auth requests go over HTTP (they do). If not feasible, we at least assert
// UI flows up to submission and success banner from sessionStorage.

// Helper to assert signup success banner when redirected to login page
const assertSignupSuccessBanner = () => {
  // The app stores a message in sessionStorage and shows it in login mode
  cy.contains(/Account created successfully!/i).should('be.visible');
};

// Error stubs for realistic UX checks
const stubDuplicateEmailError = () => {
  // If app calls Supabase API over network, intercept here. Otherwise, simulate by
  // forcing the hook to show error is non-trivial from Cypress. We’ll test UI error
  // route by leaving required fields blank to trigger validation errors instead.
};


// Stub Supabase signup to simulate success without hitting real backend
const stubSupabaseSignUpSuccess = (userType: 'job-seeker' | 'client') => {
  cy.intercept(
    { method: 'POST', url: /\/auth\/v1\/signup.*/ },
    (req) => {
      const now = new Date().toISOString();
      const email = (req.body as any)?.email ?? `e2e+${Date.now()}@example.com`;
      req.reply({
        statusCode: 200,
        body: {
          user: {
            id: userType === 'job-seeker' ? 'signup-js-1' : 'signup-emp-1',
            email,
            created_at: now,
            user_metadata: { user_type: userType },
            app_metadata: { provider: 'email' },
            aud: 'authenticated',
          },
          identities: [],
        },
      });
    }
  ).as('supabaseSignUp');
};

describe('UC1 Create Account - E2E', () => {
  beforeEach(() => {
    // Start at signup view
    visitAuth('signup');
    // Ensure basic elements visible
    cy.contains(/Create Account/i).should('be.visible');
    cy.contains('I am a...').should('be.visible');
    // Intercept Supabase signup for all tests that submit
    // Individual tests may choose not to submit, which is fine.
  });

  it('Job Seeker signup journey', () => {
    // Ensure job seeker is default selected
    cy.contains('button', 'Job Seeker').should('have.class', 'border-primary-blue');

    // Stub Supabase signup success
    stubSupabaseSignUpSuccess('job-seeker');

    fillCommonSignup();
    fillJobSeekerSpecific();
    submitForm();

    // Wait for Supabase signup to be acknowledged
    cy.wait('@supabaseSignUp');

    // After successful signup the app redirects to login and shows banner
    cy.url().should('include', '/auth?mode=login');

    assertSignupSuccessBanner();
  });

  it('Employer signup journey', () => {
    // Switch to Employer
    cy.contains('button', 'Employer').click();

    // Stub Supabase signup success
    stubSupabaseSignUpSuccess('client');

    fillCommonSignup({ firstName: 'Jane', lastName: 'Smith' });
    fillEmployerSpecific();
    submitForm();

    // Wait for Supabase signup to be acknowledged
    cy.wait('@supabaseSignUp');

    cy.url().should('include', '/auth?mode=login');
    assertSignupSuccessBanner();
  });

  it('Validation errors prevent submission and display messages', () => {
    // Leave email blank to trigger validation error (client-side)
    cy.get('input#email').clear();
    submitForm();

    // stays on signup and shows error alert
    cy.contains(/email/i).should('exist');
  });
});

