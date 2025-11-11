import { describe, it, expect, beforeEach } from 'vitest';
import { TextureAtlas, TextureCoordinates } from '../../src/graphics/TextureAtlas';
import { BlockType } from '../../src/types/VoxelTypes';
import { TEXTURE_CONSTANTS } from '../../src/constants/GraphicsConstants';
import * as THREE from 'three';

describe('TextureAtlas', () => {
  let atlas: TextureAtlas;

  beforeEach(() => {
    atlas = new TextureAtlas();
  });

  describe('initialization', () => {
    it('should create a TextureAtlas instance', () => {
      expect(atlas).toBeDefined();
      expect(atlas).toBeInstanceOf(TextureAtlas);
    });

    it('should have correct atlas dimensions', () => {
      expect(atlas.getAtlasSize()).toBe(TEXTURE_CONSTANTS.ATLAS_SIZE);
    });

    it('should have correct tile size', () => {
      expect(atlas.getTileSize()).toBe(TEXTURE_CONSTANTS.TILE_SIZE);
    });

    it('should calculate tiles per row correctly', () => {
      const tilesPerRow = TEXTURE_CONSTANTS.ATLAS_SIZE / TEXTURE_CONSTANTS.TILE_SIZE;
      expect(atlas.getTilesPerRow()).toBe(tilesPerRow);
    });
  });

  describe('texture coordinate mapping', () => {
    it('should have texture coordinates for all block types', () => {
      const blockTypes = Object.values(BlockType).filter(v => typeof v === 'number');

      blockTypes.forEach(blockType => {
        const coords = atlas.getTextureCoordinates(blockType as BlockType);
        expect(coords).toBeDefined();
      });
    });

    it('should return valid UV coordinates', () => {
      const coords = atlas.getTextureCoordinates(BlockType.GRASS);

      expect(coords.u).toBeGreaterThanOrEqual(0);
      expect(coords.u).toBeLessThanOrEqual(1);
      expect(coords.v).toBeGreaterThanOrEqual(0);
      expect(coords.v).toBeLessThanOrEqual(1);
      expect(coords.width).toBeGreaterThan(0);
      expect(coords.width).toBeLessThanOrEqual(1);
      expect(coords.height).toBeGreaterThan(0);
      expect(coords.height).toBeLessThanOrEqual(1);
    });

    it('should have different coordinates for different blocks', () => {
      const grassCoords = atlas.getTextureCoordinates(BlockType.GRASS);
      const stoneCoords = atlas.getTextureCoordinates(BlockType.STONE);

      const isDifferent =
        grassCoords.u !== stoneCoords.u ||
        grassCoords.v !== stoneCoords.v;

      expect(isDifferent).toBe(true);
    });

    it('should handle all block categories', () => {
      // Test samples from each category
      const sampleBlocks = [
        BlockType.GRASS,      // Natural
        BlockType.BRICK,      // Building
        BlockType.COAL_ORE,   // Mineral
        BlockType.FLOWER,     // Decoration
        BlockType.WATER,      // Liquid
      ];

      sampleBlocks.forEach(blockType => {
        const coords = atlas.getTextureCoordinates(blockType);
        expect(coords).toBeDefined();
        expect(coords.u).toBeDefined();
        expect(coords.v).toBeDefined();
      });
    });
  });

  describe('face-specific textures', () => {
    it('should support different textures for block faces', () => {
      const topCoords = atlas.getTextureCoordinates(BlockType.GRASS, 'top');
      const sideCoords = atlas.getTextureCoordinates(BlockType.GRASS, 'side');
      const bottomCoords = atlas.getTextureCoordinates(BlockType.GRASS, 'bottom');

      expect(topCoords).toBeDefined();
      expect(sideCoords).toBeDefined();
      expect(bottomCoords).toBeDefined();
    });

    it('should have grass block with different top texture', () => {
      const topCoords = atlas.getTextureCoordinates(BlockType.GRASS, 'top');
      const sideCoords = atlas.getTextureCoordinates(BlockType.GRASS, 'side');

      const isDifferent =
        topCoords.u !== sideCoords.u ||
        topCoords.v !== sideCoords.v;

      expect(isDifferent).toBe(true);
    });

    it('should default to all-sides texture when face not specified', () => {
      const defaultCoords = atlas.getTextureCoordinates(BlockType.STONE);
      const sideCoords = atlas.getTextureCoordinates(BlockType.STONE, 'side');

      expect(defaultCoords.u).toBe(sideCoords.u);
      expect(defaultCoords.v).toBe(sideCoords.v);
    });
  });

  describe('atlas grid calculations', () => {
    it('should correctly calculate tile position in atlas', () => {
      const coords = atlas.getTextureCoordinates(BlockType.AIR);

      // AIR is at position 0, should be top-left corner
      expect(coords.u).toBe(0);
      expect(coords.v).toBe(0);
    });

    it('should calculate correct tile size in UV space', () => {
      const coords = atlas.getTextureCoordinates(BlockType.GRASS);
      const expectedTileSize = TEXTURE_CONSTANTS.TILE_SIZE / TEXTURE_CONSTANTS.ATLAS_SIZE;

      expect(coords.width).toBeCloseTo(expectedTileSize, 5);
      expect(coords.height).toBeCloseTo(expectedTileSize, 5);
    });

    it('should fit all block types within atlas bounds', () => {
      const blockTypes = Object.values(BlockType).filter(v => typeof v === 'number');
      const tilesPerRow = TEXTURE_CONSTANTS.ATLAS_SIZE / TEXTURE_CONSTANTS.TILE_SIZE;

      blockTypes.forEach(blockType => {
        const coords = atlas.getTextureCoordinates(blockType as BlockType);

        // Calculate which row and column this tile is in
        const tileIndex = blockType as number;
        const row = Math.floor(tileIndex / tilesPerRow);
        const col = tileIndex % tilesPerRow;

        // Check that tile fits in atlas
        expect(row).toBeLessThan(tilesPerRow);
        expect(col).toBeLessThan(tilesPerRow);
      });
    });
  });

  describe('texture generation', () => {
    it.skip('should generate a canvas texture', () => {
      // Skipped: happy-dom doesn't support canvas 2D context
      // This would be tested in a browser environment or with canvas mock
      const texture = atlas.generateTexture();

      expect(texture).toBeDefined();
      expect(texture).toBeInstanceOf(THREE.CanvasTexture);
    });

    it.skip('should set correct texture parameters', () => {
      // Skipped: happy-dom doesn't support canvas 2D context
      const texture = atlas.generateTexture();

      expect(texture.magFilter).toBe(THREE.NearestFilter);
      expect(texture.minFilter).toBe(THREE.NearestFilter);
      expect(texture.wrapS).toBe(THREE.ClampToEdgeWrapping);
      expect(texture.wrapT).toBe(THREE.ClampToEdgeWrapping);
    });

    it.skip('should have correct texture dimensions', () => {
      // Skipped: happy-dom doesn't support canvas 2D context
      const texture = atlas.generateTexture();

      expect(texture.image.width).toBe(TEXTURE_CONSTANTS.ATLAS_SIZE);
      expect(texture.image.height).toBe(TEXTURE_CONSTANTS.ATLAS_SIZE);
    });
  });

  describe('block color integration', () => {
    it.skip('should draw blocks with their defined colors', () => {
      // Skipped: happy-dom doesn't support canvas 2D context
      const texture = atlas.generateTexture();
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');

      expect(ctx).toBeTruthy();
    });

    it('should handle transparent blocks', () => {
      const airCoords = atlas.getTextureCoordinates(BlockType.AIR);
      const waterCoords = atlas.getTextureCoordinates(BlockType.WATER);
      const glassCoords = atlas.getTextureCoordinates(BlockType.GLASS);

      expect(airCoords).toBeDefined();
      expect(waterCoords).toBeDefined();
      expect(glassCoords).toBeDefined();
    });
  });

  describe('performance', () => {
    it.skip('should cache generated texture', () => {
      // Skipped: happy-dom doesn't support canvas 2D context
      const texture1 = atlas.generateTexture();
      const texture2 = atlas.generateTexture();

      expect(texture1).toBe(texture2);
    });

    it('should handle rapid coordinate lookups', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        atlas.getTextureCoordinates(BlockType.GRASS);
        atlas.getTextureCoordinates(BlockType.STONE);
        atlas.getTextureCoordinates(BlockType.DIRT);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 3000 lookups in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('edge cases', () => {
    it('should handle block type 0 (AIR)', () => {
      const coords = atlas.getTextureCoordinates(BlockType.AIR);
      expect(coords).toBeDefined();
    });

    it('should handle highest block type number', () => {
      const blockTypes = Object.values(BlockType)
        .filter(v => typeof v === 'number') as number[];
      const maxBlockType = Math.max(...blockTypes);

      const coords = atlas.getTextureCoordinates(maxBlockType as BlockType);
      expect(coords).toBeDefined();
    });

    it('should handle invalid face parameter gracefully', () => {
      const coords = atlas.getTextureCoordinates(BlockType.GRASS, 'invalid' as any);
      expect(coords).toBeDefined();
    });
  });

  describe('texture coordinates interface', () => {
    it('should return TextureCoordinates with all required properties', () => {
      const coords = atlas.getTextureCoordinates(BlockType.STONE);

      expect(coords).toHaveProperty('u');
      expect(coords).toHaveProperty('v');
      expect(coords).toHaveProperty('width');
      expect(coords).toHaveProperty('height');
    });

    it('should have consistent coordinate ranges', () => {
      const blockTypes = Object.values(BlockType)
        .filter(v => typeof v === 'number') as BlockType[];

      blockTypes.forEach(blockType => {
        const coords = atlas.getTextureCoordinates(blockType);

        expect(coords.u + coords.width).toBeLessThanOrEqual(1.01); // Small tolerance for floating point
        expect(coords.v + coords.height).toBeLessThanOrEqual(1.01);
        expect(coords.u).toBeGreaterThanOrEqual(0);
        expect(coords.v).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
