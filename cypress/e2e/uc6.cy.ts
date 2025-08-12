/// <reference types="cypress"/>

// UC6: Employer creates a new shift from UploadJobs page
// Flow: Login (employer) -> navigate to Upload Jobs -> fill valid form -> stub create_shift RPC -> show success -> auto-navigate to employer dashboard

const stubEmployerLogin = () => {
  cy.intercept(
    { method: 'POST', url: /\/auth\/v1\/token.*grant_type=password.*/ },
    (req) => {
      req.reply({
        statusCode: 200,
        body: {
          access_token: 'test-employer-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'test-refresh-token',
          user: {
            id: 'test-employer-123',
            email: 'employer@test.com',
            created_at: new Date().toISOString(),
            user_metadata: { user_type: 'client' }, // maps to employer
            app_metadata: { provider: 'email' },
            aud: 'authenticated',
          },
        },
      });
    }
  ).as('employerLogin');
};

// Stub the RPC that UploadJobs -> useShifts.createShift calls
const stubCreateShift = () => {
  type CreateShiftBody = {
    p_employer_id: string;
    job_title: string;
    job_description: string;
    job_requirements: string;
    job_type: string;
    pay_rate: number;
    job_location: string;
    postal_code: number | string;
    p_start_time: string;
    p_end_time: string;
    break_duration: number;
    staff_needed: number;
  };

  cy.intercept(
    { method: 'POST', url: /\/rest\/v1\/rpc\/create_shift.*/ },
    (req) => {
      // Basic payload assertions
      const body = req.body as CreateShiftBody;
      expect(body).to.have.property('p_employer_id', 'test-employer-123');
      expect(body).to.have.property('p_start_time');
      expect(body).to.have.property('p_end_time');
      expect(body).to.have.property('job_title');
      expect(body).to.have.property('job_location');
      expect(body).to.have.property('postal_code');
      expect(body).to.have.property('pay_rate');
      expect(body).to.have.property('staff_needed');

      req.reply({ statusCode: 200, body: { shift_id: 'shift-new-1' } });
    }
  ).as('createShift');
};

// After creation, useShifts.fetchShifts may run; keep it quiet
const stubGetShiftsByEmployer = () => {
  cy.intercept(
    { method: 'POST', url: /\/rest\/v1\/rpc\/get_shifts_by_employer.*/ },
    { statusCode: 200, body: [] }
  ).as('getShiftsByEmployer');
};

const loginEmployerThroughUI = () => {
  cy.visit('/auth?mode=login');
  cy.get('input#email').should('be.visible').clear().type('employer@test.com');
  cy.get('input#password').should('be.visible').clear().type('Password1');
  cy.contains('button', /sign in/i).should('be.enabled').click();
  cy.wait('@employerLogin');
  // On success, app navigates to /employer/dashboard
  cy.location('pathname', { timeout: 10000 }).should('eq', '/employer/dashboard');
};

const fillUploadJobsForm = () => {
  // Title and description
  cy.get('input[name="job_title"]').should('be.visible').type('E2E Test Shift');
  cy.get('select[name="job_type"]').should('be.visible').select('Waiter/Waitress');
  cy.get('textarea[name="job_description"]').should('be.visible').type('Assist customers and handle orders.');
  cy.get('textarea[name="job_requirements"]').should('be.visible').type('Good communication; able to stand long hours.');

  // Date (pick a day in next month to ensure future date)
  cy.get('#datepicker-Date').should('be.visible').click();
  cy.get('.react-datepicker__navigation--next').click();
  cy.get('.react-datepicker').within(() => {
    cy.get('div.react-datepicker__month-container').first().within(() => {
      cy.get('div.react-datepicker__week').first()
        .find('div.react-datepicker__day')
        .not('.react-datepicker__day--outside-month')
        .first()
        .click();
    });
  });

  // Times and numbers
  cy.get('input[name="start_time"]').should('be.visible').type('09:00');
  cy.get('input[name="end_time"]').should('be.visible').type('12:00');
  cy.get('input[name="break_duration"]').should('be.visible').clear().type('0.5');

  // Location and postal
  cy.get('input[name="job_location"]').should('be.visible').type('1 Test Avenue');
  cy.get('input[name="postal_code"]').should('be.visible').type('123456');

  // Pay and staff
  cy.get('input[name="pay_rate"]').should('be.visible').type('25');
  cy.get('input[name="staff_needed"]').should('be.visible').type('3');
};

describe('UC6 UploadJobs - create new shift', () => {
  beforeEach(() => {
    stubEmployerLogin();
    stubCreateShift();
    stubGetShiftsByEmployer();
  });

  it('submits a valid form, shows success, then navigates to dashboard', () => {
    // Login as employer
    loginEmployerThroughUI();

    // Navigate to Upload Jobs page
    cy.visit('/employer/uploadjobs');

    // Fill form fields
    fillUploadJobsForm();

    // Submit
    cy.contains('button', 'Post Job').should('be.visible').click();

    // RPC called
    cy.wait('@createShift');

    // Success banner appears
    cy.contains(/Job listing created successfully!/i).should('be.visible');

    // Wait for the 3s redirect to dashboard
    cy.wait(3200);
    cy.location('pathname', { timeout: 10000 }).should('eq', '/employer/dashboard');
  });
});
