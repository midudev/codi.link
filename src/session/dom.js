import { $, $$ } from '../utils/dom'

export const liveShareBar = $('#live-share')
export const buttons = $$('button', liveShareBar)
export const joinForm = $('#join-form')
export const sessionInput = $('input[data-for=join-session]')
export const contents = $$('.live-share-content', liveShareBar)
export const sessionId = $('span[data-for=session-id]')
export const participantsQuantity = $('span[data-for=session-participants]')
export const participantsList = $('.participants-list')
export const sessionDetails = $('.session-details')
export const sessionIdLi = $('.session-id')

export const dotSVG = '<svg xmlns="http://www.w3.org/2000/svg" class="participant-color" aria-hidden="true" viewBox="4 4 8 8"><path d="M8 4c.367 0 .721.048 1.063.145a3.943 3.943 0 0 1 1.762 1.031 3.944 3.944 0 0 1 1.03 1.762c.097.34.145.695.145 1.062 0 .367-.048.721-.145 1.063a3.94 3.94 0 0 1-1.03 1.765 4.017 4.017 0 0 1-1.762 1.031C8.72 11.953 8.367 12 8 12s-.721-.047-1.063-.14a4.056 4.056 0 0 1-1.765-1.032A4.055 4.055 0 0 1 4.14 9.062 3.992 3.992 0 0 1 4 8c0-.367.047-.721.14-1.063a4.02 4.02 0 0 1 .407-.953A4.089 4.089 0 0 1 5.98 4.546a3.94 3.94 0 0 1 .957-.401A3.89 3.89 0 0 1 8 4z" fill="currentColor"/></svg>'
export const closeSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="currentColor"><path d="M8 8.707l3.646 3.647l.708-.707L8.707 8l3.647-3.646l-.707-.708L8 7.293L4.354 3.646l-.707.708L7.293 8l-3.646 3.646l.707.708L8 8.707z"/></g></svg>'

export const toggleSessionID = (value) => {
  value ? sessionIdLi.setAttribute('hidden', '') : sessionIdLi.removeAttribute('hidden')
}
