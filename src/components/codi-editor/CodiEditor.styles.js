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
    width: 36px;
    height: 36px;
    object-fit: contain;
    object-position: center;
    pointer-events: none;
  }

  slot:hover + img {
   opacity: 0.2;
  }
  
   slot:focus-within + img {
    opacity: 0.1;
  }
  

  @media (max-width: 650px) {
    :host::after {
      left: 16px;
      right: unset;
    }
  }
`
