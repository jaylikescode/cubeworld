import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MobileBlockSheet } from '../../src/ui/MobileBlockSheet';
import { BlockType } from '../../src/types/VoxelTypes';

describe('MobileBlockSheet - Orientation', () => {
  let container: HTMLElement;
  let mobileBlockSheet: MobileBlockSheet;

  beforeEach(() => {
    // Create a container for the sheet
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (mobileBlockSheet) {
      mobileBlockSheet.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with portrait orientation by default', () => {
      mobileBlockSheet = new MobileBlockSheet(container);
      
      expect(mobileBlockSheet.getOrientation()).toBe('portrait');
    });

    it('should add portrait class to sheet element on initialization', () => {
      mobileBlockSheet = new MobileBlockSheet(container);
      
      const sheetElement = container.querySelector('.mobile-block-sheet');
      expect(sheetElement).not.toBeNull();
      expect(sheetElement?.classList.contains('portrait')).toBe(true);
    });

    it('should set data-orientation attribute on initialization', () => {
      mobileBlockSheet = new MobileBlockSheet(container);
      
      const sheetElement = container.querySelector('.mobile-block-sheet');
      expect(sheetElement?.getAttribute('data-orientation')).toBe('portrait');
    });
  });

  describe('Orientation Changes', () => {
    beforeEach(() => {
      mobileBlockSheet = new MobileBlockSheet(container);
    });

    it('should update orientation when setOrientation is called', () => {
      mobileBlockSheet.setOrientation('landscape');
      
      expect(mobileBlockSheet.getOrientation()).toBe('landscape');
    });

    it('should add landscape class when orientation changes to landscape', () => {
      mobileBlockSheet.setOrientation('landscape');
      
      const sheetElement = container.querySelector('.mobile-block-sheet');
      expect(sheetElement?.classList.contains('landscape')).toBe(true);
      expect(sheetElement?.classList.contains('portrait')).toBe(false);
    });

    it('should update data-orientation attribute when orientation changes', () => {
      mobileBlockSheet.setOrientation('landscape');
      
      const sheetElement = container.querySelector('.mobile-block-sheet');
      expect(sheetElement?.getAttribute('data-orientation')).toBe('landscape');
    });

    it('should not trigger unnecessary updates if orientation is the same', () => {
      const sheetElement = container.querySelector('.mobile-block-sheet') as HTMLElement;
      const initialClassList = Array.from(sheetElement.classList);
      
      mobileBlockSheet.setOrientation('portrait');
      
      const finalClassList = Array.from(sheetElement.classList);
      expect(finalClassList).toEqual(initialClassList);
    });

    it('should correctly toggle between portrait and landscape', () => {
      const sheetElement = container.querySelector('.mobile-block-sheet');
      
      // Start in portrait
      expect(sheetElement?.classList.contains('portrait')).toBe(true);
      
      // Change to landscape
      mobileBlockSheet.setOrientation('landscape');
      expect(sheetElement?.classList.contains('landscape')).toBe(true);
      expect(sheetElement?.classList.contains('portrait')).toBe(false);
      
      // Change back to portrait
      mobileBlockSheet.setOrientation('portrait');
      expect(sheetElement?.classList.contains('portrait')).toBe(true);
      expect(sheetElement?.classList.contains('landscape')).toBe(false);
    });
  });

  describe('Grid Layout', () => {
    beforeEach(() => {
      mobileBlockSheet = new MobileBlockSheet(container);
    });

    it('should adjust grid layout when orientation changes', () => {
      const gridElement = container.querySelector('.mobile-block-grid') as HTMLElement;
      
      // Check initial grid (portrait: 3 columns)
      expect(gridElement.style.gridTemplateColumns).toContain('100px');
      
      // Change to landscape
      mobileBlockSheet.setOrientation('landscape');
      
      // Grid should update (landscape: 4 columns, smaller blocks)
      expect(gridElement.style.gridTemplateColumns).toContain('80px');
    });

    it('should use larger blocks in portrait mode', () => {
      const gridElement = container.querySelector('.mobile-block-grid') as HTMLElement;
      
      mobileBlockSheet.setOrientation('portrait');
      expect(gridElement.style.gridTemplateColumns).toContain('100px');
    });

    it('should use smaller blocks in landscape mode', () => {
      const gridElement = container.querySelector('.mobile-block-grid') as HTMLElement;
      
      mobileBlockSheet.setOrientation('landscape');
      expect(gridElement.style.gridTemplateColumns).toContain('80px');
    });
  });

  describe('Block Rendering', () => {
    beforeEach(() => {
      mobileBlockSheet = new MobileBlockSheet(container);
    });

    it('should render blocks correctly in both orientations', () => {
      const testBlocks = [
        BlockType.GRASS,
        BlockType.DIRT,
        BlockType.STONE,
        BlockType.WOOD,
      ];

      // Render in portrait
      mobileBlockSheet.renderBlocks(testBlocks);
      let blockButtons = container.querySelectorAll('.mobile-block-btn');
      expect(blockButtons.length).toBe(4);

      // Change to landscape
      mobileBlockSheet.setOrientation('landscape');
      
      // Re-render blocks
      mobileBlockSheet.renderBlocks(testBlocks);
      blockButtons = container.querySelectorAll('.mobile-block-btn');
      expect(blockButtons.length).toBe(4);
    });

    it('should maintain block selection when orientation changes', () => {
      const testBlocks = [BlockType.GRASS, BlockType.DIRT, BlockType.STONE];
      mobileBlockSheet.renderBlocks(testBlocks);

      // Select a block
      mobileBlockSheet.setSelectedBlock(BlockType.DIRT);
      expect(mobileBlockSheet.getSelectedBlock()).toBe(BlockType.DIRT);

      // Change orientation
      mobileBlockSheet.setOrientation('landscape');

      // Selection should be maintained
      expect(mobileBlockSheet.getSelectedBlock()).toBe(BlockType.DIRT);
    });
  });

  describe('Sheet State', () => {
    beforeEach(() => {
      mobileBlockSheet = new MobileBlockSheet(container);
    });

    it('should maintain open state when orientation changes', () => {
      mobileBlockSheet.open();
      expect(mobileBlockSheet.isOpen()).toBe(true);

      mobileBlockSheet.setOrientation('landscape');

      expect(mobileBlockSheet.isOpen()).toBe(true);
    });

    it('should maintain closed state when orientation changes', () => {
      expect(mobileBlockSheet.isOpen()).toBe(false);

      mobileBlockSheet.setOrientation('landscape');

      expect(mobileBlockSheet.isOpen()).toBe(false);
    });

    it('should toggle correctly after orientation change', () => {
      mobileBlockSheet.setOrientation('landscape');

      mobileBlockSheet.toggle();
      expect(mobileBlockSheet.isOpen()).toBe(true);

      mobileBlockSheet.toggle();
      expect(mobileBlockSheet.isOpen()).toBe(false);
    });
  });

  describe('Block Selection Callbacks', () => {
    beforeEach(() => {
      mobileBlockSheet = new MobileBlockSheet(container);
    });

    it('should still trigger callbacks after orientation change', () => {
      let selectedBlock: BlockType | null = null;
      mobileBlockSheet.onBlockSelect((block) => {
        selectedBlock = block;
      });

      const testBlocks = [BlockType.GRASS, BlockType.DIRT];
      mobileBlockSheet.renderBlocks(testBlocks);

      // Change orientation
      mobileBlockSheet.setOrientation('landscape');

      // Re-render blocks
      mobileBlockSheet.renderBlocks(testBlocks);

      // Click a block button
      const dirtButton = container.querySelector('[data-block="' + BlockType.DIRT + '"]') as HTMLElement;
      dirtButton.click();

      expect(selectedBlock).toBe(BlockType.DIRT);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mobileBlockSheet = new MobileBlockSheet(container);
    });

    it('should maintain ARIA attributes when orientation changes', () => {
      const sheetElement = container.querySelector('.mobile-block-sheet');
      
      expect(sheetElement?.getAttribute('role')).toBe('dialog');
      expect(sheetElement?.getAttribute('aria-label')).toBe('Block selection');
      
      mobileBlockSheet.setOrientation('landscape');
      
      expect(sheetElement?.getAttribute('role')).toBe('dialog');
      expect(sheetElement?.getAttribute('aria-label')).toBe('Block selection');
    });

    it('should update aria-hidden when opening/closing in different orientations', () => {
      const sheetElement = container.querySelector('.mobile-block-sheet');
      
      // Portrait - closed
      expect(sheetElement?.getAttribute('aria-hidden')).toBe('true');
      
      // Portrait - open
      mobileBlockSheet.open();
      expect(sheetElement?.getAttribute('aria-hidden')).toBe('false');
      
      // Change to landscape while open
      mobileBlockSheet.setOrientation('landscape');
      expect(sheetElement?.getAttribute('aria-hidden')).toBe('false');
      
      // Landscape - close
      mobileBlockSheet.close();
      expect(sheetElement?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Elements Structure', () => {
    beforeEach(() => {
      mobileBlockSheet = new MobileBlockSheet(container);
    });

    it('should maintain sheet structure when orientation changes', () => {
      const checkStructure = () => {
        expect(container.querySelector('.mobile-block-sheet')).not.toBeNull();
        expect(container.querySelector('.bottom-sheet-handle')).not.toBeNull();
        expect(container.querySelector('.bottom-sheet-title')).not.toBeNull();
        expect(container.querySelector('.mobile-block-grid')).not.toBeNull();
        expect(container.querySelector('.mobile-sheet-overlay')).not.toBeNull();
      };

      checkStructure();
      
      mobileBlockSheet.setOrientation('landscape');
      checkStructure();
      
      mobileBlockSheet.setOrientation('portrait');
      checkStructure();
    });
  });
});

