import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameConfig, ConfigManager } from '../../src/config/GameConfig';
import { WORLD_CONSTANTS, GRAPHICS_CONSTANTS, PHYSICS_CONSTANTS, AUDIO_CONSTANTS } from '../../src/constants';

describe('GameConfig', () => {
  describe('default configuration', () => {
    let config: GameConfig;

    beforeEach(() => {
      config = new GameConfig();
    });

    it('should create with default world settings', () => {
      expect(config.world.chunkSize).toBe(WORLD_CONSTANTS.CHUNK_SIZE);
      expect(config.world.chunkHeight).toBe(WORLD_CONSTANTS.CHUNK_HEIGHT);
      expect(config.world.renderDistance).toBe(WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE);
      expect(config.world.seaLevel).toBe(WORLD_CONSTANTS.SEA_LEVEL);
    });

    it('should create with default graphics settings', () => {
      expect(config.graphics.fov).toBe(GRAPHICS_CONSTANTS.DEFAULT_FOV);
      expect(config.graphics.shadows).toBe(true);
      expect(config.graphics.antialias).toBe(true);
      expect(config.graphics.targetFPS).toBe(GRAPHICS_CONSTANTS.TARGET_FPS);
    });

    it('should create with default audio settings', () => {
      expect(config.audio.masterVolume).toBe(AUDIO_CONSTANTS.DEFAULT_MASTER_VOLUME);
      expect(config.audio.musicVolume).toBe(AUDIO_CONSTANTS.DEFAULT_MUSIC_VOLUME);
      expect(config.audio.sfxVolume).toBe(AUDIO_CONSTANTS.DEFAULT_SFX_VOLUME);
      expect(config.audio.ambientVolume).toBe(AUDIO_CONSTANTS.DEFAULT_AMBIENT_VOLUME);
    });

    it('should create with default controls settings', () => {
      expect(config.controls.mouseSensitivity).toBe(PHYSICS_CONSTANTS.MOUSE_SENSITIVITY);
      expect(config.controls.invertY).toBe(false);
    });

    it('should create with default gameplay settings', () => {
      expect(config.gameplay.autoSave).toBe(true);
      expect(config.gameplay.showFPS).toBe(true);
      expect(config.gameplay.debugMode).toBe(false);
    });
  });

  describe('custom configuration', () => {
    it('should accept custom world settings', () => {
      const config = new GameConfig({
        world: {
          renderDistance: 5,
          chunkSize: 32,
        },
      });

      expect(config.world.renderDistance).toBe(5);
      expect(config.world.chunkSize).toBe(32);
      // Should keep defaults for other values
      expect(config.world.chunkHeight).toBe(WORLD_CONSTANTS.CHUNK_HEIGHT);
    });

    it('should accept custom graphics settings', () => {
      const config = new GameConfig({
        graphics: {
          fov: 90,
          shadows: false,
        },
      });

      expect(config.graphics.fov).toBe(90);
      expect(config.graphics.shadows).toBe(false);
      expect(config.graphics.antialias).toBe(true); // default
    });

    it('should accept custom audio settings', () => {
      const config = new GameConfig({
        audio: {
          masterVolume: 0.5,
          musicVolume: 0.3,
        },
      });

      expect(config.audio.masterVolume).toBe(0.5);
      expect(config.audio.musicVolume).toBe(0.3);
      expect(config.audio.sfxVolume).toBe(AUDIO_CONSTANTS.DEFAULT_SFX_VOLUME); // default
    });

    it('should accept partial nested configuration', () => {
      const config = new GameConfig({
        world: { renderDistance: 8 },
        graphics: { fov: 100 },
      });

      expect(config.world.renderDistance).toBe(8);
      expect(config.world.chunkSize).toBe(WORLD_CONSTANTS.CHUNK_SIZE);
      expect(config.graphics.fov).toBe(100);
      expect(config.audio.masterVolume).toBe(AUDIO_CONSTANTS.DEFAULT_MASTER_VOLUME);
    });
  });

  describe('validation', () => {
    it('should clamp render distance to valid range', () => {
      const configLow = new GameConfig({ world: { renderDistance: 0 } });
      const configHigh = new GameConfig({ world: { renderDistance: 20 } });

      expect(configLow.world.renderDistance).toBe(WORLD_CONSTANTS.MIN_RENDER_DISTANCE);
      expect(configHigh.world.renderDistance).toBe(WORLD_CONSTANTS.MAX_RENDER_DISTANCE);
    });

    it('should clamp audio volumes to 0-1 range', () => {
      const config = new GameConfig({
        audio: {
          masterVolume: -0.5,
          musicVolume: 1.5,
        },
      });

      expect(config.audio.masterVolume).toBe(0);
      expect(config.audio.musicVolume).toBe(1);
    });

    it('should clamp FOV to reasonable range', () => {
      const configLow = new GameConfig({ graphics: { fov: 30 } });
      const configHigh = new GameConfig({ graphics: { fov: 150 } });

      expect(configLow.graphics.fov).toBeGreaterThanOrEqual(45);
      expect(configHigh.graphics.fov).toBeLessThanOrEqual(120);
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      const config = new GameConfig();
      const json = config.toJSON();

      expect(json).toBeDefined();
      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should deserialize from JSON', () => {
      const original = new GameConfig({
        world: { renderDistance: 5 },
        graphics: { fov: 90 },
      });

      const json = original.toJSON();
      const restored = GameConfig.fromJSON(json);

      expect(restored.world.renderDistance).toBe(5);
      expect(restored.graphics.fov).toBe(90);
    });

    it('should handle invalid JSON gracefully', () => {
      const restored = GameConfig.fromJSON('invalid json');
      expect(restored).toBeInstanceOf(GameConfig);
      expect(restored.world.renderDistance).toBe(WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE);
    });
  });
});

describe('ConfigManager', () => {
  let manager: ConfigManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    manager = new ConfigManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should create a ConfigManager instance', () => {
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(ConfigManager);
    });

    it('should have a default configuration', () => {
      const config = manager.getConfig();
      expect(config).toBeInstanceOf(GameConfig);
    });
  });

  describe('get and set configuration', () => {
    it('should get current configuration', () => {
      const config = manager.getConfig();
      expect(config.world.renderDistance).toBe(WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE);
    });

    it('should update configuration', () => {
      manager.updateConfig({
        world: { renderDistance: 6 },
      });

      const config = manager.getConfig();
      expect(config.world.renderDistance).toBe(6);
    });

    it('should preserve unmodified settings when updating', () => {
      manager.updateConfig({
        world: { renderDistance: 7 },
      });

      const config = manager.getConfig();
      expect(config.world.renderDistance).toBe(7);
      expect(config.graphics.fov).toBe(GRAPHICS_CONSTANTS.DEFAULT_FOV);
      expect(config.audio.masterVolume).toBe(AUDIO_CONSTANTS.DEFAULT_MASTER_VOLUME);
    });

    it('should allow multiple updates', () => {
      manager.updateConfig({ world: { renderDistance: 5 } });
      manager.updateConfig({ graphics: { fov: 85 } });
      manager.updateConfig({ audio: { masterVolume: 0.6 } });

      const config = manager.getConfig();
      expect(config.world.renderDistance).toBe(5);
      expect(config.graphics.fov).toBe(85);
      expect(config.audio.masterVolume).toBe(0.6);
    });
  });

  describe('persistence', () => {
    it('should save configuration to localStorage', () => {
      manager.updateConfig({ world: { renderDistance: 8 } });
      manager.save();

      const saved = localStorage.getItem('cubeworld_config');
      expect(saved).toBeDefined();
      expect(saved).not.toBeNull();
    });

    it('should load configuration from localStorage', () => {
      const config = new GameConfig({ world: { renderDistance: 7 } });
      localStorage.setItem('cubeworld_config', config.toJSON());

      const newManager = new ConfigManager();
      const loaded = newManager.getConfig();

      expect(loaded.world.renderDistance).toBe(7);
    });

    it('should auto-save when updateConfig is called', () => {
      manager.updateConfig({ world: { renderDistance: 7 } });

      const saved = localStorage.getItem('cubeworld_config');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.world.renderDistance).toBe(7);
    });

    it('should handle missing localStorage data gracefully', () => {
      localStorage.clear();
      const newManager = new ConfigManager();
      const config = newManager.getConfig();

      expect(config).toBeInstanceOf(GameConfig);
      expect(config.world.renderDistance).toBe(WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('cubeworld_config', 'corrupted data');

      const newManager = new ConfigManager();
      const config = newManager.getConfig();

      expect(config).toBeInstanceOf(GameConfig);
      expect(config.world.renderDistance).toBe(WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE);
    });
  });

  describe('reset', () => {
    it('should reset to default configuration', () => {
      manager.updateConfig({ world: { renderDistance: 10 } });
      manager.updateConfig({ graphics: { fov: 100 } });

      manager.reset();

      const config = manager.getConfig();
      expect(config.world.renderDistance).toBe(WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE);
      expect(config.graphics.fov).toBe(GRAPHICS_CONSTANTS.DEFAULT_FOV);
    });

    it('should clear localStorage on reset', () => {
      manager.updateConfig({ world: { renderDistance: 10 } });
      manager.reset();

      const saved = localStorage.getItem('cubeworld_config');
      expect(saved).toBeNull();
    });
  });

  describe('change listeners', () => {
    it('should notify listeners when configuration changes', () => {
      const listener = vi.fn();
      manager.addChangeListener(listener);

      manager.updateConfig({ world: { renderDistance: 5 } });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(expect.any(GameConfig));
    });

    it('should remove change listeners', () => {
      const listener = vi.fn();
      manager.addChangeListener(listener);
      manager.removeChangeListener(listener);

      manager.updateConfig({ world: { renderDistance: 5 } });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.addChangeListener(listener1);
      manager.addChangeListener(listener2);

      manager.updateConfig({ world: { renderDistance: 5 } });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });
});
