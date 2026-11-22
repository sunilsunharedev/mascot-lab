import * as THREE from 'three';
import { Mascot } from './Mascot';
import { Spring } from './Spring';

export class SceneManager {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera();
  private readonly mascot = new Mascot();
  private readonly peek = new Spring(0, 11, .68);
  private readonly lookX = new Spring();
  private readonly lookY = new Spring();
  private frame = 0;
  private previous = 0;
  private time = 0;
  private nextBlink = 1.8;
  private visible = false;
  private reduced = false;
  private targetX = 0;
  private targetY = 0;

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setClearColor(0, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.camera.position.set(0, 0, 8);
    const key = new THREE.DirectionalLight(0xffe7dd, 2.25);
    key.position.set(-3, 5, 6);
    const rim = new THREE.DirectionalLight(0xd2a5ff, 2.1);
    rim.position.set(3, 3, -4);
    this.scene.add(new THREE.HemisphereLight(0xfce2ff, 0xac597f, 1.65), key, rim, this.mascot.root);
    host.append(this.renderer.domElement);
    new ResizeObserver(this.resize).observe(host);
    this.resize();
  }

  private resize = () => {
    const { clientWidth: width, clientHeight: height } = this.host;
    if (!width || !height) return;
    const span = Math.max(2.50, 2.98 * height / width);
    const halfWidth = span * width / height / 2;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.bottom = -.53;
    this.camera.top = this.camera.bottom + span;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.draw(0);
  };

  setVisible(visible: boolean) {
    this.visible = visible;
    if (!visible) {
      this.peek.reset(0);
      this.setPointer(0, 0);
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.previous = 0;
    } else {
      this.start();
    }
  }

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
    if (reduced) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.previous = 0;
      this.lookX.reset(0);
      this.lookY.reset(0);
      this.draw(0);
    } else {
      this.peek.reset(0);
      this.start();
    }
  }

  setPointer(x: number, y: number) {
    this.targetX = THREE.MathUtils.clamp(x, -1, 1);
    this.targetY = THREE.MathUtils.clamp(y, -1, 1);
  }

  replay() {
    this.peek.reset(0);
    this.start();
  }

  private start() {
    if (!this.frame && this.visible && !this.reduced) {
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  private tick = (now: number) => {
    const dt = this.previous ? Math.min((now - this.previous) / 1000, .05) : 0;
    this.previous = now;
    this.draw(dt);
    this.frame = requestAnimationFrame(this.tick);
  };

  private draw(dt: number) {
    this.time += dt;
    const blinkAge = this.time - this.nextBlink;
    const blink = blinkAge >= 0 && blinkAge < .23 ? Math.sin(Math.PI * blinkAge / .23) : 0;
    if (blinkAge >= .23) this.nextBlink = this.time + 2.1 + Math.random() * 2.6;
    const peek = this.reduced ? 1 : this.peek.step(this.visible ? 1 : 0, dt);
    this.mascot.pose(
      this.lookX.step(this.targetX, dt),
      this.lookY.step(this.targetY, dt),
      peek,
      this.reduced ? 0 : blink,
      this.reduced ? 0 : Math.sin(this.time * 2.2),
    );
    this.host.parentElement?.style.setProperty('--peek', String(THREE.MathUtils.clamp(peek, 0, 1)));
    this.renderer.render(this.scene, this.camera);
  }
}

