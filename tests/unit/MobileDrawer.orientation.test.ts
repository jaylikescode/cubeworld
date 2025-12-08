import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MobileDrawer } from '../../src/ui/MobileDrawer';
import { BlockCategoryManager } from '../../src/ui/BlockCategoryManager';
import { BlockCategory } from '../../src/types/VoxelTypes';

describe('MobileDrawer - Orientation', () => {
  let container: HTMLElement;
  let mobileDrawer: MobileDrawer;
  let categoryManager: BlockCategoryManager;

  beforeEach(() => {
    // Create a container for the drawer
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Create category manager
    categoryManager = new BlockCategoryManager();
  });

  afterEach(() => {
    // Clean up
    if (mobileDrawer) {
      mobileDrawer.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with portrait orientation by default', () => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
      
      expect(mobileDrawer.getOrientation()).toBe('portrait');
    });

    it('should add portrait class to drawer element on initialization', () => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
      
      const drawerElement = container.querySelector('.mobile-drawer');
      expect(drawerElement).not.toBeNull();
      expect(drawerElement?.classList.contains('portrait')).toBe(true);
    });

    it('should set data-orientation attribute on initialization', () => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
      
      const drawerElement = container.querySelector('.mobile-drawer');
      expect(drawerElement?.getAttribute('data-orientation')).toBe('portrait');
    });
  });

  describe('Orientation Changes', () => {
    beforeEach(() => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
    });

    it('should update orientation when setOrientation is called', () => {
      mobileDrawer.setOrientation('landscape');
      
      expect(mobileDrawer.getOrientation()).toBe('landscape');
    });

    it('should add landscape class when orientation changes to landscape', () => {
      mobileDrawer.setOrientation('landscape');
      
      const drawerElement = container.querySelector('.mobile-drawer');
      expect(drawerElement?.classList.contains('landscape')).toBe(true);
      expect(drawerElement?.classList.contains('portrait')).toBe(false);
    });

    it('should update data-orientation attribute when orientation changes', () => {
      mobileDrawer.setOrientation('landscape');
      
      const drawerElement = container.querySelector('.mobile-drawer');
      expect(drawerElement?.getAttribute('data-orientation')).toBe('landscape');
    });

    it('should not trigger unnecessary updates if orientation is the same', () => {
      const drawerElement = container.querySelector('.mobile-drawer') as HTMLElement;
      const initialClassList = Array.from(drawerElement.classList);
      
      mobileDrawer.setOrientation('portrait');
      
      const finalClassList = Array.from(drawerElement.classList);
      expect(finalClassList).toEqual(initialClassList);
    });

    it('should correctly toggle between portrait and landscape', () => {
      const drawerElement = container.querySelector('.mobile-drawer');
      
      // Start in portrait
      expect(drawerElement?.classList.contains('portrait')).toBe(true);
      
      // Change to landscape
      mobileDrawer.setOrientation('landscape');
      expect(drawerElement?.classList.contains('landscape')).toBe(true);
      expect(drawerElement?.classList.contains('portrait')).toBe(false);
      
      // Change back to portrait
      mobileDrawer.setOrientation('portrait');
      expect(drawerElement?.classList.contains('portrait')).toBe(true);
      expect(drawerElement?.classList.contains('landscape')).toBe(false);
    });
  });

  describe('Drawer Width Adjustment', () => {
    beforeEach(() => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
    });

    it('should use wider drawer in portrait mode', () => {
      const drawerElement = container.querySelector('.mobile-drawer') as HTMLElement;
      
      mobileDrawer.setOrientation('portrait');
      
      expect(drawerElement.style.width).toBe('80%');
      expect(drawerElement.style.maxWidth).toBe('320px');
    });

    it('should use narrower drawer in landscape mode', () => {
      const drawerElement = container.querySelector('.mobile-drawer') as HTMLElement;
      
      mobileDrawer.setOrientation('landscape');
      
      expect(drawerElement.style.width).toBe('60%');
      expect(drawerElement.style.maxWidth).toBe('300px');
    });

    it('should adjust width when switching orientations', () => {
      const drawerElement = container.querySelector('.mobile-drawer') as HTMLElement;
      
      // Start in portrait
      mobileDrawer.setOrientation('portrait');
      expect(drawerElement.style.width).toBe('80%');
      
      // Switch to landscape
      mobileDrawer.setOrientation('landscape');
      expect(drawerElement.style.width).toBe('60%');
      
      // Switch back to portrait
      mobileDrawer.setOrientation('portrait');
      expect(drawerElement.style.width).toBe('80%');
    });
  });

  describe('Drawer State', () => {
    beforeEach(() => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
    });

    it('should maintain open state when orientation changes', () => {
      mobileDrawer.open();
      expect(mobileDrawer.isOpen()).toBe(true);

      mobileDrawer.setOrientation('landscape');

      expect(mobileDrawer.isOpen()).toBe(true);
    });

    it('should maintain closed state when orientation changes', () => {
      expect(mobileDrawer.isOpen()).toBe(false);

      mobileDrawer.setOrientation('landscape');

      expect(mobileDrawer.isOpen()).toBe(false);
    });

    it('should toggle correctly after orientation change', () => {
      mobileDrawer.setOrientation('landscape');

      mobileDrawer.toggle();
      expect(mobileDrawer.isOpen()).toBe(true);

      mobileDrawer.toggle();
      expect(mobileDrawer.isOpen()).toBe(false);
    });
  });

  describe('Category Management', () => {
    beforeEach(() => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
    });

    it('should maintain active category when orientation changes', () => {
      mobileDrawer.setActiveCategory(BlockCategory.BUILDING);
      expect(mobileDrawer.getActiveCategory()).toBe(BlockCategory.BUILDING);

      mobileDrawer.setOrientation('landscape');

      expect(mobileDrawer.getActiveCategory()).toBe(BlockCategory.BUILDING);
    });

    it('should still trigger category change callbacks after orientation change', () => {
      let changedCategory: number | null = null;
      mobileDrawer.onCategoryChange((category) => {
        changedCategory = category;
      });

      mobileDrawer.setOrientation('landscape');

      // Click a category button
      const buildingButton = container.querySelector(`[data-category="${BlockCategory.BUILDING}"]`) as HTMLElement;
      if (buildingButton) {
        buildingButton.click();
        expect(changedCategory).toBe(BlockCategory.BUILDING);
      }
    });

    it('should render all category buttons after orientation change', () => {
      const getButtonCount = () => {
        return container.querySelectorAll('.drawer-category-btn').length;
      };

      const countBefore = getButtonCount();
      expect(countBefore).toBeGreaterThan(0);

      mobileDrawer.setOrientation('landscape');

      const countAfter = getButtonCount();
      expect(countAfter).toBe(countBefore);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
    });

    it('should maintain ARIA attributes when orientation changes', () => {
      const drawerElement = container.querySelector('.mobile-drawer');
      
      expect(drawerElement?.getAttribute('role')).toBe('dialog');
      expect(drawerElement?.getAttribute('aria-label')).toBe('Navigation menu');
      
      mobileDrawer.setOrientation('landscape');
      
      expect(drawerElement?.getAttribute('role')).toBe('dialog');
      expect(drawerElement?.getAttribute('aria-label')).toBe('Navigation menu');
    });

    it('should update aria-hidden when opening/closing in different orientations', () => {
      const drawerElement = container.querySelector('.mobile-drawer');
      
      // Portrait - closed
      expect(drawerElement?.getAttribute('aria-hidden')).toBe('true');
      
      // Portrait - open
      mobileDrawer.open();
      expect(drawerElement?.getAttribute('aria-hidden')).toBe('false');
      
      // Change to landscape while open
      mobileDrawer.setOrientation('landscape');
      expect(drawerElement?.getAttribute('aria-hidden')).toBe('false');
      
      // Landscape - close
      mobileDrawer.close();
      expect(drawerElement?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Elements Structure', () => {
    beforeEach(() => {
      mobileDrawer = new MobileDrawer(container, categoryManager);
    });

    it('should maintain drawer structure when orientation changes', () => {
      const checkStructure = () => {
        expect(container.querySelector('.mobile-drawer')).not.toBeNull();
        expect(container.querySelector('.drawer-header')).not.toBeNull();
        expect(container.querySelector('.drawer-title')).not.toBeNull();
        expect(container.querySelector('.drawer-close')).not.toBeNull();
        expect(container.querySelector('.drawer-content')).not.toBeNull();
        expect(container.querySelector('.drawer-overlay')).not.toBeNull();
      };

      checkStructure();
      
      mobileDrawer.setOrientation('landscape');
      checkStructure();
      
      mobileDrawer.setOrientation('portrait');
      checkStructure();
    });
  });
});

