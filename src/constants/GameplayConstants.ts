/**
 * Gameplay and game state constants
 */

export const GAMEPLAY_CONSTANTS = {
  // Inventory
  INVENTORY_SIZE: 36,
  HOTBAR_SIZE: 9,
  MAX_STACK_SIZE: 64,

  // World saves
  AUTO_SAVE_INTERVAL: 60000, // 60 seconds
  MAX_SAVE_SLOTS: 10,

  // Performance monitoring
  FPS_UPDATE_INTERVAL: 100, // Update FPS display every 100ms
  PERFORMANCE_SAMPLE_SIZE: 60,

  // UI
  UI_FADE_TIME: 200, // milliseconds
  TOOLTIP_DELAY: 500, // milliseconds
  NOTIFICATION_DURATION: 3000, // milliseconds

  // Debug
  DEBUG_MODE_ENABLED: false,
  SHOW_CHUNK_BOUNDARIES: false,
  SHOW_COLLISION_BOXES: false,
} as const;

export const AUDIO_CONSTANTS = {
  // Volume levels (0-1)
  DEFAULT_MASTER_VOLUME: 0.8,
  DEFAULT_MUSIC_VOLUME: 0.6,
  DEFAULT_SFX_VOLUME: 1.0,
  DEFAULT_AMBIENT_VOLUME: 0.4,

  // Audio settings
  MAX_CONCURRENT_SOUNDS: 32,
  AUDIO_FALLOFF_DISTANCE: 50,
  AUDIO_MAX_DISTANCE: 100,
} as const;

export const MULTIPLAYER_CONSTANTS = {
  // Network
  DEFAULT_PORT: 25565,
  MAX_PLAYERS: 20,
  TICK_RATE: 20, // Server ticks per second

  // Sync intervals (milliseconds)
  PLAYER_POSITION_SYNC: 50,
  BLOCK_UPDATE_BATCH: 100,
  CHUNK_SYNC_RATE: 1000,

  // Limits
  MAX_BLOCK_UPDATES_PER_TICK: 1000,
  MAX_PACKET_SIZE: 65536, // 64KB
} as const;
