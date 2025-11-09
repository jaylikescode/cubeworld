import * as THREE from 'three';
import { NoiseGenerator } from '../utils/NoiseGenerator';
import { WorldSettings, BIOMES } from '../types/GameTypes';

export class Terrain {
  private geometry: THREE.PlaneGeometry;
  private material: THREE.MeshStandardMaterial;
  public mesh: THREE.Mesh;
  private noiseGenerator: NoiseGenerator;
  private worldSettings: WorldSettings;
  private heightMap: Float32Array;
  private originalHeights: Float32Array;

  constructor(settings: WorldSettings) {
    this.worldSettings = settings;
    this.noiseGenerator = new NoiseGenerator(Math.random());

    // Create geometry
    this.geometry = new THREE.PlaneGeometry(
      settings.width,
      settings.height,
      settings.segments,
      settings.segments
    );

    // Create material with vertex colors
    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: false,
      side: THREE.DoubleSide,
      metalness: 0.1,
      roughness: 0.8,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;

    // Initialize height maps
    const vertexCount = this.geometry.attributes.position.count;
    this.heightMap = new Float32Array(vertexCount);
    this.originalHeights = new Float32Array(vertexCount);

    this.generateTerrain();
  }

  /**
   * Generate initial terrain using noise
   */
  public generateTerrain(): void {
    const positions = this.geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      // Normalize coordinates
      const nx = x / this.worldSettings.width;
      const ny = y / this.worldSettings.height;

      // Generate height using noise
      const height = this.noiseGenerator.getTerrainHeight(
        nx,
        ny,
        this.worldSettings.noiseScale,
        this.worldSettings.octaves,
        this.worldSettings.persistence,
        this.worldSettings.lacunarity
      );

      const elevation = height * this.worldSettings.maxElevation;
      positions.setZ(i, elevation);
      this.heightMap[i] = elevation;
      this.originalHeights[i] = elevation;

      // Assign color based on height
      const color = this.getColorForHeight(height);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  /**
   * Get color based on normalized height (0-1)
   */
  private getColorForHeight(normalizedHeight: number): THREE.Color {
    // Find appropriate biome
    for (const biome of Object.values(BIOMES)) {
      if (normalizedHeight >= biome.heightRange[0] && normalizedHeight <= biome.heightRange[1]) {
        return biome.color.clone();
      }
    }
    return BIOMES.grassland.color.clone();
  }

  /**
   * Modify terrain at a specific point with brush
   */
  public modifyTerrain(
    worldPoint: THREE.Vector3,
    brushSize: number,
    strength: number,
    mode: 'raise' | 'lower' | 'smooth' | 'flatten'
  ): void {
    const positions = this.geometry.attributes.position;
    const colors = this.geometry.attributes.color;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Calculate distance from brush center
      const dx = x - worldPoint.x;
      const dy = y - worldPoint.z;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < brushSize) {
        // Smooth falloff
        const falloff = 1 - (distance / brushSize);
        const effect = falloff * falloff * strength;

        let newHeight = z;

        switch (mode) {
          case 'raise':
            newHeight += effect;
            break;
          case 'lower':
            newHeight -= effect;
            break;
          case 'smooth': {
            // Average with neighbors
            const neighbors = this.getNeighborHeights(i, positions);
            const avgHeight = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
            newHeight = THREE.MathUtils.lerp(z, avgHeight, effect * 0.5);
            break;
          }
          case 'flatten':
            newHeight = THREE.MathUtils.lerp(z, worldPoint.y, effect);
            break;
        }

        // Clamp height
        newHeight = THREE.MathUtils.clamp(
          newHeight,
          -this.worldSettings.maxElevation,
          this.worldSettings.maxElevation
        );

        positions.setZ(i, newHeight);
        this.heightMap[i] = newHeight;

        // Update color based on new height
        const normalizedHeight = (newHeight + this.worldSettings.maxElevation) / (2 * this.worldSettings.maxElevation);
        const color = this.getColorForHeight(normalizedHeight);
        colors.setXYZ(i, color.r, color.g, color.b);
      }
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  /**
   * Paint biome on terrain
   */
  public paintBiome(worldPoint: THREE.Vector3, brushSize: number, biomeType: string): void {
    const positions = this.geometry.attributes.position;
    const colors = this.geometry.attributes.color;
    const biome = BIOMES[biomeType];

    if (!biome) return;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      const dx = x - worldPoint.x;
      const dy = y - worldPoint.z;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < brushSize) {
        const falloff = 1 - (distance / brushSize);
        const currentColor = new THREE.Color(
          colors.getX(i),
          colors.getY(i),
          colors.getZ(i)
        );

        // Blend with biome color
        currentColor.lerp(biome.color, falloff * 0.3);
        colors.setXYZ(i, currentColor.r, currentColor.g, currentColor.b);
      }
    }

    colors.needsUpdate = true;
  }

  /**
   * Get heights of neighboring vertices
   */
  private getNeighborHeights(index: number, positions: THREE.BufferAttribute | THREE.InterleavedBufferAttribute): number[] {
    const segmentsX = this.worldSettings.segments + 1;
    const row = Math.floor(index / segmentsX);
    const col = index % segmentsX;
    const heights: number[] = [];

    // Check 8 neighbors
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dr, dc] of offsets) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (newRow >= 0 && newRow < segmentsX && newCol >= 0 && newCol < segmentsX) {
        const neighborIndex = newRow * segmentsX + newCol;
        heights.push(positions.getZ(neighborIndex));
      }
    }

    return heights;
  }

  /**
   * Reset terrain to original state
   */
  public reset(): void {
    this.generateTerrain();
  }

  /**
   * Get geometry for stats
   */
  public getVertexCount(): number {
    return this.geometry.attributes.position.count;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

