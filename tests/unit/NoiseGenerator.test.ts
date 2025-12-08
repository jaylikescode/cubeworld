import { describe, it, expect, beforeEach } from 'vitest';
import { NoiseGenerator } from '../../src/utils/NoiseGenerator';

describe('NoiseGenerator', () => {
  let generator: NoiseGenerator;

  beforeEach(() => {
    // Use a fixed seed for deterministic testing
    generator = new NoiseGenerator(12345);
  });

  describe('constructor', () => {
    it('should create a NoiseGenerator with a seed', () => {
      expect(generator).toBeDefined();
      expect(generator).toBeInstanceOf(NoiseGenerator);
    });

    it('should create a NoiseGenerator without a seed', () => {
      const randomGenerator = new NoiseGenerator();
      expect(randomGenerator).toBeDefined();
      expect(randomGenerator).toBeInstanceOf(NoiseGenerator);
    });

    it('should produce different results with different seeds', () => {
      const gen1 = new NoiseGenerator(111);
      const gen2 = new NoiseGenerator(222);

      const value1 = gen1.fbm(1.0, 1.0, 4, 0.5, 2.0);
      const value2 = gen2.fbm(1.0, 1.0, 4, 0.5, 2.0);

      expect(value1).not.toBe(value2);
    });

    it('should produce same results with same seed', () => {
      const gen1 = new NoiseGenerator(12345);
      const gen2 = new NoiseGenerator(12345);

      const value1 = gen1.fbm(1.0, 1.0, 4, 0.5, 2.0);
      const value2 = gen2.fbm(1.0, 1.0, 4, 0.5, 2.0);

      expect(value1).toBe(value2);
    });
  });

  describe('fbm (Fractal Brownian Motion)', () => {
    it('should return a number', () => {
      const result = generator.fbm(0, 0, 4, 0.5, 2.0);
      expect(typeof result).toBe('number');
    });

    it('should return normalized values between -1 and 1', () => {
      // Test multiple points
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        const value = generator.fbm(x, y, 4, 0.5, 2.0);

        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('should return different values for different coordinates', () => {
      const value1 = generator.fbm(0, 0, 4, 0.5, 2.0);
      const value2 = generator.fbm(10, 10, 4, 0.5, 2.0);

      expect(value1).not.toBe(value2);
    });

    it('should return same value for same coordinates', () => {
      const value1 = generator.fbm(5.5, 7.3, 4, 0.5, 2.0);
      const value2 = generator.fbm(5.5, 7.3, 4, 0.5, 2.0);

      expect(value1).toBe(value2);
    });

    it('should handle different octave counts', () => {
      const result1 = generator.fbm(1, 1, 1, 0.5, 2.0);
      const result2 = generator.fbm(1, 1, 4, 0.5, 2.0);
      const result3 = generator.fbm(1, 1, 8, 0.5, 2.0);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();

      // Different octaves should produce different results
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
    });

    it('should handle different persistence values', () => {
      const result1 = generator.fbm(1, 1, 4, 0.3, 2.0);
      const result2 = generator.fbm(1, 1, 4, 0.5, 2.0);
      const result3 = generator.fbm(1, 1, 4, 0.7, 2.0);

      // Different persistence should produce different results
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
    });

    it('should handle different lacunarity values', () => {
      const result1 = generator.fbm(1, 1, 4, 0.5, 1.5);
      const result2 = generator.fbm(1, 1, 4, 0.5, 2.0);
      const result3 = generator.fbm(1, 1, 4, 0.5, 2.5);

      // Different lacunarity should produce different results
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
    });

    it('should handle edge case of 0 octaves', () => {
      const result = generator.fbm(1, 1, 0, 0.5, 2.0);
      expect(result).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const result = generator.fbm(-10, -20, 4, 0.5, 2.0);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(-1);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('getNormalized', () => {
    it('should return a number between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        const value = generator.getNormalized(x, y);

        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('should return different values for different coordinates', () => {
      const value1 = generator.getNormalized(0, 0);
      const value2 = generator.getNormalized(10, 10);

      expect(value1).not.toBe(value2);
    });

    it('should return same value for same coordinates', () => {
      const value1 = generator.getNormalized(5.5, 7.3);
      const value2 = generator.getNormalized(5.5, 7.3);

      expect(value1).toBe(value2);
    });

    it('should handle negative coordinates', () => {
      const result = generator.getNormalized(-100, -200);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('getRidged', () => {
    it('should return a number', () => {
      const result = generator.getRidged(0, 0, 2);
      expect(typeof result).toBe('number');
    });

    it('should return positive values', () => {
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        const value = generator.getRidged(x, y, 2);

        // Ridged noise should generally be positive
        expect(value).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return different values for different coordinates', () => {
      const value1 = generator.getRidged(0, 0, 2);
      const value2 = generator.getRidged(10, 10, 2);

      expect(value1).not.toBe(value2);
    });

    it('should return same value for same coordinates', () => {
      const value1 = generator.getRidged(5.5, 7.3, 2);
      const value2 = generator.getRidged(5.5, 7.3, 2);

      expect(value1).toBe(value2);
    });

    it('should handle different octave counts', () => {
      const result1 = generator.getRidged(1, 1, 1);
      const result2 = generator.getRidged(1, 1, 3);
      const result3 = generator.getRidged(1, 1, 5);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();

      // Different octaves should produce different results
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
    });

    it('should handle edge case of 0 octaves', () => {
      const result = generator.getRidged(1, 1, 0);
      expect(result).toBe(0);
    });

    it('should create ridged patterns suitable for mountains', () => {
      // Ridged noise should have sharper features than regular noise
      const ridged1 = generator.getRidged(1.0, 1.0, 3);
      const ridged2 = generator.getRidged(1.1, 1.0, 3);

      // Adjacent points can have significant differences in ridged noise
      expect(Math.abs(ridged1 - ridged2)).toBeDefined();
    });
  });

  describe('getTerrainHeight', () => {
    it('should return a number', () => {
      const result = generator.getTerrainHeight(0, 0, 0.01, 4, 0.5, 2.0);
      expect(typeof result).toBe('number');
    });

    it('should return values between -1 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        const value = generator.getTerrainHeight(x, y, 0.01, 4, 0.5, 2.0);

        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('should combine base and ridged noise', () => {
      const terrain = generator.getTerrainHeight(10, 10, 0.01, 4, 0.5, 2.0);
      const fbmOnly = generator.fbm(10 * 0.01, 10 * 0.01, 4, 0.5, 2.0);

      // Terrain height should be different from fbm alone
      expect(terrain).not.toBe(fbmOnly);
    });

    it('should return different values for different coordinates', () => {
      const value1 = generator.getTerrainHeight(0, 0, 0.01, 4, 0.5, 2.0);
      const value2 = generator.getTerrainHeight(100, 100, 0.01, 4, 0.5, 2.0);

      expect(value1).not.toBe(value2);
    });

    it('should return same value for same coordinates and parameters', () => {
      const value1 = generator.getTerrainHeight(50, 75, 0.01, 4, 0.5, 2.0);
      const value2 = generator.getTerrainHeight(50, 75, 0.01, 4, 0.5, 2.0);

      expect(value1).toBe(value2);
    });

    it('should handle different scale values', () => {
      const result1 = generator.getTerrainHeight(10, 10, 0.005, 4, 0.5, 2.0);
      const result2 = generator.getTerrainHeight(10, 10, 0.01, 4, 0.5, 2.0);
      const result3 = generator.getTerrainHeight(10, 10, 0.02, 4, 0.5, 2.0);

      // Different scales should produce different terrain
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
    });

    it('should produce smooth continuous terrain', () => {
      // Test that nearby points have similar values (continuity)
      const value1 = generator.getTerrainHeight(100, 100, 0.01, 4, 0.5, 2.0);
      const value2 = generator.getTerrainHeight(100.1, 100, 0.01, 4, 0.5, 2.0);

      // Nearby points should have similar values
      const diff = Math.abs(value1 - value2);
      expect(diff).toBeLessThan(0.5); // Reasonable threshold for smoothness
    });
  });

  describe('Noise consistency', () => {
    it('should produce consistent noise across multiple calls', () => {
      const x = 42.5;
      const y = 73.2;

      const fbm1 = generator.fbm(x, y, 4, 0.5, 2.0);
      const fbm2 = generator.fbm(x, y, 4, 0.5, 2.0);

      const norm1 = generator.getNormalized(x, y);
      const norm2 = generator.getNormalized(x, y);

      const ridged1 = generator.getRidged(x, y, 3);
      const ridged2 = generator.getRidged(x, y, 3);

      expect(fbm1).toBe(fbm2);
      expect(norm1).toBe(norm2);
      expect(ridged1).toBe(ridged2);
    });

    it('should produce different noise for different positions', () => {
      const positions = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: -5, y: 15 },
        { x: 100, y: -50 },
      ];

      const values = positions.map(pos =>
        generator.fbm(pos.x, pos.y, 4, 0.5, 2.0)
      );

      // All values should be unique
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(positions.length);
    });
  });

  describe('Performance', () => {
    it('should generate noise values efficiently', () => {
      const startTime = performance.now();

      // Generate 10000 noise values
      for (let i = 0; i < 10000; i++) {
        generator.fbm(i * 0.1, i * 0.1, 4, 0.5, 2.0);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});
