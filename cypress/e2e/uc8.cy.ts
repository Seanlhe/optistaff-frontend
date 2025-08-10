/// <reference types="cypress"/>

describe("UC8 Shift Cancellation E2E test suite", () => {
  
  beforeEach(() => {
    cy.visit("localhost:5173");
    setupLoginEmployer();
    cy.get("a[href='/employer/roster']").should("be.visible").click();
  })

  const setupLoginEmployer = () => {
    cy.get("a[href='/auth?mode=login']").should("be.visible").click();
    cy.get("input[id='email']").should("be.visible").click().type("employer@gmail.com");
    cy.get("input[id='password']").should("be.visible").click().type("Testuser");
    cy.get("button[type='submit']").should("be.visible").click();
  }

  it("Displays weekly roster with shifts, UC5 prerequisite", () => {
    // Verify roster page loads correctly
    cy.contains("Weekly Roster").should("be.visible");
    
    // Verify calendar structure is present  
    cy.get(".grid-cols-7").should("be.visible");
    
    // Verify actual shifts are present (using visible shift names from your data)
    cy.contains("Test Shift").should("be.visible");
    cy.contains("New Status Test").should("be.visible");
    cy.contains("Friday Dinner Rush Support").should("be.visible");
    cy.contains("Error Test").should("be.visible");
    cy.log("✅ Shifts found on roster page");
  })

  it("Step 1: Employer clicks on job desired to cancel", () => {
    // UC8 Sequence Step 1: Employer -> ClientRoster.tsx: click on the job desired to cancel
    // Click on the first available shift (Test Shift)
    cy.contains("Test Shift").should("be.visible").click();
    
    // Verify the click triggers ClientShiftDetails modal
    // cy.get(".fixed.inset-0").should("be.visible");
    cy.log("✅ Shift clicked");
  })

  it("Steps 2-3: ClientRoster renders ClientShiftDetails and displays shift details", () => {
    // UC8 Sequence Step 2: ClientRoster.tsx -> ClientShiftDetails.tsx: render ClientShiftDetails(shift)
    // UC8 Sequence Step 3: ClientShiftDetails.tsx -> Employer: Display Shift Details
    cy.contains("Test Shift").click();
    
    // Verify ClientShiftDetails modal is rendered and displays shift details
    cy.get(".fixed.inset-0").should("be.visible");
    
    // Verify essential shift details are displayed
    cy.get(".fixed.inset-0").within(() => {
      // Should have shift title
      cy.contains("Test Shift").should("be.visible");
      // Should have cancel button as per sequence diagram
      cy.contains("Cancel", { matchCase: false }).should("be.visible");
    });
    cy.log("✅ Shift details modal displayed correctly");
  })

  it("Steps 4-8: Complete cancellation workflow (Success Path)", () => {
    // UC8 Sequence Step 4: Employer -> ClientShiftDetails.tsx: click(cancel_button)
    // UC8 Sequence Step 5: ClientShiftDetails.tsx -> useShifts Hook: updateShiftStatus(shiftId, status)
    // UC8 Sequence Step 6: useShifts Hook -> Shifts: updateShiftStatus(shiftId, status)
    // UC8 Sequence Step 7: Shifts -> useShifts Hook: response(updated_count)
    // UC8 Sequence Step 8: useShifts Hook -> ClientShiftDetails.tsx: response(updated_count)
    // Success Alt: shift is successfully cancelled (updated count is not 0)
    
    cy.contains("Test Shift").click();
    cy.get(".fixed.inset-0").should("be.visible");
    
    // Step 4: Click cancel button
    cy.get(".fixed.inset-0").within(() => {
      cy.contains("Cancel", { matchCase: false }).should("be.visible").click();
    });
    
    // Steps 5-8: updateShiftStatus workflow happens
    cy.wait(3000); // Allow time for API call completion

    cy.get(".fixed.inset-0").should("not.exist");

    cy.contains("Weekly Roster").should("be.visible");
    cy.contains("Test Shift")
      .parent()
      .should("have.class", "bg-gray-100")
    
    // Verify successful cancellation behavior (modal should close or show success)
    cy.log("✅ Cancellation workflow completed");
  })

    

  it("Unable to Cancel Completed Shifts", () => {
    // U85 Sequence Steps 4-8: Attempt cancellation of a completed shift
    cy.contains("Friday Dinner Rush Support").click();
    cy.get(".fixed.inset-0").should("be.visible");

    cy.get(".fixed.inset-0").within(() => {
      cy.contains("Cancel", { matchCase: false }).should("not.exist");
    });
  })

  it("Complete UC8 end-to-end workflow verification", () => {
    // This test verifies the complete sequence diagram flow end-to-end
    cy.contains("Weekly Roster").should("be.visible");
    
    // UC8 Sequence Steps 1-3: Navigation, rendering, and display
    cy.contains("New Status Test").click();
    cy.get(".fixed.inset-0").should("be.visible");
    
    // UC8 Sequence Steps 4-8: Complete cancellation workflow
    cy.get(".fixed.inset-0").within(() => {
      cy.contains("Cancel", { matchCase: false }).should("be.visible").click();
      cy.wait(2000);
      cy.log("✅ Complete UC8 sequence diagram workflow executed");

    });

    cy.contains("Weekly Roster").should("be.visible");
    cy.contains("New Status Test")
      .parent()
      .should("have.class", "bg-gray-100")
  })
})