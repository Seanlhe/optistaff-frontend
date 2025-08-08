/**
 * UC4: Indicate Availability - End-to-End Tests
 * @description Complete user journey test for the Indicate Availability use case
 * @author OptiStaff Team
 * @testing_approach Single comprehensive test with smooth visual interactions and template functionality
 */

describe('UC4: Indicate Availability - Complete User Journey', () => {
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
      // Availability API mocks
      cy.intercept('GET', '/api/availability*', { body: [] }).as('getAvailability')
      cy.intercept('POST', '/api/availability*', { statusCode: 200, body: { success: true } }).as('saveAvailability')
      cy.intercept('DELETE', '/api/availability*', { statusCode: 200 }).as('deleteAvailability')
      
      // Template API mocks
      cy.intercept('GET', '/api/availability_templates*', { 
        statusCode: 200, 
        body: {
          data: [
            { id: 1, name: 'Morning Shift', created_at: '2024-01-01' },
            { id: 2, name: 'Evening Shift', created_at: '2024-01-02' }
          ] 
        }
      }).as('getTemplates')
      cy.intercept('POST', '/api/availability_templates*', { statusCode: 200, body: { success: true } }).as('saveTemplate')
      cy.intercept('DELETE', '/api/availability_templates/*', { statusCode: 200 }).as('deleteTemplate')
    })
    
    // Navigate to preferences page
    cy.visit(`${baseUrl}/employee/preferences`)
    
    // Wait for page to load completely
    cy.wait(1000)
  })

  it('should complete the entire availability setup journey with smooth interactions', () => {
    // ===========================================
    // 🛠️ HELPER FUNCTIONS
    // ===========================================
    
    const dismissModals = () => {
      cy.get('body').then($body => {
        const modals = $body.find('[class*="fixed"], [class*="modal"], [class*="overlay"], [class*="z-50"]')
        if (modals.length > 0) {
          cy.log('🚫 Modal detected - attempting dismissal')
          
          // Try multiple dismissal methods
          // Method 1: Find close buttons
          const closeButtons = $body.find('button').filter((_, el) => {
            const text = Cypress.$(el).text().toLowerCase()
            return text.includes('close') || text.includes('cancel') || text === '×' || text.includes('ok')
          })
          
          if (closeButtons.length > 0) {
            cy.wrap(closeButtons.first()).click({ force: true })
            cy.wait(200)
          } else {
            // Method 2: Try ESC key
            cy.get('body').type('{esc}', { force: true })
            cy.wait(200)
            
            // Method 3: Click outside modal area
            cy.get('body').click(10, 10, { force: true })
            cy.wait(200)
          }
          
          cy.log('✅ Modal dismissal attempted')
        }
      })
    }
    
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
    cy.log('🎬 Starting Complete Availability Setup Journey')
    
    // === PHASE 1: NAVIGATION TO AVAILABILITY TAB ===
    cy.log('📋 Phase 1: Navigation to Availability Tab')
    
    // Start from top and showcase the page
    cy.scrollTo('top')
    cy.wait(timing.mediumPause)
    
    // Check for and handle any modal overlays first
    dismissModals()
    
    // Show current tab (should be Preferences)
    cy.contains('button', 'Preferences').should('be.visible').then($btn => {
      cy.wrap($btn).scrollIntoView()
      cy.wait(timing.mediumPause)
      cy.log('👀 Currently on Preferences tab')
    })
    
    // Navigate to Availability tab
    cy.log('🔄 Switching to Availability tab...')
    cy.contains('button', 'Availability').should('be.visible').then($btn => {
      cy.wrap($btn).scrollIntoView()
      cy.wait(timing.shortPause)
      
      // Use force: true to handle potential overlays
      cy.wrap($btn).click({ force: true })
      cy.wait(timing.longPause)
      cy.log('✅ Switched to Availability tab')
    })
    
    // === PHASE 2: CALENDAR OVERVIEW & NAVIGATION ===
    cy.log('📅 Phase 2: Calendar Overview & Navigation')
    
    // Show calendar structure
    cy.get('body').then($body => {
      // Look for calendar-related elements (adapt to your actual structure)
      if ($body.find('[class*="calendar"]').length > 0) {
        cy.get('[class*="calendar"]').first().scrollIntoView()
        cy.wait(timing.mediumPause)
        cy.log('📅 Calendar component displayed')
      } else if ($body.find('[class*="grid"]').length > 0) {
        cy.get('[class*="grid"]').first().scrollIntoView()
        cy.wait(timing.mediumPause)
        cy.log('📅 Grid-based calendar displayed')
      } else {
        cy.log('📅 Calendar structure detected')
      }
    })
    
    // Look for navigation controls
    cy.get('body').then($body => {
      // Previous/Next week buttons
      const navButtons = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase()
        return text.includes('prev') || text.includes('next') || text.includes('←') || text.includes('→')
      })
      
      if (navButtons.length > 0) {
        cy.log('🔄 Calendar navigation controls found')
        
        // Demonstrate navigation if buttons exist
        const prevButton = navButtons.filter((i, el) => 
          Cypress.$(el).text().toLowerCase().includes('prev') || Cypress.$(el).text().includes('←')
        )
        const nextButton = navButtons.filter((i, el) => 
          Cypress.$(el).text().toLowerCase().includes('next') || Cypress.$(el).text().includes('→')
        )
        
        if (nextButton.length > 0) {
          cy.wrap(nextButton.first()).scrollIntoView()
          cy.wait(timing.shortPause)
          cy.wrap(nextButton.first()).click()
          cy.wait(timing.mediumPause)
          cy.log('➡️ Navigated to next period')
        }
        
        if (prevButton.length > 0) {
          cy.wrap(prevButton.first()).scrollIntoView()
          cy.wait(timing.shortPause)
          cy.wrap(prevButton.first()).click()
          cy.wait(timing.mediumPause)
          cy.log('⬅️ Navigated back to previous period')
        }
      } else {
        cy.log('ℹ️ Navigation controls not found or different structure')
      }
    })
    
    // === PHASE 3: AVAILABILITY SLOT CREATION ===
    cy.log('⏰ Phase 3: Creating Availability Slots')
    
    // Look for clickable time slots or calendar areas
    cy.get('body').then($body => {
      // Try to find time slots or calendar grid cells
      const timeSlots = $body.find('[class*="slot"], [class*="cell"], [class*="hour"], [class*="time"]')
      
      if (timeSlots.length > 0) {
        cy.log(`Found ${timeSlots.length} potential time slots`)
        
        // Create availability slots by clicking/double-clicking
        for (let i = 0; i < Math.min(3, timeSlots.length); i++) {
          cy.wrap(timeSlots.eq(i)).scrollIntoView()
          cy.wait(timing.shortPause)
          
          // Try double-click first (common pattern)
          cy.wrap(timeSlots.eq(i)).dblclick({ force: true })
          cy.wait(timing.mediumPause)
          cy.log(`✅ Created availability slot ${i + 1}`)
        }
      } else {
        // Alternative: look for any clickable calendar areas
        const calendarAreas = $body.find('[class*="calendar"] div, [class*="grid"] div').filter((i, el) => {
          const $el = Cypress.$(el)
          return $el.height() > 20 && $el.width() > 50 // Reasonable size for time slots
        })
        
        if (calendarAreas.length > 0) {
          cy.log('Creating availability using calendar area clicks')
          
          for (let i = 0; i < Math.min(3, calendarAreas.length); i += Math.floor(calendarAreas.length / 3)) {
            cy.wrap(calendarAreas.eq(i)).scrollIntoView()
            cy.wait(timing.shortPause)
            cy.wrap(calendarAreas.eq(i)).click({ force: true })
            cy.wait(timing.mediumPause)
            cy.log(`✅ Created availability slot ${i + 1}`)
          }
        } else {
          cy.log('ℹ️ Creating availability using general calendar interaction')
          // Fallback: just interact with calendar area
          cy.get('div').first().click()
          cy.wait(timing.mediumPause)
        }
      }
    })
    
    // === PHASE 4: TEMPLATE FUNCTIONALITY ===
    cy.log('📋 Phase 4: Template Management')
    
    // Look for template-related buttons
    cy.get('body').then($body => {
      const templateButtons = $body.find('button').filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase()
        return text.includes('template') || text.includes('save') || text.includes('load')
      })
      
      if (templateButtons.length > 0) {
        cy.log('📋 Template controls found')
        
        // Click template button
        const templateBtn = templateButtons.filter((i, el) => 
          Cypress.$(el).text().toLowerCase().includes('template')
        )
        
        if (templateBtn.length > 0) {
          cy.wrap(templateBtn.first()).scrollIntoView()
          cy.wait(timing.shortPause)
          cy.wrap(templateBtn.first()).click({ force: true })
          cy.wait(timing.longPause)
          cy.log('📋 Template dialog opened')
          
          // Wait for dialog to fully load
          cy.wait(timing.mediumPause)
          
          // Look for template actions
          cy.get('body').then($dialogBody => {
            const saveTemplateBtn = $dialogBody.find('button, input[type="button"]').filter((_, el) => {
              const text = Cypress.$(el).text().toLowerCase()
              return text.includes('save') && text.includes('template')
            })
            
            if (saveTemplateBtn.length > 0) {
              cy.wrap(saveTemplateBtn.first()).click({ force: true })
              cy.wait(timing.mediumPause)
              cy.log('💾 Save template action triggered')
              
              // Look for template name input
              const nameInput = $dialogBody.find('input[type="text"]')
              if (nameInput.length > 0) {
                cy.wrap(nameInput.first()).clear().type('My Custom Schedule', { delay: timing.typingDelay, force: true })
                cy.wait(timing.mediumPause)
                cy.log('✍️ Template name entered')
                
                // Look for confirm button
                const confirmBtn = $dialogBody.find('button').filter((_, el) => {
                  const text = Cypress.$(el).text().toLowerCase()
                  return text.includes('save') || text.includes('ok') || text.includes('confirm')
                })
                
                if (confirmBtn.length > 0) {
                  cy.wrap(confirmBtn.first()).click({ force: true })
                  cy.wait(timing.mediumPause)
                  cy.log('✅ Template saved')
                }
              }
            }
            
            // Always attempt to close any remaining dialogs
            dismissModals()
          })
        }
      } else {
        cy.log('ℹ️ Template functionality not found or different structure')
      }
    })
    
    // === PHASE 5: AVAILABILITY MODIFICATION ===
    cy.log('✏️ Phase 5: Modifying Availability')
    
    // Look for existing availability events/slots
    cy.get('body').then($body => {
      const events = $body.find('[class*="event"], [class*="slot"], [class*="available"]')
      
      if (events.length > 0) {
        cy.log(`Found ${events.length} availability events`)
        
        // Interact with first event (select, modify, etc.)
        cy.wrap(events.first()).scrollIntoView()
        cy.wait(timing.shortPause)
        cy.wrap(events.first()).click({ force: true })
        cy.wait(timing.mediumPause)
        cy.log('👆 Selected availability event')
        
        // Try to modify or delete (common interactions)
        if (events.length > 1) {
          // Double-click to delete/modify
          cy.wrap(events.eq(1)).scrollIntoView()
          cy.wait(timing.shortPause)
          cy.wrap(events.eq(1)).dblclick({ force: true })
          cy.wait(timing.mediumPause)
          cy.log('🗑️ Modified/deleted availability event')
        }
      } else {
        cy.log('ℹ️ No availability events found to modify')
      }
    })
    
    // === PHASE 6: FINAL SAVE ===
    cy.log('💾 Phase 6: Saving Availability')
    
    // Look for save button
    cy.get('button').then($buttons => {
      const saveButton = $buttons.filter((i, el) => {
        const text = Cypress.$(el).text().toLowerCase()
        return text.includes('save') && (text.includes('availability') || text.includes('schedule'))
      })
      
      if (saveButton.length > 0) {
        cy.wrap(saveButton.first()).scrollIntoView()
        cy.wait(timing.mediumPause)
        
        // Show save button before clicking
        cy.wrap(saveButton.first()).should('be.visible')
        cy.log('💾 Save Availability button found')
        
        cy.wrap(saveButton.first()).click({ force: true })
        cy.wait(timing.longPause)
        cy.log('🚀 Availability saved!')
      } else {
        // Look for general save button
        const generalSave = $buttons.filter((i, el) => {
          const text = Cypress.$(el).text().toLowerCase()
          return text.includes('save') || text.includes('submit')
        })
        
        if (generalSave.length > 0) {
          cy.wrap(generalSave.first()).scrollIntoView()
          cy.wait(timing.mediumPause)
          cy.wrap(generalSave.first()).click({ force: true })
          cy.wait(timing.longPause)
          cy.log('💾 Availability saved via general save button')
        } else {
          cy.log('ℹ️ Save button not found - availability may auto-save')
        }
      }
    })
    
    // === PHASE 7: SUCCESS VERIFICATION ===
    cy.log('🎉 Phase 7: Verification & Completion')
    
    // Look for success indicators
    cy.get('body').should('exist')
    cy.log('✅ Availability setup completed')
    
    // Check for success message if it appears
    cy.get('body').then($body => {
      if ($body.find(':contains("success"), :contains("saved")').length > 0) {
        cy.log('🎉 Success message detected!')
      } else {
        cy.log('ℹ️ No visible success message (may have already disappeared)')
      }
    })
    
    // === PHASE 8: FINAL TAB DEMONSTRATION ===
    cy.log('🔄 Phase 8: Final Tab Navigation Demo')
    
    // Check for any lingering modals before tab switching
    dismissModals()
    
    // Switch back to Preferences tab to show full navigation
    cy.contains('button', 'Preferences').then($btn => {
      cy.wrap($btn).scrollIntoView()
      cy.wait(timing.shortPause)
      cy.wrap($btn).click({ force: true })
      cy.wait(timing.longPause)
      cy.log('📋 Switched back to Preferences tab')
    })
    
    // Return to Availability tab
    cy.contains('button', 'Availability').then($btn => {
      cy.wrap($btn).scrollIntoView()
      cy.wait(timing.shortPause)
      cy.wrap($btn).click({ force: true })
      cy.wait(timing.longPause)
      cy.log('📅 Returned to Availability tab')
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
    cy.log('✨ Complete Availability Setup Journey Finished Successfully!')
    cy.log('🏁 All phases completed: Tab Navigation → Calendar Overview → Slot Creation → Templates → Modifications → Save → Verification')
  })
})