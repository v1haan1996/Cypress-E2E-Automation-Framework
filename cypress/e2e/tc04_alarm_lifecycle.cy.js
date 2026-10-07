describe('TC-04 - Alarm Investigation and Lifecycle', () => {

    it('should allow the operator to investigate, acknowledge, and resolve an active alarm', () => {

        cy.login()

        // Validate and dismiss the "What's new" modal
        cy.contains("What's new").should('be.visible')
        cy.contains('button', 'Got it').click()
        cy.contains("What's new").should('not.exist')

        // Navigate to Alarms
        cy.get('nav')
            .contains('a', 'Alarms')
            .click()

        cy.url().should('include', '/alarms')
        cy.contains('h1', 'Alarms').should('be.visible')

        // Filter to Active alarms
        cy.intercept({
            method: 'GET',
            pathname: '/api/events',
            query: {
                status: 'Active'
            }
        }).as('activeAlarms')

        cy.get('#alarm-status-filter').click()

        cy.get('[role="option"]')
            .contains('Active')
            .click()

        cy.wait('@activeAlarms')
            .its('response.statusCode')
            .should('eq', 200)

        // Capture details from the first Active alarm
        cy.get('tbody tr')
            .filter(':contains("Active")')
            .first()
            .within(() => {

                cy.get('td').eq(3).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('alarmDevice')
                })

                cy.get('td').eq(4).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('alarmSeverity')
                })

                cy.get('td').eq(5).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('alarmStatus')
                })

                cy.get('td').eq(6).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('alarmMeasurement')
                })
            })

        // Capture unique alarm ID
        cy.get('[data-cy="alarm-row"]')
            .filter(':contains("Active")')
            .first()
            .invoke('attr', 'data-alarm-id')
            .then((alarmId) => {
                cy.wrap(alarmId).as('alarmId')
            })

        // Expand the alarm
        cy.get('tbody tr')
            .filter(':contains("Active")')
            .first()
            .within(() => {
                cy.get('[data-cy="expand-row"]').click()
            })

        // Validate expanded state
        cy.get('tbody tr')
            .filter(':contains("Active")')
            .first()
            .find('[data-cy="expand-row"]')
            .should('have.attr', 'aria-expanded', 'true')

        // Validate initial alarm details
        cy.get('@alarmMeasurement').then((alarmMeasurement) => {

            cy.contains('Alarm detail')
                .parent()
                .should('contain.text', alarmMeasurement)

            cy.contains('Not acknowledged')
                .should('be.visible')

            cy.contains('Not resolved')
                .should('be.visible')
        })

        // Acknowledge the alarm
        cy.intercept('PATCH', '/api/events/*').as('acknowledgeAlarm')

        cy.get('tbody tr')
            .filter(':contains("Active")')
            .first()
            .within(() => {
                cy.get('[data-cy="ack-button"]')
                    .should('be.visible')
                    .click()
            })

        cy.wait('@acknowledgeAlarm')
            .its('response.statusCode')
            .should('eq', 200)

        // Change status filter to All
        cy.intercept({
            method: 'GET',
            pathname: '/api/events',
            query: {
                status: 'All'
            }
        }).as('allAlarms')

        cy.get('#alarm-status-filter').click()

        cy.get('[role="option"]')
            .contains('All')
            .click()

        cy.wait('@allAlarms')
            .its('response.statusCode')
            .should('eq', 200)

        // Find the same alarm again by ID
        cy.get('@alarmId').then((alarmId) => {

            cy.get(`[data-cy="alarm-row"][data-alarm-id="${alarmId}"]`)
                .should('exist')
                .and('contain.text', 'Acknowledged')
        })

        // Validate acknowledged alarm is not yet resolved
        cy.contains('Alarm detail')
            .parent()
            .should('contain.text', 'Acknowledged')
            .and('contain.text', 'Not resolved')

        // Resolve the same alarm
        cy.intercept('PATCH', '/api/events/*').as('resolveAlarm')

        cy.get('@alarmId').then((alarmId) => {

            cy.get(`[data-cy="alarm-row"][data-alarm-id="${alarmId}"]`)
                .within(() => {
                    cy.get('[data-cy="resolve-button"]')
                        .should('be.visible')
                        .click()
                })
        })

        cy.wait('@resolveAlarm')
            .its('response.statusCode')
            .should('eq', 200)

        // Validate resolved status
        cy.get('@alarmId').then((alarmId) => {

            cy.get(`[data-cy="alarm-row"][data-alarm-id="${alarmId}"]`)
                .should('contain.text', 'Resolved')
        })

        cy.contains('Alarm detail')
            .parent()
            .should('contain.text', 'Resolved')
            .and('not.contain.text', 'Not resolved')
    })
})