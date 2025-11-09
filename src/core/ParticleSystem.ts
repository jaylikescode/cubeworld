import * as THREE from 'three';

export class ParticleSystem {
  private particleGroup: THREE.Group;
  private rainParticles: THREE.Points | null = null;
  private snowParticles: THREE.Points | null = null;
  private cloudsGroup: THREE.Group;
  private isRaining: boolean = false;
  private isSnowing: boolean = false;

  constructor() {
    this.particleGroup = new THREE.Group();
    this.cloudsGroup = new THREE.Group();
    this.createClouds();
  }

  private createClouds(): void {
    const cloudGeometry = new THREE.SphereGeometry(5, 8, 8);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      emissive: 0x444444,
    });

    // Create multiple cloud clusters
    for (let i = 0; i < 8; i++) {
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
      const angle = (i / 8) * Math.PI * 2;
      const radius = 60 + Math.random() * 20;
      
      cloud.position.set(
        Math.cos(angle) * radius,
        30 + Math.random() * 10,
        Math.sin(angle) * radius
      );
      cloud.scale.set(
        1 + Math.random() * 0.5,
        0.8 + Math.random() * 0.3,
        1 + Math.random() * 0.5
      );
      
      this.cloudsGroup.add(cloud);
    }
  }

  public createRain(): void {
    const particleCount = 1000;
    const particles = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = (Math.random() - 0.5) * 100;
      particles[i * 3 + 1] = Math.random() * 50 + 20;
      particles[i * 3 + 2] = (Math.random() - 0.5) * 100;
      velocities[i] = 0.5 + Math.random() * 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

    const material = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.particleGroup.add(this.rainParticles);
    this.isRaining = true;
  }

  public createSnow(): void {
    const particleCount = 2000;
    const particles = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = (Math.random() - 0.5) * 100;
      particles[i * 3 + 1] = Math.random() * 50 + 20;
      particles[i * 3 + 2] = (Math.random() - 0.5) * 100;
      velocities[i] = 0.1 + Math.random() * 0.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
    });

    this.snowParticles = new THREE.Points(geometry, material);
    this.particleGroup.add(this.snowParticles);
    this.isSnowing = true;
  }

  public stopRain(): void {
    if (this.rainParticles) {
      this.particleGroup.remove(this.rainParticles);
      this.rainParticles.geometry.dispose();
      (this.rainParticles.material as THREE.Material).dispose();
      this.rainParticles = null;
      this.isRaining = false;
    }
  }

  public stopSnow(): void {
    if (this.snowParticles) {
      this.particleGroup.remove(this.snowParticles);
      this.snowParticles.geometry.dispose();
      (this.snowParticles.material as THREE.Material).dispose();
      this.snowParticles = null;
      this.isSnowing = false;
    }
  }

  public toggleRain(): void {
    if (this.isRaining) {
      this.stopRain();
    } else {
      this.stopSnow(); // Stop snow if it's active
      this.createRain();
    }
  }

  public toggleSnow(): void {
    if (this.isSnowing) {
      this.stopSnow();
    } else {
      this.stopRain(); // Stop rain if it's active
      this.createSnow();
    }
  }

  public update(delta: number): void {
    // Animate clouds
    this.cloudsGroup.rotation.y += delta * 0.02;

    // Update rain particles
    if (this.rainParticles) {
      const positions = this.rainParticles.geometry.attributes.position;
      const velocities = this.rainParticles.geometry.attributes.velocity;

      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i);
        const velocity = velocities.getX(i);
        
        y -= velocity;
        
        if (y < 0) {
          y = 50 + Math.random() * 20;
        }
        
        positions.setY(i, y);
      }
      
      positions.needsUpdate = true;
    }

    // Update snow particles
    if (this.snowParticles) {
      const positions = this.snowParticles.geometry.attributes.position;
      const velocities = this.snowParticles.geometry.attributes.velocity;

      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i);
        let x = positions.getX(i);
        const velocity = velocities.getX(i);
        
        y -= velocity;
        x += Math.sin(y * 0.1) * 0.1;
        
        if (y < 0) {
          y = 50 + Math.random() * 20;
          x = (Math.random() - 0.5) * 100;
        }
        
        positions.setY(i, y);
        positions.setX(i, x);
      }
      
      positions.needsUpdate = true;
    }
  }

  public getGroup(): THREE.Group {
    return this.particleGroup;
  }

  public getClouds(): THREE.Group {
    return this.cloudsGroup;
  }

  public dispose(): void {
    this.stopRain();
    this.stopSnow();
    
    this.cloudsGroup.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
  }
}

