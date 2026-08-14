export default {
  html: `<main>
  <p class="kicker">codi.link</p>
  <h1 id="text"></h1>
</main>`,
  css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0c0d12;
  color: #f5f6fa;
}

main {
  width: min(640px, 90vw);
}

.kicker {
  margin: 0 0 0.4rem;
  color: #8b93ff;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.8rem;
}

h1 {
  margin: 0;
  min-height: 1.3em;
  font-size: clamp(2rem, 7vw, 3.4rem);
  line-height: 1.2;
}

h1::after {
  content: "";
  display: inline-block;
  width: 0.08em;
  height: 1em;
  margin-left: 0.08em;
  background: #8b93ff;
  animation: blink 0.8s steps(2, start) infinite;
  vertical-align: -0.08em;
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}`,
  js: `const phrases = [
  'Write HTML, CSS and JS.',
  'See the result instantly.',
  'Share a playground in the URL.'
]

const textEl = document.getElementById('text')
let phraseIndex = 0
let charIndex = 0
let deleting = false

const tick = () => {
  const phrase = phrases[phraseIndex]
  charIndex += deleting ? -1 : 1
  textEl.textContent = phrase.slice(0, charIndex)

  let delay = deleting ? 40 : 70

  if (!deleting && charIndex === phrase.length) {
    deleting = true
    delay = 1200
  }

  if (deleting && charIndex === 0) {
    deleting = false
    phraseIndex = (phraseIndex + 1) % phrases.length
    delay = 250
  }

  setTimeout(tick, delay)
}

tick()`
}
