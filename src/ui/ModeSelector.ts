/**
 * ModeSelector
 *
 * UI component for displaying and switching render modes (Desktop/Mobile)
 *
 * Features:
 * - Displays current active mode with color-coded badge
 * - Shows device detection information on hover
 * - Toggle button to switch between modes
 * - Indicates when mode is overridden from device detection
 *
 * Design Principles:
 * - User-friendly: Clear visual feedback
 * - Informative: Shows both active and detected modes
 * - Accessible: Hover for details, click to toggle
 */

import type { ModeManager, ModeState } from '../services/ModeManager';
import type { DeviceDetector } from '../utils/DeviceDetector';

export class ModeSelector {
  private container: HTMLElement;
  private modeManager: ModeManager;
  private deviceDetector: DeviceDetector;
  private rootElement?: HTMLDivElement;

  constructor(
    mountPoint: Element,
    modeManager: ModeManager,
    deviceDetector: DeviceDetector
  ) {
    this.container = mountPoint as HTMLElement;
    this.modeManager = modeManager;
    this.deviceDetector = deviceDetector;

    this.render();
  }

  /**
   * Render the mode selector UI
   */
  private render(): void {
    const state = this.modeManager.getState();

    // Create container
    this.rootElement = document.createElement('div');
    this.rootElement.className = 'mode-selector';

    // Create mode badge
    const badge = document.createElement('div');
    badge.className = 'mode-badge';
    badge.setAttribute('data-mode', state.currentMode);
    if (state.isOverridden) {
      badge.classList.add('overridden');
    }

    const modeIcon = state.currentMode === 'desktop' ? '🖥️' : '📱';
    const modeText = state.currentMode === 'desktop' ? 'Desktop Mode' : 'Mobile Mode';
    badge.textContent = `${modeIcon} ${modeText}`;

    // Create details panel (shown on hover)
    const details = this.createDetailsPanel(state);

    this.rootElement.appendChild(badge);
    this.rootElement.appendChild(details);

    // Insert at the top of the info panel (before h3)
    const firstChild = this.container.firstChild;
    if (firstChild) {
      this.container.insertBefore(this.rootElement, firstChild);
    } else {
      this.container.appendChild(this.rootElement);
    }
  }

  /**
   * Create the details panel with device info and toggle button
   */
  private createDetailsPanel(state: ModeState): HTMLDivElement {
    const details = document.createElement('div');
    details.className = 'mode-details';

    // Active mode info
    const activeModeInfo = document.createElement('div');
    activeModeInfo.className = 'mode-info';
    activeModeInfo.innerHTML = `<strong>Active Mode:</strong> ${
      state.currentMode === 'desktop' ? 'Desktop' : 'Mobile'
    }`;

    // Detected device info
    const detectedModeInfo = document.createElement('div');
    detectedModeInfo.className = 'mode-info';
    const detectedText = state.detectedMode === 'desktop' ? 'Desktop' : 'Mobile/Tablet';
    detectedModeInfo.innerHTML = `<strong>Detected Device:</strong> ${detectedText}`;

    // Device details
    const deviceDetails = document.createElement('div');
    deviceDetails.className = 'mode-info';
    const screenSize = `${window.innerWidth}x${window.innerHeight}`;
    const touchSupport = this.deviceDetector.hasTouchSupport() ? 'Yes' : 'No';
    deviceDetails.innerHTML = `<strong>Screen:</strong> ${screenSize} | <strong>Touch:</strong> ${touchSupport}`;

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mode-toggle-btn';
    const targetMode = state.currentMode === 'desktop' ? 'Mobile' : 'Desktop';
    const targetIcon = state.currentMode === 'desktop' ? '📱' : '🖥️';
    toggleBtn.textContent = `Switch to ${targetMode} ${targetIcon}`;

    // Handle toggle
    toggleBtn.addEventListener('click', () => {
      this.handleToggle();
    });

    details.appendChild(activeModeInfo);
    details.appendChild(detectedModeInfo);
    details.appendChild(deviceDetails);
    details.appendChild(toggleBtn);

    return details;
  }

  /**
   * Handle mode toggle
   */
  private handleToggle(): void {
    const currentMode = this.modeManager.getCurrentMode();
    const newMode = currentMode === 'desktop' ? 'mobile' : 'desktop';

    console.log(`🔄 ModeSelector: Switching from ${currentMode} to ${newMode}`);
    this.modeManager.switchMode(newMode);

    // UI will be updated via the mode change callback in VoxelUIManager
    // But we need to update our display
    this.updateDisplay(this.modeManager.getState());
  }

  /**
   * Update the display to reflect current state
   * Called when mode changes
   */
  public updateDisplay(state: ModeState): void {
    if (!this.rootElement) return;

    // Update badge
    const badge = this.rootElement.querySelector('.mode-badge');
    if (badge) {
      badge.setAttribute('data-mode', state.currentMode);

      if (state.isOverridden) {
        badge.classList.add('overridden');
      } else {
        badge.classList.remove('overridden');
      }

      const modeIcon = state.currentMode === 'desktop' ? '🖥️' : '📱';
      const modeText = state.currentMode === 'desktop' ? 'Desktop Mode' : 'Mobile Mode';
      badge.textContent = `${modeIcon} ${modeText}`;
    }

    // Update details panel
    const details = this.rootElement.querySelector('.mode-details');
    if (details) {
      const newDetails = this.createDetailsPanel(state);
      details.replaceWith(newDetails);
    }
  }

  /**
   * Destroy the component
   */
  public destroy(): void {
    if (this.rootElement && this.rootElement.parentNode) {
      this.rootElement.parentNode.removeChild(this.rootElement);
    }
    this.rootElement = undefined;
  }
}
