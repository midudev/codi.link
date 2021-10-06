/* eslint-disable no-undef */
export const CheckImportSkypack = () => {
  describe('Check Skypack is importing correctly', () => {
    it('Import React and check that is imported in the JS', () => {
      cy.get('[data-action="show-skypack-bar"]').click()
      cy.get('#skypack-search-input').clear()
      cy.get('#skypack-search-input').type('react')
      cy.get(
        '[title="React is a JavaScript library for building user interfaces."]'
      ).click()
      cy.get('[style="top:16px;height:24px;"] > :nth-child(1) > .mtk22').should(
        'have.text',
        'React'
      )

      it('Type @ and get 0 results', () => {
        cy.get('#skypack-search-input').type('@')
        cy.get('.skypack-item').click()
        cy.get('.search-results-message').should(
          'have.text',
          '0 results for "@"'
        )
      })

      it('Import @Material-ui and check if the @ is imported', () => {
        cy.get('#skypack-search-input').type('@material')
        cy.get(':nth-child(1) > small').click()
        cy.get(
          '[style="top:16px;height:24px;"] > :nth-child(1) > .mtk22'
        ).should('have.text', 'MaterialUiCore')
      })
    })
  })
}
