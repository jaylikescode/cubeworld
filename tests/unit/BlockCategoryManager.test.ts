import { describe, it, expect, beforeEach } from 'vitest';
import { BlockCategoryManager } from '../../src/ui/BlockCategoryManager';
import { BlockCategory, BlockType } from '../../src/types/VoxelTypes';

describe('BlockCategoryManager', () => {
  let categoryManager: BlockCategoryManager;

  beforeEach(() => {
    categoryManager = new BlockCategoryManager();
  });

  describe('initialization', () => {
    it('should create a BlockCategoryManager instance', () => {
      expect(categoryManager).toBeDefined();
      expect(categoryManager).toBeInstanceOf(BlockCategoryManager);
    });

    it('should have default category as NATURAL', () => {
      const currentCategory = categoryManager.getCurrentCategory();
      expect(currentCategory).toBe(BlockCategory.NATURAL);
    });
  });

  describe('category filtering', () => {
    it('should return all NATURAL blocks', () => {
      const naturalBlocks = categoryManager.getBlocksByCategory(BlockCategory.NATURAL);

      expect(naturalBlocks.length).toBeGreaterThan(0);
      expect(naturalBlocks).toContain(BlockType.GRASS);
      expect(naturalBlocks).toContain(BlockType.DIRT);
      expect(naturalBlocks).toContain(BlockType.STONE);
      expect(naturalBlocks).toContain(BlockType.SAND);
    });

    it('should return all BUILDING blocks', () => {
      const buildingBlocks = categoryManager.getBlocksByCategory(BlockCategory.BUILDING);

      expect(buildingBlocks.length).toBeGreaterThan(0);
      expect(buildingBlocks).toContain(BlockType.BRICK);
      expect(buildingBlocks).toContain(BlockType.PLANK);
      expect(buildingBlocks).toContain(BlockType.COBBLESTONE);
      expect(buildingBlocks).toContain(BlockType.GLASS);
    });

    it('should return all MINERAL blocks', () => {
      const mineralBlocks = categoryManager.getBlocksByCategory(BlockCategory.MINERAL);

      expect(mineralBlocks.length).toBeGreaterThan(0);
      expect(mineralBlocks).toContain(BlockType.COAL_ORE);
      expect(mineralBlocks).toContain(BlockType.IRON_ORE);
      expect(mineralBlocks).toContain(BlockType.DIAMOND_ORE);
    });

    it('should return all DECORATION blocks', () => {
      const decorationBlocks = categoryManager.getBlocksByCategory(BlockCategory.DECORATION);

      expect(decorationBlocks.length).toBeGreaterThan(0);
      expect(decorationBlocks).toContain(BlockType.FLOWER);
      expect(decorationBlocks).toContain(BlockType.TORCH);
    });

    it('should return all LIQUID blocks', () => {
      const liquidBlocks = categoryManager.getBlocksByCategory(BlockCategory.LIQUID);

      expect(liquidBlocks.length).toBeGreaterThan(0);
      expect(liquidBlocks).toContain(BlockType.WATER);
      expect(liquidBlocks).toContain(BlockType.LAVA);
    });

    it('should not mix blocks from different categories', () => {
      const naturalBlocks = categoryManager.getBlocksByCategory(BlockCategory.NATURAL);
      const buildingBlocks = categoryManager.getBlocksByCategory(BlockCategory.BUILDING);

      // Natural blocks should not contain building blocks
      expect(naturalBlocks).not.toContain(BlockType.BRICK);
      expect(naturalBlocks).not.toContain(BlockType.PLANK);

      // Building blocks should not contain natural blocks
      expect(buildingBlocks).not.toContain(BlockType.GRASS);
      expect(buildingBlocks).not.toContain(BlockType.DIRT);
    });

    it('should exclude AIR from all categories', () => {
      const allCategories = [
        BlockCategory.NATURAL,
        BlockCategory.BUILDING,
        BlockCategory.MINERAL,
        BlockCategory.DECORATION,
        BlockCategory.LIQUID,
      ];

      allCategories.forEach(category => {
        const blocks = categoryManager.getBlocksByCategory(category);
        expect(blocks).not.toContain(BlockType.AIR);
      });
    });
  });

  describe('category switching', () => {
    it('should set current category', () => {
      categoryManager.setCurrentCategory(BlockCategory.BUILDING);
      expect(categoryManager.getCurrentCategory()).toBe(BlockCategory.BUILDING);
    });

    it('should get blocks from current category', () => {
      categoryManager.setCurrentCategory(BlockCategory.MINERAL);
      const currentBlocks = categoryManager.getCurrentBlocks();

      expect(currentBlocks).toContain(BlockType.COAL_ORE);
      expect(currentBlocks).toContain(BlockType.IRON_ORE);
      expect(currentBlocks).not.toContain(BlockType.GRASS);
    });

    it('should emit category change event', () => {
      let eventFired = false;
      let newCategory: BlockCategory | null = null;

      categoryManager.onCategoryChange((category) => {
        eventFired = true;
        newCategory = category;
      });

      categoryManager.setCurrentCategory(BlockCategory.DECORATION);

      expect(eventFired).toBe(true);
      expect(newCategory).toBe(BlockCategory.DECORATION);
    });

    it('should switch to next category', () => {
      categoryManager.setCurrentCategory(BlockCategory.NATURAL);
      categoryManager.nextCategory();
      expect(categoryManager.getCurrentCategory()).toBe(BlockCategory.BUILDING);

      categoryManager.nextCategory();
      expect(categoryManager.getCurrentCategory()).toBe(BlockCategory.MINERAL);
    });

    it('should wrap around to first category after last', () => {
      categoryManager.setCurrentCategory(BlockCategory.LIQUID);
      categoryManager.nextCategory();
      expect(categoryManager.getCurrentCategory()).toBe(BlockCategory.NATURAL);
    });

    it('should switch to previous category', () => {
      categoryManager.setCurrentCategory(BlockCategory.BUILDING);
      categoryManager.previousCategory();
      expect(categoryManager.getCurrentCategory()).toBe(BlockCategory.NATURAL);
    });

    it('should wrap around to last category before first', () => {
      categoryManager.setCurrentCategory(BlockCategory.NATURAL);
      categoryManager.previousCategory();
      expect(categoryManager.getCurrentCategory()).toBe(BlockCategory.LIQUID);
    });
  });

  describe('category information', () => {
    it('should get category name', () => {
      expect(categoryManager.getCategoryName(BlockCategory.NATURAL)).toBe('Natural');
      expect(categoryManager.getCategoryName(BlockCategory.BUILDING)).toBe('Building');
      expect(categoryManager.getCategoryName(BlockCategory.MINERAL)).toBe('Mineral');
      expect(categoryManager.getCategoryName(BlockCategory.DECORATION)).toBe('Decoration');
      expect(categoryManager.getCategoryName(BlockCategory.LIQUID)).toBe('Liquid');
    });

    it('should get category icon', () => {
      expect(categoryManager.getCategoryIcon(BlockCategory.NATURAL)).toBe('🌿');
      expect(categoryManager.getCategoryIcon(BlockCategory.BUILDING)).toBe('🏗️');
      expect(categoryManager.getCategoryIcon(BlockCategory.MINERAL)).toBe('💎');
      expect(categoryManager.getCategoryIcon(BlockCategory.DECORATION)).toBe('🎨');
      expect(categoryManager.getCategoryIcon(BlockCategory.LIQUID)).toBe('💧');
    });

    it('should get all categories', () => {
      const categories = categoryManager.getAllCategories();

      expect(categories).toHaveLength(5);
      expect(categories).toContain(BlockCategory.NATURAL);
      expect(categories).toContain(BlockCategory.BUILDING);
      expect(categories).toContain(BlockCategory.MINERAL);
      expect(categories).toContain(BlockCategory.DECORATION);
      expect(categories).toContain(BlockCategory.LIQUID);
    });

    it('should get category count', () => {
      const naturalCount = categoryManager.getCategoryBlockCount(BlockCategory.NATURAL);
      const buildingCount = categoryManager.getCategoryBlockCount(BlockCategory.BUILDING);

      expect(naturalCount).toBeGreaterThan(0);
      expect(buildingCount).toBeGreaterThan(0);
    });
  });

  describe('block search', () => {
    it('should search blocks by name', () => {
      const results = categoryManager.searchBlocks('stone');

      expect(results.length).toBeGreaterThan(0);
      expect(results).toContain(BlockType.STONE);
      expect(results).toContain(BlockType.SANDSTONE);
      expect(results).toContain(BlockType.COBBLESTONE);
    });

    it('should search case-insensitively', () => {
      const lowerResults = categoryManager.searchBlocks('grass');
      const upperResults = categoryManager.searchBlocks('GRASS');
      const mixedResults = categoryManager.searchBlocks('GrAsS');

      expect(lowerResults).toContain(BlockType.GRASS);
      expect(upperResults).toContain(BlockType.GRASS);
      expect(mixedResults).toContain(BlockType.GRASS);
    });

    it('should return empty array for no matches', () => {
      const results = categoryManager.searchBlocks('nonexistent');
      expect(results).toEqual([]);
    });

    it('should search within current category only', () => {
      categoryManager.setCurrentCategory(BlockCategory.BUILDING);
      const results = categoryManager.searchBlocks('stone', true);

      // Should find COBBLESTONE (building) but not STONE (natural)
      expect(results).toContain(BlockType.COBBLESTONE);
      expect(results).not.toContain(BlockType.STONE);
    });

    it('should search across all categories', () => {
      const results = categoryManager.searchBlocks('ore', false);

      expect(results).toContain(BlockType.COAL_ORE);
      expect(results).toContain(BlockType.IRON_ORE);
      expect(results).toContain(BlockType.DIAMOND_ORE);
    });
  });

  describe('performance', () => {
    it('should handle rapid category switching', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        categoryManager.nextCategory();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 100 switches in less than 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should cache category blocks', () => {
      const firstCall = categoryManager.getBlocksByCategory(BlockCategory.NATURAL);
      const secondCall = categoryManager.getBlocksByCategory(BlockCategory.NATURAL);

      // Should return the same array reference (cached)
      expect(firstCall).toBe(secondCall);
    });

    it('should handle rapid searches', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        categoryManager.searchBlocks('stone');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 100 searches in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('edge cases', () => {
    it('should handle empty search query', () => {
      const results = categoryManager.searchBlocks('');
      expect(results).toEqual([]);
    });

    it('should handle whitespace in search query', () => {
      const results = categoryManager.searchBlocks('  stone  ');
      expect(results).toContain(BlockType.STONE);
    });

    it('should not allow setting invalid category', () => {
      const initialCategory = categoryManager.getCurrentCategory();
      categoryManager.setCurrentCategory(999 as BlockCategory); // Invalid category

      // Should keep current category
      expect(categoryManager.getCurrentCategory()).toBe(initialCategory);
    });

    it('should handle multiple event listeners', () => {
      let listener1Called = false;
      let listener2Called = false;

      categoryManager.onCategoryChange(() => { listener1Called = true; });
      categoryManager.onCategoryChange(() => { listener2Called = true; });

      categoryManager.setCurrentCategory(BlockCategory.BUILDING);

      expect(listener1Called).toBe(true);
      expect(listener2Called).toBe(true);
    });
  });
});
