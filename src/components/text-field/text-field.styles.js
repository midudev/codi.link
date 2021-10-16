import { css } from 'lit'

const TextFieldStyles = css`
:host {
    display: flex;
    background-color: var(--input-background);
    border: 1px solid var(--input-border-color);
    color: var(--input-color);
    padding: .5em;
    margin-top: 16px;
    font-size: 1rem;
}

::slotted(svg) {
    fill: rgba(128, 128, 128, 0.50);
}
      
:host input {
    width: 100%;
    padding: 0 0.5rem;
    border: none;
    background-color: transparent;
    outline: none;
    color: var(--input-color);
}
`

export default TextFieldStyles
