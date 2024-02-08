import { css } from 'lit'

export const DialogStyles = css`
dialog {
    display: grid;
    align-content: start;
    margin: auto;
    padding: 0;
    position: fixed;
    inset: 0;
    border: none;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 100;
    overflow: hidden;
    background-color: #1E1E1E;
    transition: opacity .3s ease;
    max-inline-size: min(90vw, 650px);

    &[modal-mode="mega"]::backdrop {
      backdrop-filter: blur(1px);
      background-color: rgba(0, 0, 0, 0.3);
    }

    &:not([open]) {
      pointer-events: none;
      opacity: 0;
      transition: opacity .1s ease;

      &::backdrop {
        transition: backdrop-filter .1s ease;
      }
    }

    &::backdrop {
      transition: backdrop-filter .3s ease;
    }
  
  }
  header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    color: white;
    background-color: #333333;
    padding-block: 1rem;
    padding-inline: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem 0.5rem 0 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    p {
      margin: 0;
    }

    svg {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
    }

  }
  footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-block: 1rem;
    padding-inline: 1.5rem;
  }
  button {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: background-color .2s ease, scale .2s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
    font-weight: 600;

    &:active {
      transform: scale(0.98);
    }
  }
  .cancel-button {
    background-color: #374151;
    color: #ededed;

    &:hover {
      background-color: #434D5E;
    }
  }
  .accept-button {
    background-color: #158BF3;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background-color: #199AFC;
    }
  }
`
