import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BackgroundScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const particles = createParticles();
    scene.add(particles);

    const heroMark = createPlayButton(0.82);
    heroMark.rotation.set(-0.1, -0.35, 0.08);
    scene.add(heroMark);

    const nearMark = createPlayButton(0.38);
    nearMark.rotation.set(0.28, 0.45, -0.14);
    scene.add(nearMark);

    const filmStrip = createFilmStrip();
    filmStrip.rotation.set(-0.4, 0.3, -0.42);
    scene.add(filmStrip);



    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const keyLight = new THREE.PointLight(0xff2b2b, 28, 20);
    keyLight.position.set(-3, 4, 6);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xffffff, 10, 12);
    rimLight.position.set(4, -2, 4);
    scene.add(rimLight);

    let frameId;
    const clock = new THREE.Clock();
    const pointer = new THREE.Vector2(0, 0);

    function animate() {
      const elapsed = clock.getElapsedTime();

      particles.rotation.y = elapsed * 0.035;
      particles.rotation.x = Math.sin(elapsed * 0.2) * 0.08;
      heroMark.rotation.x = Math.sin(elapsed * 0.45) * 0.12 - 0.1 + pointer.y * 0.08;
      heroMark.rotation.y = Math.sin(elapsed * 0.32) * 0.24 - 0.35 + pointer.x * 0.1;
      heroMark.rotation.z = Math.sin(elapsed * 0.25) * 0.08;
      nearMark.rotation.x = Math.cos(elapsed * 0.38) * 0.16 + 0.28;
      nearMark.rotation.y = Math.sin(elapsed * 0.28) * 0.2 + 0.45;
      filmStrip.rotation.z = Math.sin(elapsed * 0.22) * 0.1 - 0.42;
      filmStrip.position.y = Math.sin(elapsed * 0.36) * 0.22 + 2.15;

      scene.rotation.x = pointer.y * 0.025;
      scene.rotation.y = pointer.x * 0.035;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }

    function handlePointerMove(event) {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      if (window.innerWidth < 768) {
        heroMark.position.set(3.1, 3, -1.25);
        heroMark.scale.setScalar(0.55);
        filmStrip.position.set(-3.2, 2.15, -1.6);
        nearMark.position.set(-3.2, -3, -0.4);
      } else {
        heroMark.position.set(5.4, 2.75, -1.15);
        heroMark.scale.setScalar(0.82);
        filmStrip.position.set(-5.6, 2.15, -1.6);
        nearMark.position.set(-5.1, -2.35, -0.2);
      }
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove);
    handleResize();
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      scene.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true" />;
}

function createParticles() {
  const count = 1200;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 17;
    positions[stride + 1] = (Math.random() - 0.5) * 11;
    positions[stride + 2] = (Math.random() - 0.5) * 10;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xff5555,
    size: 0.026,
    transparent: true,
    opacity: 0.66
  });

  return new THREE.Points(geometry, material);
}

function createPlayButton(scale = 1) {
  const group = new THREE.Group();

  const bodyShape = createRoundedRectShape(4, 2.75, 0.62);
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.34,
      bevelEnabled: true,
      bevelSegments: 12,
      bevelSize: 0.12,
      bevelThickness: 0.08
    }),
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x4d0000,
      roughness: 0.24,
      metalness: 0.18,
      transparent: true,
      opacity: 0.82
    })
  );
  body.position.set(-2, -1.375, -0.17);
  group.add(body);

  const playShape = new THREE.Shape();
  playShape.moveTo(-0.44, -0.64);
  playShape.lineTo(-0.44, 0.64);
  playShape.lineTo(0.72, 0);
  playShape.lineTo(-0.44, -0.64);

  const play = new THREE.Mesh(
    new THREE.ExtrudeGeometry(playShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.018,
      bevelThickness: 0.018
    }),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.32,
      metalness: 0.08
    })
  );
  play.position.z = 0.12;
  group.add(play);

  group.scale.setScalar(scale);
  return group;
}

function createFilmStrip() {
  const group = new THREE.Group();
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.36,
    metalness: 0.14,
    transparent: true,
    opacity: 0.78
  });
  const redMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0x320000,
    roughness: 0.32,
    metalness: 0.08
  });
  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.28,
    metalness: 0.06
  });

  const railGeometry = new THREE.BoxGeometry(4.8, 0.46, 0.14);
  const topRail = new THREE.Mesh(railGeometry, baseMaterial);
  topRail.position.y = 0.94;
  group.add(topRail);

  const bottomRail = new THREE.Mesh(railGeometry, baseMaterial);
  bottomRail.position.y = -0.94;
  group.add(bottomRail);

  for (let index = 0; index < 5; index += 1) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.08, 0.12), index % 2 === 0 ? redMaterial : whiteMaterial);
    frame.position.x = -1.9 + index * 0.95;
    frame.position.z = 0.02;
    frame.scale.y = index % 2 === 0 ? 0.72 : 0.52;
    group.add(frame);

    const topDot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.16), whiteMaterial);
    topDot.position.set(frame.position.x, 0.94, 0.09);
    group.add(topDot);

    const bottomDot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.16), whiteMaterial);
    bottomDot.position.set(frame.position.x, -0.94, 0.09);
    group.add(bottomDot);
  }

  group.scale.setScalar(0.72);
  return group;
}

function createFloatingCards() {
  const group = new THREE.Group();
  const placements = [
    [-2.6, 0.6, -2.8, 0.22],
    [0.8, 3.2, -3.2, -0.16],
    [2.1, -3.1, -2.1, 0.28]
  ];

  placements.forEach(([x, y, z, rotation], index) => {
    const card = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.78, 0.08),
      new THREE.MeshStandardMaterial({
        color: index === 1 ? 0xffffff : 0x27272a,
        roughness: 0.4,
        metalness: 0.05,
        transparent: true,
        opacity: 0.72
      })
    );
    card.add(body);

    const progress = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.06, 0.09),
      new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 })
    );
    progress.position.set(-0.1, -0.28, 0.06);
    card.add(progress);

    card.position.set(x, y, z);
    card.rotation.z = rotation;
    card.userData.baseY = y;
    group.add(card);
  });

  return group;
}

function createRoundedRectShape(width, height, radius) {
  const x = 0;
  const y = 0;
  const shape = new THREE.Shape();

  shape.moveTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);

  return shape;
}
