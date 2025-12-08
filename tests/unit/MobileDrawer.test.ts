import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MobileDrawer } from '../../src/ui/MobileDrawer';
import { BlockCategoryManager } from '../../src/ui/BlockCategoryManager';

describe('MobileDrawer', () => {
  let container: HTMLElement;
  let drawer: MobileDrawer;
  let categoryManager: BlockCategoryManager;

  beforeEach(() => {
    // Create a container for testing
    container = document.createElement('div');
    container.id = 'ui-overlay';
    document.body.appendChild(container);

    // Create category manager
    categoryManager = new BlockCategoryManager();
  });

  afterEach(() => {
    // Clean up
    if (drawer) {
      drawer.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should create mobile drawer element', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const drawerElement = container.querySelector('.mobile-drawer');
      expect(drawerElement).toBeTruthy();
      expect(drawerElement?.classList.contains('mobile-drawer')).toBe(true);
    });

    it('should be hidden by default', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const drawerElement = container.querySelector('.mobile-drawer');
      expect(drawerElement?.classList.contains('open')).toBe(false);
      expect(drawer.isOpen()).toBe(false);
    });

    it('should have an overlay', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const overlay = container.querySelector('.drawer-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should have a close button', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const closeButton = container.querySelector('.drawer-close');
      expect(closeButton).toBeTruthy();
    });

    it('should have a title', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const title = container.querySelector('.drawer-title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Menu');
    });
  });

  describe('Open/Close', () => {
    it('should open drawer programmatically', () => {
      drawer = new MobileDrawer(container, categoryManager);

      drawer.open();

      const drawerElement = container.querySelector('.mobile-drawer');
      const overlay = container.querySelector('.drawer-overlay');

      expect(drawerElement?.classList.contains('open')).toBe(true);
      expect(overlay?.classList.contains('active')).toBe(true);
      expect(drawer.isOpen()).toBe(true);
    });

    it('should close drawer programmatically', () => {
      drawer = new MobileDrawer(container, categoryManager);

      drawer.open();
      drawer.close();

      const drawerElement = container.querySelector('.mobile-drawer');
      const overlay = container.querySelector('.drawer-overlay');

      expect(drawerElement?.classList.contains('open')).toBe(false);
      expect(overlay?.classList.contains('active')).toBe(false);
      expect(drawer.isOpen()).toBe(false);
    });

    it('should toggle drawer state', () => {
      drawer = new MobileDrawer(container, categoryManager);

      expect(drawer.isOpen()).toBe(false);

      drawer.toggle();
      expect(drawer.isOpen()).toBe(true);

      drawer.toggle();
      expect(drawer.isOpen()).toBe(false);
    });

    it('should close on overlay click', () => {
      drawer = new MobileDrawer(container, categoryManager);

      drawer.open();

      const overlay = container.querySelector('.drawer-overlay') as HTMLElement;
      overlay.click();

      expect(drawer.isOpen()).toBe(false);
    });

    it('should close on close button click', () => {
      drawer = new MobileDrawer(container, categoryManager);

      drawer.open();

      const closeButton = container.querySelector('.drawer-close') as HTMLElement;
      closeButton.click();

      expect(drawer.isOpen()).toBe(false);
    });
  });

  describe('Category Rendering', () => {
    it('should render category buttons', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const categoryButtons = container.querySelectorAll('.drawer-category-btn');
      expect(categoryButtons.length).toBeGreaterThan(0);
    });

    it('should have category icons and labels', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const firstCategory = container.querySelector('.drawer-category-btn');
      expect(firstCategory).toBeTruthy();

      const icon = firstCategory?.querySelector('.category-icon');
      const label = firstCategory?.querySelector('.category-label');

      expect(icon).toBeTruthy();
      expect(label).toBeTruthy();
    });

    it('should highlight active category', () => {
      drawer = new MobileDrawer(container, categoryManager);

      drawer.setActiveCategory(0);

      const firstCategory = container.querySelector('.drawer-category-btn[data-category="0"]');
      expect(firstCategory?.classList.contains('active')).toBe(true);
    });

    it('should switch categories on button click', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const categoryButtons = container.querySelectorAll('.drawer-category-btn');
      expect(categoryButtons.length).toBeGreaterThan(1);

      const secondCategory = categoryButtons[1] as HTMLElement;
      secondCategory.click();

      expect(secondCategory.classList.contains('active')).toBe(true);
    });
  });

  describe('Category Change Callback', () => {
    it('should call onCategoryChange when category is clicked', () => {
      drawer = new MobileDrawer(container, categoryManager);

      let changedCategory = -1;
      drawer.onCategoryChange((category: number) => {
        changedCategory = category;
      });

      const categoryButtons = container.querySelectorAll('.drawer-category-btn');
      const secondCategory = categoryButtons[1] as HTMLElement;
      const categoryId = parseInt(secondCategory.getAttribute('data-category')!);

      secondCategory.click();

      expect(changedCategory).toBe(categoryId);
    });

    it('should close drawer after category selection', () => {
      drawer = new MobileDrawer(container, categoryManager);

      drawer.open();

      const categoryButtons = container.querySelectorAll('.drawer-category-btn');
      const firstCategory = categoryButtons[0] as HTMLElement;
      firstCategory.click();

      expect(drawer.isOpen()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on drawer', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const drawerElement = container.querySelector('.mobile-drawer');
      expect(drawerElement?.getAttribute('role')).toBe('dialog');
      expect(drawerElement?.getAttribute('aria-label')).toBe('Navigation menu');
    });

    it('should have aria-hidden when closed', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const drawerElement = container.querySelector('.mobile-drawer');
      expect(drawerElement?.getAttribute('aria-hidden')).toBe('true');

      drawer.open();
      expect(drawerElement?.getAttribute('aria-hidden')).toBe('false');
    });

    it('should have proper ARIA labels on category buttons', () => {
      drawer = new MobileDrawer(container, categoryManager);

      const firstCategory = container.querySelector('.drawer-category-btn');
      expect(firstCategory?.getAttribute('role')).toBe('button');
      expect(firstCategory?.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('should remove element from DOM on destroy', () => {
      drawer = new MobileDrawer(container, categoryManager);

      expect(container.querySelector('.mobile-drawer')).toBeTruthy();

      drawer.destroy();

      expect(container.querySelector('.mobile-drawer')).toBeFalsy();
      expect(container.querySelector('.drawer-overlay')).toBeFalsy();
    });
  });
});
