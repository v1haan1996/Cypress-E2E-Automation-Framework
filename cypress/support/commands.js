Cypress.Commands.add('login', () => {

    cy.visit('https://testapp.andresfloresv.com/login')

    cy.env(['username', 'password']).then(({ username, password }) => {

        expect(Boolean(username), 'username is loaded').to.be.true
        expect(Boolean(password), 'password is loaded').to.be.true

        cy.get('#username')
            .type(username)

        cy.get('#password')
            .type(password, { log: false })

        cy.get('button[type="submit"]')
            .click()

        cy.url()
            .should('not.include', '/login')
    })
})