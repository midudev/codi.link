import { css } from 'lit'

export const codeTabsStyles = css`
  .nav {
    cursor: pointer;
    width: calc(100vw - 75px);
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
  }

  @media (max-width: 650px) {
    .nav {
      width: 100vw;
    }
  }

  .codeTabs {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .codeTabs__tab {
    color: #c5c5c5;
    padding: 10px 15px;
    padding-right: 0;
    border-bottom: 3px solid transparent;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    min-width: 120px;
  }

  .codeTabs__tab-active {
    border-bottom: 3px solid #c5c5c5;
    font-weight: 600;
  }

  .codeTabs__tab__text {
    cursor: pointer;
    word-break: keep-all;
  }

  .codeTabs__tab__button {
    background-color: transparent;
    border-style: none;
    color: #c5c5c5;
    cursor: pointer;
    border-radius: 4px;
  }

  .codeTabs__tab__button:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .codeTabs__tab__input {
    border-style: none;
    background-color: transparent;
    color: #c5c5c5;
    font-size: 1rem;
  }

  .codeTabs__tab:focus-within {
    width:200px
  }

  .codeTabs__addNewtab {
    display: block;
  }
`
