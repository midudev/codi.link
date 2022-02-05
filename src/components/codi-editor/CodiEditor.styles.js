import { css } from 'lit'

export const CodiEditorStyles = css`
  :host {
    position: relative;
    overflow: hidden;
  }

  img {
    position: absolute;
    right: 16px;
    bottom: 16px;
    z-index: 1;
    width: 48px;
    height: 48px;
    object-fit: contain;
    object-position: center;
    pointer-events: none;
  }

  @media (max-width: 650px) {
    :host::after {
      left: 16px;
      right: unset;
    }
  }
`
