/**
 * World generation and chunk management constants
 */

export const WORLD_CONSTANTS = {
  // Chunk dimensions
  CHUNK_SIZE: 16,
  CHUNK_HEIGHT: 64,
  CHUNK_WIDTH: 16,
  CHUNK_DEPTH: 16,

  // World generation
  DEFAULT_RENDER_DISTANCE: 3,
  MIN_RENDER_DISTANCE: 1,
  MAX_RENDER_DISTANCE: 8,

  // Height levels
  SEA_LEVEL: 32,
  MIN_WORLD_HEIGHT: 0,
  MAX_WORLD_HEIGHT: 64,
  BEDROCK_LEVEL: 0,

  // Terrain generation parameters
  CONTINENTAL_SCALE: 0.005,
  CONTINENTAL_OCTAVES: 4,
  CONTINENTAL_AMPLITUDE: 20,

  EROSION_SCALE: 0.01,
  EROSION_OCTAVES: 3,
  EROSION_AMPLITUDE: 10,

  PEAKS_SCALE: 0.02,
  PEAKS_OCTAVES: 2,
  PEAKS_AMPLITUDE: 15,

  // Tree generation
  TREE_SPAWN_PROBABILITY: 0.02,
  MIN_TREE_HEIGHT: 4,
  MAX_TREE_VARIATION: 2,
  TREE_LEAF_RADIUS: 2,
  TREE_MIN_ALTITUDE: 2, // Above sea level

  // Snow generation
  SNOW_MIN_HEIGHT: 15, // Above sea level
  SNOW_LAYER_THICKNESS: 2,

  // Underground layers
  STONE_DEPTH: 4,
  DIRT_DEPTH: 1,
} as const;

export const NOISE_CONSTANTS = {
  // FBM defaults
  DEFAULT_PERSISTENCE: 0.5,
  DEFAULT_LACUNARITY: 2.0,
  DEFAULT_OCTAVES: 4,

  // Ridged noise
  RIDGED_AMPLITUDE_DECAY: 0.5,
  RIDGED_FREQUENCY_MULTIPLIER: 2,
} as const;
