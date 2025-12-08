import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MobileInfoBar } from '../../src/ui/MobileInfoBar';

/**
 * MobileInfoBar Tests
 * Part of Phase 5: Mobile Information Display
 *
 * Functionality:
 * - Fixed top position info bar
 * - Display FPS and block count
 * - Semi-transparent background
 * - Tap to show/hide detailed info
 */
describe('MobileInfoBar', () => {
  let container: HTMLElement;
  let infoBar: MobileInfoBar;

  beforeEach(() => {
    // Create a container for testing
    container = document.createElement('div');
    container.id = 'ui-overlay';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (infoBar) {
      infoBar.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should create mobile info bar element', () => {
      infoBar = new MobileInfoBar(container);

      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement).toBeTruthy();
      expect(barElement?.classList.contains('mobile-info-bar')).toBe(true);
    });

    it('should be at fixed top position', () => {
      infoBar = new MobileInfoBar(container);

      const barElement = container.querySelector('.mobile-info-bar') as HTMLElement;
      expect(barElement).toBeTruthy();
      expect(barElement.classList.contains('mobile-info-bar')).toBe(true);
    });

    it('should show compact view by default', () => {
      infoBar = new MobileInfoBar(container);

      expect(infoBar.isExpanded()).toBe(false);
      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement?.classList.contains('expanded')).toBe(false);
    });

    it('should have FPS display element', () => {
      infoBar = new MobileInfoBar(container);

      const fpsElement = container.querySelector('.info-fps');
      expect(fpsElement).toBeTruthy();
    });

    it('should have block count display element', () => {
      infoBar = new MobileInfoBar(container);

      const blockCountElement = container.querySelector('.info-block-count');
      expect(blockCountElement).toBeTruthy();
    });
  });

  describe('Data Display', () => {
    it('should display FPS value', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateFPS(60);

      const fpsElement = container.querySelector('.info-fps');
      expect(fpsElement?.textContent).toContain('60');
    });

    it('should display block count', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateBlockCount(1234);

      const blockCountElement = container.querySelector('.info-block-count');
      expect(blockCountElement?.textContent).toContain('1,234');
    });

    it('should format large block counts with comma', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateBlockCount(12345);

      const blockCountElement = container.querySelector('.info-block-count');
      expect(blockCountElement?.textContent).toContain('12,345');
    });

    it('should color code FPS (green for high FPS)', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateFPS(58);

      const fpsElement = container.querySelector('.info-fps') as HTMLElement;
      expect(fpsElement.style.color).toBeTruthy();
    });

    it('should color code FPS (yellow for medium FPS)', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateFPS(35);

      const fpsElement = container.querySelector('.info-fps') as HTMLElement;
      expect(fpsElement.style.color).toBeTruthy();
    });

    it('should color code FPS (red for low FPS)', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateFPS(20);

      const fpsElement = container.querySelector('.info-fps') as HTMLElement;
      expect(fpsElement.style.color).toBeTruthy();
    });
  });

  describe('Expand/Collapse', () => {
    it('should expand on tap', () => {
      infoBar = new MobileInfoBar(container);

      expect(infoBar.isExpanded()).toBe(false);

      const barElement = container.querySelector('.mobile-info-bar') as HTMLElement;
      barElement.click();

      expect(infoBar.isExpanded()).toBe(true);
      expect(barElement.classList.contains('expanded')).toBe(true);
    });

    it('should collapse on second tap', () => {
      infoBar = new MobileInfoBar(container);

      const barElement = container.querySelector('.mobile-info-bar') as HTMLElement;

      // First tap - expand
      barElement.click();
      expect(infoBar.isExpanded()).toBe(true);

      // Second tap - collapse
      barElement.click();
      expect(infoBar.isExpanded()).toBe(false);
      expect(barElement.classList.contains('expanded')).toBe(false);
    });

    it('should toggle expanded state programmatically', () => {
      infoBar = new MobileInfoBar(container);

      expect(infoBar.isExpanded()).toBe(false);

      infoBar.toggle();
      expect(infoBar.isExpanded()).toBe(true);

      infoBar.toggle();
      expect(infoBar.isExpanded()).toBe(false);
    });

    it('should show detailed info when expanded', () => {
      infoBar = new MobileInfoBar(container);

      // Set detailed info
      infoBar.updateCurrentTool('Place');
      infoBar.updateCurrentBlock('Grass');
      infoBar.updateCursorPosition(10, 20, 30);

      // Expand
      infoBar.toggle();

      // Check detailed info is visible
      const toolElement = container.querySelector('.info-tool');
      const blockElement = container.querySelector('.info-block');
      const posElement = container.querySelector('.info-position');

      expect(toolElement?.textContent).toContain('Place');
      expect(blockElement?.textContent).toContain('Grass');
      expect(posElement?.textContent).toContain('10');
    });

    it('should hide detailed info when collapsed', () => {
      infoBar = new MobileInfoBar(container);

      // Expand first
      infoBar.toggle();
      expect(infoBar.isExpanded()).toBe(true);

      // Collapse
      infoBar.toggle();
      expect(infoBar.isExpanded()).toBe(false);

      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement?.classList.contains('expanded')).toBe(false);
    });
  });

  describe('Detailed Information', () => {
    it('should update current tool display', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateCurrentTool('Break');
      infoBar.toggle(); // Expand to see details

      const toolElement = container.querySelector('.info-tool');
      expect(toolElement?.textContent).toContain('Break');
    });

    it('should update current block display', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateCurrentBlock('Stone');
      infoBar.toggle();

      const blockElement = container.querySelector('.info-block');
      expect(blockElement?.textContent).toContain('Stone');
    });

    it('should update cursor position display', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateCursorPosition(5, 10, 15);
      infoBar.toggle();

      const posElement = container.querySelector('.info-position');
      expect(posElement?.textContent).toContain('5');
      expect(posElement?.textContent).toContain('10');
      expect(posElement?.textContent).toContain('15');
    });

    it('should show "-" when no cursor position', () => {
      infoBar = new MobileInfoBar(container);

      infoBar.updateCursorPosition(null, null, null);
      infoBar.toggle();

      const posElement = container.querySelector('.info-position');
      expect(posElement?.textContent).toBe('-');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      infoBar = new MobileInfoBar(container);

      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement?.getAttribute('role')).toBe('region');
      expect(barElement?.getAttribute('aria-label')).toBe('Game information');
    });

    it('should update aria-expanded on toggle', () => {
      infoBar = new MobileInfoBar(container);

      const barElement = container.querySelector('.mobile-info-bar');
      expect(barElement?.getAttribute('aria-expanded')).toBe('false');

      infoBar.toggle();
      expect(barElement?.getAttribute('aria-expanded')).toBe('true');

      infoBar.toggle();
      expect(barElement?.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Cleanup', () => {
    it('should remove element from DOM on destroy', () => {
      infoBar = new MobileInfoBar(container);

      expect(container.querySelector('.mobile-info-bar')).toBeTruthy();

      infoBar.destroy();

      expect(container.querySelector('.mobile-info-bar')).toBeFalsy();
    });
  });
});
