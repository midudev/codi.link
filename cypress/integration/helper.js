/* eslint-disable no-undef */
export const beforeEachTest = () => {
  return beforeEach(() => {
    cy.visit('http://localhost:3000', { timeout: 10000 })
  })
}

export const afterEachTest = () => {
  afterEach(() => {

  })
}
