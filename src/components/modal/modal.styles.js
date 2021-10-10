import { css } from 'lit'

const ModalStyles = css`
:host {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0, 0, 0, .48);
    z-index: 1;
}

:host .modal {
    position: absolute;
    min-height: 200px;
    min-width: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #2d323c;
    z-index: 1;
    color: #c5c5c5;
}

:host .modal .modal-header, :host .modal-content {
    padding: 1rem;
}

:host .modal .modal-header {
    border-bottom: 1px solid rgb(28 28 28);
}

:host .modal .modal-header * {
    margin: 0;
}
`

export default ModalStyles
