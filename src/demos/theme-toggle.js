export default {
  html: `<div class="page">
  <button id="toggle" aria-pressed="false">
    Toggle theme
  </button>
  <article class="card">
    <h1>Hello, theme</h1>
    <p>This card follows a data-theme attribute on the page.</p>
  </article>
</div>`,
  css: `:root {
  --bg: #f4efe6;
  --fg: #1d1a16;
  --card: #fffaf2;
  --border: #e4d8c4;
}

[data-theme='dark'] {
  --bg: #12141a;
  --fg: #f2f4f8;
  --card: #1c2029;
  --border: #303644;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
  transition: 0.25s background-color, 0.25s color;
}

.page {
  width: min(380px, 90vw);
}

button {
  font: inherit;
  margin-bottom: 1rem;
  border: 1px solid var(--border);
  background: var(--card);
  color: inherit;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
}

.card {
  padding: 1.4rem;
  border-radius: 16px;
  background: var(--card);
  border: 1px solid var(--border);
}

h1 {
  margin: 0 0 0.4rem;
}

p {
  margin: 0;
  line-height: 1.5;
  opacity: 0.8;
}`,
  js: `const toggle = document.getElementById('toggle')
const root = document.documentElement

const setTheme = (theme) => {
  root.setAttribute('data-theme', theme)
  toggle.setAttribute('aria-pressed', String(theme === 'dark'))
}

toggle.onclick = () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  setTheme(next)
}`
}
