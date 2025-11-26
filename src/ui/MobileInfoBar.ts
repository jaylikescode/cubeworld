import type { Orientation } from '../utils/OrientationManager';

/**
 * MobileInfoBar - Top information bar for mobile devices
 * Shows FPS, block count, and detailed info on tap
 * Supports both portrait and landscape orientations
 */
export class MobileInfoBar {
  private container: HTMLElement;
  private barElement: HTMLElement;
  private isExpandedState: boolean = false;
  private currentOrientation: Orientation = 'portrait';

  // Info elements
  private fpsElement: HTMLElement;
  private blockCountElement: HTMLElement;
  private toolElement: HTMLElement;
  private blockElement: HTMLElement;
  private positionElement: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.barElement = this.createInfoBar();

    // Create info elements
    this.fpsElement = this.barElement.querySelector('.info-fps')!;
    this.blockCountElement = this.barElement.querySelector('.info-block-count')!;
    this.toolElement = this.barElement.querySelector('.info-tool')!;
    this.blockElement = this.barElement.querySelector('.info-block')!;
    this.positionElement = this.barElement.querySelector('.info-position')!;

    this.container.appendChild(this.barElement);

    // Attach event listeners
    this.barElement.addEventListener('click', () => this.toggle());
  }

  /**
   * Create info bar element
   */
  private createInfoBar(): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'mobile-info-bar';
    bar.classList.add(this.currentOrientation); // Add orientation class
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Game information');
    bar.setAttribute('aria-expanded', 'false');
    bar.setAttribute('data-orientation', this.currentOrientation);

    // Compact view (always visible)
    const compactView = document.createElement('div');
    compactView.className = 'info-compact';

    const fps = document.createElement('div');
    fps.className = 'info-item info-fps';
    fps.textContent = '0 FPS';

    const blockCount = document.createElement('div');
    blockCount.className = 'info-item info-block-count';
    blockCount.textContent = '0 blocks';

    compactView.appendChild(fps);
    compactView.appendChild(blockCount);

    // Detailed view (shown when expanded)
    const detailedView = document.createElement('div');
    detailedView.className = 'info-detailed';

    const tool = document.createElement('div');
    tool.className = 'info-detail-item';
    tool.innerHTML = '<span class="info-label">Tool:</span> <span class="info-tool">-</span>';

    const block = document.createElement('div');
    block.className = 'info-detail-item';
    block.innerHTML = '<span class="info-label">Block:</span> <span class="info-block">-</span>';

    const position = document.createElement('div');
    position.className = 'info-detail-item';
    position.innerHTML = '<span class="info-label">Position:</span> <span class="info-position">-</span>';

    detailedView.appendChild(tool);
    detailedView.appendChild(block);
    detailedView.appendChild(position);

    bar.appendChild(compactView);
    bar.appendChild(detailedView);

    return bar;
  }

  /**
   * Update FPS display
   */
  public updateFPS(fps: number): void {
    this.fpsElement.textContent = `${Math.round(fps)} FPS`;

    // Color code FPS
    let color: string;
    if (fps >= 50) {
      color = '#4ecdc4'; // Green
    } else if (fps >= 30) {
      color = '#f4d03f'; // Yellow
    } else {
      color = '#e74c3c'; // Red
    }
    this.fpsElement.style.color = color;
  }

  /**
   * Update block count display
   */
  public updateBlockCount(count: number): void {
    // Format with comma separator
    const formatted = count.toLocaleString('en-US');
    this.blockCountElement.textContent = `${formatted} blocks`;
  }

  /**
   * Update current tool display
   */
  public updateCurrentTool(tool: string): void {
    this.toolElement.textContent = tool || '-';
  }

  /**
   * Update current block display
   */
  public updateCurrentBlock(block: string): void {
    this.blockElement.textContent = block || '-';
  }

  /**
   * Update cursor position display
   */
  public updateCursorPosition(x: number | null, y: number | null, z: number | null): void {
    if (x !== null && y !== null && z !== null) {
      this.positionElement.textContent = `${x}, ${y}, ${z}`;
    } else {
      this.positionElement.textContent = '-';
    }
  }

  /**
   * Toggle expanded state
   */
  public toggle(): void {
    this.isExpandedState = !this.isExpandedState;

    if (this.isExpandedState) {
      this.barElement.classList.add('expanded');
      this.barElement.setAttribute('aria-expanded', 'true');
    } else {
      this.barElement.classList.remove('expanded');
      this.barElement.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Check if info bar is expanded
   */
  public isExpanded(): boolean {
    return this.isExpandedState;
  }

  /**
   * Set orientation and update layout
   */
  public setOrientation(orientation: Orientation, autoExpandInLandscape: boolean = true): void {
    if (this.currentOrientation === orientation) {
      return; // No change needed
    }

    this.currentOrientation = orientation;
    this.updateOrientationLayout(autoExpandInLandscape);
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
  private updateOrientationLayout(autoExpandInLandscape: boolean): void {
    // Remove old orientation classes
    this.barElement.classList.remove('portrait', 'landscape');
    
    // Add new orientation class
    this.barElement.classList.add(this.currentOrientation);

    // Update aria attributes
    this.barElement.setAttribute('data-orientation', this.currentOrientation);

    // Auto-expand in landscape mode if option is enabled
    if (this.currentOrientation === 'landscape' && autoExpandInLandscape) {
      if (!this.isExpandedState) {
        this.barElement.classList.add('expanded');
        this.barElement.setAttribute('aria-expanded', 'true');
        this.isExpandedState = true;
      }
    } else if (this.currentOrientation === 'portrait' && autoExpandInLandscape) {
      // Auto-collapse in portrait mode
      if (this.isExpandedState) {
        this.barElement.classList.remove('expanded');
        this.barElement.setAttribute('aria-expanded', 'false');
        this.isExpandedState = false;
      }
    }
  }

  /**
   * Clean up and remove the info bar
   */
  public destroy(): void {
    if (this.barElement && this.barElement.parentNode) {
      this.barElement.parentNode.removeChild(this.barElement);
    }
  }
}
