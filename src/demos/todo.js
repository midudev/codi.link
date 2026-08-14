export default {
  html: `<div class="app">
  <h1>Todo</h1>
  <form id="form">
    <input id="input" type="text" placeholder="Add a task..." autocomplete="off" />
    <button type="submit">Add</button>
  </form>
  <ul id="list"></ul>
</div>`,
  css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100dvh;
  display: grid;
  place-items: start center;
  padding: 2.5rem 1rem;
  font-family: system-ui, sans-serif;
  background: #111318;
  color: #eef1f6;
}

.app {
  width: min(420px, 100%);
}

h1 {
  margin: 0 0 1rem;
  font-size: 1.6rem;
}

form {
  display: flex;
  gap: 0.5rem;
}

input,
button {
  font: inherit;
}

input {
  flex: 1;
  border: 1px solid #2c3242;
  background: #1a1e29;
  color: inherit;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
}

button {
  border: 0;
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  background: #4f8cff;
  color: #fff;
  cursor: pointer;
}

ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #232836;
}

li.done span {
  text-decoration: line-through;
  opacity: 0.5;
}

li button {
  background: transparent;
  color: #ff8a8a;
  padding: 0;
}`,
  js: `const form = document.getElementById('form')
const input = document.getElementById('input')
const list = document.getElementById('list')

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const text = input.value.trim()
  if (!text) return

  const item = document.createElement('li')
  item.innerHTML = \`<span>\${text}</span><button type="button">✕</button>\`

  item.querySelector('span').onclick = () => {
    item.classList.toggle('done')
  }

  item.querySelector('button').onclick = () => {
    item.remove()
  }

  list.prepend(item)
  input.value = ''
  input.focus()
})`
}
