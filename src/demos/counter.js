export default {
  html: `<div class="app">
  <p class="label">Clicks</p>
  <p class="value" id="value">0</p>
  <div class="actions">
    <button id="dec" aria-label="Decrement">−</button>
    <button id="reset">Reset</button>
    <button id="inc" aria-label="Increment">+</button>
  </div>
</div>`,
  css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0f1221;
  color: #f4f4f8;
}

.app {
  text-align: center;
}

.label {
  margin: 0;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-size: 0.8rem;
  opacity: 0.6;
}

.value {
  margin: 0.2em 0 0.6em;
  font-size: clamp(4rem, 16vw, 8rem);
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  font: inherit;
  cursor: pointer;
  background: #2a2f4a;
  color: inherit;
}

#inc {
  background: #6c7bff;
  color: #fff;
}`,
  js: `const valueEl = document.getElementById('value')
let count = 0

const render = () => {
  valueEl.textContent = count
}

document.getElementById('dec').onclick = () => {
  count--
  render()
}

document.getElementById('inc').onclick = () => {
  count++
  render()
}

document.getElementById('reset').onclick = () => {
  count = 0
  render()
}`
}
