import { css } from 'lit'

const ShareStyles = css`
:host codi-text-field#project-url {
    max-width: 50%;
    margin: auto;
}

:host {
    --input-color: gray;
}

:host h4 {
    text-align: center;
}

:host .divider {
    width: 20%;
    height: 2px;
    margin: 2rem auto;
    background-color: #929292;
}

:host .share-options {
    display: flex;
}

:host .share-options > div {
    width: 50%;
}

:host .share-options .social-container .social-options {
    display: flex; 
    justify-content: space-around;
}

:host .share-options .social-container .social-options svg {
    cursor: pointer;
}

:host .share-options .social-container .social-options svg:hover path {
    fill: white;
}


`

export default ShareStyles
