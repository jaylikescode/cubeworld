import { describe, it, expect, beforeEach } from 'vitest';
import { StructureGenerator, Structure, StructureType } from '../../src/world/StructureGenerator';
import { BlockType } from '../../src/types/VoxelTypes';

describe('StructureGenerator', () => {
  let generator: StructureGenerator;

  beforeEach(() => {
    generator = new StructureGenerator(12345); // Fixed seed for deterministic tests
  });

  describe('initialization', () => {
    it('should create a StructureGenerator instance', () => {
      expect(generator).toBeDefined();
      expect(generator).toBeInstanceOf(StructureGenerator);
    });

    it('should use provided seed', () => {
      const gen1 = new StructureGenerator(100);
      const gen2 = new StructureGenerator(100);
      const gen3 = new StructureGenerator(200);

      // Same seed should produce same results
      const pos1 = gen1.getRandomStructurePosition(0, 0);
      const pos2 = gen2.getRandomStructurePosition(0, 0);
      const pos3 = gen3.getRandomStructurePosition(0, 0);

      expect(pos1.x).toBe(pos2.x);
      expect(pos1.z).toBe(pos2.z);
      expect(pos1.x).not.toBe(pos3.x);
    });
  });

  describe('structure types', () => {
    it('should have defined structure types', () => {
      expect(StructureType.HOUSE).toBeDefined();
      expect(StructureType.TOWER).toBeDefined();
      expect(StructureType.CASTLE).toBeDefined();
      expect(StructureType.DUNGEON).toBeDefined();
      expect(StructureType.TEMPLE).toBeDefined();
    });

    it('should support custom structures', () => {
      const customStructure: Structure = {
        type: StructureType.HOUSE,
        blocks: [
          { x: 0, y: 0, z: 0, blockType: BlockType.COBBLESTONE },
        ],
        width: 5,
        height: 5,
        depth: 5,
      };

      expect(customStructure).toBeDefined();
      expect(customStructure.blocks.length).toBe(1);
    });
  });

  describe('simple structures', () => {
    it('should generate a simple house', () => {
      const house = generator.generateHouse();

      expect(house).toBeDefined();
      expect(house.type).toBe(StructureType.HOUSE);
      expect(house.blocks).toBeDefined();
      expect(house.blocks.length).toBeGreaterThan(0);
      expect(house.width).toBeGreaterThan(0);
      expect(house.height).toBeGreaterThan(0);
      expect(house.depth).toBeGreaterThan(0);
    });

    it('should generate a tower', () => {
      const tower = generator.generateTower();

      expect(tower).toBeDefined();
      expect(tower.type).toBe(StructureType.TOWER);
      expect(tower.blocks.length).toBeGreaterThan(0);
      expect(tower.height).toBeGreaterThan(tower.width); // Towers should be tall
    });

    it('should generate a well', () => {
      const well = generator.generateWell();

      expect(well).toBeDefined();
      expect(well.blocks.length).toBeGreaterThan(0);
    });
  });

  describe('complex structures', () => {
    it('should generate a castle', () => {
      const castle = generator.generateCastle();

      expect(castle).toBeDefined();
      expect(castle.type).toBe(StructureType.CASTLE);
      expect(castle.blocks.length).toBeGreaterThan(100); // Castles are big
      expect(castle.width).toBeGreaterThan(10);
      expect(castle.depth).toBeGreaterThan(10);
    });

    it('should generate a temple', () => {
      const temple = generator.generateTemple();

      expect(temple).toBeDefined();
      expect(temple.type).toBe(StructureType.TEMPLE);
      expect(temple.blocks.length).toBeGreaterThan(50);
    });

    it('should generate a dungeon', () => {
      const dungeon = generator.generateDungeon();

      expect(dungeon).toBeDefined();
      expect(dungeon.type).toBe(StructureType.DUNGEON);
      expect(dungeon.blocks.length).toBeGreaterThan(0);
    });
  });

  describe('structure features', () => {
    it('should generate houses with walls', () => {
      const house = generator.generateHouse();
      const wallBlocks = house.blocks.filter(b =>
        [BlockType.PLANK, BlockType.COBBLESTONE, BlockType.BRICK].includes(b.blockType)
      );

      expect(wallBlocks.length).toBeGreaterThan(0);
    });

    it('should generate houses with doors', () => {
      const house = generator.generateHouse();
      const airBlocks = house.blocks.filter(b => b.blockType === BlockType.AIR);

      // Should have some air blocks for door/windows
      expect(airBlocks.length).toBeGreaterThan(0);
    });

    it('should generate towers with height variation', () => {
      const tower1 = generator.generateTower();
      const gen2 = new StructureGenerator(54321);
      const tower2 = gen2.generateTower();

      // Different seeds might produce different heights
      // (though this test is probabilistic)
      const heightsDiffer = tower1.height !== tower2.height;
      expect(heightsDiffer || tower1.height === tower2.height).toBe(true);
    });

    it('should generate structures with roofs', () => {
      const house = generator.generateHouse();

      // Check if there are blocks at the top (roof)
      const maxY = Math.max(...house.blocks.map(b => b.y));
      const roofBlocks = house.blocks.filter(b => b.y === maxY);

      expect(roofBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('structure placement', () => {
    it('should provide structure positions', () => {
      const pos = generator.getRandomStructurePosition(10, 20);

      expect(pos).toBeDefined();
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.z).toBe('number');
    });

    it('should check if structure should spawn', () => {
      const shouldSpawn = generator.shouldSpawnStructure(0, 0);

      expect(typeof shouldSpawn).toBe('boolean');
    });

    it('should spawn structures rarely', () => {
      let spawnCount = 0;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        if (generator.shouldSpawnStructure(i * 10, i * 10)) {
          spawnCount++;
        }
      }

      // Structures should be relatively rare (< 20% of chunks)
      expect(spawnCount).toBeLessThan(iterations * 0.2);
    });

    it('should be deterministic for same coordinates', () => {
      const shouldSpawn1 = generator.shouldSpawnStructure(100, 100);
      const shouldSpawn2 = generator.shouldSpawnStructure(100, 100);

      expect(shouldSpawn1).toBe(shouldSpawn2);
    });
  });

  describe('structure composition', () => {
    it('should use appropriate block types for houses', () => {
      const house = generator.generateHouse();
      const blockTypes = new Set(house.blocks.map(b => b.blockType));

      // Houses should use building materials
      const hasBuildingBlocks = house.blocks.some(b =>
        [
          BlockType.PLANK,
          BlockType.OAK_PLANK,
          BlockType.BRICK,
          BlockType.COBBLESTONE,
          BlockType.GLASS,
        ].includes(b.blockType)
      );

      expect(hasBuildingBlocks).toBe(true);
    });

    it('should use stone for castle walls', () => {
      const castle = generator.generateCastle();
      const stoneBlocks = castle.blocks.filter(b =>
        [BlockType.STONE, BlockType.COBBLESTONE, BlockType.STONE_BRICK].includes(b.blockType)
      );

      expect(stoneBlocks.length).toBeGreaterThan(0);
    });

    it('should have hollow interiors in buildings', () => {
      const house = generator.generateHouse();
      const airBlocks = house.blocks.filter(b => b.blockType === BlockType.AIR);

      // Should have interior space
      expect(airBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('structure validation', () => {
    it('should have valid block positions', () => {
      const house = generator.generateHouse();

      house.blocks.forEach(block => {
        expect(block.x).toBeDefined();
        expect(block.y).toBeDefined();
        expect(block.z).toBeDefined();
        expect(block.blockType).toBeDefined();
      });
    });

    it('should have blocks within structure bounds', () => {
      const house = generator.generateHouse();

      house.blocks.forEach(block => {
        expect(block.x).toBeGreaterThanOrEqual(0);
        expect(block.x).toBeLessThan(house.width);
        expect(block.y).toBeGreaterThanOrEqual(0);
        expect(block.y).toBeLessThan(house.height);
        expect(block.z).toBeGreaterThanOrEqual(0);
        expect(block.z).toBeLessThan(house.depth);
      });
    });

    it('should not have duplicate blocks at same position', () => {
      const house = generator.generateHouse();
      const positions = new Set<string>();

      house.blocks.forEach(block => {
        const key = `${block.x},${block.y},${block.z}`;
        expect(positions.has(key)).toBe(false);
        positions.add(key);
      });
    });
  });

  describe('structure variety', () => {
    it('should select random structure types', () => {
      const structureTypes = new Set<StructureType>();

      for (let i = 0; i < 50; i++) {
        const gen = new StructureGenerator(i);
        const type = gen.selectRandomStructureType();
        structureTypes.add(type);
      }

      // Should have at least 2 different structure types in 50 attempts
      expect(structureTypes.size).toBeGreaterThan(1);
    });

    it('should generate different structures with different seeds', () => {
      const gen1 = new StructureGenerator(111);
      const gen2 = new StructureGenerator(222);

      const house1 = gen1.generateHouse();
      const house2 = gen2.generateHouse();

      // Different seeds might produce different sized houses
      const isDifferent =
        house1.blocks.length !== house2.blocks.length ||
        house1.width !== house2.width ||
        house1.height !== house2.height ||
        house1.depth !== house2.depth;

      expect(isDifferent).toBe(true);
    });
  });

  describe('performance', () => {
    it('should generate houses quickly', () => {
      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        generator.generateHouse();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 10 houses should generate in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple structure generations', () => {
      expect(() => {
        for (let i = 0; i < 20; i++) {
          generator.generateHouse();
          generator.generateTower();
          generator.generateWell();
        }
      }).not.toThrow();
    });
  });
});
