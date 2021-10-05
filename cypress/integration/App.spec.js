/* eslint-disable no-undef */
import { CheckImportSkypack } from './Skypack.spec'

beforeEach(() => {
  cy.visit('http://localhost:3000/')
})

CheckImportSkypack()
