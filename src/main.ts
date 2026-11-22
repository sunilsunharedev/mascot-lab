import './style.css';
import { SceneManager } from './scene/SceneManager';

const host = document.querySelector<HTMLElement>('.canvas-host')!;
const stage = document.querySelector<HTMLElement>('.stage')!;
const fallback = document.querySelector<HTMLElement>('.fallback')!;
const replay = document.querySelector<HTMLButtonElement>('#replay')!;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const about = document.querySelector<HTMLElement>('.about p')!;
let scene: SceneManager | undefined;

replay.hidden = true;
try {
  scene = new SceneManager(host);
} catch {
  about.textContent = 'An original 3D character inspired by GitHub’s homepage mascot. This browser is displaying its still portrait.';
}

if (scene) {
  const activeScene = scene;
  host.classList.add('is-ready');
  fallback.hidden = true;

  const applyMotion = () => {
    activeScene.setReducedMotion(motion.matches);
    replay.hidden = motion.matches;
    about.textContent = motion.matches
      ? 'An original 3D character inspired by GitHub’s homepage mascot. The scene holds a still pose with reduced motion enabled.'
      : 'An original 3D character inspired by GitHub’s homepage mascot. Move your pointer to meet its gaze, or scroll away and back to see it peek out again.';
  };

  motion.addEventListener('change', applyMotion);
  applyMotion();

  new IntersectionObserver(([entry]) => {
    activeScene.setVisible(entry.intersectionRatio >= .5);
  }, { threshold: .5 }).observe(stage);

  document.querySelector('.hero')!.addEventListener('pointermove', (event) => {
    const pointer = event as PointerEvent;
    if (pointer.pointerType === 'touch') return;
    const box = host.getBoundingClientRect();
    activeScene.setPointer(
      (pointer.clientX - box.left - box.width / 2) / (box.width * .47),
      (box.top + box.height * .63 - pointer.clientY) / (box.height * .75),
    );
  });
  document.querySelector('.hero')!.addEventListener('pointerleave', () => activeScene.setPointer(0, 0));

  replay.addEventListener('click', () => {
    stage.scrollIntoView({ block: 'center' });
    activeScene.replay();
  });
}


