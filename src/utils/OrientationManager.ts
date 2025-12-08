import { DeviceDetector } from './DeviceDetector';

/**
 * Orientation types
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Layout configuration based on orientation
 */
export interface LayoutConfig {
  /** Position of bottom navigation */
  bottomNavPosition: 'bottom' | 'left';
  /** Direction of block sheet slide-in */
  blockSheetDirection: 'bottom' | 'right';
  /** Maximum size of block sheet */
  blockSheetMaxSize: string;
  /** Whether info bar should auto-expand */
  infoBarAutoExpand: boolean;
  /** Canvas area margins */
  canvasArea: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
}

/**
 * OrientationManager - Manages device orientation changes and provides
 * layout configurations for different orientations
 */
export class OrientationManager {
  private deviceDetector: DeviceDetector;
  private currentOrientation: Orientation;
  private orientationChangeCallbacks: ((orientation: Orientation) => void)[] = [];
  private debounceTimer: number | null = null;
  private debounceDelay: number = 100; // ms

  constructor(deviceDetector: DeviceDetector) {
    this.deviceDetector = deviceDetector;
    this.currentOrientation = this.detectOrientation();
    this.setupEventListeners();
  }

  /**
   * Detect current orientation
   */
  private detectOrientation(): Orientation {
    return this.deviceDetector.getOrientation();
  }

  /**
   * Setup event listeners for orientation changes
   */
  private setupEventListeners(): void {
    // Listen to both orientationchange and resize events
    // Some devices only trigger one or the other
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange();
    });

    window.addEventListener('resize', () => {
      this.handleOrientationChange();
    });
  }

  /**
   * Handle orientation change with debouncing
   */
  private handleOrientationChange(): void {
    // Clear existing timer
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = window.setTimeout(() => {
      const newOrientation = this.detectOrientation();

      // Only trigger callbacks if orientation actually changed
      if (newOrientation !== this.currentOrientation) {
        this.currentOrientation = newOrientation;
        this.triggerOrientationChange(newOrientation);
      }

      this.debounceTimer = null;
    }, this.debounceDelay);
  }

  /**
   * Trigger orientation change callbacks
   */
  private triggerOrientationChange(orientation: Orientation): void {
    this.orientationChangeCallbacks.forEach(callback => {
      try {
        callback(orientation);
      } catch (error) {
        console.error('Error in orientation change callback:', error);
      }
    });
  }

  /**
   * Get current orientation
   */
  public getCurrentOrientation(): Orientation {
    return this.currentOrientation;
  }

  /**
   * Check if current orientation is portrait
   */
  public isPortrait(): boolean {
    return this.currentOrientation === 'portrait';
  }

  /**
   * Check if current orientation is landscape
   */
  public isLandscape(): boolean {
    return this.currentOrientation === 'landscape';
  }

  /**
   * Subscribe to orientation change events
   */
  public onOrientationChange(callback: (orientation: Orientation) => void): void {
    this.orientationChangeCallbacks.push(callback);
  }

  /**
   * Unsubscribe from orientation change events
   */
  public offOrientationChange(callback: (orientation: Orientation) => void): void {
    const index = this.orientationChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.orientationChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Get layout configuration based on current orientation
   */
  public getLayoutConfig(): LayoutConfig {
    if (this.isLandscape()) {
      return this.getLandscapeLayoutConfig();
    } else {
      return this.getPortraitLayoutConfig();
    }
  }

  /**
   * Get portrait mode layout configuration
   */
  private getPortraitLayoutConfig(): LayoutConfig {
    return {
      bottomNavPosition: 'bottom',
      blockSheetDirection: 'bottom',
      blockSheetMaxSize: '70vh',
      infoBarAutoExpand: false,
      canvasArea: {
        top: '40px', // Info bar height
        bottom: '60px', // Bottom nav height
        left: '0',
        right: '0',
      },
    };
  }

  /**
   * Get landscape mode layout configuration
   */
  private getLandscapeLayoutConfig(): LayoutConfig {
    const screenHeight = this.deviceDetector.getScreenHeight();
    const isShortScreen = screenHeight < 600;

    return {
      bottomNavPosition: 'bottom', // Keep at bottom for simplicity
      blockSheetDirection: 'right',
      blockSheetMaxSize: '40vw',
      infoBarAutoExpand: !isShortScreen, // Auto-expand only on taller screens
      canvasArea: {
        top: isShortScreen ? '35px' : '40px',
        bottom: '50px', // Smaller bottom nav in landscape
        left: '0',
        right: '0',
      },
    };
  }

  /**
   * Get optimal block grid columns for current orientation
   */
  public getOptimalGridColumns(): number {
    if (this.isLandscape()) {
      // More columns in landscape for block sheet
      return 4;
    } else {
      // Fewer columns in portrait
      return 3;
    }
  }

  /**
   * Get screen dimensions
   */
  public getScreenDimensions(): { width: number; height: number } {
    return {
      width: this.deviceDetector.getScreenWidth(),
      height: this.deviceDetector.getScreenHeight(),
    };
  }

  /**
   * Check if device is in a short landscape mode (< 600px height)
   */
  public isShortLandscape(): boolean {
    return this.isLandscape() && this.deviceDetector.getScreenHeight() < 600;
  }

  /**
   * Get aspect ratio
   */
  public getAspectRatio(): number {
    const width = this.deviceDetector.getScreenWidth();
    const height = this.deviceDetector.getScreenHeight();
    return width / height;
  }

  /**
   * Set debounce delay (for testing purposes)
   */
  public setDebounceDelay(delay: number): void {
    this.debounceDelay = delay;
  }

  /**
   * Log current orientation info (for debugging)
   */
  public logOrientationInfo(): void {
    const config = this.getLayoutConfig();
    const dimensions = this.getScreenDimensions();
    
    console.log('📱 Orientation Info:', {
      'Current Orientation': this.currentOrientation,
      'Screen Size': `${dimensions.width}×${dimensions.height}`,
      'Aspect Ratio': this.getAspectRatio().toFixed(2),
      'Bottom Nav Position': config.bottomNavPosition,
      'Block Sheet Direction': config.blockSheetDirection,
      'Block Sheet Max Size': config.blockSheetMaxSize,
      'Info Bar Auto-Expand': config.infoBarAutoExpand,
      'Optimal Grid Columns': this.getOptimalGridColumns(),
      'Is Short Landscape': this.isShortLandscape(),
    });
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    // Clear any pending debounce timer
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Clear all callbacks
    this.orientationChangeCallbacks = [];

    // Note: We don't remove window event listeners as they're shared
    // and other parts of the app might still need them
  }
}

