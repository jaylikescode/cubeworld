import { BlockCategory } from '../types/VoxelTypes';
import { BlockCategoryManager } from './BlockCategoryManager';
import type { Orientation } from '../utils/OrientationManager';

/**
 * MobileDrawer - Side drawer menu for mobile devices
 * Slides in from the right to show categories and settings
 * Supports both portrait and landscape orientations
 */
export class MobileDrawer {
  private container: HTMLElement;
  private drawerElement: HTMLElement;
  private overlayElement: HTMLElement;
  private isOpenState: boolean = false;
  private activeCategory: number = BlockCategory.NATURAL;
  private currentOrientation: Orientation = 'portrait';
  private categoryChangeCallbacks: ((category: number) => void)[] = [];
  private categoryManager: BlockCategoryManager;

  constructor(container: HTMLElement, categoryManager: BlockCategoryManager) {
    this.container = container;
    this.categoryManager = categoryManager;
    this.overlayElement = this.createOverlay();
    this.drawerElement = this.createDrawer();

    this.container.appendChild(this.overlayElement);
    this.container.appendChild(this.drawerElement);

    this.renderCategories();
    
    // Initialize layout based on initial orientation
    this.updateOrientationLayout();
  }

  /**
   * Create overlay element
   */
  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.addEventListener('click', () => this.close());
    return overlay;
  }

  /**
   * Create drawer element
   */
  private createDrawer(): HTMLElement {
    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.classList.add(this.currentOrientation); // Add orientation class
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Navigation menu');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('data-orientation', this.currentOrientation);

    const header = document.createElement('div');
    header.className = 'drawer-header';

    const title = document.createElement('div');
    title.className = 'drawer-title';
    title.textContent = 'Menu';

    const closeButton = document.createElement('button');
    closeButton.className = 'drawer-close';
    closeButton.textContent = '✕';
    closeButton.setAttribute('aria-label', 'Close menu');
    closeButton.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeButton);

    const content = document.createElement('div');
    content.className = 'drawer-content';

    drawer.appendChild(header);
    drawer.appendChild(content);

    return drawer;
  }

  /**
   * Render category buttons
   */
  private renderCategories(): void {
    const content = this.drawerElement.querySelector('.drawer-content')!;
    content.innerHTML = '';

    const categoriesSection = document.createElement('div');
    categoriesSection.className = 'drawer-section';

    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'drawer-section-title';
    sectionTitle.textContent = 'Categories';

    categoriesSection.appendChild(sectionTitle);

    // Render each category
    const categories = this.categoryManager.getAllCategoriesWithInfo();
    categories.forEach(({ category, name, icon }) => {
      const button = this.createCategoryButton(category, name, icon);
      categoriesSection.appendChild(button);
    });

    content.appendChild(categoriesSection);
  }

  /**
   * Create a category button
   */
  private createCategoryButton(categoryId: number, name: string, icon: string): HTMLElement {
    const button = document.createElement('button');
    button.className = 'drawer-category-btn';
    button.setAttribute('data-category', categoryId.toString());
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', `Select ${name} category`);

    if (this.activeCategory === categoryId) {
      button.classList.add('active');
    }

    const iconEl = document.createElement('span');
    iconEl.className = 'category-icon';
    iconEl.textContent = icon;

    const label = document.createElement('span');
    label.className = 'category-label';
    label.textContent = name;

    button.appendChild(iconEl);
    button.appendChild(label);

    // Event listeners
    button.addEventListener('click', () => this.selectCategory(categoryId));
    button.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.selectCategory(categoryId);
    });

    return button;
  }

  /**
   * Select a category
   */
  private selectCategory(categoryId: number): void {
    // Update active state
    const buttons = this.drawerElement.querySelectorAll('.drawer-category-btn');
    buttons.forEach(btn => {
      btn.classList.remove('active');
    });

    const selectedButton = this.drawerElement.querySelector(`[data-category="${categoryId}"]`);
    if (selectedButton) {
      selectedButton.classList.add('active');
    }

    this.activeCategory = categoryId;

    // Trigger callbacks
    this.categoryChangeCallbacks.forEach(callback => callback(categoryId));

    // Close drawer after selection
    this.close();
  }

  /**
   * Open the drawer
   */
  public open(): void {
    this.isOpenState = true;
    this.drawerElement.classList.add('open');
    this.overlayElement.classList.add('active');
    this.drawerElement.setAttribute('aria-hidden', 'false');
  }

  /**
   * Close the drawer
   */
  public close(): void {
    this.isOpenState = false;
    this.drawerElement.classList.remove('open');
    this.overlayElement.classList.remove('active');
    this.drawerElement.setAttribute('aria-hidden', 'true');
  }

  /**
   * Toggle drawer state
   */
  public toggle(): void {
    if (this.isOpenState) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Check if drawer is open
   */
  public isOpen(): boolean {
    return this.isOpenState;
  }

  /**
   * Set active category programmatically
   */
  public setActiveCategory(categoryId: number): void {
    this.activeCategory = categoryId;

    // Update UI
    const buttons = this.drawerElement.querySelectorAll('.drawer-category-btn');
    buttons.forEach(btn => {
      const btnCategoryId = parseInt(btn.getAttribute('data-category')!);
      if (btnCategoryId === categoryId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Get currently active category
   */
  public getActiveCategory(): number {
    return this.activeCategory;
  }

  /**
   * Register callback for category change
   */
  public onCategoryChange(callback: (category: number) => void): void {
    this.categoryChangeCallbacks.push(callback);
  }

  /**
   * Set orientation and update layout
   */
  public setOrientation(orientation: Orientation): void {
    if (this.currentOrientation === orientation) {
      return; // No change needed
    }

    this.currentOrientation = orientation;
    this.updateOrientationLayout();
  }

  /**
   * Get current orientation
   */
  public getOrientation(): Orientation {
    return this.currentOrientation;
  }

  /**
   * Update layout based on current orientation
   */
  private updateOrientationLayout(): void {
    // Remove old orientation classes
    this.drawerElement.classList.remove('portrait', 'landscape');
    
    // Add new orientation class
    this.drawerElement.classList.add(this.currentOrientation);

    // Update aria attributes
    this.drawerElement.setAttribute('data-orientation', this.currentOrientation);

    // Update drawer width based on orientation
    // Portrait: 80% width (more immersive)
    // Landscape: 60% width (less space needed)
    if (this.currentOrientation === 'landscape') {
      this.drawerElement.style.maxWidth = '300px';
      this.drawerElement.style.width = '60%';
    } else {
      this.drawerElement.style.maxWidth = '320px';
      this.drawerElement.style.width = '80%';
    }
  }

  /**
   * Clean up and remove the drawer
   */
  public destroy(): void {
    if (this.drawerElement && this.drawerElement.parentNode) {
      this.drawerElement.parentNode.removeChild(this.drawerElement);
    }

    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
  }
}
