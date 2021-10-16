import { css } from 'lit'

const ShareStyles = css`
:host {

}

:host h4 {
    text-align: center;
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
