import { BlockType } from '../types/VoxelTypes';
import { Inventory } from './Inventory';

export type CraftableItem = BlockType | string;

export interface Recipe {
  id: string;
  name: string;
  category: 'blocks' | 'entities' | 'tools' | 'special';
  ingredients: Array<[CraftableItem, number]>; // Item type -> quantity (using array for mixed types)
  result: CraftableItem; // Result item
  resultQuantity: number;
  craftingTime?: number; // Optional crafting time in seconds
}

export class CraftingSystem {
  private recipes: Map<string, Recipe> = new Map();

  constructor() {
    this.initializeRecipes();
  }

  /**
   * Initialize all crafting recipes
   */
  private initializeRecipes(): void {
    // Prismarine recipes
    this.addRecipe({
      id: 'prismarine',
      name: 'Prismarine',
      category: 'blocks',
      ingredients: [
        [BlockType.WATER, 2],
        [BlockType.SAND, 1],
      ],
      result: BlockType.PRISMARINE,
      resultQuantity: 4,
    });

    this.addRecipe({
      id: 'prismarine_bricks',
      name: 'Prismarine Bricks',
      category: 'blocks',
      ingredients: [
        [BlockType.PRISMARINE, 4],
      ],
      result: BlockType.PRISMARINE_BRICKS,
      resultQuantity: 4,
    });

    this.addRecipe({
      id: 'dark_prismarine',
      name: 'Dark Prismarine',
      category: 'blocks',
      ingredients: [
        [BlockType.PRISMARINE, 8],
        [BlockType.STONE, 1],
      ],
      result: BlockType.DARK_PRISMARINE,
      resultQuantity: 8,
    });

    // Wool recipes
    this.addRecipe({
      id: 'wool_white',
      name: 'White Wool',
      category: 'blocks',
      ingredients: [
        [BlockType.WOOD, 4],
        [BlockType.SNOW, 1],
      ],
      result: BlockType.WOOL_WHITE,
      resultQuantity: 4,
    });

    this.addRecipe({
      id: 'wool_black',
      name: 'Black Wool',
      category: 'blocks',
      ingredients: [
        [BlockType.WOOL_WHITE, 1],
        [BlockType.STONE, 1],
      ],
      result: BlockType.WOOL_BLACK,
      resultQuantity: 1,
    });

    this.addRecipe({
      id: 'wool_red',
      name: 'Red Wool',
      category: 'blocks',
      ingredients: [
        [BlockType.WOOL_WHITE, 1],
        [BlockType.STONE, 1], // Simplified - in real Minecraft this would be red dye
      ],
      result: BlockType.WOOL_RED,
      resultQuantity: 1,
    });

    this.addRecipe({
      id: 'wool_blue',
      name: 'Blue Wool',
      category: 'blocks',
      ingredients: [
        [BlockType.WOOL_WHITE, 1],
        [BlockType.WATER, 1], // Simplified - in real Minecraft this would be blue dye
      ],
      result: BlockType.WOOL_BLUE,
      resultQuantity: 1,
    });

    this.addRecipe({
      id: 'wool_green',
      name: 'Green Wool',
      category: 'blocks',
      ingredients: [
        [BlockType.WOOL_WHITE, 1],
        [BlockType.GRASS, 1], // Simplified - in real Minecraft this would be green dye
      ],
      result: BlockType.WOOL_GREEN,
      resultQuantity: 1,
    });

    this.addRecipe({
      id: 'wool_yellow',
      name: 'Yellow Wool',
      category: 'blocks',
      ingredients: [
        [BlockType.WOOL_WHITE, 1],
        [BlockType.SAND, 1], // Simplified - in real Minecraft this would be yellow dye
      ],
      result: BlockType.WOOL_YELLOW,
      resultQuantity: 1,
    });

    // Beacon recipe
    this.addRecipe({
      id: 'beacon',
      name: 'Beacon',
      category: 'special',
      ingredients: [
        [BlockType.STONE, 3],
        [BlockType.IRON_BLOCK, 1],
      ],
      result: BlockType.BEACON,
      resultQuantity: 1,
    });

    // Iron Block recipe (for crafting golems)
    this.addRecipe({
      id: 'iron_block',
      name: 'Iron Block',
      category: 'blocks',
      ingredients: [
        [BlockType.STONE, 9],
      ],
      result: BlockType.IRON_BLOCK,
      resultQuantity: 1,
    });

    // Golem recipes
    // Note: Using simplified recipes - in real Minecraft, golems are built in the world, not crafted
    this.addRecipe({
      id: 'iron_golem',
      name: 'Iron Golem',
      category: 'entities',
      ingredients: [
        [BlockType.IRON_BLOCK, 4],
        ['pumpkin', 1], // Using string ID for non-block items
      ],
      result: 'iron_golem',
      resultQuantity: 1,
    });

    this.addRecipe({
      id: 'snow_golem',
      name: 'Snow Golem',
      category: 'entities',
      ingredients: [
        [BlockType.SNOW, 2],
        ['pumpkin', 1],
      ],
      result: 'snow_golem',
      resultQuantity: 1,
    });

    // Mob spawn egg recipes
    this.addRecipe({
      id: 'creeper_spawn',
      name: 'Creeper Spawn Egg',
      category: 'entities',
      ingredients: [
        [BlockType.GRASS, 4],
        [BlockType.SAND, 2],
      ],
      result: 'creeper_spawn',
      resultQuantity: 1,
    });

    this.addRecipe({
      id: 'zombie_spawn',
      name: 'Zombie Spawn Egg',
      category: 'entities',
      ingredients: [
        [BlockType.DIRT, 4],
        ['rotten_flesh', 1],
      ],
      result: 'zombie_spawn',
      resultQuantity: 1,
    });

    this.addRecipe({
      id: 'skeleton_spawn',
      name: 'Skeleton Spawn Egg',
      category: 'entities',
      ingredients: [
        ['bone', 2],
        ['arrow', 1],
      ],
      result: 'skeleton_spawn',
      resultQuantity: 1,
    });
  }

  /**
   * Convert ingredients array to Map for inventory checking
   */
  private ingredientsToMap(ingredients: Array<[CraftableItem, number]>): Map<CraftableItem, number> {
    const map = new Map<CraftableItem, number>();
    for (const [item, quantity] of ingredients) {
      map.set(item, quantity);
    }
    return map;
  }

  /**
   * Add a recipe to the system
   */
  private addRecipe(recipe: Recipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  /**
   * Get all recipes
   */
  public getAllRecipes(): Recipe[] {
    return Array.from(this.recipes.values());
  }

  /**
   * Get recipes by category
   */
  public getRecipesByCategory(category: Recipe['category']): Recipe[] {
    return this.getAllRecipes().filter(r => r.category === category);
  }

  /**
   * Get a specific recipe by ID
   */
  public getRecipe(id: string): Recipe | undefined {
    return this.recipes.get(id);
  }

  /**
   * Check if player can craft a recipe
   */
  public canCraft(recipeId: string, inventory: Inventory): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return false;
    }
    const ingredientsMap = this.ingredientsToMap(recipe.ingredients);
    return inventory.hasItems(ingredientsMap);
  }

  /**
   * Craft an item from a recipe
   */
  public craft(recipeId: string, inventory: Inventory): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return false;
    }

    const ingredientsMap = this.ingredientsToMap(recipe.ingredients);
    if (!inventory.hasItems(ingredientsMap)) {
      return false;
    }

    // Remove ingredients
    inventory.removeItems(ingredientsMap);

    // Add result
    inventory.addItem(recipe.result, recipe.resultQuantity);

    return true;
  }

  /**
   * Get recipes that can be crafted with current inventory
   */
  public getCraftableRecipes(inventory: Inventory): Recipe[] {
    return this.getAllRecipes().filter(recipe => {
      const ingredientsMap = this.ingredientsToMap(recipe.ingredients);
      return inventory.hasItems(ingredientsMap);
    });
  }
}

