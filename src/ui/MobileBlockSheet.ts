import { BlockType, BLOCK_TYPES } from '../types/VoxelTypes';
import type { Orientation } from '../utils/OrientationManager';

/**
 * Get block icon - using dynamic approach to avoid duplication
 */
function getBlockIcon(blockType: BlockType): string {
  const iconMap: Partial<Record<BlockType, string>> = {
    [BlockType.AIR]: '⬛',
    [BlockType.WATER]: '💧',
    [BlockType.LAVA]: '🌋',
    [BlockType.GRASS]: '🟩',
    [BlockType.DIRT]: '🟫',
    [BlockType.STONE]: '⬜',
    [BlockType.SAND]: '🟨',
    [BlockType.GRAVEL]: '◽',
    [BlockType.CLAY]: '🟧',
    [BlockType.SNOW]: '❄️',
    [BlockType.ICE]: '🧊',
    [BlockType.BEDROCK]: '⬛',
    [BlockType.SANDSTONE]: '🟫',
    [BlockType.RED_SAND]: '🟥',
    [BlockType.PODZOL]: '🟤',
    [BlockType.MYCELIUM]: '🟣',
    [BlockType.NETHERRACK]: '🔴',
    [BlockType.END_STONE]: '🟡',
    [BlockType.OBSIDIAN]: '⬛',
    [BlockType.WOOD]: '🪵',
    [BlockType.OAK_LOG]: '🪵',
    [BlockType.BIRCH_LOG]: '🪵',
    [BlockType.SPRUCE_LOG]: '🪵',
    [BlockType.DARK_OAK_LOG]: '🪵',
    [BlockType.ACACIA_LOG]: '🪵',
    [BlockType.LEAVES]: '🍃',
    [BlockType.OAK_LEAVES]: '🍃',
    [BlockType.BIRCH_LEAVES]: '🍃',
    [BlockType.SPRUCE_LEAVES]: '🍃',
    [BlockType.DARK_OAK_LEAVES]: '🍃',
    [BlockType.ACACIA_LEAVES]: '🍃',
    [BlockType.COAL_ORE]: '⚫',
    [BlockType.IRON_ORE]: '⚪',
    [BlockType.GOLD_ORE]: '🟡',
    [BlockType.DIAMOND_ORE]: '💎',
    [BlockType.EMERALD_ORE]: '🟢',
    [BlockType.REDSTONE_ORE]: '🔴',
    [BlockType.LAPIS_ORE]: '🔵',
    [BlockType.COPPER_ORE]: '🟠',
    [BlockType.QUARTZ_ORE]: '⚪',
    [BlockType.COAL_BLOCK]: '⬛',
    [BlockType.IRON_BLOCK]: '⬜',
    [BlockType.GOLD_BLOCK]: '🟨',
    [BlockType.DIAMOND_BLOCK]: '💎',
    [BlockType.EMERALD_BLOCK]: '🟩',
    [BlockType.REDSTONE_BLOCK]: '🟥',
    [BlockType.PLANK]: '🟫',
    [BlockType.OAK_PLANK]: '🟫',
    [BlockType.BIRCH_PLANK]: '🟫',
    [BlockType.SPRUCE_PLANK]: '🟫',
    [BlockType.COBBLESTONE]: '🪨',
    [BlockType.STONE_BRICK]: '⬜',
    [BlockType.BRICK]: '🧱',
    [BlockType.GLASS]: '🔷',
    [BlockType.CONCRETE]: '⬜',
    [BlockType.WHITE_CONCRETE]: '⬜',
    [BlockType.GRAY_CONCRETE]: '◽',
    [BlockType.BLACK_CONCRETE]: '⬛',
    [BlockType.RED_CONCRETE]: '🟥',
    [BlockType.BLUE_CONCRETE]: '🟦',
    [BlockType.GREEN_CONCRETE]: '🟩',
    [BlockType.FLOWER]: '🌸',
    [BlockType.ROSE]: '🌹',
    [BlockType.DANDELION]: '🌼',
    [BlockType.TULIP]: '🌷',
    [BlockType.MUSHROOM]: '🍄',
    [BlockType.RED_MUSHROOM]: '🍄',
    [BlockType.BROWN_MUSHROOM]: '🍄',
    [BlockType.TORCH]: '🔥',
    [BlockType.LANTERN]: '🏮',
  };

  return iconMap[blockType] || '❓';
}

/**
 * MobileBlockSheet - Bottom sheet for block selection on mobile devices
 * Slides up from bottom (portrait) or in from right (landscape)
 * Supports both portrait and landscape orientations
 */
export class MobileBlockSheet {
  private container: HTMLElement;
  private sheetElement: HTMLElement;
  private overlayElement: HTMLElement;
  private gridElement: HTMLElement;
  private isOpenState: boolean = false;
  private selectedBlock?: BlockType;
  private currentOrientation: Orientation = 'portrait';
  private blockSelectCallbacks: ((block: BlockType) => void)[] = [];

  // Touch gesture tracking
  private touchStartY: number = 0;
  private touchStartX: number = 0;
  private isDragging: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.overlayElement = this.createOverlay();
    this.sheetElement = this.createSheet();
    this.gridElement = this.sheetElement.querySelector('.mobile-block-grid')!;

    this.container.appendChild(this.overlayElement);
    this.container.appendChild(this.sheetElement);

    this.attachEventListeners();
    
    // Initialize grid layout based on initial orientation
    this.updateGridLayout();
  }

  /**
   * Create overlay element
   */
  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-sheet-overlay';
    overlay.addEventListener('click', () => this.close());
    return overlay;
  }

  /**
   * Create sheet element
   */
  private createSheet(): HTMLElement {
    const sheet = document.createElement('div');
    sheet.className = 'mobile-block-sheet';
    sheet.classList.add(this.currentOrientation); // Add orientation class
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Block selection');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.setAttribute('data-orientation', this.currentOrientation);

    const handle = document.createElement('div');
    handle.className = 'bottom-sheet-handle';

    const title = document.createElement('div');
    title.className = 'bottom-sheet-title';
    title.textContent = 'Select Block';

    const grid = document.createElement('div');
    grid.className = 'mobile-block-grid';

    sheet.appendChild(handle);
    sheet.appendChild(title);
    sheet.appendChild(grid);

    return sheet;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const handle = this.sheetElement.querySelector('.bottom-sheet-handle')!;

    // Handle swipe gestures
    handle.addEventListener('touchstart', (e: Event) => {
      const touchEvent = e as TouchEvent;
      this.touchStartY = touchEvent.touches[0].clientY;
      this.touchStartX = touchEvent.touches[0].clientX;
      this.isDragging = true;
    });

    handle.addEventListener('touchmove', (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (!this.isDragging) return;

      if (this.currentOrientation === 'portrait') {
        // Portrait: Drag down to close
        const currentY = touchEvent.touches[0].clientY;
        const deltaY = currentY - this.touchStartY;
        if (deltaY > 0) e.preventDefault();
      } else {
        // Landscape: Drag right to close
        const currentX = touchEvent.touches[0].clientX;
        const deltaX = currentX - this.touchStartX;
        if (deltaX > 0) e.preventDefault();
      }
    });

    handle.addEventListener('touchend', (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (!this.isDragging) return;

      if (this.currentOrientation === 'portrait') {
        const endY = touchEvent.changedTouches[0].clientY;
        const deltaY = endY - this.touchStartY;
        if (deltaY > 50) this.close();
      } else {
        // Landscape: Drag right to close
        const endX = touchEvent.changedTouches[0].clientX;
        const deltaX = endX - this.touchStartX;
        if (deltaX > 50) this.close();
      }

      this.isDragging = false;
    });
  }

  /**
   * Open the sheet
   */
  public open(): void {
    this.isOpenState = true;
    this.sheetElement.classList.add('open');
    this.overlayElement.classList.add('active');
    this.sheetElement.setAttribute('aria-hidden', 'false');
  }

  /**
   * Close the sheet
   */
  public close(): void {
    this.isOpenState = false;
    this.sheetElement.classList.remove('open');
    this.overlayElement.classList.remove('active');
    this.sheetElement.setAttribute('aria-hidden', 'true');
  }

  /**
   * Toggle sheet state
   */
  public toggle(): void {
    if (this.isOpenState) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Check if sheet is open
   */
  public isOpen(): boolean {
    return this.isOpenState;
  }

  /**
   * Render blocks in grid
   */
  public renderBlocks(blocks: BlockType[]): void {
    this.gridElement.innerHTML = '';

    blocks.forEach(blockType => {
      const button = this.createBlockButton(blockType);
      this.gridElement.appendChild(button);
    });
  }

  /**
   * Create a block button
   */
  private createBlockButton(blockType: BlockType): HTMLElement {
    const blockData = BLOCK_TYPES[blockType];
    const button = document.createElement('button');
    button.className = 'mobile-block-btn';
    button.setAttribute('data-block', blockType.toString());
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', `Select ${blockData.name} block`);
    button.setAttribute('aria-pressed', 'false');

    if (this.selectedBlock === blockType) {
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
    }

    const icon = document.createElement('span');
    icon.className = 'block-icon';
    icon.textContent = getBlockIcon(blockType);

    const name = document.createElement('span');
    name.className = 'block-name';
    name.textContent = blockData.name;

    button.appendChild(icon);
    button.appendChild(name);

    // Apply block color as background
    const color = blockData.color;
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);
    button.style.background = `linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)}) 100%)`;

    // Set text color based on background brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    button.style.color = brightness > 128 ? '#000' : '#fff';

    // Event listeners
    button.addEventListener('click', () => this.selectBlock(blockType));
    button.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.selectBlock(blockType);
    });

    return button;
  }

  /**
   * Select a block
   */
  private selectBlock(blockType: BlockType): void {
    // Update selected state
    const buttons = this.gridElement.querySelectorAll('.mobile-block-btn');
    buttons.forEach(btn => {
      btn.classList.remove('selected');
      btn.setAttribute('aria-pressed', 'false');
    });

    const selectedButton = this.gridElement.querySelector(`[data-block="${blockType}"]`);
    if (selectedButton) {
      selectedButton.classList.add('selected');
      selectedButton.setAttribute('aria-pressed', 'true');
    }

    this.selectedBlock = blockType;

    // Trigger callbacks
    this.blockSelectCallbacks.forEach(callback => callback(blockType));

    // Close sheet after selection
    this.close();
  }

  /**
   * Set selected block programmatically
   */
  public setSelectedBlock(blockType: BlockType): void {
    this.selectedBlock = blockType;

    // Update UI
    const buttons = this.gridElement.querySelectorAll('.mobile-block-btn');
    buttons.forEach(btn => {
      const btnBlockType = parseInt(btn.getAttribute('data-block')!);
      if (btnBlockType === blockType) {
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /**
   * Get currently selected block
   */
  public getSelectedBlock(): BlockType | undefined {
    return this.selectedBlock;
  }

  /**
   * Register callback for block selection
   */
  public onBlockSelect(callback: (block: BlockType) => void): void {
    this.blockSelectCallbacks.push(callback);
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
    this.sheetElement.classList.remove('portrait', 'landscape');
    
    // Add new orientation class
    this.sheetElement.classList.add(this.currentOrientation);

    // Update aria attributes
    this.sheetElement.setAttribute('data-orientation', this.currentOrientation);

    // Update grid layout based on orientation
    this.updateGridLayout();
  }

  /**
   * Update grid layout based on orientation
   */
  private updateGridLayout(): void {
    // Portrait: 3 columns, more compact
    // Landscape: 4 columns, more horizontal space
    // columnsCount removed as it was unused, relying on auto-fill with minmax
    const minBlockSize = this.currentOrientation === 'portrait' ? '100px' : '80px';
    
    this.gridElement.style.gridTemplateColumns = `repeat(auto-fill, minmax(${minBlockSize}, 1fr))`;
  }

  /**
   * Clean up and remove the sheet
   */
  public destroy(): void {
    if (this.sheetElement && this.sheetElement.parentNode) {
      this.sheetElement.parentNode.removeChild(this.sheetElement);
    }

    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
  }
}
