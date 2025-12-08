import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MobileInfoBar } from '../../src/ui/MobileInfoBar';

describe('MobileInfoBar - Orientation', () => {
  let container: HTMLElement;
  let mobileInfoBar: MobileInfoBar;

  beforeEach(() => {
    // Create a container for the info bar
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (mobileInfoBar) {
      mobileInfoBar.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with portrait orientation by default', () => {
      mobileInfoBar = new MobileInfoBar(container);
      
      expect(mobileInfoBar.getOrientation()).toBe('portrait');
    });

    it('should add portrait class to bar element on initialization', () => {
      mobileInfoBar = new MobileInfoBar(container);
      
      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement).not.toBeNull();
      expect(barElement?.classList.contains('portrait')).toBe(true);
    });

    it('should set data-orientation attribute on initialization', () => {
      mobileInfoBar = new MobileInfoBar(container);
      
      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement?.getAttribute('data-orientation')).toBe('portrait');
    });

    it('should not be expanded on initialization', () => {
      mobileInfoBar = new MobileInfoBar(container);
      
      expect(mobileInfoBar.isExpanded()).toBe(false);
    });
  });

  describe('Orientation Changes', () => {
    beforeEach(() => {
      mobileInfoBar = new MobileInfoBar(container);
    });

    it('should update orientation when setOrientation is called', () => {
      mobileInfoBar.setOrientation('landscape');
      
      expect(mobileInfoBar.getOrientation()).toBe('landscape');
    });

    it('should add landscape class when orientation changes to landscape', () => {
      mobileInfoBar.setOrientation('landscape');
      
      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement?.classList.contains('landscape')).toBe(true);
      expect(barElement?.classList.contains('portrait')).toBe(false);
    });

    it('should update data-orientation attribute when orientation changes', () => {
      mobileInfoBar.setOrientation('landscape');
      
      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement?.getAttribute('data-orientation')).toBe('landscape');
    });

    it('should not trigger unnecessary updates if orientation is the same', () => {
      const barElement = container.querySelector('.mobile-info-bar') as HTMLElement;
      const initialClassList = Array.from(barElement.classList);
      
      mobileInfoBar.setOrientation('portrait');
      
      const finalClassList = Array.from(barElement.classList);
      expect(finalClassList).toEqual(initialClassList);
    });

    it('should correctly toggle between portrait and landscape', () => {
      const barElement = container.querySelector('.mobile-info-bar');
      
      // Start in portrait
      expect(barElement?.classList.contains('portrait')).toBe(true);
      
      // Change to landscape
      mobileInfoBar.setOrientation('landscape');
      expect(barElement?.classList.contains('landscape')).toBe(true);
      expect(barElement?.classList.contains('portrait')).toBe(false);
      
      // Change back to portrait
      mobileInfoBar.setOrientation('portrait');
      expect(barElement?.classList.contains('portrait')).toBe(true);
      expect(barElement?.classList.contains('landscape')).toBe(false);
    });
  });

  describe('Auto-Expand in Landscape', () => {
    beforeEach(() => {
      mobileInfoBar = new MobileInfoBar(container);
    });

    it('should auto-expand when changing to landscape with autoExpand enabled', () => {
      expect(mobileInfoBar.isExpanded()).toBe(false);
      
      mobileInfoBar.setOrientation('landscape', true);
      
      expect(mobileInfoBar.isExpanded()).toBe(true);
    });

    it('should not auto-expand when autoExpand is disabled', () => {
      expect(mobileInfoBar.isExpanded()).toBe(false);
      
      mobileInfoBar.setOrientation('landscape', false);
      
      expect(mobileInfoBar.isExpanded()).toBe(false);
    });

    it('should auto-collapse when changing from landscape to portrait', () => {
      mobileInfoBar.setOrientation('landscape', true);
      expect(mobileInfoBar.isExpanded()).toBe(true);
      
      mobileInfoBar.setOrientation('portrait', true);
      
      expect(mobileInfoBar.isExpanded()).toBe(false);
    });

    it('should add expanded class when auto-expanding', () => {
      const barElement = container.querySelector('.mobile-info-bar');
      
      mobileInfoBar.setOrientation('landscape', true);
      
      expect(barElement?.classList.contains('expanded')).toBe(true);
    });

    it('should update aria-expanded when auto-expanding', () => {
      const barElement = container.querySelector('.mobile-info-bar');
      
      mobileInfoBar.setOrientation('landscape', true);
      
      expect(barElement?.getAttribute('aria-expanded')).toBe('true');
    });

    it('should maintain manually expanded state in landscape', () => {
      // Manually expand first
      mobileInfoBar.toggle();
      expect(mobileInfoBar.isExpanded()).toBe(true);
      
      // Change to landscape
      mobileInfoBar.setOrientation('landscape', true);
      
      // Should remain expanded
      expect(mobileInfoBar.isExpanded()).toBe(true);
    });
  });

  describe('Info Display Updates', () => {
    beforeEach(() => {
      mobileInfoBar = new MobileInfoBar(container);
    });

    it('should maintain FPS display when orientation changes', () => {
      mobileInfoBar.updateFPS(60);
      
      const fpsElement = container.querySelector('.info-fps') as HTMLElement;
      expect(fpsElement.textContent).toBe('60 FPS');
      
      mobileInfoBar.setOrientation('landscape');
      
      expect(fpsElement.textContent).toBe('60 FPS');
    });

    it('should maintain block count display when orientation changes', () => {
      mobileInfoBar.updateBlockCount(1234);
      
      const blockCountElement = container.querySelector('.info-block-count') as HTMLElement;
      expect(blockCountElement.textContent).toBe('1,234 blocks');
      
      mobileInfoBar.setOrientation('landscape');
      
      expect(blockCountElement.textContent).toBe('1,234 blocks');
    });

    it('should maintain tool display when orientation changes', () => {
      mobileInfoBar.updateCurrentTool('Place Block');
      
      const toolElement = container.querySelector('.info-tool') as HTMLElement;
      expect(toolElement.textContent).toBe('Place Block');
      
      mobileInfoBar.setOrientation('landscape');
      
      expect(toolElement.textContent).toBe('Place Block');
    });

    it('should maintain block display when orientation changes', () => {
      mobileInfoBar.updateCurrentBlock('Grass');
      
      const blockElement = container.querySelector('.info-block') as HTMLElement;
      expect(blockElement.textContent).toBe('Grass');
      
      mobileInfoBar.setOrientation('landscape');
      
      expect(blockElement.textContent).toBe('Grass');
    });

    it('should maintain position display when orientation changes', () => {
      mobileInfoBar.updateCursorPosition(10, 5, 3);
      
      const positionElement = container.querySelector('.info-position') as HTMLElement;
      expect(positionElement.textContent).toBe('10, 5, 3');
      
      mobileInfoBar.setOrientation('landscape');
      
      expect(positionElement.textContent).toBe('10, 5, 3');
    });
  });

  describe('Toggle Functionality', () => {
    beforeEach(() => {
      mobileInfoBar = new MobileInfoBar(container);
    });

    it('should still toggle correctly after orientation change', () => {
      mobileInfoBar.setOrientation('landscape', false);
      
      expect(mobileInfoBar.isExpanded()).toBe(false);
      
      mobileInfoBar.toggle();
      expect(mobileInfoBar.isExpanded()).toBe(true);
      
      mobileInfoBar.toggle();
      expect(mobileInfoBar.isExpanded()).toBe(false);
    });

    it('should trigger toggle on click after orientation change', () => {
      mobileInfoBar.setOrientation('landscape', false);
      
      const barElement = container.querySelector('.mobile-info-bar') as HTMLElement;
      
      barElement.click();
      expect(mobileInfoBar.isExpanded()).toBe(true);
      
      barElement.click();
      expect(mobileInfoBar.isExpanded()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mobileInfoBar = new MobileInfoBar(container);
    });

    it('should maintain ARIA attributes when orientation changes', () => {
      const barElement = container.querySelector('.mobile-info-bar');
      
      expect(barElement?.getAttribute('role')).toBe('region');
      expect(barElement?.getAttribute('aria-label')).toBe('Game information');
      
      mobileInfoBar.setOrientation('landscape');
      
      expect(barElement?.getAttribute('role')).toBe('region');
      expect(barElement?.getAttribute('aria-label')).toBe('Game information');
    });

    it('should update aria-expanded correctly during auto-expand', () => {
      const barElement = container.querySelector('.mobile-info-bar');
      
      expect(barElement?.getAttribute('aria-expanded')).toBe('false');
      
      mobileInfoBar.setOrientation('landscape', true);
      
      expect(barElement?.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Elements Structure', () => {
    beforeEach(() => {
      mobileInfoBar = new MobileInfoBar(container);
    });

    it('should maintain info bar structure when orientation changes', () => {
      const checkStructure = () => {
        expect(container.querySelector('.mobile-info-bar')).not.toBeNull();
        expect(container.querySelector('.info-compact')).not.toBeNull();
        expect(container.querySelector('.info-detailed')).not.toBeNull();
        expect(container.querySelector('.info-fps')).not.toBeNull();
        expect(container.querySelector('.info-block-count')).not.toBeNull();
        expect(container.querySelector('.info-tool')).not.toBeNull();
        expect(container.querySelector('.info-block')).not.toBeNull();
        expect(container.querySelector('.info-position')).not.toBeNull();
      };

      checkStructure();
      
      mobileInfoBar.setOrientation('landscape');
      checkStructure();
      
      mobileInfoBar.setOrientation('portrait');
      checkStructure();
    });
  });
});

