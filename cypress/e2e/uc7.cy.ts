describe("UC7 Create Feedback E2E test suite", ()=>{
  beforeEach(()=>{
      cy.visit("localhost:5173");
      setupLoginEmployer();
      cy.get("a[href='/employer/history']").should("be.visible").click();
  })
  const setupLoginEmployer = ()=>{
    cy.get("a[href='/auth?mode=login']").should("be.visible").click();
    cy.get("input[id='email']").should("be.visible").click().type("employer@gmail.com");
    cy.get("input[id='password']").should("be.visible").click().type("testuser");
    cy.get("button[type='submit']").should("be.visible").click();
    
  }

  it("Displays shift information, steps...", ()=>{
    
  })
})