import * as THREE from 'three';

const surface = (color: number, roughness = .55) =>
  new THREE.MeshStandardMaterial({ color, roughness });

const sphere = new THREE.SphereGeometry(1, 48, 32);

function oval(material: THREE.Material, x: number, y: number, z: number,
  width: number, height: number, depth: number) {
  const mesh = new THREE.Mesh(sphere, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(width, height, depth);
  return mesh;
}

function earGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-.27, -.38);
  shape.bezierCurveTo(-.33, -.11, -.46, .46, -.32, .51);
  shape.bezierCurveTo(-.19, .56, .23, .29, .35, .07);
  shape.bezierCurveTo(.39, -.06, .18, -.4, -.27, -.38);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .24, bevelSegments: 6, steps: 1, bevelSize: .075, bevelThickness: .10, curveSegments: 24,
  });
  geometry.translate(0, 0, -.12);
  return geometry;
}

function faceGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, .79);
  shape.bezierCurveTo(-.38, .79, -.62, .94, -.82, .61);
  shape.bezierCurveTo(-1.01, .29, -1.04, .04, -.88, -.08);
  shape.bezierCurveTo(-.94, -.43, -.70, -.52, 0, -.47);
  shape.bezierCurveTo(.70, -.52, .94, -.43, .88, -.08);
  shape.bezierCurveTo(1.04, .04, 1.01, .29, .82, .61);
  shape.bezierCurveTo(.62, .94, .38, .79, 0, .79);

  const perimeter = shape.getSpacedPoints(96).slice(0, -1);
  const rings = 18;
  const positions = [0, .16, .885];
  const colors: number[] = [];
  const indices: number[] = [];
  const rose = new THREE.Color('#f783a9');
  const peach = new THREE.Color('#ffad96');
  const petal = new THREE.Color('#ffbad9');

  function addColor(y: number) {
    const color = y < .13
      ? rose.clone().lerp(peach, THREE.MathUtils.smoothstep(y, -.46, .13))
      : peach.clone().lerp(petal, THREE.MathUtils.smoothstep(y, .13, .72));
    colors.push(color.r, color.g, color.b);
  }

  addColor(.16);
  for (let ring = 1; ring <= rings; ring++) {
    const angle = ring / rings * Math.PI / 2;
    for (const point of perimeter) {
      const y = .16 + (point.y - .16) * Math.sin(angle);
      positions.push(point.x * Math.sin(angle), y, .27 + .615 * Math.cos(angle));
      addColor(y);
    }
  }

  const count = perimeter.length;
  for (let i = 0; i < count; i++) {
    const next = (i + 1) % count;
    indices.push(0, 1 + i, 1 + next);
    for (let ring = 1; ring < rings; ring++) {
      const inner = 1 + (ring - 1) * count;
      const outer = inner + count;
      indices.push(inner + i, outer + i, outer + next, inner + i, outer + next, inner + next);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function stroke(points: THREE.Vector3[], radius: number, material: THREE.Material) {
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, radius, 8), material);
}

export class Mascot {
  readonly root = new THREE.Group();
  readonly head = new THREE.Group();
  private readonly eyes: { lid: THREE.Group; gaze: THREE.Group }[] = [];

  constructor() {
    const hood = surface(0x322440, .68);
    const ink = surface(0x27152d);
    const white = surface(0xffe7f4);
    const violet = new THREE.MeshPhysicalMaterial({ color: 0x5040b5, roughness: .17, clearcoat: 1 });
    const highlight = new THREE.MeshBasicMaterial({ color: 0xfff5fb, toneMapped: false });
    const glint = new THREE.MeshBasicMaterial({ color: 0xf3c7ff, toneMapped: false });
    this.root.add(this.head);
    this.head.add(oval(hood, 0, .06, 0, 1.11, 1, .69));

    const ear = earGeometry();
    for (const side of [-1, 1]) {
      const mesh = new THREE.Mesh(ear, hood);
      mesh.position.set(side * .73, .83, -.035);
      mesh.scale.set(-side * .90, .69, 1);
      this.head.add(mesh);
      for (let row = 0; row < 2; row++) {
        const y = -.10 - row * .125;
        this.head.add(stroke([
          new THREE.Vector3(side * .93, y, .28),
          new THREE.Vector3(side * 1.14, y + .019, .29),
          new THREE.Vector3(side * 1.24, y - .013 - row * .018, .27),
        ], .026, hood));
      }
    }

    this.head.add(new THREE.Mesh(faceGeometry(), new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: .65,
    })));

    for (const side of [-1, 1]) {
      const lid = new THREE.Group();
      lid.position.set(side * .44, .32, .799);
      lid.rotation.y = side * .22;
      lid.rotation.z = side * .07;
      const gaze = new THREE.Group();
      lid.add(oval(ink, 0, 0, .015, .235, .274, .095));
      lid.add(oval(white, 0, -.012, .041, .211, .246, .089));
      lid.add(gaze);
      gaze.add(oval(violet, 0, 0, .115, .168, .212, .081));
      gaze.add(oval(ink, .006, .022, .162, .104, .137, .048));
      const shine = oval(highlight, -.048, .101, .203, .067, .038, .012);
      shine.rotation.z = .35;
      gaze.add(shine, oval(glint, .077, -.058, .192, .026, .021, .012));
      this.head.add(lid);
      this.eyes.push({ lid, gaze });
    }

    this.head.add(oval(ink, 0, .088, .885, .051, .033, .025));
    this.head.add(stroke([
      new THREE.Vector3(-.116, -.034, .866),
      new THREE.Vector3(-.057, -.056, .879),
      new THREE.Vector3(0, -.061, .882),
      new THREE.Vector3(.057, -.056, .879),
      new THREE.Vector3(.116, -.034, .866),
    ], .013, ink));
  }

  pose(x: number, y: number, peek: number, blink: number, breath: number) {
    this.root.position.y = -2.12 * (1 - peek) + breath * .018;
    this.head.rotation.set(-y * .15, x * .34, -x * .065);
    this.head.scale.set(1 - breath * .006, 1 + breath * .014, 1);
    for (const { lid, gaze } of this.eyes) {
      lid.scale.y = 1 - blink * .94;
      gaze.position.set(x * .045, y * .039, 0);
    }
  }
}

