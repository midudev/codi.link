import { css } from 'lit'

export const CodiEditorStyles = css`
    :host {
      position: relative;
      overflow: hidden;
    }

    :host::after {
      content: '';
      position: absolute;
      background-repeat: no-repeat;
      right: 16px;
      bottom: 16px;
      z-index: 1;
      width: 48px;
      height: 48px;
    }
    `
