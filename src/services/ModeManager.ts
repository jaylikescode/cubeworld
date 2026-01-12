/**
 * ModeManager
 *
 * Central mode state management and coordination
 *
 * Responsibilities:
 * - Determine initial render mode (localStorage > URL param > device detection)
 * - Manage mode state and transitions
 * - Notify subscribers of mode changes
 * - Persist user preferences to localStorage
 *
 * Design Principles:
 * - Single Responsibility: Only manages mode state
 * - Observable Pattern: Callbacks for mode changes
 * - Priority Chain: localStorage > URL > device detection
 */

import type { LocalStorageManager } from './LocalStorageManager';
import type { DeviceDetector } from '../utils/DeviceDetector';

export type RenderMode = 'desktop' | 'mobile';

export interface ModeState {
  currentMode: RenderMode;
  detectedMode: RenderMode;
  isOverridden: boolean;
}

export class ModeManager {
  private currentMode: RenderMode;
  private detectedMode: RenderMode;
  private changeCallbacks: ((mode: RenderMode) => void)[] = [];
  private storage: LocalStorageManager;
  private deviceDetector: DeviceDetector;

  constructor(deviceDetector: DeviceDetector, storage: LocalStorageManager) {
    this.deviceDetector = deviceDetector;
    this.storage = storage;

    // Determine detected mode from device
    this.detectedMode = this.detectModeFromDevice();

    // Determine initial mode using priority chain
    this.currentMode = this.determineInitialMode();
  }

  /**
   * Detect mode from device characteristics
   */
  private detectModeFromDevice(): RenderMode {
    if (this.deviceDetector.isMobile() || this.deviceDetector.isTablet()) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Determine initial mode using priority chain:
   * 1. localStorage preference (user's saved choice)
   * 2. URL parameter ?mode=desktop/mobile
   * 3. Device detection (automatic)
   */
  public determineInitialMode(): RenderMode {
    // Priority 1: localStorage
    const savedPreference = this.storage.loadModePreference();
    if (savedPreference) {
      return savedPreference;
    }

    // Priority 2: URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    if (urlMode === 'desktop' || urlMode === 'mobile') {
      return urlMode;
    }

    // Priority 3: Device detection
    return this.detectedMode;
  }

  /**
   * Switch to a new mode
   * - Updates internal state
   * - Saves preference to localStorage
   * - Triggers callbacks to notify subscribers
   */
  public switchMode(mode: RenderMode): void {
    if (this.currentMode === mode) {
      return; // Already in this mode
    }

    this.currentMode = mode;
    this.savePreference(mode);
    this.triggerCallbacks();
  }

  /**
   * Get current active mode
   */
  public getCurrentMode(): RenderMode {
    return this.currentMode;
  }

  /**
   * Get comprehensive mode state
   */
  public getState(): ModeState {
    return {
      currentMode: this.currentMode,
      detectedMode: this.detectedMode,
      isOverridden: this.currentMode !== this.detectedMode,
    };
  }

  /**
   * Subscribe to mode changes
   * @returns Unsubscribe function
   */
  public onModeChange(callback: (mode: RenderMode) => void): () => void {
    this.changeCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.changeCallbacks.indexOf(callback);
      if (index > -1) {
        this.changeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Trigger all registered callbacks
   */
  private triggerCallbacks(): void {
    this.changeCallbacks.forEach((callback) => {
      try {
        callback(this.currentMode);
      } catch (error) {
        console.error('Error in mode change callback:', error);
      }
    });
  }

  /**
   * Save mode preference to localStorage
   */
  private savePreference(mode: RenderMode): void {
    const success = this.storage.saveModePreference(mode);
    if (!success) {
      console.warn('Failed to save mode preference to localStorage');
    }
  }
}
