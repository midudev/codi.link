import { beforeEachTest, afterEachTest } from './helper'
/* eslint-disable no-undef */

const CheckImportSkypack = () => {
  beforeEachTest()
  afterEachTest()
  return describe('Check Skypack is importing correctly', () => {
    it('Import React and check that is imported in the JS', () => {
      cy.get('[data-action="show-skypack-bar"]').click()
      cy.get('#skypack-search-input').type('react')
      cy.get(
        '[title="React is a JavaScript library for building user interfaces."]'
      ).click()
      return cy.get('[class="mtk22"]').should('have.text', 'React')
    })
    it('Type @ and get 0 results', () => {
      cy.get('[data-action="show-skypack-bar"]').click()
      cy.get('#skypack-search-input').type('@')
      cy.get('.skypack-item').click()
      return cy.get('.search-results-message').should(
        'have.text',
        '0 results for "@"'
      )
    })
    it('Import @Material-ui and check if the @ is imported', () => {
      cy.get('[data-action="show-skypack-bar"]').click()
      cy.get('#skypack-search-input').type('@material')
      cy.get('.search-results .extensions ul li:first').click()
      return cy.get('[class="mtk22"]').should('have.text', 'MaterialUiCore')
    })
  })
}

CheckImportSkypack()
