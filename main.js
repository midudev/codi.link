import "./styles/style.css";

import Split from "split-grid";
import { encode, decode } from "js-base64";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import JsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

import createEditor from "./js/utils/createEditor";
import copyURLToClipboard from "./js/utils/copyURLToClipboard";

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "html") return new HtmlWorker();
    if (label === "javascript") return new JsWorker();
    if (label === "css") return new CssWorker();
  },
};

const $ = (selector) => document.querySelector(selector);

const $js = $("#js");
const $css = $("#css");
const $html = $("#html");

const { pathname } = window.location;

const [rawHtml, rawCss, rawJs] = pathname.slice(1).split("%7C");

const html = rawHtml ? decode(rawHtml) : "";
const css = rawCss ? decode(rawCss) : "";
const js = rawJs ? decode(rawJs) : "";

const htmlEditor = createEditor($html, "html", html);
const cssEditor = createEditor($css, "css", css);
const jsEditor = createEditor($js, "javascript", js);

Split({
  columnGutters: [
    {
      track: 1,
      element: document.querySelector(".vertical-gutter"),
    },
  ],
  rowGutters: [
    {
      track: 1,
      element: document.querySelector(".horizontal-gutter"),
    },
  ],
});

htmlEditor.onDidChangeModelContent(update);
cssEditor.onDidChangeModelContent(update);
jsEditor.onDidChangeModelContent(update);

const htmlForPreview = createHtml({ html, js, css });
$("iframe").setAttribute("srcdoc", htmlForPreview);

function update() {
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const js = jsEditor.getValue();

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`;

  window.history.replaceState(null, null, `/${hashedCode}`);

  const htmlForPreview = createHtml({ html, js, css });
  $("iframe").setAttribute("srcdoc", htmlForPreview);
}

function createHtml({ html, js, css }) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      ${css}
    </style>
  </head>
  <body>
    ${html}
    <script type="module">
    ${js}
    </script>
  </body>
</html>
  `;
}


// clipboard url

const clipboardButton = $("#clipboard-button");

clipboardButton.addEventListener("click", async (e) => {
  e.preventDefault();

  // copying url
  await copyURLToClipboard();

  // response text
  clipboardButton.innerText = "Copied!";

  setTimeout(() => {
    clipboardButton.innerText = "Copy CodiLink";
  }, 3000);
});
