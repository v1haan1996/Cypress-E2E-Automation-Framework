describe('TC-02 - Device Discovery, Search, Filtering and Navigation', () => {

    it('should allow the operator to discover, filter, validate, and navigate devices', () => {

        const deviceName = 'MCC-10 Press Line Feeder'
        const deviceId = '10'
        const deviceLocation = 'Building B - Production'
        const deviceStatus = 'Warning'

        cy.login()

        // Validate and dismiss the "What's new" modal
        cy.contains("What's new").should('be.visible')
        cy.contains('button', 'Got it').click()
        cy.contains("What's new").should('not.exist')

        // Navigate to Devices
        cy.contains('a', 'Devices').click()

        cy.url().should('include', '/devices')
        cy.contains('h1', 'Devices').should('be.visible')

        // Search for a specific device
        cy.get('#device-search').type(deviceName)

        // Validate search result
        cy.get('tbody tr')
            .should('have.length', 1)
            .and('contain.text', deviceName)

        // Filter by device status
        cy.get('#device-status-filter').click()

        cy.get(`[role="option"][data-value="${deviceStatus}"]`).click()

        // Validate filtered result
        cy.get('tbody tr')
            .should('have.length', 1)
            .and('contain.text', deviceName)
            .and('contain.text', deviceStatus)

        // Validate important device information
        cy.get('tbody tr').within(() => {

            cy.contains(deviceName).should('be.visible')

            cy.contains(deviceLocation).should('be.visible')

            cy.contains(deviceStatus).should('be.visible')

            cy.get('td')
                .eq(3)
                .invoke('text')
                .should('match', /^\d+$/)
        })

        // Capture the device's Active Alarms count for cross-page validation
        cy.get('tbody tr')
            .find('td')
            .eq(3)
            .invoke('text')
            .then((alarmCount) => {
                cy.wrap(alarmCount.trim()).as('deviceActiveAlarmCount')
            })

        // Open Device Details - lightweight validation only
        cy.get(
            `[data-cy="device-row"][data-device-id="${deviceId}"]`
        ).click()

        cy.url().should('include', `/devices/${deviceId}`)

        cy.contains('h1', deviceName).should('be.visible')

        // Return to Devices
        cy.get('a[href="/devices"]').first().click()

        cy.url().should('include', '/devices')

        // Navigate to Alarms
        cy.get('a[href="/alarms"]').click()

        cy.url().should('include', '/alarms')

        cy.contains('h1', 'Alarms').should('be.visible')

        // Filter alarms by the same device
        cy.get('#alarm-device-filter').click()

        cy.get('[role="option"]')
            .contains(deviceName)
            .click()

        // Intercept the exact request triggered by Status = Active
        cy.intercept({
            method: 'GET',
            pathname: '/api/events',
            query: {
                deviceId: deviceId,
                status: 'Active'
            }
        }).as('activeDeviceAlarms')

        // Filter by Active status
        cy.get('#alarm-status-filter').click()

        cy.get('[role="option"]')
            .contains('Active')
            .click()

        // Wait for filtered API response
        cy.wait('@activeDeviceAlarms')
            .its('response.statusCode')
            .should('eq', 200)

        // Validate visible rows belong to the device and are Active
        cy.get('tbody tr')
            .filter(`:contains("${deviceName}")`)
            .each(($row) => {
                cy.wrap($row)
                    .should('contain.text', deviceName)
                    .and('contain.text', 'Active')
            })

        // Validate Devices-page Active Alarm count
        // matches Alarms-page filtered total
        cy.get('@deviceActiveAlarmCount').then((deviceAlarmCount) => {

            cy.get('.MuiTablePagination-displayedRows')
                .should(($pagination) => {

                    const paginationText = $pagination.text()
                    const match = paginationText.match(/of\s+(\d+)/)

                    expect(match).to.not.be.null

                    const alarmTotal = match[1]

                    expect(alarmTotal).to.equal(deviceAlarmCount)
                })
        })
    })
})