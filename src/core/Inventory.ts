import { BlockType, BLOCK_TYPES } from '../types/VoxelTypes';

export interface InventoryItem {
  type: BlockType | string; // Can be block type or special item ID
  quantity: number;
  displayName: string;
}

export class Inventory {
  private items: Map<string | BlockType, number> = new Map();
  private maxStackSize: number = 64;

  constructor() {
    // Initialize with some basic items for testing
    this.addItem(BlockType.STONE, 32);
    this.addItem(BlockType.WOOD, 16);
    this.addItem(BlockType.IRON_BLOCK, 8);
    this.addItem(BlockType.SNOW, 16);
  }

  /**
   * Add items to inventory
   */
  public addItem(item: BlockType | string, quantity: number): void {
    const current = this.items.get(item) || 0;
    this.items.set(item, Math.min(current + quantity, this.maxStackSize * 10)); // Allow multiple stacks for simplicity
  }

  /**
   * Remove items from inventory
   */
  public removeItem(item: BlockType | string, quantity: number): boolean {
    const current = this.items.get(item) || 0;
    if (current < quantity) {
      return false;
    }
    const newQuantity = current - quantity;
    if (newQuantity <= 0) {
      this.items.delete(item);
    } else {
      this.items.set(item, newQuantity);
    }
    return true;
  }

  /**
   * Check if we have enough of an item
   */
  public hasItem(item: BlockType | string, quantity: number): boolean {
    const current = this.items.get(item) || 0;
    return current >= quantity;
  }

  /**
   * Get quantity of an item
   */
  public getQuantity(item: BlockType | string): number {
    return this.items.get(item) || 0;
  }

  /**
   * Check if we have all required items for a recipe
   */
  public hasItems(requirements: Map<BlockType | string, number>): boolean {
    for (const [item, quantity] of requirements.entries()) {
      if (!this.hasItem(item, quantity)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Remove all items required for a recipe
   */
  public removeItems(requirements: Map<BlockType | string, number>): boolean {
    if (!this.hasItems(requirements)) {
      return false;
    }

    for (const [item, quantity] of requirements.entries()) {
      this.removeItem(item, quantity);
    }
    return true;
  }

  /**
   * Get all items in inventory
   */
  public getAllItems(): InventoryItem[] {
    const result: InventoryItem[] = [];
    for (const [item, quantity] of this.items.entries()) {
      result.push({
        type: item,
        quantity,
        displayName: this.getItemDisplayName(item),
      });
    }
    return result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  /**
   * Get display name for an item
   */
  private getItemDisplayName(item: BlockType | string): string {
    if (typeof item === 'string') {
      // Special items
      const specialNames: Record<string, string> = {
        'iron_golem': 'Iron Golem',
        'snow_golem': 'Snow Golem',
        'creeper_spawn': 'Creeper Spawn Egg',
        'zombie_spawn': 'Zombie Spawn Egg',
        'skeleton_spawn': 'Skeleton Spawn Egg',
      };
      return specialNames[item] || item;
    }
    
    // Block types
    return BLOCK_TYPES[item]?.name || `Block ${item}`;
  }
}

