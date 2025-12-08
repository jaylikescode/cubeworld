import { CraftingSystem, Recipe } from '../core/CraftingSystem';
import { Inventory } from '../core/Inventory';
import { BlockType, BLOCK_TYPES } from '../types/VoxelTypes';

export class CraftingUI {
  private craftingSystem: CraftingSystem;
  private inventory: Inventory;
  private isOpen: boolean = false;
  private currentCategory: Recipe['category'] | 'all' = 'all';

  private panel: HTMLElement | null = null;
  private recipeList: HTMLElement | null = null;
  private inventoryDisplay: HTMLElement | null = null;

  constructor(craftingSystem: CraftingSystem, inventory: Inventory) {
    this.craftingSystem = craftingSystem;
    this.inventory = inventory;
    this.initializeUI();
  }

  private initializeUI(): void {
    // Create crafting panel (will be inserted into HTML)
    this.createCraftingPanel();
    this.updateRecipes();
    this.updateInventory();
  }

  private createCraftingPanel(): void {
    // The panel HTML will be added to index.html, but we set up event handlers here
    this.panel = document.getElementById('crafting-panel');
    this.recipeList = document.getElementById('recipe-list');
    this.inventoryDisplay = document.getElementById('inventory-display');

    // Category filter buttons
    const categoryButtons = document.querySelectorAll('[data-category]');
    categoryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-category') as Recipe['category'] | 'all';
        this.setCategory(category);
        
        // Update active state
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });

    // Close button
    const closeButton = document.getElementById('close-crafting');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close();
      });
    }

    // Crafting button handler is set up in updateRecipes
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    this.isOpen = true;
    if (this.panel) {
      this.panel.style.display = 'block';
      this.updateRecipes();
      this.updateInventory();
    }
  }

  public close(): void {
    this.isOpen = false;
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  }

  private setCategory(category: Recipe['category'] | 'all'): void {
    this.currentCategory = category;
    this.updateRecipes();
  }

  private updateRecipes(): void {
    if (!this.recipeList) return;

    // Get recipes based on current category
    const recipes = this.currentCategory === 'all'
      ? this.craftingSystem.getAllRecipes()
      : this.craftingSystem.getRecipesByCategory(this.currentCategory);

    // Clear existing recipes
    this.recipeList.innerHTML = '';

    // Sort recipes by name
    recipes.sort((a, b) => a.name.localeCompare(b.name));

    // Create recipe cards
    recipes.forEach((recipe) => {
      const recipeCard = this.createRecipeCard(recipe);
      if (this.recipeList) {
        this.recipeList.appendChild(recipeCard);
      }
    });

    // If no recipes, show message
    if (recipes.length === 0 && this.recipeList) {
      const noRecipes = document.createElement('div');
      noRecipes.className = 'no-recipes';
      noRecipes.textContent = 'No recipes in this category';
      this.recipeList.appendChild(noRecipes);
    }
  }

  private createRecipeCard(recipe: Recipe): HTMLElement {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const canCraft = this.craftingSystem.canCraft(recipe.id, this.inventory);
    if (!canCraft) {
      card.classList.add('unavailable');
    }

    // Recipe name
    const name = document.createElement('div');
    name.className = 'recipe-name';
    name.textContent = recipe.name;
    card.appendChild(name);

    // Ingredients
    const ingredients = document.createElement('div');
    ingredients.className = 'recipe-ingredients';
    
    const ingredientList: string[] = [];
    for (const [item, quantity] of recipe.ingredients) {
      const itemName = this.getItemDisplayName(item);
      const hasEnough = this.inventory.hasItem(item, quantity);
      ingredientList.push(`${hasEnough ? '✓' : '✗'} ${itemName} x${quantity}`);
    }
    
    ingredients.textContent = 'Ingredients: ' + ingredientList.join(', ');
    card.appendChild(ingredients);

    // Result
    const result = document.createElement('div');
    result.className = 'recipe-result';
    const resultName = this.getItemDisplayName(recipe.result);
    result.textContent = `Result: ${resultName} x${recipe.resultQuantity}`;
    card.appendChild(result);

    // Craft button
    const craftButton = document.createElement('button');
    craftButton.className = 'craft-button';
    craftButton.textContent = 'Craft';
    craftButton.disabled = !canCraft;
    
    craftButton.addEventListener('click', () => {
      if (this.craftingSystem.craft(recipe.id, this.inventory)) {
        // Success - update UI
        this.updateRecipes();
        this.updateInventory();
        
        // Show success message
        this.showCraftingMessage(`Crafted ${resultName}!`, 'success');
      } else {
        // Failed - show error
        this.showCraftingMessage('Cannot craft: Missing ingredients', 'error');
      }
    });
    
    card.appendChild(craftButton);

    return card;
  }

  private updateInventory(): void {
    if (!this.inventoryDisplay) return;

    const items = this.inventory.getAllItems();
    
    // Clear existing items
    this.inventoryDisplay.innerHTML = '';

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'inventory-empty';
      empty.textContent = 'Inventory is empty';
      this.inventoryDisplay.appendChild(empty);
      return;
    }

    // Create inventory items
    items.forEach((item) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'inventory-item';
      
      const name = document.createElement('span');
      name.className = 'item-name';
      name.textContent = item.displayName;
      
      const quantity = document.createElement('span');
      quantity.className = 'item-quantity';
      quantity.textContent = `x${item.quantity}`;
      
      itemElement.appendChild(name);
      itemElement.appendChild(quantity);
      if (this.inventoryDisplay) {
        this.inventoryDisplay.appendChild(itemElement);
      }
    });
  }

  private getItemDisplayName(item: BlockType | string): string {
    if (typeof item === 'string') {
      const specialNames: Record<string, string> = {
        'iron_golem': 'Iron Golem',
        'snow_golem': 'Snow Golem',
        'creeper_spawn': 'Creeper Spawn Egg',
        'zombie_spawn': 'Zombie Spawn Egg',
        'skeleton_spawn': 'Skeleton Spawn Egg',
        'pumpkin': 'Pumpkin',
        'rotten_flesh': 'Rotten Flesh',
        'bone': 'Bone',
        'arrow': 'Arrow',
      };
      return specialNames[item] || item;
    }
    return BLOCK_TYPES[item]?.name || `Block ${item}`;
  }

  private showCraftingMessage(message: string, type: 'success' | 'error'): void {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.className = `crafting-message ${type}`;
    messageEl.textContent = message;
    
    if (this.panel) {
      this.panel.appendChild(messageEl);
      
      // Remove after 3 seconds
      setTimeout(() => {
        messageEl.remove();
      }, 3000);
    }
  }

  public isPanelOpen(): boolean {
    return this.isOpen;
  }

  public refresh(): void {
    this.updateRecipes();
    this.updateInventory();
  }
}

