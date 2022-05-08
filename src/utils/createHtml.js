// @ts-check

/**
 * Create an index.html content from provided data
 * @param {object} params - The parameters
 * @param {string} params.css - CSS
 * @param {string} params.html - HTML content
 * @param {string} params.js - JavaScript
 * @returns {string}
 */
export const createHtml = ({ css, html, js }) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style id="preview-style">
      ${css}
    </style>
  </head>
  <body>
    ${html}
    <script type="module">
    ${js}
    </script>
  </body>
</html>`
}
