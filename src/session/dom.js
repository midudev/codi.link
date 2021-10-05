import { $, $$ } from '../utils/dom'

export const liveShareBar = $('#live-share')
export const buttons = $$('button', liveShareBar)
export const joinForm = $('#join-form')
export const sessionInput = $('input[data-for=join-session]')
export const usernameInput = $('input[data-for=session-user]')
export const contents = $$('.live-share-content', liveShareBar)
export const sessionId = $('span[data-for=session-id]')
export const participantsQuantity = $('span[data-for=session-participants]')
export const participantsList = $('.participants-list')
