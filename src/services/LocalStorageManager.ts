/**
 * LocalStorageManager
 *
 * Class for saving/loading world data using browser localStorage.
 *
 * Responsibilities:
 * - Save SerializedWorld data to localStorage
 * - Load SerializedWorld data from localStorage
 * - Check for existence of saved data
 * - Delete saved data
 * - Check storage usage
 *
 * Design Principles:
 * - Single Responsibility: Only handles storage management
 * - Graceful Degradation: Returns null on error (no throwing)
 * - Browser Compatibility: Uses localStorage API
 */

import type { SerializedWorld } from '../types/SerializationTypes';
import type { RenderMode } from './ModeManager';

export class LocalStorageManager {
  /** localStorage key name */
  private static readonly STORAGE_KEY = 'cubeworld_save';
  private static readonly MODE_PREFERENCE_KEY = 'cubeworld_mode_preference';

  /**
   * Save world data to localStorage
   *
   * @param data - SerializedWorld data to save
   * @returns Success status (true: success, false: failure)
   */
  saveWorld(data: SerializedWorld): boolean {
    try {
      const jsonString = JSON.stringify(data);
      localStorage.setItem(LocalStorageManager.STORAGE_KEY, jsonString);
      return true;
    } catch (error) {
      // localStorage quota exceeded or other error
      console.error('Failed to save world to localStorage:', error);
      return false;
    }
  }

  /**
   * Load world data from localStorage
   *
   * @returns Saved SerializedWorld data, or null if not found
   */
  loadWorld(): SerializedWorld | null {
    try {
      const jsonString = localStorage.getItem(LocalStorageManager.STORAGE_KEY);

      if (!jsonString) {
        return null;
      }

      const data = JSON.parse(jsonString) as SerializedWorld;
      return data;
    } catch (error) {
      // JSON parsing error or data corruption
      console.error('Failed to load world from localStorage:', error);
      return null;
    }
  }

  /**
   * Check if saved world exists
   *
   * @returns true if saved data exists and is valid, false if not or corrupted
   */
  hasWorld(): boolean {
    try {
      const jsonString = localStorage.getItem(LocalStorageManager.STORAGE_KEY);

      if (!jsonString) {
        return false;
      }

      // Simple data validation check (if JSON parseable)
      JSON.parse(jsonString);
      return true;
    } catch {
      // Parsing failed = corrupted data = no valid save
      return false;
    }
  }

  /**
   * Delete saved world data
   */
  clearWorld(): void {
    try {
      localStorage.removeItem(LocalStorageManager.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear world from localStorage:', error);
    }
  }

  /**
   * Check size of saved data (bytes)
   *
   * @returns Saved data size (bytes), 0 if none
   */
  getSaveSize(): number {
    try {
      const jsonString = localStorage.getItem(LocalStorageManager.STORAGE_KEY);

      if (!jsonString) {
        return 0;
      }

      // Calculate byte size of JavaScript string
      // Considering UTF-16 encoding (each character is 2 bytes)
      return new Blob([jsonString]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Save mode preference to localStorage
   *
   * @param mode - Render mode to save ('desktop' or 'mobile')
   * @returns Success status (true: success, false: failure)
   */
  saveModePreference(mode: RenderMode): boolean {
    try {
      localStorage.setItem(LocalStorageManager.MODE_PREFERENCE_KEY, mode);
      return true;
    } catch (error) {
      console.error('Failed to save mode preference:', error);
      return false;
    }
  }

  /**
   * Load mode preference from localStorage
   *
   * @returns Saved render mode, or null if not found or invalid
   */
  loadModePreference(): RenderMode | null {
    try {
      const mode = localStorage.getItem(LocalStorageManager.MODE_PREFERENCE_KEY);

      if (mode === 'desktop' || mode === 'mobile') {
        return mode;
      }

      return null;
    } catch (error) {
      console.error('Failed to load mode preference:', error);
      return null;
    }
  }

  /**
   * Delete mode preference from localStorage
   */
  clearModePreference(): void {
    try {
      localStorage.removeItem(LocalStorageManager.MODE_PREFERENCE_KEY);
    } catch (error) {
      console.error('Failed to clear mode preference:', error);
    }
  }
}
