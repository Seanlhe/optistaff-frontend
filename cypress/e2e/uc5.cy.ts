/// <reference types="cypress"/>

// UC5: Jobseeker cancels an assignment from JSSchedule
// Flow: Login -> load schedule -> open assignment -> cancel -> verify RPC & UI

import type { Assignment } from '../../src/types/hooks';

const visit = (path: string) => cy.visit(`http://localhost:5173${path}`);

const stubSupabaseLoginSuccess = () => {
    cy.intercept(
        { method: 'POST', url: /\/auth\/v1\/token\?grant_type=password.*/ },
        (req) => {
            const now = new Date().toISOString();
            const body = req.body as { email?: string };
            const email = body?.email ?? `e2e+${Date.now()}@example.com`;
            req.reply({
                statusCode: 200,
                body: {
                    access_token: 'e2e-access-token',
                    token_type: 'bearer',
                    expires_in: 3600,
                    refresh_token: 'e2e-refresh-token',
                    user: {
                        id: 'js-1',
                        email,
                        created_at: now,
                        user_metadata: { user_type: 'job-seeker' },
                        app_metadata: { provider: 'email' },
                        aud: 'authenticated',
                    },
                },
            });
        }
    ).as('supabaseLogin');
};

const fixtureAssignment = (
    overrides: Partial<Assignment> = {}
): Assignment => ({
    assignment_id: overrides.assignment_id ?? 'assign-1',
    company_name: overrides.company_name ?? 'Tech Corp',
    employee_name: overrides.employee_name ?? 'Jane Doe',
    employer_name: overrides.employer_name ?? 'Tech Corp',
    employee_id: overrides.employee_id ?? 'emp-1',
    job_title: overrides.job_title ?? 'Cashier',
    job_location: overrides.job_location ?? 'Downtown',
    postal_code: overrides.postal_code ?? '123456',
    job_description: overrides.job_description ?? 'Handle POS',
    job_requirements: overrides.job_requirements ?? 'Friendly',
    job_type: overrides.job_type ?? 'Waiter/Waitress',
    pay_rate: overrides.pay_rate ?? 20,
    start_time: overrides.start_time ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    end_time: overrides.end_time ?? new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    break_hours: overrides.break_hours ?? 0.5,
    contact_number: overrides.contact_number ?? '12345678',
    contact_email: overrides.contact_email ?? 'manager@corp.com',
    check_in_time: overrides.check_in_time ?? null,
    check_out_time: overrides.check_out_time ?? null,
    status: overrides.status ?? 'upcoming',
    created_at: overrides.created_at ?? new Date().toISOString(),
});

const stubAssignmentsList = (assignments = [fixtureAssignment()]) => {
    cy.intercept(
        { method: 'POST', url: /\/rest\/v1\/rpc\/get_assignments_by_jobseeker.*/ },
        { statusCode: 200, body: assignments }
    ).as('getAssignments');
};

const stubUpdateAssignmentStatus = () => {
    cy.intercept(
        { method: 'POST', url: /\/rest\/v1\/rpc\/update_assignment_status.*/ },
        (req) => {
            type UpdateBody = { p_assignment_id?: string; p_status_name?: string };
            const body = req.body as UpdateBody;
            expect(body.p_status_name).to.eq('cancel_by_employee');
            req.reply({ statusCode: 200, body: { updated_count: 1, payout_created: false } });
        }
    ).as('updateAssignment');
};

// Stub totals and weekly earnings RPCs used by PayoutTotalSummaryCard/usePayouts and useAssignments
const stubEarningsAndSummaries = () => {
    // Total earnings (number)
    cy.intercept(
        { method: 'POST', url: /\/rest\/v1\/rpc\/get_user_total_earnings.*/ },
        (req) => {
            // Optionally inspect req.body.target_user_id
            req.reply({ statusCode: 200, body: 123.45 });
        }
    ).as('getTotalEarnings');

    // Weekly earnings summary (array of summaries)
    cy.intercept(
        { method: 'POST', url: /\/rest\/v1\/rpc\/get_weekly_earnings_summary.*/ },
        (req) => {
            const body = req.body as { p_user_id?: string; p_start_date?: string; p_end_date?: string };
            const sample = [{
                assignment_id: 'assign-1',
                shift_id: 'shift-1',
                shift_title: 'Cashier',
                shift_start_time: new Date().toISOString(),
                shift_end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                break_hours: 0.5,
                pay_rate: 20,
                scheduled_hours: 2,
                calculated_pay: 40,
                shift_date: new Date().toISOString().slice(0, 10),
                assignment_status: 'upcoming',
                is_completed: false,
            }];
            req.reply({ statusCode: 200, body: sample });
        }
    ).as('getWeeklyEarnings');
};

// Optional: noise reducers
const stubFeedbackAndProfile = () => {
    cy.intercept({ method: 'GET', url: /\/rest\/v1\/feedback.*/ }, { statusCode: 200, body: [] }).as('getFeedback');
    cy.intercept({ method: 'GET', url: /\/rest\/v1\/job_seekers.*/ }, { statusCode: 200, body: [] }).as('getProfile');
};

const loginThroughUI = () => {
    visit('/auth?mode=login');
    cy.get('input#email').should('be.visible').clear().type(`e2e+${Date.now()}@example.com`);
    cy.get('input#password').should('be.visible').clear().type('Password1');
    cy.get('button[type="submit"]').should('be.enabled').click();
    cy.wait('@supabaseLogin');
};

describe('UC5 JSSchedule - cancel assignment', () => {
    beforeEach(() => {
        stubSupabaseLoginSuccess();
        stubFeedbackAndProfile();
        stubEarningsAndSummaries();
        // First load returns upcoming assignment
        stubAssignmentsList([fixtureAssignment({ status: 'upcoming' })]);
        stubUpdateAssignmentStatus();
    });

    it('cancels an upcoming assignment and refreshes the list', () => {
        // Login first
        loginThroughUI();

        // Go to schedule page
        visit('/employee/schedule');

        // Initial fetch
        cy.wait('@getAssignments');

        // Before triggering cancel, set next fetch to return the cancelled assignment
        cy.intercept(
          { method: 'POST', url: /\/rest\/v1\/rpc\/get_assignments_by_jobseeker.*/ },
          { statusCode: 200, body: [fixtureAssignment({ status: 'cancel_by_employee' })] }
        ).as('getAssignmentsAfter');

        // Open details
        cy.contains('button', /View Details/i).should('be.visible').click();

        // Scroll to and click Cancel inside modal
        cy.get('[role="dialog"]').should('be.visible').within(() => {
            cy.contains('button', /Cancel Assignment/i)
              .scrollIntoView()
              .should('be.visible')
              .click();
        });

        // RPC called with cancel_by_employee
        cy.wait('@updateAssignment');

        // After debounce, assignments refetch with updated status
        cy.wait('@getAssignmentsAfter');

        // Optional: ensure earnings calls completed (prevent noise)
        cy.wait('@getTotalEarnings');
        cy.wait('@getWeeklyEarnings');

        // Status chip should reflect cancellation
        cy.contains(/Cancelled by Employee/i).should('be.visible');

        // Modal should close (no Cancel button visible)
        cy.contains('button', /Cancel Assignment/i).should('not.exist');
    });
});
