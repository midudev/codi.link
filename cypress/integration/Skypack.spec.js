import { beforeEachTest, afterEachTest } from './helper'
/* eslint-disable no-undef */

const CheckImportSkypack = () => {
  beforeEachTest()
  afterEachTest()
  return describe('Check Skypack is importing correctly', () => {
    it('Import package and check that is imported in the JS', () => {
      cy.get('[data-action="show-skypack-bar"]').click()
      cy.get('#skypack-search-input').type('midudev')
      cy.get(
        '[title="Spinning Progress Indicator Custom Element"]'
      ).click()
      return cy.get('codi-editor').contains('MidudevWcSpinningProgress')
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
  })
}

CheckImportSkypack()
