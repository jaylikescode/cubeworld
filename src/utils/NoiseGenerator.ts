import { createNoise2D, NoiseFunction2D } from 'simplex-noise';

export class NoiseGenerator {
  private noise2D: NoiseFunction2D;

  constructor(seed?: number) {
    this.noise2D = createNoise2D(() => seed ?? Math.random());
  }

  /**
   * Generate fractal brownian motion noise for realistic terrain
   */
  public fbm(x: number, y: number, octaves: number, persistence: number, lacunarity: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }

  /**
   * Get normalized noise value (0 to 1)
   */
  public getNormalized(x: number, y: number): number {
    return (this.noise2D(x, y) + 1) * 0.5;
  }

  /**
   * Get ridged noise for mountain ranges
   */
  public getRidged(x: number, y: number, octaves: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;

    for (let i = 0; i < octaves; i++) {
      const n = Math.abs(this.noise2D(x * frequency, y * frequency));
      total += (1 - n) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return total;
  }

  /**
   * Generate terrain height with multiple noise layers
   */
  public getTerrainHeight(
    x: number, 
    y: number, 
    scale: number, 
    octaves: number, 
    persistence: number, 
    lacunarity: number
  ): number {
    const baseNoise = this.fbm(x * scale, y * scale, octaves, persistence, lacunarity);
    const ridgeNoise = this.getRidged(x * scale * 0.5, y * scale * 0.5, 3);
    
    // Combine base and ridge noise for varied terrain
    return baseNoise * 0.7 + ridgeNoise * 0.3;
  }
}

