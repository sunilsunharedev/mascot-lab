export class Spring {
  velocity = 0;

  constructor(public value = 0, private readonly frequency = 12, private readonly damping = 0.73) {}

  step(target: number, delta: number) {
    // Small steps keep the damped oscillator stable on slower displays.
    if (delta <= 0) return this.value;
    const steps = Math.ceil(delta * 120);
    const dt = delta / steps;
    for (let i = 0; i < steps; i++) {
      const acceleration = (target - this.value) * this.frequency ** 2
        - 2 * this.damping * this.frequency * this.velocity;
      this.velocity += acceleration * dt;
      this.value += this.velocity * dt;
    }
    return this.value;
  }

  reset(value: number) {
    this.value = value;
    this.velocity = 0;
  }
}

