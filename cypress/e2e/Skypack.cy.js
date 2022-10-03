/* eslint-disable no-undef */

import { beforeEachTest, afterEachTest } from './helper.cy'

const CheckImportSkypack = () => {
  beforeEachTest()
  afterEachTest()
  return describe('Check Skypack is importing correctly', () => {
    it('Import React and check that is imported in the JS', () => {
      cy.get('[data-action="show-skypack-bar"]').click()
      cy.get('#skypack-search-input').type('react')
      cy.get(
        '[title="React is a JavaScript library for building user interfaces."]'
      ).click({ force: true })
      return cy.get('[class="mtk22"]').should('have.text', 'React')
    })
    it('Type @ and get 0 results', () => {
      cy.get('[data-action="show-skypack-bar"]').click()
      cy.get('#skypack-search-input').type('@')
      cy.get('.skypack-item').click({ force: true })
      return cy.get('.search-results-message').should(
        'have.text',
        '0 results for "@"'
      )
    })
    it('Import @angular/material and check if the @ is imported', () => {
      cy.get('[data-action="show-skypack-bar"]').click()
      cy.get('#skypack-search-input').type('angular material')
      cy.get('.search-results .extensions ul li:first').click({ force: true })
      return cy.get('[class="mtk22"]').should('have.text', 'AngularMaterial')
    })
  })
}

CheckImportSkypack()
