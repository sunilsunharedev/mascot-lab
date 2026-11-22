# Peekaboo

A standalone Three.js study of the peeking mascot on GitHub's homepage. The scene uses procedural geometry and runs entirely in the browser.

## Run locally

Requires Node.js 22.12 or newer on the Node 22 release line.

```sh
npm ci
npm run dev
```

Use `npm run build` to type-check and build into `dist/`. Use `npm run preview` to serve that build locally.

## Host the website

On Netlify, choose **Add new project → Import an existing project**, connect the GitHub repository, and select the `main` branch. The included `netlify.toml` configures Node 22, runs `npm run build`, and publishes `dist/`. Netlify provides a public URL after the build finishes.

For manual hosting, run `npm ci` and `npm run build`, then upload the contents of `dist/` to the root of any static host. The site runs without a backend or environment secrets.


## Reference observations

Inspected the public [GitHub homepage](https://github.com/) in Chrome at 1440 × 1000 CSS pixels with a 1.5 device pixel ratio on November 22, 2026.

- The top mascot sat at the center of a 4 CSS pixel full-width color divider. Its canvas measured 175 × 175 CSS pixels with a 262 × 262 backing buffer. The surrounding wrapper measured 200 × 200 CSS pixels. The loaded canvas reported Three.js r148 and returned a WebGL 2 context.
- The silhouette showed a dark rounded hood, low pointed ears and short side whiskers. The face transitioned from pink around the forehead through warm peach near the eyes to deeper pink toward the chin. The large violet eyes had bright elliptical highlights. A tiny dark nose and curved smile sat between and below them.
- Moving the mouse to the left side of the mascot turned its face toward the pointer. The canvas computed to `pointer-events: none`. The click sample showed the face near center and yielded no distinct click response I could isolate from the pointer movement.
- Scrolling by 240 px moved the visible divider and mascot wrapper together by 240 px. The wrapper remained fully opaque in that sample. Initial HTML set the intro mascot wrapper to opacity zero, while the loaded wrapper measured opacity one.
- Chrome requested a public mascot GLB. The [public landing-page bundle](https://github.githubassets.com/assets/landing-pages-6eccf70a4f450eb3.js) references it and defines custom shader materials for the face, pupils and appendages. It includes face color uniforms, procedural noise and a mouse movement uniform that influences appendage deformation.

## Interpretation and local design

The pointer turn was directly visible. Independent eye tracking, blink timing, breathing cadence, and scroll re-entry behavior were inconclusive in the GitHub samples. The demo gives these motions their own timing and adds a keyboard-accessible replay button.

The original mesh uses a rounded hood, beveled ears, a vertex-colored face and layered eyes. Warm key lighting, a purple rim and a blurred contact shadow give it depth above the divider. The demo enlarges the character and stages it against a plum background in its own page layout. Reduced motion holds a centered pose, and a CSS portrait appears when WebGL 2 initialization fails.

## Source layout

- `src/main.ts` connects pointer movement, replay, scroll visibility, and the system motion preference to the scene.
- `src/scene/SceneManager.ts` manages WebGL rendering, camera sizing, lighting, and animation timing.
- `src/scene/Mascot.ts` builds the procedural model and applies its pose.
- `src/scene/Spring.ts` implements damped motion for the peek and gaze.
- `src/style.css` lays out the page and supplies the divider, contact shadow, and still portrait.
