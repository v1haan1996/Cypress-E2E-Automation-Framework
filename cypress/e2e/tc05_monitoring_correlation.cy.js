describe('TC-05 - Dashboard, Events and Alarms Correlation', () => {

    it('should correlate monitoring information across Dashboard, Events and Alarms', () => {

        cy.login()

        // Validate and dismiss the "What's new" modal
        cy.contains("What's new").should('be.visible')
        cy.contains('button', 'Got it').click()
        cy.contains("What's new").should('not.exist')

        // Validate Dashboard
        cy.url().should('not.include', '/login')

        cy.contains('h1', 'Dashboard')
            .should('be.visible')

        // Validate Recent Alarms section
        cy.contains('Recent alarms')
            .should('be.visible')

        // Capture the first Recent Alarm from Dashboard
        cy.contains('Recent alarms')
            .parents('.MuiCardContent-root')
            .find('li')
            .first()
            .within(() => {

                cy.get('a[href^="/devices/"]')
                    .invoke('text')
                    .then((text) => {
                        cy.wrap(text.trim()).as('dashboardAlarmDevice')
                    })

                cy.get('p')
                    .invoke('text')
                    .then((text) => {
                        cy.wrap(text.trim()).as('dashboardAlarmDetail')
                    })
            })

        // Navigate to Alarms
        cy.get('nav')
            .contains('a', 'Alarms')
            .click()

        cy.url().should('include', '/alarms')

        cy.contains('h1', 'Alarms')
            .should('be.visible')

        // Correlate Dashboard alarm with the Alarms table
        cy.get('@dashboardAlarmDevice').then((deviceName) => {

            cy.get('@dashboardAlarmDetail').then((alarmDetail) => {

                const detail = alarmDetail.toLowerCase()

                let expectedMeasurement

                if (detail.includes('power factor')) {
                    expectedMeasurement = 'Power factor'
                }
                else if (detail.includes('voltage thd')) {
                    expectedMeasurement = 'THD-V'
                }
                else if (detail.includes('current thd')) {
                    expectedMeasurement = 'THD-I'
                }

                expect(
                    expectedMeasurement,
                    `Supported alarm measurement from Dashboard detail: ${alarmDetail}`
                ).to.not.be.undefined

                cy.get('tbody tr')
                    .filter(`:contains("${deviceName}")`)
                    .filter(`:contains("${expectedMeasurement}")`)
                    .should('have.length.greaterThan', 0)
                    .first()
                    .within(() => {

                        cy.contains(deviceName)
                            .should('be.visible')

                        cy.contains(expectedMeasurement)
                            .should('be.visible')
                    })
            })
        })

        // Navigate to Events
        cy.get('nav')
            .contains('a', 'Events')
            .click()

        cy.url().should('include', '/events')

        cy.contains('h1', 'Power quality events')
            .should('be.visible')

        // Filter Events by the same device captured from Dashboard
        cy.get('@dashboardAlarmDevice').then((deviceName) => {

            cy.intercept('GET', '**/api/pq-events?*')
                .as('filteredEvents')

            cy.get('#pq-device-filter').click()

            cy.get('[role="option"]')
                .contains(deviceName)
                .click()

            cy.wait('@filteredEvents')
                .its('response.statusCode')
                .should('eq', 200)

            // Validate all returned events belong to the selected device
            cy.get('tbody tr')
                .should(($rows) => {

                    expect($rows.length).to.be.greaterThan(0)

                    $rows.each((index, row) => {
                        expect(row.innerText).to.include(deviceName)
                    })
                })

            // Validate filtered events are represented on the ITIC chart
            cy.contains(/events plotted/i)
                .should('be.visible')
        })
    })
})