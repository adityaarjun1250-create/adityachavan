
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface HologramFaceProps {
  state: string;
  audioLevel: number;
}

const HologramFace: React.FC<HologramFaceProps> = ({ state, audioLevel }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const ironManGroup = new THREE.Group();
    scene.add(ironManGroup);

    // --- IRON MAN BODY CONSTRUCTION ---
    
    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.5, 2, 1);
    const armorMat = new THREE.MeshStandardMaterial({ 
      color: 0x8B0000, 
      metalness: 0.9, 
      roughness: 0.2,
      emissive: 0x440000,
      emissiveIntensity: 0.2
    });
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    ironManGroup.add(torso);

    // Arc Reactor (Chest)
    const reactorGeo = new THREE.CircleGeometry(0.3, 32);
    const reactorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    const reactor = new THREE.Mesh(reactorGeo, reactorMat);
    reactor.position.set(0, 0.2, 0.51);
    ironManGroup.add(reactor);
    
    // Arc Reactor Glow
    const reactorGlowGeo = new THREE.CircleGeometry(0.5, 32);
    const reactorGlowMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide 
    });
    const reactorGlow = new THREE.Mesh(reactorGlowGeo, reactorGlowMat);
    reactorGlow.position.set(0, 0.2, 0.505);
    ironManGroup.add(reactorGlow);

    // Head
    const headGeo = new THREE.CapsuleGeometry(0.5, 0.6, 4, 16);
    const goldMat = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700, 
      metalness: 1, 
      roughness: 0.1,
      emissive: 0x332200,
      emissiveIntensity: 0.5
    });
    const head = new THREE.Mesh(headGeo, goldMat);
    head.position.set(0, 1.4, 0);
    ironManGroup.add(head);

    // Eyes
    const eyeGeo = new THREE.PlaneGeometry(0.3, 0.08);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 1.45, 0.46);
    leftEye.rotation.y = 0.2;
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 1.45, 0.46);
    rightEye.rotation.y = -0.2;
    head.add(leftEye, rightEye);

    // Shoulders & Arms
    const shoulderGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const lShoulder = new THREE.Mesh(shoulderGeo, armorMat);
    lShoulder.position.set(-1, 0.8, 0);
    const rShoulder = new THREE.Mesh(shoulderGeo, armorMat);
    rShoulder.position.set(1, 0.8, 0);
    ironManGroup.add(lShoulder, rShoulder);

    // Arms extending out
    const armGeo = new THREE.CylinderGeometry(0.2, 0.15, 1.5);
    const lArm = new THREE.Mesh(armGeo, armorMat);
    lArm.position.set(-1.8, 0.4, 0.5);
    lArm.rotation.z = Math.PI / 4;
    lArm.rotation.x = -Math.PI / 4;
    
    const rArm = new THREE.Mesh(armGeo, armorMat);
    rArm.position.set(1.8, 0.4, 0.5);
    rArm.rotation.z = -Math.PI / 4;
    rArm.rotation.x = -Math.PI / 4;
    
    ironManGroup.add(lArm, rArm);

    // --- THE CHAKRAMS (Glowing Spinning Rings) ---
    
    const createChakram = (color: number) => {
      const chakramGroup = new THREE.Group();
      
      const ringGeo = new THREE.TorusGeometry(1, 0.05, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.8 
      });
      
      // Main ring
      const ring = new THREE.Mesh(ringGeo, ringMat);
      chakramGroup.add(ring);
      
      // Secondary spinning parts
      for (let i = 0; i < 3; i++) {
        const subRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.8 + i * 0.1, 0.02, 8, 50),
          new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.4 })
        );
        subRing.rotation.x = Math.random() * Math.PI;
        chakramGroup.add(subRing);
      }
      
      return chakramGroup;
    };

    const lChakram = createChakram(0xFFA500); // Orange-Yellow
    lChakram.position.set(-2.5, 0, 1.2);
    lChakram.scale.set(1.2, 1.2, 1.2);
    
    const rChakram = createChakram(0xFFA500);
    rChakram.position.set(2.5, 0, 1.2);
    rChakram.scale.set(1.2, 1.2, 1.2);

    const mainChakram = createChakram(0xFF4500); // More Red-Orange for the background circle
    mainChakram.position.set(0, 0, -1);
    mainChakram.scale.set(4, 4, 1);
    
    ironManGroup.add(lChakram, rChakram, mainChakram);

    // Particle Background
    const particlesCount = 800;
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.04, 
      transparent: true, 
      opacity: 0.4 
    });
    const starField = new THREE.Points(partGeo, partMat);
    scene.add(starField);

    // Lights
    const blueLight = new THREE.PointLight(0x00ffff, 5, 20);
    blueLight.position.set(5, 2, 5);
    scene.add(blueLight);

    const redLight = new THREE.PointLight(0xff0000, 5, 20);
    redLight.position.set(-5, 2, 5);
    scene.add(redLight);
    
    const centralLight = new THREE.PointLight(0xffffff, 2, 10);
    centralLight.position.set(0, 0, 2);
    scene.add(centralLight);

    camera.position.z = 10;

    // Animation variables
    let blinkTimer = 0;
    let isBlinking = false;

    const animate = (time: number) => {
      frameRef.current = requestAnimationFrame(animate);

      // --- ANIMATION LOGIC ---
      
      // Running/Flying tilt and bounce
      const bounce = Math.sin(time * 0.005) * 0.15;
      ironManGroup.position.y = bounce;
      ironManGroup.rotation.y = Math.sin(time * 0.001) * 0.1;
      ironManGroup.rotation.x = Math.sin(time * 0.0008) * 0.05;

      // Spinning Chakrams
      lChakram.rotation.z += 0.05;
      lChakram.rotation.y += 0.01;
      
      rChakram.rotation.z -= 0.05;
      rChakram.rotation.y -= 0.01;
      
      mainChakram.rotation.z += 0.005;

      // Background stars movement
      starField.rotation.y += 0.0005;
      starField.position.z += 0.01;
      if (starField.position.z > 5) starField.position.z = 0;

      // Eye Blinking
      blinkTimer++;
      if (!isBlinking && Math.random() < 0.005) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (isBlinking) {
        leftEye.scale.y = Math.max(0.1, 1 - Math.sin((blinkTimer / 10) * Math.PI));
        rightEye.scale.y = Math.max(0.1, 1 - Math.sin((blinkTimer / 10) * Math.PI));
        if (blinkTimer >= 10) isBlinking = false;
      } else {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
      }

      // Audio Reactivity (Speaking state)
      if (state === 'SPEAKING') {
        const pulse = 1 + audioLevel * 0.5;
        reactor.scale.set(pulse, pulse, 1);
        reactorGlowMat.opacity = 0.3 + audioLevel * 2;
        reactorGlow.scale.set(pulse * 1.5, pulse * 1.5, 1);
        
        // Jitter the figure slightly when speaking forcefully
        ironManGroup.position.x = (Math.random() - 0.5) * audioLevel * 0.1;
      } else if (state === 'THINKING') {
        // Pulse reactor differently
        const pulse = 1 + Math.sin(time * 0.01) * 0.2;
        reactor.scale.set(pulse, pulse, 1);
        reactorMat.color.setHex(0xff00ff);
        reactorGlowMat.color.setHex(0xff00ff);
      } else {
        reactor.scale.set(1, 1, 1);
        reactorMat.color.setHex(0x00ffff);
        reactorGlowMat.color.setHex(0x00ffff);
        reactorGlowMat.opacity = 0.3;
      }

      renderer.render(scene, camera);
    };

    animate(0);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current!);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [state, audioLevel]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default HologramFace;
