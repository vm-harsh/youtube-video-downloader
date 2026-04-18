import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BackgroundScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const particles = createParticles();
    scene.add(particles);

    const playButton = createPlayButton();
    playButton.position.set(7, 3.35, -1.15);
    playButton.rotation.set(-0.1, -0.35, 0.08);
    scene.add(playButton);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light = new THREE.PointLight(0xff2b2b, 28, 20);
    light.position.set(-3, 4, 6);
    scene.add(light);
    const rimLight = new THREE.PointLight(0xffffff, 10, 12);
    rimLight.position.set(4, -2, 4);
    scene.add(rimLight);

    let frameId;
    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();
      particles.rotation.y = elapsed * 0.035;
      particles.rotation.x = Math.sin(elapsed * 0.2) * 0.08;
      playButton.rotation.x = Math.sin(elapsed * 0.45) * 0.12 - 0.1;
      playButton.rotation.y = Math.sin(elapsed * 0.32) * 0.24 - 0.35;
      playButton.rotation.z = Math.sin(elapsed * 0.25) * 0.08;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      particles.geometry.dispose();
      particles.material.dispose();
      playButton.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          child.material.dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true" />;
}

function createParticles() {
  const count = 900;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 16;
    positions[stride + 1] = (Math.random() - 0.5) * 10;
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

function createPlayButton() {
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

  group.scale.setScalar(0.82);
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
