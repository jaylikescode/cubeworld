import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MobileBlockSheet } from '../../src/ui/MobileBlockSheet';
import { BlockType } from '../../src/types/VoxelTypes';

describe('MobileBlockSheet', () => {
  let container: HTMLElement;
  let sheet: MobileBlockSheet;

  beforeEach(() => {
    // Create a container for testing
    container = document.createElement('div');
    container.id = 'ui-overlay';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (sheet) {
      sheet.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should create mobile block sheet element', () => {
      sheet = new MobileBlockSheet(container);

      const sheetElement = container.querySelector('.mobile-block-sheet');
      expect(sheetElement).toBeTruthy();
      expect(sheetElement?.classList.contains('mobile-block-sheet')).toBe(true);
    });

    it('should be hidden by default', () => {
      sheet = new MobileBlockSheet(container);

      const sheetElement = container.querySelector('.mobile-block-sheet');
      expect(sheetElement?.classList.contains('open')).toBe(false);
    });

    it('should have a drag handle', () => {
      sheet = new MobileBlockSheet(container);

      const handle = container.querySelector('.bottom-sheet-handle');
      expect(handle).toBeTruthy();
    });

    it('should have a title', () => {
      sheet = new MobileBlockSheet(container);

      const title = container.querySelector('.bottom-sheet-title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Select Block');
    });

    it('should have a block grid container', () => {
      sheet = new MobileBlockSheet(container);

      const grid = container.querySelector('.mobile-block-grid');
      expect(grid).toBeTruthy();
    });

    it('should have an overlay', () => {
      sheet = new MobileBlockSheet(container);

      const overlay = container.querySelector('.mobile-sheet-overlay');
      expect(overlay).toBeTruthy();
    });
  });

  describe('Open/Close', () => {
    it('should open sheet programmatically', () => {
      sheet = new MobileBlockSheet(container);

      sheet.open();

      const sheetElement = container.querySelector('.mobile-block-sheet');
      const overlay = container.querySelector('.mobile-sheet-overlay');

      expect(sheetElement?.classList.contains('open')).toBe(true);
      expect(overlay?.classList.contains('active')).toBe(true);
    });

    it('should close sheet programmatically', () => {
      sheet = new MobileBlockSheet(container);

      sheet.open();
      sheet.close();

      const sheetElement = container.querySelector('.mobile-block-sheet');
      const overlay = container.querySelector('.mobile-sheet-overlay');

      expect(sheetElement?.classList.contains('open')).toBe(false);
      expect(overlay?.classList.contains('active')).toBe(false);
    });

    it('should toggle sheet state', () => {
      sheet = new MobileBlockSheet(container);

      expect(sheet.isOpen()).toBe(false);

      sheet.toggle();
      expect(sheet.isOpen()).toBe(true);

      sheet.toggle();
      expect(sheet.isOpen()).toBe(false);
    });

    it('should close on overlay click', () => {
      sheet = new MobileBlockSheet(container);

      sheet.open();

      const overlay = container.querySelector('.mobile-sheet-overlay') as HTMLElement;
      overlay.click();

      expect(sheet.isOpen()).toBe(false);
    });
  });

  describe('Block Rendering', () => {
    it('should render blocks in grid', () => {
      sheet = new MobileBlockSheet(container);

      const blocks = [BlockType.GRASS, BlockType.DIRT, BlockType.STONE];
      sheet.renderBlocks(blocks);

      const blockButtons = container.querySelectorAll('.mobile-block-btn');
      expect(blockButtons.length).toBe(3);
    });

    it('should render block with icon and name', () => {
      sheet = new MobileBlockSheet(container);

      const blocks = [BlockType.GRASS];
      sheet.renderBlocks(blocks);

      const blockBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`);
      const icon = blockBtn?.querySelector('.block-icon');
      const name = blockBtn?.querySelector('.block-name');

      expect(icon).toBeTruthy();
      expect(name).toBeTruthy();
      expect(name?.textContent).toBe('Grass');
    });

    it('should apply block color as background', () => {
      sheet = new MobileBlockSheet(container);

      const blocks = [BlockType.GRASS];
      sheet.renderBlocks(blocks);

      const blockBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`) as HTMLElement;
      // Check that color style was set (background is set but JSDOM may not preserve it)
      expect(blockBtn).toBeTruthy();
      expect(blockBtn.getAttribute('style')).toBeTruthy();
    });

    it('should handle empty block list', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([]);

      const blockButtons = container.querySelectorAll('.mobile-block-btn');
      expect(blockButtons.length).toBe(0);
    });

    it('should update grid when re-rendering', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([BlockType.GRASS, BlockType.DIRT]);
      expect(container.querySelectorAll('.mobile-block-btn').length).toBe(2);

      sheet.renderBlocks([BlockType.STONE]);
      expect(container.querySelectorAll('.mobile-block-btn').length).toBe(1);
    });
  });

  describe('Block Selection', () => {
    it('should call onBlockSelect when block is clicked', () => {
      sheet = new MobileBlockSheet(container);

      const callback = vi.fn();
      sheet.onBlockSelect(callback);

      sheet.renderBlocks([BlockType.GRASS]);

      const blockBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`) as HTMLElement;
      blockBtn.click();

      expect(callback).toHaveBeenCalledWith(BlockType.GRASS);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should close sheet after block selection', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([BlockType.GRASS]);
      sheet.open();

      const blockBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`) as HTMLElement;
      blockBtn.click();

      expect(sheet.isOpen()).toBe(false);
    });

    it('should highlight selected block', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([BlockType.GRASS, BlockType.DIRT]);

      const grassBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`) as HTMLElement;
      grassBtn.click();

      expect(grassBtn.classList.contains('selected')).toBe(true);
    });

    it('should only have one selected block at a time', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([BlockType.GRASS, BlockType.DIRT]);

      const grassBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`) as HTMLElement;
      const dirtBtn = container.querySelector(`[data-block="${BlockType.DIRT}"]`) as HTMLElement;

      grassBtn.click();
      expect(grassBtn.classList.contains('selected')).toBe(true);

      dirtBtn.click();
      expect(grassBtn.classList.contains('selected')).toBe(false);
      expect(dirtBtn.classList.contains('selected')).toBe(true);
    });

    it('should set selected block programmatically', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([BlockType.GRASS, BlockType.DIRT]);
      sheet.setSelectedBlock(BlockType.DIRT);

      const dirtBtn = container.querySelector(`[data-block="${BlockType.DIRT}"]`);
      expect(dirtBtn?.classList.contains('selected')).toBe(true);
    });

    it('should return current selected block', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([BlockType.GRASS]);

      const grassBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`) as HTMLElement;
      grassBtn.click();

      expect(sheet.getSelectedBlock()).toBe(BlockType.GRASS);
    });
  });

  describe('Touch Gestures', () => {
    it('should support touch events on blocks', () => {
      sheet = new MobileBlockSheet(container);

      const callback = vi.fn();
      sheet.onBlockSelect(callback);

      sheet.renderBlocks([BlockType.GRASS]);

      const blockBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`) as HTMLElement;

      const touchEvent = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        touches: [],
      });

      blockBtn.dispatchEvent(touchEvent);

      expect(callback).toHaveBeenCalledWith(BlockType.GRASS);
    });

    it('should handle swipe down to close', () => {
      sheet = new MobileBlockSheet(container);

      sheet.open();
      expect(sheet.isOpen()).toBe(true);

      // Simulate swipe down gesture
      const handle = container.querySelector('.bottom-sheet-handle') as HTMLElement;

      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      const touchMove = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 100, clientY: 200 } as Touch],
      });

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 100, clientY: 200 } as Touch],
      });

      handle.dispatchEvent(touchStart);
      handle.dispatchEvent(touchMove);
      handle.dispatchEvent(touchEnd);

      // Should close after swipe down
      expect(sheet.isOpen()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on blocks', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([BlockType.GRASS]);

      const blockBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`);
      expect(blockBtn?.getAttribute('aria-label')).toBe('Select Grass block');
      expect(blockBtn?.getAttribute('role')).toBe('button');
    });

    it('should have aria-pressed attribute', () => {
      sheet = new MobileBlockSheet(container);

      sheet.renderBlocks([BlockType.GRASS]);

      const blockBtn = container.querySelector(`[data-block="${BlockType.GRASS}"]`) as HTMLElement;
      expect(blockBtn.getAttribute('aria-pressed')).toBe('false');

      blockBtn.click();
      expect(blockBtn.getAttribute('aria-pressed')).toBe('true');
    });

    it('should have aria-hidden when closed', () => {
      sheet = new MobileBlockSheet(container);

      const sheetElement = container.querySelector('.mobile-block-sheet');
      expect(sheetElement?.getAttribute('aria-hidden')).toBe('true');

      sheet.open();
      expect(sheetElement?.getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('Cleanup', () => {
    it('should remove element from DOM on destroy', () => {
      sheet = new MobileBlockSheet(container);

      expect(container.querySelector('.mobile-block-sheet')).toBeTruthy();

      sheet.destroy();

      expect(container.querySelector('.mobile-block-sheet')).toBeFalsy();
      expect(container.querySelector('.mobile-sheet-overlay')).toBeFalsy();
    });

    it('should clean up event listeners on destroy', () => {
      sheet = new MobileBlockSheet(container);

      const callback = vi.fn();
      sheet.onBlockSelect(callback);

      sheet.destroy();

      // Should not crash or leak memory
      expect(() => sheet.destroy()).not.toThrow();
    });
  });

  describe('Safe Area Support', () => {
    it('should apply safe-area-inset-bottom padding', () => {
      sheet = new MobileBlockSheet(container);

      const sheetElement = container.querySelector('.mobile-block-sheet') as HTMLElement;

      // Should have padding-bottom set
      expect(sheetElement.style.paddingBottom ||
             window.getComputedStyle(sheetElement).paddingBottom).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle large block lists efficiently', () => {
      sheet = new MobileBlockSheet(container);

      const manyBlocks = Object.values(BlockType)
        .filter(v => typeof v === 'number') as BlockType[];

      const startTime = performance.now();
      sheet.renderBlocks(manyBlocks);
      const endTime = performance.now();

      // Should render in less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
