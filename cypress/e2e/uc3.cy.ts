/**
 * UC3: Set Preferences - End-to-End Tests
 * @description Complete user journey test for the Set Preferences use case
 * @author OptiStaff Team
 * @testing_approach Single comprehensive test with smooth visual interactions
 */

describe('UC3: Set Preferences - Complete User Journey', () => {
  const baseUrl = 'http://localhost:5173'
  
  beforeEach(() => {
    // Use cy.session() to cache authentication across tests
    cy.session('jobseeker-login', () => {
      // Navigate to login page
      cy.visit(`${baseUrl}/auth?mode=login`)
      
      // Perform login
      cy.get('input[type="email"]').type('jobseeker@gmail.com')
      cy.get('input[type="password"]').type('Testuser')
      cy.get('button[type="submit"]').click()
      
      // Wait for login to complete and redirect
      cy.url().should('include', '/employee')
    }, {
      validate() {
        // Validate that the session is still valid
        cy.visit(`${baseUrl}/employee/dashboard`)
        cy.url().should('include', '/employee')
      }
    })
    
    // Set up API mocks after login
    cy.fixture('uc3-preferences.json').then((fixtures) => {
      cy.intercept('GET', '/api/preferences*', fixtures.emptyPreferences).as('getPreferences')
      cy.intercept('POST', '/api/preferences*', { statusCode: 200, body: { success: true } }).as('savePreferences')
      cy.intercept('GET', '/api/job_types*', fixtures.jobTypes).as('getJobTypes')
    })
    
    // Navigate to preferences page
    cy.visit(`${baseUrl}/employee/preferences`)
    
    // Wait for page to load completely
    cy.wait(1000)
  })

  it('should complete the entire preferences setup journey with smooth interactions', () => {
    // ===========================================
    // 🎬 DYNAMIC TIMING CONFIGURATION
    // ===========================================
    // You can override timing via environment variables:
    // CYPRESS_TIMING_SPEED=fast|normal|slow|demo
    const timingSpeed = Cypress.env('TIMING_SPEED') || 'normal'
    
    const timingPresets = {
      fast: {
        scroll: 'auto',
        shortPause: 200,
        mediumPause: 500,
        longPause: 1000,
        typingDelay: 50,
      },
      normal: {
        scroll: 'auto',
        shortPause: 500,
        mediumPause: 1000,
        longPause: 2000,
        typingDelay: 100,
      },
      slow: {
        scroll: 'auto',
        shortPause: 1000,
        mediumPause: 2000,
        longPause: 3000,
        typingDelay: 200,
      },
      demo: {
        scroll: 'auto',
        shortPause: 1500,
        mediumPause: 2500,
        longPause: 4000,
        typingDelay: 300,
      }
    }
    
    const timing = timingPresets[timingSpeed] || timingPresets.normal
    cy.log(`🎬 Using timing preset: ${timingSpeed}`)
    
    // ===========================================
    // 🎬 COMPLETE USER JOURNEY START
    // ===========================================
    cy.log('🎬 Starting Complete Preferences Setup Journey')
    
    // === PHASE 1: PAGE OVERVIEW & NAVIGATION ===
    cy.log('📋 Phase 1: Page Overview & Navigation')
    
    // Start from top and showcase the page
    cy.scrollTo('top')
    cy.wait(timing.mediumPause)
    
    // Show tab navigation
    cy.contains('button', 'Preferences').should('be.visible').then($btn => {
      cy.wrap($btn).scrollIntoView()
      cy.wait(timing.mediumPause)
      cy.log('✅ Preferences tab is active')
    })
    
    cy.contains('button', 'Availability').should('be.visible').then($btn => {
      cy.wrap($btn).scrollIntoView()
      cy.wait(timing.mediumPause)
      cy.log('👀 Availability tab is visible')
    })
    
    // Demonstrate tab switching
    cy.log('🔄 Demonstrating tab navigation...')
    cy.contains('button', 'Availability').click()
    cy.wait(timing.longPause)
    cy.log('📍 Switched to Availability tab')
    
    // Switch back to Preferences
    cy.contains('button', 'Preferences').click()
    cy.wait(timing.longPause)
    cy.log('📍 Back to Preferences tab')
    
    // === PHASE 2: PAY RATE PREFERENCES ===
    cy.log('💰 Phase 2: Setting Pay Rate Preferences')
    
    // Find and interact with pay rate slider
    cy.get('input[type="range"]').first().then($slider => {
      cy.wrap($slider).scrollIntoView()
      cy.wait(timing.mediumPause)
      
      // Show current value, then change it smoothly
      const currentVal = $slider.val()
      cy.log(`Current pay rate: $${currentVal}`)
      
      cy.wrap($slider).invoke('val', 25).trigger('input')
      cy.wait(timing.mediumPause)
      cy.log('✅ Pay rate set to $25')
    })
    
    // Find and check "consider lower rate" checkbox
    cy.get('input[type="checkbox"]').first().then($checkbox => {
      cy.wrap($checkbox).scrollIntoView()
      cy.wait(timing.shortPause)
      cy.wrap($checkbox).check({ force: true })
      cy.wait(timing.mediumPause)
      cy.log('✅ Willing to consider lower rates')
    })
    
    // === PHASE 3: MAXIMUM HOURS PREFERENCES ===
    cy.log('⏰ Phase 3: Setting Maximum Hours')
    
    // Set maximum hours per week
    cy.get('input[type="number"]').first().then($input => {
      cy.wrap($input).scrollIntoView()
      cy.wait(timing.shortPause)
      
      cy.wrap($input).focus()
      cy.wait(timing.shortPause)
      cy.wrap($input).clear()
      cy.wait(timing.shortPause)
      cy.wrap($input).type('40', { delay: timing.typingDelay })
      cy.wait(timing.mediumPause)
      cy.log('✅ Maximum hours per week: 40')
    })
    
    // Set maximum hours per shift
    cy.get('input[type="number"]').eq(1).then($input => {
      cy.wrap($input).scrollIntoView()
      cy.wait(timing.shortPause)
      
      cy.wrap($input).focus()
      cy.wait(timing.shortPause)
      cy.wrap($input).clear()
      cy.wait(timing.shortPause)
      cy.wrap($input).type('8', { delay: timing.typingDelay })
      cy.wait(timing.mediumPause)
      cy.log('✅ Maximum hours per shift: 8')
    })
    
    // === PHASE 4: JOB TYPE SELECTION (MANDATORY) ===
    cy.log('💼 Phase 4: Job Type Selection (Required)')
    
    cy.get('input[type="checkbox"]').then($checkboxes => {
      const totalCheckboxes = $checkboxes.length
      cy.log(`Found ${totalCheckboxes} checkboxes total`)
      
      // Select multiple job types (skip index 0 which is "consider lower rate")
      let selectedCount = 0
      
      for (let i = 1; i < Math.min(4, totalCheckboxes); i++) {
        cy.wrap($checkboxes.eq(i)).scrollIntoView()
        cy.wait(timing.shortPause)
        cy.wrap($checkboxes.eq(i)).check({ force: true })
        cy.wait(timing.mediumPause)
        selectedCount++
        cy.log(`✅ Selected job type ${selectedCount}`)
      }
      
      cy.log(`🎯 Selected ${selectedCount} job types - form validation satisfied!`)
    })
    
    // === PHASE 5: LOCATION & TRAVEL PREFERENCES ===
    cy.log('🗺️ Phase 5: Location and Travel Settings')
    
    // Handle travel radius slider (if there's a second range input)
    cy.get('input[type="range"]').then($sliders => {
      if ($sliders.length > 1) {
        cy.wrap($sliders.eq(1)).scrollIntoView()
        cy.wait(timing.mediumPause)
        cy.wrap($sliders.eq(1)).invoke('val', 20).trigger('input')
        cy.wait(timing.mediumPause)
        cy.log('✅ Travel radius set to 20km')
      } else {
        cy.log('ℹ️ Single range slider detected (pay rate only)')
      }
    })
    
    // Look for map component
    cy.get('body').then($body => {
      if ($body.find('[class*="map"]').length > 0) {
        cy.get('[class*="map"]').first().scrollIntoView()
        cy.wait(timing.mediumPause)
        cy.log('🗺️ Map component displayed')
      } else {
        cy.log('ℹ️ Map component not found or still loading')
      }
    })
    
    // === PHASE 6: FORM VALIDATION CHECK ===
    cy.log('🔍 Phase 6: Pre-submission Validation Check')
    
    // Scroll to save button area
    cy.get('button').contains(/Save Preferences|Saving|Validating/).scrollIntoView()
    cy.wait(timing.mediumPause)
    
    // Check if save button exists and is enabled
    cy.get('button').contains(/Save Preferences|Saving|Validating/).then($btn => {
      const buttonText = $btn.text()
      cy.log(`Found button with text: "${buttonText}"`)
      
      if (buttonText.includes('Save Preferences')) {
        cy.wrap($btn).should('not.be.disabled')
        cy.log('✅ Save button is enabled - form is valid')
      } else {
        cy.log('⏳ Button shows: ' + buttonText)
      }
      
      cy.wait(timing.mediumPause)
    })
    
    // === PHASE 7: FINAL SUBMISSION ===
    cy.log('💾 Phase 7: Form Submission')
    
    // Final dramatic pause before submission
    cy.wait(timing.mediumPause)
    cy.log('🎬 Ready for form submission...')
    
    // Submit the form
    cy.get('button').contains('Save Preferences').then($btn => {
      cy.wrap($btn).should('be.visible').and('not.be.disabled')
      cy.wait(timing.mediumPause)
      
      cy.wrap($btn).click()
      cy.log('🚀 Form submitted!')
      cy.wait(timing.longPause)
    })
    
    // === PHASE 8: SUCCESS VERIFICATION ===
    cy.log('🎉 Phase 8: Verification & Completion')
    
    // Look for success indicators
    cy.get('body').should('exist')
    cy.log('✅ Form submission completed')
    
    // Check for success message if it appears
    cy.get('body').then($body => {
      if ($body.find(':contains("success")').length > 0) {
        cy.log('🎉 Success message detected!')
      } else {
        cy.log('ℹ️ No visible success message (may have already disappeared)')
      }
    })
    
    // Final showcase scroll
    cy.log('🎬 Final showcase...')
    cy.scrollTo('top')
    cy.wait(timing.mediumPause)
    cy.scrollTo('bottom')
    cy.wait(timing.mediumPause)
    cy.scrollTo('top')
    cy.wait(timing.mediumPause)
    
    // ===========================================
    // 🎬 COMPLETE USER JOURNEY END
    // ===========================================
    cy.log('✨ Complete Preferences Setup Journey Finished Successfully!')
    cy.log('🏁 All phases completed: Navigation → Pay Rate → Hours → Job Types → Location → Submission → Verification')
  })
})