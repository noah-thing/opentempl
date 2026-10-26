import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// A voxel eyeball built from rounded cubes. It turns to follow the pointer and
// blinks now and then. Same material language as the voxel objects in the app.

export function initEye(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 46);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2b3bff, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(-14, 18, 22);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9aa2ea, 1.6);
  rim.position.set(18, -6, -10);
  scene.add(rim);

  // Voxelise a sphere shell. Cubes facing +z within an angle become iris and pupil.
  const R = 8.2;
  const cells: { p: THREE.Vector3; c: THREE.Color }[] = [];
  const white = new THREE.Color('#F4F4F6');
  const cobalt = new THREE.Color('#2B3BFF');
  const ink = new THREE.Color('#0B0B0D');
  const glint = new THREE.Color('#FFFFFF');
  const r = Math.ceil(R);
  for (let x = -r; x <= r; x++)
    for (let y = -r; y <= r; y++)
      for (let z = -r; z <= r; z++) {
        const d = Math.hypot(x, y, z);
        if (d > R || d < R - 1.45) continue;
        const v = new THREE.Vector3(x, y, z);
        const a = v.clone().normalize().angleTo(new THREE.Vector3(0, 0, 1));
        let c = white;
        if (a < 0.36) c = ink;
        else if (a < 0.6) c = cobalt;
        if (x === -2 && y === 2 && z > 0 && a < 0.36) c = glint;
        cells.push({ p: v, c });
      }

  const geo = new RoundedBoxGeometry(0.94, 0.94, 0.94, 2, 0.16);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.0 });
  const mesh = new THREE.InstancedMesh(geo, mat, cells.length);
  const m = new THREE.Matrix4();
  cells.forEach((cell, i) => {
    m.makeTranslation(cell.p.x, cell.p.y, cell.p.z);
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, cell.c);
  });
  mesh.instanceColor!.needsUpdate = true;
  const eye = new THREE.Group();
  eye.add(mesh);
  scene.add(eye);

  // Pointer target, relative to the canvas centre.
  const target = new THREE.Vector2(0, 0);
  const onMove = (e: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
    target.set(Math.max(-1.2, Math.min(1.2, nx)), Math.max(-1.2, Math.min(1.2, ny)));
  };
  window.addEventListener('pointermove', onMove);

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);

  let nextBlink = performance.now() + 2500;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick = (t: number) => {
    requestAnimationFrame(tick);
    if (!visible) return;
    const ry = target.x * 0.5;
    const rx = target.y * 0.4;
    eye.rotation.y += (ry - eye.rotation.y) * (reduce ? 1 : 0.08);
    eye.rotation.x += (rx - eye.rotation.x) * (reduce ? 1 : 0.08);
    eye.position.y = reduce ? 0 : Math.sin(t / 1400) * 0.35;
    // Blink: squash vertically for a moment.
    let sy = 1;
    if (!reduce && t > nextBlink) {
      const k = (t - nextBlink) / 160;
      sy = k < 1 ? 1 - Math.sin(k * Math.PI) * 0.88 : 1;
      if (k >= 1) nextBlink = t + 2600 + Math.random() * 4200;
    }
    eye.scale.set(1, sy, 1);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(tick);
}
