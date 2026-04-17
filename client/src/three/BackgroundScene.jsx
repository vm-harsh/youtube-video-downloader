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

    const sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 8),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        roughness: 0.28,
        metalness: 0.45,
        transparent: true,
        opacity: 0.34
      })
    );
    sphere.position.set(2.7, 0.5, -1);
    scene.add(sphere);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light = new THREE.PointLight(0x5eead4, 22, 18);
    light.position.set(-3, 4, 6);
    scene.add(light);

    let frameId;
    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();
      particles.rotation.y = elapsed * 0.035;
      particles.rotation.x = Math.sin(elapsed * 0.2) * 0.08;
      sphere.rotation.x = elapsed * 0.18;
      sphere.rotation.y = elapsed * 0.26;
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
      sphere.geometry.dispose();
      sphere.material.dispose();
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
    color: 0x67e8f9,
    size: 0.026,
    transparent: true,
    opacity: 0.72
  });

  return new THREE.Points(geometry, material);
}
