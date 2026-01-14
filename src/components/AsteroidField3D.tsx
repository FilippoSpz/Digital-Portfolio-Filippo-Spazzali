import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFBX, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface AsteroidProps {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
  meshIndex: number;
}

const Asteroid = ({ position, scale, rotation, rotationSpeed, meshIndex }: AsteroidProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load FBX model
  const fbx = useFBX('/models/AsteroidsPack.fbx');
  
  // Load textures
  const [colorMap, normalMap, roughnessMap, aoMap] = useTexture([
    '/models/textures/Mat1_Base_Color.jpg',
    '/models/textures/Mat1_Normal.jpg',
    '/models/textures/Mat1_Roughness.jpg',
    '/models/textures/Mat1_AO.jpg',
  ]);

  // Get a specific mesh from the FBX (it contains multiple asteroids)
  const asteroidGeometry = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    fbx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes.push(child as THREE.Mesh);
      }
    });
    // Use different meshes based on index
    const targetMesh = meshes[meshIndex % meshes.length];
    return targetMesh?.geometry?.clone() || new THREE.IcosahedronGeometry(1, 1);
  }, [fbx, meshIndex]);

  // Slow rotation animation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0] * delta;
      meshRef.current.rotation.y += rotationSpeed[1] * delta;
      meshRef.current.rotation.z += rotationSpeed[2] * delta;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={rotation}
      geometry={asteroidGeometry}
    >
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        aoMap={aoMap}
        roughness={0.9}
        metalness={0.1}
        envMapIntensity={0.3}
      />
    </mesh>
  );
};

// Fallback asteroid using simple geometry if FBX fails
const FallbackAsteroid = ({ position, scale, rotation, rotationSpeed }: Omit<AsteroidProps, 'meshIndex'>) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0] * delta;
      meshRef.current.rotation.y += rotationSpeed[1] * delta;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#4a4555" roughness={0.9} metalness={0.1} />
    </mesh>
  );
};

interface AsteroidFieldProps {
  isMobile?: boolean;
}

const AsteroidScene = ({ isMobile }: AsteroidFieldProps) => {
  // Generate asteroid positions
  const asteroids = useMemo(() => {
    const count = isMobile ? 10 : 18;
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 7 + 13;
      
      if (isMobile) {
        // Mobile: scattered more spread out, positioned lower in frame, smaller scale
        return {
          id: i,
          position: [
            (Math.random() - 0.5) * 12,
            -1.5 - Math.random() * 3,
            -1 - Math.random() * 3,
          ] as [number, number, number],
          scale: 0.1 + Math.random() * 0.15,
          rotation: [
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
          ] as [number, number, number],
          rotationSpeed: [
            (Math.random() - 0.5) * 0.25,
            (Math.random() - 0.5) * 0.35,
            (Math.random() - 0.5) * 0.15,
          ] as [number, number, number],
          meshIndex: seed % 5,
        };
      }
      
      // Desktop: scattered on right side with faster rotation
      return {
        id: i,
        position: [
          2 + Math.random() * 5,
          (Math.random() - 0.5) * 8,
          -2 - Math.random() * 5,
        ] as [number, number, number],
        scale: 0.1 + Math.random() * 0.35,
        rotation: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ] as [number, number, number],
        rotationSpeed: [
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.1,
        ] as [number, number, number],
        meshIndex: seed % 5,
      };
    });
  }, [isMobile]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#fff5e6" />
      <directionalLight position={[-3, -2, -5]} intensity={0.3} color="#6366f1" />
      <pointLight position={[0, 0, 3]} intensity={0.4} color="#a78bfa" />
      
      {/* Asteroids */}
      <Suspense fallback={null}>
        {asteroids.map((asteroid) => (
          <Asteroid
            key={asteroid.id}
            position={asteroid.position}
            scale={asteroid.scale}
            rotation={asteroid.rotation}
            rotationSpeed={asteroid.rotationSpeed}
            meshIndex={asteroid.meshIndex}
          />
        ))}
      </Suspense>
    </>
  );
};

const AsteroidField3D = ({ isMobile = false }: AsteroidFieldProps) => {
  return (
    <div 
      className="absolute pointer-events-none z-30"
      style={{
        right: 0,
        bottom: isMobile ? 0 : 'auto',
        top: isMobile ? 'auto' : 0,
        width: isMobile ? '100%' : '40%',
        height: isMobile ? '100%' : '100%',
        overflow: 'visible',
      }}
    >
      <Canvas
        camera={{ 
          position: isMobile ? [0, 1, 10] : [0, 0, 8], 
          fov: isMobile ? 50 : 45,
        }}
        gl={{ 
          antialias: true,
          alpha: true,
        }}
        style={{ 
          background: 'transparent',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <AsteroidScene isMobile={isMobile} />
      </Canvas>
    </div>
  );
};

export default AsteroidField3D;
