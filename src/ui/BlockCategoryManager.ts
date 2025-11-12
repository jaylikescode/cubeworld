import { BlockCategory, BlockType, BLOCK_TYPES } from '../types/VoxelTypes';

/**
 * Manages block categorization and filtering for UI
 */
export class BlockCategoryManager {
  private currentCategory: BlockCategory;
  private categoryChangeCallbacks: ((category: BlockCategory) => void)[] = [];
  private categoryBlocksCache: Map<BlockCategory, BlockType[]> = new Map();

  // Category metadata
  private readonly CATEGORY_NAMES: Record<BlockCategory, string> = {
    [BlockCategory.NATURAL]: 'Natural',
    [BlockCategory.BUILDING]: 'Building',
    [BlockCategory.MINERAL]: 'Mineral',
    [BlockCategory.DECORATION]: 'Decoration',
    [BlockCategory.LIQUID]: 'Liquid',
  };

  private readonly CATEGORY_ICONS: Record<BlockCategory, string> = {
    [BlockCategory.NATURAL]: '🌿',
    [BlockCategory.BUILDING]: '🏗️',
    [BlockCategory.MINERAL]: '💎',
    [BlockCategory.DECORATION]: '🎨',
    [BlockCategory.LIQUID]: '💧',
  };

  private readonly ALL_CATEGORIES: BlockCategory[] = [
    BlockCategory.NATURAL,
    BlockCategory.BUILDING,
    BlockCategory.MINERAL,
    BlockCategory.DECORATION,
    BlockCategory.LIQUID,
  ];

  constructor() {
    this.currentCategory = BlockCategory.NATURAL;
    this.initializeCache();
  }

  /**
   * Initialize cache for all categories
   */
  private initializeCache(): void {
    this.ALL_CATEGORIES.forEach(category => {
      const blocks = this.filterBlocksByCategory(category);
      this.categoryBlocksCache.set(category, blocks);
    });
  }

  /**
   * Filter blocks by category (internal method)
   */
  private filterBlocksByCategory(category: BlockCategory): BlockType[] {
    const blockTypes = Object.values(BlockType).filter(v => typeof v === 'number') as BlockType[];

    return blockTypes.filter(blockType => {
      // Exclude AIR from all categories
      if (blockType === BlockType.AIR) {
        return false;
      }

      const blockData = BLOCK_TYPES[blockType];
      return blockData && blockData.category === category;
    });
  }

  /**
   * Get blocks by category (uses cache)
   */
  public getBlocksByCategory(category: BlockCategory): BlockType[] {
    const cached = this.categoryBlocksCache.get(category);
    if (cached) {
      return cached;
    }

    // If not cached (shouldn't happen), compute and cache
    const blocks = this.filterBlocksByCategory(category);
    this.categoryBlocksCache.set(category, blocks);
    return blocks;
  }

  /**
   * Get current category
   */
  public getCurrentCategory(): BlockCategory {
    return this.currentCategory;
  }

  /**
   * Set current category
   */
  public setCurrentCategory(category: BlockCategory): void {
    // Validate category
    if (!this.ALL_CATEGORIES.includes(category)) {
      return; // Invalid category, keep current
    }

    if (this.currentCategory !== category) {
      this.currentCategory = category;
      this.emitCategoryChange(category);
    }
  }

  /**
   * Get blocks from current category
   */
  public getCurrentBlocks(): BlockType[] {
    return this.getBlocksByCategory(this.currentCategory);
  }

  /**
   * Switch to next category
   */
  public nextCategory(): void {
    const currentIndex = this.ALL_CATEGORIES.indexOf(this.currentCategory);
    const nextIndex = (currentIndex + 1) % this.ALL_CATEGORIES.length;
    this.setCurrentCategory(this.ALL_CATEGORIES[nextIndex]);
  }

  /**
   * Switch to previous category
   */
  public previousCategory(): void {
    const currentIndex = this.ALL_CATEGORIES.indexOf(this.currentCategory);
    const previousIndex = (currentIndex - 1 + this.ALL_CATEGORIES.length) % this.ALL_CATEGORIES.length;
    this.setCurrentCategory(this.ALL_CATEGORIES[previousIndex]);
  }

  /**
   * Get category name
   */
  public getCategoryName(category: BlockCategory): string {
    return this.CATEGORY_NAMES[category] || 'Unknown';
  }

  /**
   * Get category icon
   */
  public getCategoryIcon(category: BlockCategory): string {
    return this.CATEGORY_ICONS[category] || '❓';
  }

  /**
   * Get all categories
   */
  public getAllCategories(): BlockCategory[] {
    return [...this.ALL_CATEGORIES];
  }

  /**
   * Get number of blocks in category
   */
  public getCategoryBlockCount(category: BlockCategory): number {
    return this.getBlocksByCategory(category).length;
  }

  /**
   * Search blocks by name
   * @param query Search query
   * @param currentCategoryOnly If true, search only in current category
   */
  public searchBlocks(query: string, currentCategoryOnly: boolean = false): BlockType[] {
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery) {
      return [];
    }

    const blocksToSearch = currentCategoryOnly
      ? this.getCurrentBlocks()
      : this.getAllBlocks();

    return blocksToSearch.filter(blockType => {
      const blockData = BLOCK_TYPES[blockType];
      return blockData && blockData.name.toLowerCase().includes(trimmedQuery);
    });
  }

  /**
   * Get all blocks across all categories (except AIR)
   */
  private getAllBlocks(): BlockType[] {
    const allBlocks: BlockType[] = [];
    this.ALL_CATEGORIES.forEach(category => {
      allBlocks.push(...this.getBlocksByCategory(category));
    });
    return allBlocks;
  }

  /**
   * Register callback for category change events
   */
  public onCategoryChange(callback: (category: BlockCategory) => void): void {
    this.categoryChangeCallbacks.push(callback);
  }

  /**
   * Emit category change event to all listeners
   */
  private emitCategoryChange(category: BlockCategory): void {
    this.categoryChangeCallbacks.forEach(callback => {
      callback(category);
    });
  }

  /**
   * Get category info for UI display
   */
  public getCategoryInfo(category: BlockCategory): {
    name: string;
    icon: string;
    blockCount: number;
  } {
    return {
      name: this.getCategoryName(category),
      icon: this.getCategoryIcon(category),
      blockCount: this.getCategoryBlockCount(category),
    };
  }

  /**
   * Get all categories with info
   */
  public getAllCategoriesWithInfo(): Array<{
    category: BlockCategory;
    name: string;
    icon: string;
    blockCount: number;
    isActive: boolean;
  }> {
    return this.ALL_CATEGORIES.map(category => ({
      category,
      ...this.getCategoryInfo(category),
      isActive: category === this.currentCategory,
    }));
  }
}
