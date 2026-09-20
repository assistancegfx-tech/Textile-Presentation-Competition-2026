/**
 * Safe, crash-proof celebratory confetti for in-browser / iframe environments.
 * Avoids canvas-confetti's WebWorker window-resize race condition that throws:
 * "Uncaught TypeError: canvas.getBoundingClientRect is not a function"
 */

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

export function fireCelebrationConfetti(opts?: {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
}) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const particleCount = opts?.particleCount || 75;
  const colors = opts?.colors || ['#22C55E', '#0A192F', '#84CC16', '#F59E0B', '#38BDF8'];
  const startX = (opts?.origin?.x ?? 0.5) * window.innerWidth;
  const startY = (opts?.origin?.y ?? 0.6) * window.innerHeight;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'celebration-confetti-canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';

  canvas.width = window.innerWidth || 800;
  canvas.height = window.innerHeight || 600;

  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    return;
  }

  const particles: ConfettiParticle[] = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * 120 + 30) * (Math.PI / 180); // Upwards spread
    const speed = Math.random() * 14 + 7;
    particles.push({
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * speed * 1.5,
      vy: -Math.sin(angle) * speed,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }

  let animationFrameId: number;
  const startTime = Date.now();
  const maxDuration = 3200; // 3.2 seconds

  function render() {
    const elapsed = Date.now() - startTime;
    if (elapsed > maxDuration || particles.length === 0) {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      return;
    }

    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.98; // air friction
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - elapsed / maxDuration);

      if (!ctx) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(animationFrameId);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };
}
