import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  BlockType,
  BLOCK_TYPES,
  BlockData,
  BlockCategory,
  VoxelPosition,
  Chunk,
  WorldSettings
} from '../../src/types/VoxelTypes';

describe('VoxelTypes', () => {
  describe('BlockType enum', () => {
    it('should have correct numeric values', () => {
      // Verify key blocks have their expected values
      expect(BlockType.AIR).toBe(0);
      expect(BlockType.WATER).toBe(1);
      expect(BlockType.LAVA).toBe(2);
      expect(BlockType.GRASS).toBe(3);
      expect(BlockType.DIRT).toBe(4);
      expect(BlockType.STONE).toBe(5);
      expect(BlockType.BEDROCK).toBe(11);
      expect(BlockType.COBBLESTONE).toBe(50);
    });

    it('should have unique values for each block type', () => {
      const values = Object.values(BlockType).filter(v => typeof v === 'number');
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have at least 50 block types', () => {
      const numericValues = Object.values(BlockType)
        .filter(v => typeof v === 'number');

      expect(numericValues.length).toBeGreaterThanOrEqual(50);
    });

    it('should have contiguous values starting from 0', () => {
      const numericValues = Object.values(BlockType)
        .filter(v => typeof v === 'number')
        .sort((a, b) => (a as number) - (b as number));

      numericValues.forEach((value, index) => {
        expect(value).toBe(index);
      });
    });
  });

  describe('BLOCK_TYPES', () => {
    it('should have data for all BlockType enum values', () => {
      const blockTypeValues = Object.values(BlockType)
        .filter(v => typeof v === 'number');

      blockTypeValues.forEach(blockType => {
        expect(BLOCK_TYPES[blockType as BlockType]).toBeDefined();
      });
    });

    it('should have correct structure for each block data', () => {
      Object.values(BLOCK_TYPES).forEach((blockData: BlockData) => {
        expect(blockData).toHaveProperty('type');
        expect(blockData).toHaveProperty('name');
        expect(blockData).toHaveProperty('color');
        expect(typeof blockData.type).toBe('number');
        expect(typeof blockData.name).toBe('string');
        expect(blockData.color).toBeInstanceOf(THREE.Color);
      });
    });

    describe('AIR block', () => {
      const air = BLOCK_TYPES[BlockType.AIR];

      it('should have correct properties', () => {
        expect(air.type).toBe(BlockType.AIR);
        expect(air.name).toBe('Air');
        expect(air.transparent).toBe(true);
      });

      it('should have black color', () => {
        expect(air.color.getHex()).toBe(0x000000);
      });
    });

    describe('GRASS block', () => {
      const grass = BLOCK_TYPES[BlockType.GRASS];

      it('should have correct properties', () => {
        expect(grass.type).toBe(BlockType.GRASS);
        expect(grass.name).toBe('Grass');
        expect(grass.transparent).toBeUndefined();
      });

      it('should have green color', () => {
        expect(grass.color.getHex()).toBe(0x5da130);
      });
    });

    describe('DIRT block', () => {
      const dirt = BLOCK_TYPES[BlockType.DIRT];

      it('should have correct properties', () => {
        expect(dirt.type).toBe(BlockType.DIRT);
        expect(dirt.name).toBe('Dirt');
      });

      it('should have brown color', () => {
        expect(dirt.color.getHex()).toBe(0x8b6f47);
      });
    });

    describe('STONE block', () => {
      const stone = BLOCK_TYPES[BlockType.STONE];

      it('should have correct properties', () => {
        expect(stone.type).toBe(BlockType.STONE);
        expect(stone.name).toBe('Stone');
      });

      it('should have gray color', () => {
        expect(stone.color.getHex()).toBe(0x808080);
      });
    });

    describe('SAND block', () => {
      const sand = BLOCK_TYPES[BlockType.SAND];

      it('should have correct properties', () => {
        expect(sand.type).toBe(BlockType.SAND);
        expect(sand.name).toBe('Sand');
      });

      it('should have sandy color', () => {
        expect(sand.color.getHex()).toBe(0xf4e7c3);
      });
    });

    describe('WATER block', () => {
      const water = BLOCK_TYPES[BlockType.WATER];

      it('should have correct properties', () => {
        expect(water.type).toBe(BlockType.WATER);
        expect(water.name).toBe('Water');
        expect(water.transparent).toBe(true);
      });

      it('should have blue color', () => {
        expect(water.color.getHex()).toBe(0x3399ff);
      });
    });

    describe('WOOD block', () => {
      const wood = BLOCK_TYPES[BlockType.WOOD];

      it('should have correct properties', () => {
        expect(wood.type).toBe(BlockType.WOOD);
        expect(wood.name).toBe('Wood');
      });

      it('should have brown color', () => {
        expect(wood.color.getHex()).toBe(0x8b5a2b);
      });
    });

    describe('LEAVES block', () => {
      const leaves = BLOCK_TYPES[BlockType.LEAVES];

      it('should have correct properties', () => {
        expect(leaves.type).toBe(BlockType.LEAVES);
        expect(leaves.name).toBe('Leaves');
        expect(leaves.transparent).toBe(true);
      });

      it('should have green color', () => {
        expect(leaves.color.getHex()).toBe(0x228b22);
      });
    });

    describe('SNOW block', () => {
      const snow = BLOCK_TYPES[BlockType.SNOW];

      it('should have correct properties', () => {
        expect(snow.type).toBe(BlockType.SNOW);
        expect(snow.name).toBe('Snow');
      });

      it('should have white color', () => {
        expect(snow.color.getHex()).toBe(0xffffff);
      });
    });

    describe('COBBLESTONE block', () => {
      const cobble = BLOCK_TYPES[BlockType.COBBLESTONE];

      it('should have correct properties', () => {
        expect(cobble.type).toBe(BlockType.COBBLESTONE);
        expect(cobble.name).toBe('Cobblestone');
      });

      it('should have dark gray color', () => {
        expect(cobble.color.getHex()).toBe(0x696969);
      });
    });

    describe('BEDROCK block', () => {
      const bedrock = BLOCK_TYPES[BlockType.BEDROCK];

      it('should have correct properties', () => {
        expect(bedrock.type).toBe(BlockType.BEDROCK);
        expect(bedrock.name).toBe('Bedrock');
      });

      it('should have very dark color', () => {
        expect(bedrock.color.getHex()).toBe(0x333333);
      });
    });

    it('should have transparent blocks including air, water, and leaves', () => {
      const transparentBlocks = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) => block.transparent === true);

      expect(transparentBlocks.length).toBeGreaterThanOrEqual(3);
      expect(transparentBlocks.map((b: BlockData) => b.type))
        .toEqual(expect.arrayContaining([
          BlockType.AIR,
          BlockType.WATER,
          BlockType.LEAVES
        ]));
    });

    it('should have unique names for all blocks', () => {
      const names = Object.values(BLOCK_TYPES).map((block: BlockData) => block.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have unique colors for most blocks', () => {
      const colors = Object.values(BLOCK_TYPES).map((block: BlockData) => block.color.getHex());
      const uniqueColors = new Set(colors);

      // Most blocks should have unique colors (some might share)
      expect(uniqueColors.size).toBeGreaterThanOrEqual(9);
    });
  });

  describe('VoxelPosition interface', () => {
    it('should accept valid position objects', () => {
      const pos: VoxelPosition = { x: 10, y: 20, z: 30 };
      expect(pos.x).toBe(10);
      expect(pos.y).toBe(20);
      expect(pos.z).toBe(30);
    });

    it('should handle negative coordinates', () => {
      const pos: VoxelPosition = { x: -5, y: -10, z: -15 };
      expect(pos.x).toBe(-5);
      expect(pos.y).toBe(-10);
      expect(pos.z).toBe(-15);
    });

    it('should handle zero coordinates', () => {
      const pos: VoxelPosition = { x: 0, y: 0, z: 0 };
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
      expect(pos.z).toBe(0);
    });

    it('should handle decimal coordinates', () => {
      const pos: VoxelPosition = { x: 1.5, y: 2.7, z: 3.9 };
      expect(pos.x).toBe(1.5);
      expect(pos.y).toBe(2.7);
      expect(pos.z).toBe(3.9);
    });
  });

  describe('Chunk interface', () => {
    it('should create a valid chunk with default values', () => {
      const chunkSize = 16;
      const chunkHeight = 64;
      const blocks = new Uint8Array(chunkSize * chunkHeight * chunkSize);

      const chunk: Chunk = {
        x: 0,
        z: 0,
        blocks,
        mesh: null,
      };

      expect(chunk.x).toBe(0);
      expect(chunk.z).toBe(0);
      expect(chunk.blocks).toBeInstanceOf(Uint8Array);
      expect(chunk.blocks.length).toBe(chunkSize * chunkHeight * chunkSize);
      expect(chunk.mesh).toBeNull();
    });

    it('should handle negative chunk coordinates', () => {
      const chunk: Chunk = {
        x: -2,
        z: -3,
        blocks: new Uint8Array(16 * 64 * 16),
        mesh: null,
      };

      expect(chunk.x).toBe(-2);
      expect(chunk.z).toBe(-3);
    });

    it('should store correct number of blocks', () => {
      const chunkSize = 16;
      const chunkHeight = 64;
      const expectedBlockCount = chunkSize * chunkHeight * chunkSize; // 16,384

      const chunk: Chunk = {
        x: 0,
        z: 0,
        blocks: new Uint8Array(expectedBlockCount),
        mesh: null,
      };

      expect(chunk.blocks.length).toBe(16384);
    });

    it('should allow setting block types in the blocks array', () => {
      const chunk: Chunk = {
        x: 0,
        z: 0,
        blocks: new Uint8Array(16 * 64 * 16),
        mesh: null,
      };

      chunk.blocks[0] = BlockType.GRASS;
      chunk.blocks[100] = BlockType.STONE;
      chunk.blocks[1000] = BlockType.WATER;

      expect(chunk.blocks[0]).toBe(BlockType.GRASS);
      expect(chunk.blocks[100]).toBe(BlockType.STONE);
      expect(chunk.blocks[1000]).toBe(BlockType.WATER);
    });

    it('should initialize all blocks to AIR (0) by default', () => {
      const chunk: Chunk = {
        x: 0,
        z: 0,
        blocks: new Uint8Array(16 * 64 * 16),
        mesh: null,
      };

      // Uint8Array initializes to 0, which is BlockType.AIR
      expect(chunk.blocks.every(block => block === BlockType.AIR)).toBe(true);
    });
  });

  describe('WorldSettings interface', () => {
    it('should create valid world settings', () => {
      const settings: WorldSettings = {
        chunkSize: 16,
        chunkHeight: 64,
        renderDistance: 3,
        seaLevel: 32,
      };

      expect(settings.chunkSize).toBe(16);
      expect(settings.chunkHeight).toBe(64);
      expect(settings.renderDistance).toBe(3);
      expect(settings.seaLevel).toBe(32);
    });

    it('should handle different chunk sizes', () => {
      const settings: WorldSettings = {
        chunkSize: 32,
        chunkHeight: 128,
        renderDistance: 5,
        seaLevel: 64,
      };

      expect(settings.chunkSize).toBe(32);
      expect(settings.chunkHeight).toBe(128);
    });

    it('should handle minimum values', () => {
      const settings: WorldSettings = {
        chunkSize: 1,
        chunkHeight: 1,
        renderDistance: 0,
        seaLevel: 0,
      };

      expect(settings.chunkSize).toBeGreaterThanOrEqual(1);
      expect(settings.chunkHeight).toBeGreaterThanOrEqual(1);
      expect(settings.renderDistance).toBeGreaterThanOrEqual(0);
      expect(settings.seaLevel).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Block data consistency', () => {
    it('should have consistent type field matching the enum key', () => {
      Object.entries(BLOCK_TYPES).forEach(([key, data]) => {
        expect(data.type).toBe(Number(key));
      });
    });

    it('should have non-empty names for all blocks', () => {
      Object.values(BLOCK_TYPES).forEach((block: BlockData) => {
        expect(block.name.length).toBeGreaterThan(0);
      });
    });

    it('should have valid THREE.Color objects', () => {
      Object.values(BLOCK_TYPES).forEach((block: BlockData) => {
        expect(block.color).toBeInstanceOf(THREE.Color);
        expect(block.color.r).toBeGreaterThanOrEqual(0);
        expect(block.color.r).toBeLessThanOrEqual(1);
        expect(block.color.g).toBeGreaterThanOrEqual(0);
        expect(block.color.g).toBeLessThanOrEqual(1);
        expect(block.color.b).toBeGreaterThanOrEqual(0);
        expect(block.color.b).toBeLessThanOrEqual(1);
      });
    });

    it('should only have transparent flag on appropriate blocks', () => {
      Object.values(BLOCK_TYPES).forEach((block: BlockData) => {
        if (block.transparent === true) {
          // Transparent blocks should be air, water, lava, glass, leaves, or ice
          expect([
            BlockType.AIR,
            BlockType.WATER,
            BlockType.LAVA,
            BlockType.GLASS,
            BlockType.ICE,
            BlockType.LEAVES,
            BlockType.OAK_LEAVES,
            BlockType.BIRCH_LEAVES,
            BlockType.SPRUCE_LEAVES,
            BlockType.DARK_OAK_LEAVES,
            BlockType.ACACIA_LEAVES
          ]).toContain(block.type);
        }
      });
    });
  });

  describe('BlockCategory enum', () => {
    it('should have category enum values', () => {
      expect(BlockCategory.NATURAL).toBeDefined();
      expect(BlockCategory.BUILDING).toBeDefined();
      expect(BlockCategory.MINERAL).toBeDefined();
      expect(BlockCategory.DECORATION).toBeDefined();
      expect(BlockCategory.LIQUID).toBeDefined();
    });

    it('should have unique category values', () => {
      const values = Object.values(BlockCategory).filter(v => typeof v === 'number');
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('Block categories', () => {
    it('should assign category to all blocks', () => {
      Object.values(BLOCK_TYPES).forEach((block: BlockData) => {
        expect(block.category).toBeDefined();
        expect(typeof block.category).toBe('number');
      });
    });

    it('should have natural blocks category', () => {
      const naturalBlocks = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) => block.category === BlockCategory.NATURAL);

      expect(naturalBlocks.length).toBeGreaterThan(0);
      expect(naturalBlocks.map((b: BlockData) => b.type))
        .toEqual(expect.arrayContaining([
          BlockType.GRASS,
          BlockType.DIRT,
          BlockType.STONE,
          BlockType.SAND
        ]));
    });

    it('should have building blocks category', () => {
      const buildingBlocks = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) => block.category === BlockCategory.BUILDING);

      expect(buildingBlocks.length).toBeGreaterThan(0);
      expect(buildingBlocks.map((b: BlockData) => b.type))
        .toEqual(expect.arrayContaining([
          BlockType.BRICK,
          BlockType.PLANK,
          BlockType.COBBLESTONE
        ]));
    });

    it('should have mineral blocks category', () => {
      const mineralBlocks = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) => block.category === BlockCategory.MINERAL);

      expect(mineralBlocks.length).toBeGreaterThan(0);
    });

    it('should have decoration blocks category', () => {
      const decorationBlocks = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) => block.category === BlockCategory.DECORATION);

      expect(decorationBlocks.length).toBeGreaterThan(0);
    });

    it('should have liquid blocks category', () => {
      const liquidBlocks = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) => block.category === BlockCategory.LIQUID);

      expect(liquidBlocks.length).toBeGreaterThan(0);
      expect(liquidBlocks.map((b: BlockData) => b.type))
        .toEqual(expect.arrayContaining([BlockType.WATER]));
    });
  });

  describe('Block metadata', () => {
    it('should have hardness values for all blocks', () => {
      Object.values(BLOCK_TYPES).forEach((block: BlockData) => {
        expect(block.hardness).toBeDefined();
        expect(typeof block.hardness).toBe('number');
        expect(block.hardness).toBeGreaterThanOrEqual(0);
        expect(block.hardness).toBeLessThanOrEqual(100);
      });
    });

    it('should have bedrock with maximum hardness', () => {
      const bedrock = BLOCK_TYPES[BlockType.BEDROCK];
      expect(bedrock.hardness).toBe(100);
    });

    it('should have air with zero hardness', () => {
      const air = BLOCK_TYPES[BlockType.AIR];
      expect(air.hardness).toBe(0);
    });

    it('should have appropriate hardness for stone blocks', () => {
      const stone = BLOCK_TYPES[BlockType.STONE];
      expect(stone.hardness).toBeGreaterThan(5);
      expect(stone.hardness).toBeLessThan(100);
    });

    it('should have tool requirements for hard blocks', () => {
      const hardBlocks = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) => block.hardness > 10);

      hardBlocks.forEach((block: BlockData) => {
        if (block.type !== BlockType.BEDROCK) {
          expect(block.toolRequired).toBeDefined();
        }
      });
    });

    it('should have drop items defined for mineable blocks', () => {
      Object.values(BLOCK_TYPES).forEach((block: BlockData) => {
        if (block.type !== BlockType.AIR && block.hardness < 100) {
          expect(block.drops).toBeDefined();
          expect(Array.isArray(block.drops)).toBe(true);
        }
      });
    });

    it('should have bedrock with no drops', () => {
      const bedrock = BLOCK_TYPES[BlockType.BEDROCK];
      expect(bedrock.drops).toEqual([]);
    });

    it('should have some blocks that drop themselves', () => {
      const selfDropping = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) =>
          block.drops?.some(drop => drop.blockType === block.type)
        );

      expect(selfDropping.length).toBeGreaterThan(0);
    });

    it('should have some blocks that drop different items', () => {
      // Like grass dropping dirt, or ores dropping minerals
      const differentDrops = Object.values(BLOCK_TYPES)
        .filter((block: BlockData) =>
          block.drops?.some(drop => drop.blockType !== block.type)
        );

      expect(differentDrops.length).toBeGreaterThan(0);
    });

    it('should have valid drop quantities', () => {
      Object.values(BLOCK_TYPES).forEach((block: BlockData) => {
        if (block.drops && block.drops.length > 0) {
          block.drops.forEach(drop => {
            expect(drop.quantity).toBeGreaterThan(0);
            expect(drop.quantity).toBeLessThanOrEqual(64);
          });
        }
      });
    });
  });

  describe('New block types', () => {
    describe('Building blocks', () => {
      it('should have BRICK block', () => {
        expect(BlockType.BRICK).toBeDefined();
        const brick = BLOCK_TYPES[BlockType.BRICK];
        expect(brick.name).toBe('Brick');
        expect(brick.category).toBe(BlockCategory.BUILDING);
      });

      it('should have PLANK block', () => {
        expect(BlockType.PLANK).toBeDefined();
        const plank = BLOCK_TYPES[BlockType.PLANK];
        expect(plank.name).toBe('Plank');
        expect(plank.category).toBe(BlockCategory.BUILDING);
      });

      it('should have GLASS block', () => {
        expect(BlockType.GLASS).toBeDefined();
        const glass = BLOCK_TYPES[BlockType.GLASS];
        expect(glass.name).toBe('Glass');
        expect(glass.transparent).toBe(true);
        expect(glass.category).toBe(BlockCategory.BUILDING);
      });

      it('should have CONCRETE block', () => {
        expect(BlockType.CONCRETE).toBeDefined();
        const concrete = BLOCK_TYPES[BlockType.CONCRETE];
        expect(concrete.name).toBe('Concrete');
        expect(concrete.category).toBe(BlockCategory.BUILDING);
      });
    });

    describe('Mineral blocks', () => {
      it('should have COAL_ORE block', () => {
        expect(BlockType.COAL_ORE).toBeDefined();
        const coalOre = BLOCK_TYPES[BlockType.COAL_ORE];
        expect(coalOre.name).toBe('Coal Ore');
        expect(coalOre.category).toBe(BlockCategory.MINERAL);
      });

      it('should have IRON_ORE block', () => {
        expect(BlockType.IRON_ORE).toBeDefined();
        const ironOre = BLOCK_TYPES[BlockType.IRON_ORE];
        expect(ironOre.name).toBe('Iron Ore');
        expect(ironOre.category).toBe(BlockCategory.MINERAL);
      });

      it('should have GOLD_ORE block', () => {
        expect(BlockType.GOLD_ORE).toBeDefined();
        const goldOre = BLOCK_TYPES[BlockType.GOLD_ORE];
        expect(goldOre.name).toBe('Gold Ore');
        expect(goldOre.category).toBe(BlockCategory.MINERAL);
      });

      it('should have DIAMOND_ORE block', () => {
        expect(BlockType.DIAMOND_ORE).toBeDefined();
        const diamondOre = BLOCK_TYPES[BlockType.DIAMOND_ORE];
        expect(diamondOre.name).toBe('Diamond Ore');
        expect(diamondOre.category).toBe(BlockCategory.MINERAL);
      });
    });

    describe('Natural blocks', () => {
      it('should have GRAVEL block', () => {
        expect(BlockType.GRAVEL).toBeDefined();
        const gravel = BLOCK_TYPES[BlockType.GRAVEL];
        expect(gravel.name).toBe('Gravel');
        expect(gravel.category).toBe(BlockCategory.NATURAL);
      });

      it('should have CLAY block', () => {
        expect(BlockType.CLAY).toBeDefined();
        const clay = BLOCK_TYPES[BlockType.CLAY];
        expect(clay.name).toBe('Clay');
        expect(clay.category).toBe(BlockCategory.NATURAL);
      });

      it('should have ICE block', () => {
        expect(BlockType.ICE).toBeDefined();
        const ice = BLOCK_TYPES[BlockType.ICE];
        expect(ice.name).toBe('Ice');
        expect(ice.transparent).toBe(true);
        expect(ice.category).toBe(BlockCategory.NATURAL);
      });
    });

    describe('Decoration blocks', () => {
      it('should have FLOWER block', () => {
        expect(BlockType.FLOWER).toBeDefined();
        const flower = BLOCK_TYPES[BlockType.FLOWER];
        expect(flower.name).toBe('Flower');
        expect(flower.category).toBe(BlockCategory.DECORATION);
      });

      it('should have MUSHROOM block', () => {
        expect(BlockType.MUSHROOM).toBeDefined();
        const mushroom = BLOCK_TYPES[BlockType.MUSHROOM];
        expect(mushroom.name).toBe('Mushroom');
        expect(mushroom.category).toBe(BlockCategory.DECORATION);
      });
    });
  });
});
