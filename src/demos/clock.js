export default {
  html: `<div class="clock">
  <time id="time">00:00:00</time>
  <p id="date"></p>
</div>`,
  css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  font-family: "Cascadia Code", ui-monospace, monospace;
  background:
    radial-gradient(circle at 20% 20%, #3d2b6d 0, transparent 40%),
    radial-gradient(circle at 80% 80%, #123b5c 0, transparent 42%),
    #0b1020;
  color: #e8f1ff;
}

.clock {
  text-align: center;
  padding: 2rem 2.4rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(10, 14, 30, 0.55);
  backdrop-filter: blur(12px);
}

#time {
  font-size: clamp(2.4rem, 10vw, 4.5rem);
  font-weight: 600;
  letter-spacing: 0.06em;
}

#date {
  margin: 0.6rem 0 0;
  opacity: 0.7;
  font-size: 1rem;
}`,
  js: `const timeEl = document.getElementById('time')
const dateEl = document.getElementById('date')

const formatTime = (date) => date.toLocaleTimeString('en-GB')

const formatDate = (date) => date.toLocaleDateString(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
})

const tick = () => {
  const now = new Date()
  timeEl.textContent = formatTime(now)
  dateEl.textContent = formatDate(now)
}

tick()
setInterval(tick, 1000)`
}
