import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MobileBottomNav } from '../../src/ui/MobileBottomNav';

describe('MobileBottomNav - Orientation', () => {
  let container: HTMLElement;
  let mobileBottomNav: MobileBottomNav;

  beforeEach(() => {
    // Create a container for the navigation
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (mobileBottomNav) {
      mobileBottomNav.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with portrait orientation by default', () => {
      mobileBottomNav = new MobileBottomNav(container);
      
      expect(mobileBottomNav.getOrientation()).toBe('portrait');
    });

    it('should add portrait class to nav element on initialization', () => {
      mobileBottomNav = new MobileBottomNav(container);
      
      const navElement = container.querySelector('.mobile-bottom-nav');
      expect(navElement).not.toBeNull();
      expect(navElement?.classList.contains('portrait')).toBe(true);
    });

    it('should set data-orientation attribute on initialization', () => {
      mobileBottomNav = new MobileBottomNav(container);
      
      const navElement = container.querySelector('.mobile-bottom-nav');
      expect(navElement?.getAttribute('data-orientation')).toBe('portrait');
    });
  });

  describe('Orientation Changes', () => {
    beforeEach(() => {
      mobileBottomNav = new MobileBottomNav(container);
    });

    it('should update orientation when setOrientation is called', () => {
      mobileBottomNav.setOrientation('landscape');
      
      expect(mobileBottomNav.getOrientation()).toBe('landscape');
    });

    it('should add landscape class when orientation changes to landscape', () => {
      mobileBottomNav.setOrientation('landscape');
      
      const navElement = container.querySelector('.mobile-bottom-nav');
      expect(navElement?.classList.contains('landscape')).toBe(true);
      expect(navElement?.classList.contains('portrait')).toBe(false);
    });

    it('should update data-orientation attribute when orientation changes', () => {
      mobileBottomNav.setOrientation('landscape');
      
      const navElement = container.querySelector('.mobile-bottom-nav');
      expect(navElement?.getAttribute('data-orientation')).toBe('landscape');
    });

    it('should not trigger unnecessary updates if orientation is the same', () => {
      const navElement = container.querySelector('.mobile-bottom-nav') as HTMLElement;
      const initialClassList = Array.from(navElement.classList);
      
      mobileBottomNav.setOrientation('portrait');
      
      const finalClassList = Array.from(navElement.classList);
      expect(finalClassList).toEqual(initialClassList);
    });

    it('should correctly toggle between portrait and landscape', () => {
      const navElement = container.querySelector('.mobile-bottom-nav');
      
      // Start in portrait
      expect(navElement?.classList.contains('portrait')).toBe(true);
      
      // Change to landscape
      mobileBottomNav.setOrientation('landscape');
      expect(navElement?.classList.contains('landscape')).toBe(true);
      expect(navElement?.classList.contains('portrait')).toBe(false);
      
      // Change back to portrait
      mobileBottomNav.setOrientation('portrait');
      expect(navElement?.classList.contains('portrait')).toBe(true);
      expect(navElement?.classList.contains('landscape')).toBe(false);
    });
  });

  describe('Tool Functionality During Orientation Changes', () => {
    beforeEach(() => {
      mobileBottomNav = new MobileBottomNav(container);
    });

    it('should maintain active tool when orientation changes', () => {
      // Set active tool to 'break'
      mobileBottomNav.setActiveTool('break');
      expect(mobileBottomNav.getActiveTool()).toBe('break');
      
      // Change orientation
      mobileBottomNav.setOrientation('landscape');
      
      // Active tool should remain the same
      expect(mobileBottomNav.getActiveTool()).toBe('break');
    });

    it('should maintain active button styling when orientation changes', () => {
      // Set active tool
      mobileBottomNav.setActiveTool('paint');
      
      const paintButton = container.querySelector('[data-tool="paint"]');
      expect(paintButton?.classList.contains('active')).toBe(true);
      
      // Change orientation
      mobileBottomNav.setOrientation('landscape');
      
      // Active button should still have active class
      const paintButtonAfter = container.querySelector('[data-tool="paint"]');
      expect(paintButtonAfter?.classList.contains('active')).toBe(true);
    });

    it('should still trigger tool change callbacks after orientation change', () => {
      let toolChanged = '';
      mobileBottomNav.onToolChange((tool) => {
        toolChanged = tool;
      });
      
      // Change orientation
      mobileBottomNav.setOrientation('landscape');
      
      // Click a tool button
      const fillButton = container.querySelector('[data-tool="fill"]') as HTMLElement;
      fillButton.click();
      
      expect(toolChanged).toBe('fill');
    });

    it('should still trigger menu callbacks after orientation change', () => {
      let menuOpened = false;
      mobileBottomNav.onMenuOpen(() => {
        menuOpened = true;
      });
      
      // Change orientation
      mobileBottomNav.setOrientation('landscape');
      
      // Click menu button
      const menuButton = container.querySelector('[data-tool="menu"]') as HTMLElement;
      menuButton.click();
      
      expect(menuOpened).toBe(true);
    });
  });

  describe('Button Layout', () => {
    beforeEach(() => {
      mobileBottomNav = new MobileBottomNav(container);
    });

    it('should render all 5 buttons regardless of orientation', () => {
      const buttonsPortrait = container.querySelectorAll('.mobile-nav-btn');
      expect(buttonsPortrait.length).toBe(5);
      
      mobileBottomNav.setOrientation('landscape');
      
      const buttonsLandscape = container.querySelectorAll('.mobile-nav-btn');
      expect(buttonsLandscape.length).toBe(5);
    });

    it('should maintain button order when orientation changes', () => {
      const getButtonOrder = () => {
        const buttons = Array.from(container.querySelectorAll('.mobile-nav-btn'));
        return buttons.map(btn => btn.getAttribute('data-tool'));
      };
      
      const orderPortrait = getButtonOrder();
      
      mobileBottomNav.setOrientation('landscape');
      
      const orderLandscape = getButtonOrder();
      
      expect(orderLandscape).toEqual(orderPortrait);
      expect(orderLandscape).toEqual(['place', 'break', 'paint', 'fill', 'menu']);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mobileBottomNav = new MobileBottomNav(container);
    });

    it('should maintain ARIA attributes when orientation changes', () => {
      const navElement = container.querySelector('.mobile-bottom-nav');
      
      expect(navElement?.getAttribute('role')).toBe('navigation');
      expect(navElement?.getAttribute('aria-label')).toBe('Mobile tool navigation');
      
      mobileBottomNav.setOrientation('landscape');
      
      expect(navElement?.getAttribute('role')).toBe('navigation');
      expect(navElement?.getAttribute('aria-label')).toBe('Mobile tool navigation');
    });

    it('should maintain button ARIA labels when orientation changes', () => {
      const placeButton = container.querySelector('[data-tool="place"]');
      const initialAriaLabel = placeButton?.getAttribute('aria-label');
      
      mobileBottomNav.setOrientation('landscape');
      
      const placeButtonAfter = container.querySelector('[data-tool="place"]');
      expect(placeButtonAfter?.getAttribute('aria-label')).toBe(initialAriaLabel);
    });
  });
});

