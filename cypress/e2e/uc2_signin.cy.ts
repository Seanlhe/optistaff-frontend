/// <reference types="cypress" />

// UC2: Sign In - End-to-end flow covering success and error paths
// Assumptions:
// - App is served locally (e.g., Vite default http://localhost:5173)
// - cypress.config.ts has baseUrl set to the app URL. If not, use cy.visit with a full URL.
// - We stub Supabase Auth network calls via cy.intercept to simulate server responses.

// Utility: build a minimal Supabase Auth success response payload
function buildAuthSuccessResponse(userType: "job-seeker" | "client") {
  const now = new Date().toISOString();
  return {
    access_token: "test-access-token",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "test-refresh-token",
    user: {
      id: userType === "job-seeker" ? "user-jobseeker-1" : "user-employer-1",
      email: userType === "job-seeker" ? "jobseeker@test.com" : "employer@test.com",
      created_at: now,
      user_metadata: { user_type: userType },
      app_metadata: { provider: "email" },
      aud: "authenticated",
    },
  };
}

// Utility: stub Supabase sign-in request
function stubSignInSuccess(userType: "job-seeker" | "client") {
  cy.intercept(
    {
      method: "POST",
      // Supabase auth endpoint used by supabase-js for password login
      url: /\/auth\/v1\/token.*grant_type=password.*/,
    },
    (req) => {
      // Optionally assert request body contains email/password
      // const body = req.body as any;
      // expect(body?.email).to.be.a("string");
      req.reply({ statusCode: 200, body: buildAuthSuccessResponse(userType) });
    }
  ).as("supabaseSignIn");
}

function stubSignInError(errorDescription: string) {
  cy.intercept(
    {
      method: "POST",
      url: /\/auth\/v1\/token.*grant_type=password.*/,
    },
    (req) => {
      req.reply({
        statusCode: 400,
        body: {
          error: "invalid_grant",
          error_description: errorDescription,
        },
      });
    }
  ).as("supabaseSignIn");
}

// Helpers to interact with the Auth page
function goToLogin() {
  cy.visit("/auth?mode=login");
  cy.contains("h2", /welcome back/i).should("be.visible");
  cy.contains(/sign in to your account/i).should("be.visible");
}

function fillAndSubmitLogin(email: string, password: string) {
  cy.get("#email").clear().type(email);
  cy.get("#password").clear().type(password);
  cy.contains("button", /sign in/i).click();
}

// Tests
describe("UC2 E2E: Sign In flow", () => {
  it("jobseeker success path → navigates to /employee/preferences", () => {
    stubSignInSuccess("job-seeker");
    goToLogin();
    fillAndSubmitLogin("jobseeker@test.com", "Password123");

    cy.wait("@supabaseSignIn");
    cy.location("pathname", { timeout: 10000 }).should("eq", "/employee/preferences");
  });

  it("employer success path → navigates to /employer/dashboard", () => {
    stubSignInSuccess("client");
    goToLogin();
    fillAndSubmitLogin("employer@test.com", "Password123");

    cy.wait("@supabaseSignIn");
    cy.location("pathname", { timeout: 10000 }).should("eq", "/employer/dashboard");
  });

  it("invalid credentials error → shows 'Invalid credentials' and stays on Auth", () => {
    stubSignInError("Invalid login credentials");
    goToLogin();
    fillAndSubmitLogin("user@test.com", "WrongPass1");

    cy.wait("@supabaseSignIn");
    cy.contains(/invalid credentials/i, { timeout: 10000 }).should("be.visible");
    cy.location("pathname").should("eq", "/auth");
  });

  it("unverified email error → shows 'Please verify your email' and stays on Auth", () => {
    stubSignInError("Email not confirmed");
    goToLogin();
    fillAndSubmitLogin("user@test.com", "AnyPassword1");

    cy.wait("@supabaseSignIn");
    cy.contains(/please verify your email/i, { timeout: 10000 }).should("be.visible");
    cy.location("pathname").should("eq", "/auth");
  });
});

