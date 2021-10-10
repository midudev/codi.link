import { css } from 'lit'

const TextFieldStyles = css`
:host {
    display: flex;
    background-color: var(--bgc-input);
    border: 1px solid var(--bdc-input);
    color: var(--c-input);
    padding: .5em;
    margin-top: 16px;
    font-size: 1rem;
}

::slotted(svg) {
    fill: rgba(128, 128, 128, 0.50);
}
      
:host input {
    width: 100%;
    padding: .05em;
    padding-left: 8px;
    border: none;
    background-color: transparent;
    outline: none;
    color: var(--c-input);
}
`

export default TextFieldStyles
