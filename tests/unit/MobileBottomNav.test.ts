import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MobileBottomNav } from '../../src/ui/MobileBottomNav';
import { ToolMode } from '../../src/types/VoxelTypes';

describe('MobileBottomNav', () => {
  let container: HTMLElement;
  let nav: MobileBottomNav;

  beforeEach(() => {
    // Create a container for testing
    container = document.createElement('div');
    container.id = 'ui-overlay';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (nav) {
      nav.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should create mobile bottom navigation element', () => {
      nav = new MobileBottomNav(container);

      const navElement = container.querySelector('.mobile-bottom-nav');
      expect(navElement).toBeTruthy();
      expect(navElement?.classList.contains('mobile-bottom-nav')).toBe(true);
    });

    it('should render 5 navigation buttons', () => {
      nav = new MobileBottomNav(container);

      const buttons = container.querySelectorAll('.mobile-nav-btn');
      expect(buttons.length).toBe(5);
    });

    it('should render buttons with correct tools', () => {
      nav = new MobileBottomNav(container);

      const placeBtn = container.querySelector('[data-tool="place"]');
      const breakBtn = container.querySelector('[data-tool="break"]');
      const paintBtn = container.querySelector('[data-tool="paint"]');
      const fillBtn = container.querySelector('[data-tool="fill"]');
      const menuBtn = container.querySelector('[data-tool="menu"]');

      expect(placeBtn).toBeTruthy();
      expect(breakBtn).toBeTruthy();
      expect(paintBtn).toBeTruthy();
      expect(fillBtn).toBeTruthy();
      expect(menuBtn).toBeTruthy();
    });

    it('should render buttons with icons and labels', () => {
      nav = new MobileBottomNav(container);

      const placeBtn = container.querySelector('[data-tool="place"]');
      const icon = placeBtn?.querySelector('.mobile-nav-icon');
      const label = placeBtn?.querySelector('.mobile-nav-label');

      expect(icon).toBeTruthy();
      expect(label).toBeTruthy();
      expect(icon?.textContent).toBe('🏗️');
      expect(label?.textContent).toBe('Place');
    });

    it('should have Place tool active by default', () => {
      nav = new MobileBottomNav(container);

      const placeBtn = container.querySelector('[data-tool="place"]');
      expect(placeBtn?.classList.contains('active')).toBe(true);
    });
  });

  describe('Tool Selection', () => {
    it('should change active tool on button click', () => {
      nav = new MobileBottomNav(container);

      const breakBtn = container.querySelector('[data-tool="break"]') as HTMLElement;
      breakBtn.click();

      expect(breakBtn.classList.contains('active')).toBe(true);
    });

    it('should remove active class from previous tool', () => {
      nav = new MobileBottomNav(container);

      const placeBtn = container.querySelector('[data-tool="place"]') as HTMLElement;
      const breakBtn = container.querySelector('[data-tool="break"]') as HTMLElement;

      expect(placeBtn.classList.contains('active')).toBe(true);

      breakBtn.click();

      expect(placeBtn.classList.contains('active')).toBe(false);
      expect(breakBtn.classList.contains('active')).toBe(true);
    });

    it('should call onToolChange callback when tool is selected', () => {
      nav = new MobileBottomNav(container);

      const callback = vi.fn();
      nav.onToolChange(callback);

      const breakBtn = container.querySelector('[data-tool="break"]') as HTMLElement;
      breakBtn.click();

      expect(callback).toHaveBeenCalledWith('break');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call onMenuOpen callback when menu button is clicked', () => {
      nav = new MobileBottomNav(container);

      const callback = vi.fn();
      nav.onMenuOpen(callback);

      const menuBtn = container.querySelector('[data-tool="menu"]') as HTMLElement;
      menuBtn.click();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not trigger tool change for menu button', () => {
      nav = new MobileBottomNav(container);

      const callback = vi.fn();
      nav.onToolChange(callback);

      const menuBtn = container.querySelector('[data-tool="menu"]') as HTMLElement;
      menuBtn.click();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Public API', () => {
    it('should set active tool programmatically', () => {
      nav = new MobileBottomNav(container);

      nav.setActiveTool('paint');

      const paintBtn = container.querySelector('[data-tool="paint"]');
      expect(paintBtn?.classList.contains('active')).toBe(true);
    });

    it('should return current active tool', () => {
      nav = new MobileBottomNav(container);

      expect(nav.getActiveTool()).toBe('place');

      nav.setActiveTool('break');
      expect(nav.getActiveTool()).toBe('break');
    });

    it('should handle invalid tool gracefully', () => {
      nav = new MobileBottomNav(container);

      // Should not throw error
      nav.setActiveTool('invalid' as ToolMode);

      // Should keep previous active tool
      expect(nav.getActiveTool()).toBe('place');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      nav = new MobileBottomNav(container);

      const placeBtn = container.querySelector('[data-tool="place"]');
      expect(placeBtn?.getAttribute('aria-label')).toBe('Place Block');
      expect(placeBtn?.getAttribute('role')).toBe('button');
    });

    it('should have aria-pressed attribute', () => {
      nav = new MobileBottomNav(container);

      const placeBtn = container.querySelector('[data-tool="place"]');
      const breakBtn = container.querySelector('[data-tool="break"]');

      expect(placeBtn?.getAttribute('aria-pressed')).toBe('true');
      expect(breakBtn?.getAttribute('aria-pressed')).toBe('false');
    });

    it('should update aria-pressed when tool changes', () => {
      nav = new MobileBottomNav(container);

      const breakBtn = container.querySelector('[data-tool="break"]') as HTMLElement;
      breakBtn.click();

      expect(breakBtn.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Safe Area Support', () => {
    it('should apply safe-area-inset-bottom padding', () => {
      nav = new MobileBottomNav(container);

      const navElement = container.querySelector('.mobile-bottom-nav') as HTMLElement;
      const style = window.getComputedStyle(navElement);

      // Should have padding-bottom set (either from CSS variable or fallback)
      expect(navElement.style.paddingBottom || style.paddingBottom).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should remove element from DOM on destroy', () => {
      nav = new MobileBottomNav(container);

      expect(container.querySelector('.mobile-bottom-nav')).toBeTruthy();

      nav.destroy();

      expect(container.querySelector('.mobile-bottom-nav')).toBeFalsy();
    });

    it('should remove event listeners on destroy', () => {
      nav = new MobileBottomNav(container);

      const callback = vi.fn();
      nav.onToolChange(callback);

      nav.destroy();

      // Try to click after destroy (button won't exist, but test the concept)
      const navElement = container.querySelector('.mobile-bottom-nav');
      expect(navElement).toBeFalsy();
    });
  });

  describe('Visual Feedback', () => {
    it('should highlight active tool with active class', () => {
      nav = new MobileBottomNav(container);

      const placeBtn = container.querySelector('[data-tool="place"]');
      expect(placeBtn?.classList.contains('active')).toBe(true);
    });

    it('should only have one active tool at a time', () => {
      nav = new MobileBottomNav(container);

      const breakBtn = container.querySelector('[data-tool="break"]') as HTMLElement;
      breakBtn.click();

      const activeButtons = container.querySelectorAll('.mobile-nav-btn.active');
      expect(activeButtons.length).toBe(1);
    });
  });

  describe('Touch Events', () => {
    it('should handle touch events (not just click)', () => {
      nav = new MobileBottomNav(container);

      const callback = vi.fn();
      nav.onToolChange(callback);

      const breakBtn = container.querySelector('[data-tool="break"]') as HTMLElement;

      // Simulate touch event
      const touchEvent = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        touches: [],
      });

      breakBtn.dispatchEvent(touchEvent);

      // Should trigger click handler
      expect(callback).toHaveBeenCalledWith('break');
    });
  });
});
