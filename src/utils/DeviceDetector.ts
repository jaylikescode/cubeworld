/**
 * Device types
 */
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

/**
 * Performance levels
 */
export enum PerformanceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Device information interface
 */
export interface DeviceInfo {
  deviceType: DeviceType;
  performanceLevel: PerformanceLevel;
  hasTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  isIOS: boolean;
  isAndroid: boolean;
  isIPad: boolean;
  supportsWebGL: boolean;
  gpuTier: 'low' | 'medium' | 'high';
}

/**
 * DeviceDetector - Detects device type, capabilities, and performance level
 */
export class DeviceDetector {
  private deviceType: DeviceType;
  private performanceLevel: PerformanceLevel;
  private orientationChangeCallbacks: (() => void)[] = [];
  private resizeCallbacks: (() => void)[] = [];

  constructor() {
    this.deviceType = this.detectDeviceType();
    this.performanceLevel = this.detectPerformanceLevel();
    this.setupEventListeners();
  }

  /**
   * Detect device type based on user agent and screen size
   */
  private detectDeviceType(): DeviceType {
    const userAgent = navigator.userAgent || '';
    const width = window.innerWidth;

    // Check user agent for mobile devices
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);

    // Check screen size
    if (isMobileUA || width < 768) {
      return DeviceType.MOBILE;
    } else if (isTabletUA || (width >= 768 && width < 1024)) {
      return DeviceType.TABLET;
    } else {
      return DeviceType.DESKTOP;
    }
  }

  /**
   * Detect performance level based on hardware
   */
  private detectPerformanceLevel(): PerformanceLevel {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4;

    // Low-end: <= 4 cores and <= 4GB RAM
    if (cores <= 4 && memory <= 4) {
      return PerformanceLevel.LOW;
    }

    // High-end: >= 8 cores or >= 8GB RAM
    if (cores >= 8 || memory >= 8) {
      return PerformanceLevel.HIGH;
    }

    // Medium: everything else
    return PerformanceLevel.MEDIUM;
  }

  /**
   * Setup event listeners for orientation and resize
   */
  private setupEventListeners(): void {
    window.addEventListener('orientationchange', () => {
      this.orientationChangeCallbacks.forEach(callback => callback());
    });

    window.addEventListener('resize', () => {
      this.resizeCallbacks.forEach(callback => callback());
    });
  }

  /**
   * Check if device is mobile
   */
  public isMobile(): boolean {
    return this.deviceType === DeviceType.MOBILE;
  }

  /**
   * Check if device is tablet
   */
  public isTablet(): boolean {
    return this.deviceType === DeviceType.TABLET;
  }

  /**
   * Check if device is desktop
   */
  public isDesktop(): boolean {
    return this.deviceType === DeviceType.DESKTOP;
  }

  /**
   * Get device type
   */
  public getDeviceType(): DeviceType {
    return this.deviceType;
  }

  /**
   * Check if device has touch support
   */
  public hasTouchSupport(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ((navigator as { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0
    );
  }

  /**
   * Get performance level
   */
  public getPerformanceLevel(): PerformanceLevel {
    return this.performanceLevel;
  }

  /**
   * Check if device is low-end
   */
  public isLowEndDevice(): boolean {
    return this.performanceLevel === PerformanceLevel.LOW;
  }

  /**
   * Get screen width
   */
  public getScreenWidth(): number {
    return window.innerWidth;
  }

  /**
   * Get screen height
   */
  public getScreenHeight(): number {
    return window.innerHeight;
  }

  /**
   * Get screen orientation
   */
  public getOrientation(): 'portrait' | 'landscape' {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  /**
   * Check if orientation is landscape
   */
  public isLandscape(): boolean {
    return this.getOrientation() === 'landscape';
  }

  /**
   * Check if orientation is portrait
   */
  public isPortrait(): boolean {
    return this.getOrientation() === 'portrait';
  }

  /**
   * Get device pixel ratio
   */
  public getPixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * Check if device has retina display
   */
  public isRetinaDisplay(): boolean {
    return this.getPixelRatio() >= 2;
  }

  /**
   * Check if device is iOS
   */
  public isIOS(): boolean {
    const userAgent = navigator.userAgent || '';
    return /iPhone|iPad|iPod/i.test(userAgent);
  }

  /**
   * Check if device is Android
   */
  public isAndroid(): boolean {
    const userAgent = navigator.userAgent || '';
    return /Android/i.test(userAgent);
  }

  /**
   * Check if device is iPad
   */
  public isIPad(): boolean {
    const userAgent = navigator.userAgent || '';
    return /iPad/i.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Check if WebGL is supported
   */
  public supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return gl !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if local storage is supported
   */
  public supportsLocalStorage(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get GPU tier estimation
   */
  public getGPUTier(): 'low' | 'medium' | 'high' {
    // Simple heuristic based on device type and performance level
    if (this.isMobile() && this.isLowEndDevice()) {
      return 'low';
    }

    if (this.isDesktop() && this.performanceLevel === PerformanceLevel.HIGH) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Get complete device information
   */
  public getDeviceInfo(): DeviceInfo {
    return {
      deviceType: this.getDeviceType(),
      performanceLevel: this.getPerformanceLevel(),
      hasTouch: this.hasTouchSupport(),
      screenWidth: this.getScreenWidth(),
      screenHeight: this.getScreenHeight(),
      orientation: this.getOrientation(),
      pixelRatio: this.getPixelRatio(),
      isIOS: this.isIOS(),
      isAndroid: this.isAndroid(),
      isIPad: this.isIPad(),
      supportsWebGL: this.supportsWebGL(),
      gpuTier: this.getGPUTier(),
    };
  }

  /**
   * Subscribe to orientation change events
   */
  public onOrientationChange(callback: () => void): void {
    this.orientationChangeCallbacks.push(callback);
  }

  /**
   * Subscribe to resize events
   */
  public onResize(callback: () => void): void {
    this.resizeCallbacks.push(callback);
  }

  /**
   * Log device info to console (for debugging)
   */
  public logDeviceInfo(): void {
    const info = this.getDeviceInfo();
    console.log('📱 Device Info:', {
      'Device Type': info.deviceType,
      'Performance': info.performanceLevel,
      'Touch Support': info.hasTouch,
      'Screen': `${info.screenWidth}×${info.screenHeight}`,
      'Orientation': info.orientation,
      'Pixel Ratio': info.pixelRatio,
      'Platform': info.isIOS ? 'iOS' : info.isAndroid ? 'Android' : 'Other',
      'GPU Tier': info.gpuTier,
      'WebGL': info.supportsWebGL ? 'Supported' : 'Not Supported',
    });
  }
}
