import {
  WORLD_CONSTANTS,
  GRAPHICS_CONSTANTS,
  PHYSICS_CONSTANTS,
  AUDIO_CONSTANTS,
  GAMEPLAY_CONSTANTS,
} from '../constants';

/**
 * Configuration interfaces
 */
export interface WorldConfig {
  chunkSize: number;
  chunkHeight: number;
  renderDistance: number;
  seaLevel: number;
}

export interface GraphicsConfig {
  fov: number;
  shadows: boolean;
  antialias: boolean;
  targetFPS: number;
}

export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
}

export interface ControlsConfig {
  mouseSensitivity: number;
  invertY: boolean;
}

export interface GameplayConfig {
  autoSave: boolean;
  showFPS: boolean;
  debugMode: boolean;
}

export interface GameConfigData {
  world?: Partial<WorldConfig>;
  graphics?: Partial<GraphicsConfig>;
  audio?: Partial<AudioConfig>;
  controls?: Partial<ControlsConfig>;
  gameplay?: Partial<GameplayConfig>;
}

/**
 * Game configuration class with validation and defaults
 */
export class GameConfig {
  public world: WorldConfig;
  public graphics: GraphicsConfig;
  public audio: AudioConfig;
  public controls: ControlsConfig;
  public gameplay: GameplayConfig;

  constructor(config: GameConfigData = {}) {
    this.world = {
      chunkSize: WORLD_CONSTANTS.CHUNK_SIZE,
      chunkHeight: WORLD_CONSTANTS.CHUNK_HEIGHT,
      renderDistance: WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE,
      seaLevel: WORLD_CONSTANTS.SEA_LEVEL,
      ...config.world,
    };

    this.graphics = {
      fov: GRAPHICS_CONSTANTS.DEFAULT_FOV,
      shadows: true,
      antialias: true,
      targetFPS: GRAPHICS_CONSTANTS.TARGET_FPS,
      ...config.graphics,
    };

    this.audio = {
      masterVolume: AUDIO_CONSTANTS.DEFAULT_MASTER_VOLUME,
      musicVolume: AUDIO_CONSTANTS.DEFAULT_MUSIC_VOLUME,
      sfxVolume: AUDIO_CONSTANTS.DEFAULT_SFX_VOLUME,
      ambientVolume: AUDIO_CONSTANTS.DEFAULT_AMBIENT_VOLUME,
      ...config.audio,
    };

    this.controls = {
      mouseSensitivity: PHYSICS_CONSTANTS.MOUSE_SENSITIVITY,
      invertY: false,
      ...config.controls,
    };

    this.gameplay = {
      autoSave: true,
      showFPS: true,
      debugMode: GAMEPLAY_CONSTANTS.DEBUG_MODE_ENABLED,
      ...config.gameplay,
    };

    // Validate and clamp values
    this.validate();
  }

  /**
   * Validate and clamp configuration values
   */
  private validate(): void {
    // Clamp render distance
    this.world.renderDistance = Math.max(
      WORLD_CONSTANTS.MIN_RENDER_DISTANCE,
      Math.min(WORLD_CONSTANTS.MAX_RENDER_DISTANCE, this.world.renderDistance)
    );

    // Clamp FOV
    this.graphics.fov = Math.max(45, Math.min(120, this.graphics.fov));

    // Clamp audio volumes
    this.audio.masterVolume = Math.max(0, Math.min(1, this.audio.masterVolume));
    this.audio.musicVolume = Math.max(0, Math.min(1, this.audio.musicVolume));
    this.audio.sfxVolume = Math.max(0, Math.min(1, this.audio.sfxVolume));
    this.audio.ambientVolume = Math.max(0, Math.min(1, this.audio.ambientVolume));

    // Clamp mouse sensitivity
    this.controls.mouseSensitivity = Math.max(0.0001, Math.min(0.01, this.controls.mouseSensitivity));
  }

  /**
   * Serialize configuration to JSON string
   */
  public toJSON(): string {
    return JSON.stringify({
      world: this.world,
      graphics: this.graphics,
      audio: this.audio,
      controls: this.controls,
      gameplay: this.gameplay,
    });
  }

  /**
   * Deserialize configuration from JSON string
   */
  public static fromJSON(json: string): GameConfig {
    try {
      const data = JSON.parse(json);
      return new GameConfig(data);
    } catch (error) {
      console.warn('Failed to parse config JSON, using defaults:', error);
      return new GameConfig();
    }
  }
}

/**
 * Configuration manager with persistence and change notifications
 */
export class ConfigManager {
  private static readonly STORAGE_KEY = 'cubeworld_config';
  private config: GameConfig;
  private changeListeners: Array<(config: GameConfig) => void> = [];

  constructor() {
    this.config = this.loadFromStorage();
  }

  /**
   * Get current configuration
   */
  public getConfig(): GameConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: GameConfigData): void {
    // Create new config with updates
    const currentData = JSON.parse(this.config.toJSON());
    const newData: GameConfigData = {
      world: { ...currentData.world, ...updates.world },
      graphics: { ...currentData.graphics, ...updates.graphics },
      audio: { ...currentData.audio, ...updates.audio },
      controls: { ...currentData.controls, ...updates.controls },
      gameplay: { ...currentData.gameplay, ...updates.gameplay },
    };

    this.config = new GameConfig(newData);
    this.save();
    this.notifyListeners();
  }

  /**
   * Reset to default configuration
   */
  public reset(): void {
    this.config = new GameConfig();
    this.clearStorage();
    this.notifyListeners();
  }

  /**
   * Save configuration to localStorage
   */
  public save(): void {
    try {
      localStorage.setItem(ConfigManager.STORAGE_KEY, this.config.toJSON());
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadFromStorage(): GameConfig {
    try {
      const stored = localStorage.getItem(ConfigManager.STORAGE_KEY);
      if (stored) {
        return GameConfig.fromJSON(stored);
      }
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error);
    }

    return new GameConfig();
  }

  /**
   * Clear configuration from localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(ConfigManager.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear config from localStorage:', error);
    }
  }

  /**
   * Add change listener
   */
  public addChangeListener(listener: (config: GameConfig) => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * Remove change listener
   */
  public removeChangeListener(listener: (config: GameConfig) => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index !== -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  /**
   * Notify all change listeners
   */
  private notifyListeners(): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
  }
}
