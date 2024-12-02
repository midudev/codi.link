import { css } from 'lit'

export const LayoutPreviewStyles = css`
:host {
  display: grid;
  height: var(--layout-preview-size, 40px);
  width: var(--layout-preview-size, 40px);
  padding: var(--layout-preview-padding, 5px);
  cursor: pointer;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: 'html js' 'css result';
  gap: var(--layout-preview-gap, 2px);
}

:host([active]){
  background-color: var(--layout-preview-background-color, #797b80);
  border-radius: var(--layout-preview-border-radius, 5px);
}

:host([layout=layout-2]){
  grid-template-areas: 'html css' 'js result';
}

:host([layout=vertical]){
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 1fr;
  grid-template-areas: 'html css js result';
}

:host([layout=horizontal]){
  grid-template-rows: repeat(4, 1fr);
  grid-template-columns: 1fr;
  grid-template-areas: 'html' 'css' 'js' 'result';
}

:host([layout=bottom]){
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas: 'result result result' 'html js css';
}

:host([layout=tabs]){
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas: 'html html result' 'html html result';
}

:host([layout=tabs]) .css,
:host([layout=tabs]) .js {
  position: absolute;
  width: 5px;
  height: 5px;
  top: 5px;
  border-left: 1px solid black;
  border-bottom: 1px solid black;
}

:host([layout=tabs]) .css {
  left: calc(33.33% - 3px);
}

:host([layout=tabs]) .js {
  left: calc(33.33% + 4px);
}

.html {
  grid-area: html;
  background-color: var(--layout-preview-background-color-html, #e34f26);
}

.css {
  grid-area: css;
  background-color: var(--layout-preview-background-color-css, #30a9dc);
}

.js {
  grid-area: js;
  background-color: var(--layout-preview-background-color-js, #f7df1e);
}

.result {
  grid-area: result;
  background-color: var(--layout-preview-background-color-result, #ffffff);
}
`
