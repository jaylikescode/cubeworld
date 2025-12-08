/**
 * Physics and gameplay constants
 */

export const PHYSICS_CONSTANTS = {
  // Gravity
  GRAVITY: -9.8,
  TERMINAL_VELOCITY: -50,

  // Player movement
  WALK_SPEED: 5,
  RUN_SPEED: 10,
  JUMP_VELOCITY: 10,
  CROUCH_SPEED: 2.5,

  // Player dimensions
  PLAYER_HEIGHT: 1.8,
  PLAYER_WIDTH: 0.6,
  PLAYER_EYE_HEIGHT: 1.6,

  // Camera movement
  MOUSE_SENSITIVITY: 0.002,
  CAMERA_MIN_PITCH: -Math.PI / 2 + 0.1,
  CAMERA_MAX_PITCH: Math.PI / 2 - 0.1,

  // Collision
  COLLISION_MARGIN: 0.001,
  MAX_STEP_HEIGHT: 0.5,

  // Time
  FIXED_TIME_STEP: 1 / 60,
  MAX_SUBSTEPS: 5,
} as const;

export const TOOL_CONSTANTS = {
  // Tool reach distance
  MAX_REACH_DISTANCE: 10,

  // Tool speeds (blocks per second)
  BREAK_SPEED: 4,
  PLACE_SPEED: 10,

  // Tool modes
  MODES: {
    PLACE: 'place',
    BREAK: 'break',
    PAINT: 'paint',
    FILL: 'fill',
  } as const,
} as const;
