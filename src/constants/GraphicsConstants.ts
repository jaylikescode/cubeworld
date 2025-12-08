/**
 * Graphics and rendering constants
 */

export const GRAPHICS_CONSTANTS = {
  // Block rendering
  BLOCK_SIZE: 1,
  BLOCK_GEOMETRY_SEGMENTS: 1,

  // Instanced mesh limits
  MAX_INSTANCES_PER_MESH: 100000,

  // Colors (as hex values for documentation)
  COLORS: {
    AIR: 0x000000,
    GRASS: 0x5da130,
    DIRT: 0x8b6f47,
    STONE: 0x808080,
    SAND: 0xf4e7c3,
    WATER: 0x3399ff,
    WOOD: 0x8b5a2b,
    LEAVES: 0x228b22,
    SNOW: 0xffffff,
    COBBLESTONE: 0x696969,
    BEDROCK: 0x333333,
  },

  // Lighting
  AMBIENT_LIGHT_INTENSITY: 0.6,
  DIRECTIONAL_LIGHT_INTENSITY: 0.8,
  DIRECTIONAL_LIGHT_POSITION: {
    x: 1,
    y: 2,
    z: 1,
  },

  // Shadow settings
  SHADOW_MAP_SIZE: 2048,
  SHADOW_CAMERA_SIZE: 100,
  SHADOW_CAMERA_NEAR: 0.1,
  SHADOW_CAMERA_FAR: 500,

  // Camera settings
  DEFAULT_FOV: 75,
  DEFAULT_NEAR_PLANE: 0.1,
  DEFAULT_FAR_PLANE: 1000,

  // Performance
  TARGET_FPS: 60,
  FRAME_TIME_MS: 16.67, // 1000ms / 60fps
} as const;

export const TEXTURE_CONSTANTS = {
  // Texture atlas (for future implementation)
  ATLAS_SIZE: 256,
  TILE_SIZE: 16,
  TILES_PER_ROW: 16,
  MAX_TEXTURES: 256,

  // Texture filtering
  ANISOTROPY: 16,
} as const;

export const MESH_CONSTANTS = {
  // Face culling
  FACE_DIRECTIONS: {
    RIGHT: { dx: 1, dy: 0, dz: 0 },
    LEFT: { dx: -1, dy: 0, dz: 0 },
    TOP: { dx: 0, dy: 1, dz: 0 },
    BOTTOM: { dx: 0, dy: -1, dz: 0 },
    FRONT: { dx: 0, dy: 0, dz: 1 },
    BACK: { dx: 0, dy: 0, dz: -1 },
  },

  // Mesh optimization
  VERTICES_PER_CUBE: 24,
  TRIANGLES_PER_CUBE: 12,
  FACES_PER_CUBE: 6,
} as const;
