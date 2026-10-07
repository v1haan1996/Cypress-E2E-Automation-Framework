describe('TC-03 - Power Quality Event Investigation', () => {

    it('should allow the operator to investigate a power quality event', () => {

        const eventTypeFilter = 'Sag'

        cy.login()

        // Validate and dismiss the "What's new" modal
        cy.contains("What's new").should('be.visible')
        cy.contains('button', 'Got it').click()
        cy.contains("What's new").should('not.exist')

        // Navigate to Events
        cy.contains('a', 'Events').click()

        cy.url().should('include', '/events')
        cy.contains('h1', 'Power quality events').should('be.visible')

        // Filter events by type
        cy.get('#pq-type-filter').click()

        cy.get('[role="option"]')
            .contains(eventTypeFilter)
            .click()

        // Validate that Sag events are returned
        cy.get('tbody tr')
            .filter(`:contains("${eventTypeFilter}")`)
            .should('have.length.greaterThan', 0)

        cy.get('tbody tr')
            .filter(`:contains("${eventTypeFilter}")`)
            .each(($row) => {
                cy.wrap($row).should('contain.text', eventTypeFilter)
            })

        // Capture details from the first Sag event
        cy.get('tbody tr')
            .filter(`:contains("${eventTypeFilter}")`)
            .first()
            .within(() => {

                cy.get('td').eq(1).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('eventDevice')
                })

                cy.get('td').eq(2).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('eventType')
                })

                cy.get('td').eq(3).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('eventMagnitude')
                })

                cy.get('td').eq(4).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('eventDuration')
                })

                cy.get('td').eq(5).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('eventCategory')
                })

                cy.get('td').eq(6).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('eventPhases')
                })

                cy.get('td').eq(7).invoke('text').then((text) => {
                    cy.wrap(text.trim()).as('eventITIC')
                })
            })

        // Open the selected event
        cy.get('tbody tr')
            .filter(`:contains("${eventTypeFilter}")`)
            .first()
            .click()

        cy.url().should('not.eq', 'https://testapp.andresfloresv.com/events')

        // Validate that the correct event was opened
        cy.get('@eventType').then((eventType) => {

            cy.get('@eventDevice').then((eventDevice) => {

                cy.contains('h1', `${eventType} on ${eventDevice}`)
                    .should('be.visible')
            })
        })

        // Validate Magnitude consistency
        cy.get('@eventMagnitude').then((eventMagnitude) => {

            const magnitudeValue = eventMagnitude
                .replace('%', '')
                .trim()

            cy.contains('Magnitude')
                .parents('.MuiCardContent-root')
                .should('contain.text', magnitudeValue)
        })

        // Validate Duration consistency
        cy.get('@eventDuration').then((eventDuration) => {

            const durationValue = eventDuration
                .split('(')[0]
                .trim()

            cy.contains('Duration')
                .parents('.MuiCardContent-root')
                .should('contain.text', durationValue)
        })

        // Validate Category consistency
        cy.get('@eventCategory').then((eventCategory) => {

            cy.contains('Category')
                .parents('.MuiCardContent-root')
                .should('contain.text', eventCategory)
        })

        // Validate Affected Phases consistency
        cy.get('@eventPhases').then((eventPhases) => {

            cy.contains('Affected phases')
                .parents('.MuiCardContent-root')
                .should('contain.text', eventPhases)
        })

        // Validate ITIC Result consistency
        cy.get('@eventITIC').then((eventITIC) => {

            cy.contains('ITIC result')
                .parents('.MuiCardContent-root')
                .should('contain.text', eventITIC)
        })

        // Validate RMS disturbance section
        cy.contains('RMS voltage through the disturbance')
            .should('be.visible')

        cy.contains('Per-phase RMS at 8.3 ms resolution')
            .should('be.visible')

        // Validate all three phase series are represented in the chart
        cy.get('.recharts-legend-wrapper').within(() => {

            cy.contains('L1').should('be.visible')
            cy.contains('L2').should('be.visible')
            cy.contains('L3').should('be.visible')
        })

        // Navigate back to Events
        cy.get('a[href="/events"]')
            .contains('Back to events')
            .click()

        cy.url().should('include', '/events')

        cy.contains('h1', 'Power quality events')
            .should('be.visible')
    })
})