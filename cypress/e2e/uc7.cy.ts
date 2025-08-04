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

  it("Displays shift information, UC 7 Steps 3-8", ()=>{
    //Replace with local supabase data in the future
    cy.contains("Customer Service Representative").should("be.visible");
    cy.contains("50 Raffles Place, Singapore 048623, Singapore 123456").should("be.visible");
    cy.contains("Friday, 01/08/2025").should("be.visible");
    cy.contains("0").should("be.visible");
  })

  it("Select a shift, UC 7 Step 9", ()=>{
    //Replace with local supabase data in the future
    const firstShiftCard = cy.get("div[data-testid='past-shift-card']").first()
    firstShiftCard.click()
    firstShiftCard.should("have.class", "border-primary-blue")
  })

  it("Select a shift, UC 7 Step 9", ()=>{
    //Replace with local supabase data in the future
    const firstShiftCard = cy.get("div[data-testid='past-shift-card']").first()
    firstShiftCard.click()
    firstShiftCard.should("have.class", "border-primary-blue")
  })

  it("Displays assignment data, UC 7 Steps 10-14", ()=>{
    const firstShiftCard = cy.get("div[data-testid='past-shift-card']").first()
    firstShiftCard.click();
    cy.contains("Khu John").should("be.visible");
    cy.contains("Eliana Jo").should("be.visible");
    const reviewBtn = cy.contains("button", "Review").first();
    reviewBtn.should("be.visible");
  })

  it("Selecting an assignment to rate, UC7 Step 15", ()=>{
    const firstShiftCard = cy.get("div[data-testid='past-shift-card']").first()
    firstShiftCard.click();
    const reviewBtn = cy.contains("button", "Review").first();
    reviewBtn.click();
  })

  it("Submitting a valid assignment, UC7 Steps 17-19", ()=>{
    const firstShiftCard = cy.get("div[data-testid='past-shift-card']").first()
    firstShiftCard.click();
    const reviewBtn = cy.contains("button", "Review").first();
    reviewBtn.click();
    cy.get("p[class*='font-montserrat-b']").contains("Khu John").should("be.visible");
    cy.get("img[alt='Star 5']").click()
    cy.get("textarea[name='comment']").click().type("Great Work!")
    //Submit the feedback later
  })

  it("Submitting an invalid assignment, UC7 Steps 17-18, 25-26", ()=>{
    const firstShiftCard = cy.get("div[data-testid='past-shift-card']").first()
    firstShiftCard.click();
    const reviewBtn = cy.contains("button", "Review").first();
    reviewBtn.click();
    cy.get("p[class*='font-montserrat-b']").contains("Khu John").should("be.visible");
    cy.get("textarea[name='comment']").click().type("Great Work!")
    cy.contains("button", "Rate").click()
    cy.contains("Please provide a valid rating.").should("be.visible")
  })

  it("Submitting an invalid feedback with white-space only comment, UC7 Steps 17-18, 25-26", ()=>{
    cy.get("div[data-testid='past-shift-card']").first().click();
    cy.contains("button", "Review").first().click();
  
    // Confirm modal loaded
    cy.get("p[class*='font-montserrat-b']").contains("Khu John").should("be.visible");
  
    // Give valid rating
    cy.get("img[alt='Star 4']").click();
  
    // Type whitespace-only comment
    cy.get("textarea[name='comment']").click().type("   ");
  
    // Submit
    cy.contains("button", "Rate").click();
  
    // Assert validation
    cy.contains("Please provide a valid comment.").should("be.visible");
  });
  it("Submitting an invalid feedback with multiple validation errors, UC7 Steps 17-18, 25-26", ()=>{
    cy.get("div[data-testid='past-shift-card']").first().click();
    cy.contains("button", "Review").first().click();
  
    // Confirm modal loaded
    cy.get("p[class*='font-montserrat-b']").contains("Khu John").should("be.visible");
  
    // Leave rating and comment blank
    cy.contains("button", "Rate").click();
  
    // Assert both errors
    cy.contains("Please provide a valid rating.").should("be.visible");
    cy.contains("Please provide a valid comment.").should("be.visible");
  });

  it("Submitting an invalid feedback with empty comment, UC7 Steps 17-18, 25-26", ()=>{
    cy.get("div[data-testid='past-shift-card']").first().click();
    cy.contains("button", "Review").first().click();
    // Confirm modal loaded
    cy.get("p[class*='font-montserrat-b']").contains("Khu John").should("be.visible");
    // Give valid rating
    cy.get("img[alt='Star 4']").click();
    // Leave comment empty
    cy.get("textarea[name='comment']").clear();
    // Submit
    cy.contains("button", "Rate").click();
    // Assert validation
    cy.contains("Please provide a valid comment.").should("be.visible");
  });
})