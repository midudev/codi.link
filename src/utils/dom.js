export const $ = (selector, context = document) =>
  context.querySelector(selector)

export const $$ = (selector, context = document) =>
  context.querySelectorAll(selector)
