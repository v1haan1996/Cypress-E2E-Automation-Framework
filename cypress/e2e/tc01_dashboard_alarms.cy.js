describe('TC-01 - Operator Login, Dashboard Monitoring and Alarm Navigation', () => {

    it('should authenticate the operator, validate dashboard monitoring, and navigate to alarms', () => {

        cy.login()

        // Validate and dismiss the "What's new" modal
        cy.contains("What's new").should('be.visible')
        cy.contains('button', 'Got it').click()
        cy.contains("What's new").should('not.exist')

        // Validate Total Devices
        cy.contains('h3', 'Total devices')
            .parents('.MuiCardContent-root')
            .within(() => {
                cy.get('p')
                    .invoke('text')
                    .should('match', /^\d+$/)
            })

        // Validate Active Alarms and severity breakdown
        cy.contains('h3', 'Active alarms')
            .parents('.MuiCardContent-root')
            .within(() => {
                cy.get('p')
                    .invoke('text')
                    .should('match', /^\d+$/)

                cy.contains(/\d+\s+critical,\s+\d+\s+warning/)
                    .should('be.visible')
            })

        // Validate Devices Out of Spec
        cy.contains('h3', 'Devices out of spec')
            .parents('.MuiCardContent-root')
            .within(() => {
                cy.get('p')
                    .invoke('text')
                    .should('match', /^\d+$/)

                cy.contains('Devices with at least one active alarm')
                    .should('be.visible')
            })

        // Validate Offline Devices
        cy.contains('h3', 'Offline devices')
            .parents('.MuiCardContent-root')
            .within(() => {
                cy.get('p')
                    .invoke('text')
                    .should('match', /^\d+$/)

                cy.contains('Not currently reporting')
                    .should('be.visible')
            })

        // Validate Live Voltage monitoring context
        cy.contains('h2', 'Live voltage')
            .parents('.MuiCardContent-root')
            .within(() => {
                cy.contains('MDP-01 Main Distribution')
                    .should('be.visible')

                cy.contains('last 60 minutes')
                    .should('be.visible')
            })

        // Validate Recent Alarms
        cy.contains('Recent alarms').should('be.visible')

        // Navigate from Recent Alarms to the Alarms page
        cy.contains('a[href="/alarms"]', 'View all').click()

        cy.url().should('include', '/alarms')
        cy.contains('h1', 'Alarms').should('be.visible')
    })
})