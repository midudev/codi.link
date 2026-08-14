export default {
  html: `<div class="scene">
  <div class="orb orb-a"></div>
  <div class="orb orb-b"></div>
  <div class="orb orb-c"></div>
  <article class="card">
    <p>Move the pointer</p>
    <h1>CSS orbs</h1>
  </article>
</div>`,
  css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100dvh;
  overflow: hidden;
  font-family: system-ui, sans-serif;
  background: #07080f;
  color: #fff;
}

.scene {
  min-height: 100dvh;
  display: grid;
  place-items: center;
}

.orb {
  position: absolute;
  width: 42vmin;
  height: 42vmin;
  border-radius: 50%;
  filter: blur(20px);
  animation: float 10s ease-in-out infinite;
}

.orb-a {
  background: #6c5ce7;
  top: 8%;
  left: 12%;
}

.orb-b {
  background: #00cec9;
  right: 8%;
  bottom: 12%;
  animation-delay: -3s;
}

.orb-c {
  background: #fd79a8;
  left: 40%;
  top: 50%;
  width: 28vmin;
  height: 28vmin;
  animation-delay: -6s;
}

.card {
  position: relative;
  padding: 2rem 2.4rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(16px);
}

.card p {
  margin: 0;
  opacity: 0.7;
}

.card h1 {
  margin: 0.2em 0 0;
}

@keyframes float {
  50% {
    transform: translate3d(4vw, -3vh, 0) scale(1.08);
  }
}`,
  js: `const scene = document.querySelector('.scene')

scene.addEventListener('pointermove', ({ clientX, clientY }) => {
  const x = (clientX / window.innerWidth - 0.5) * 24
  const y = (clientY / window.innerHeight - 0.5) * 24

  document.querySelectorAll('.orb').forEach((orb, index) => {
    const depth = (index + 1) * 0.6
    orb.style.translate = \`\${x * depth}px \${y * depth}px\`
  })
})`
}
