import * as THREE from 'three';

export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  SAND = 4,
  WATER = 5,
  WOOD = 6,
  LEAVES = 7,
  SNOW = 8,
  COBBLESTONE = 9,
  BEDROCK = 10,
  PRISMARINE = 11,
  PRISMARINE_BRICKS = 12,
  DARK_PRISMARINE = 13,
  WOOL_WHITE = 14,
  WOOL_BLACK = 15,
  WOOL_RED = 16,
  WOOL_BLUE = 17,
  WOOL_GREEN = 18,
  WOOL_YELLOW = 19,
  BEACON = 20,
  IRON_BLOCK = 21,
}

export interface BlockData {
  type: BlockType;
  name: string;
  color: THREE.Color;
  transparent?: boolean;
}

export const BLOCK_TYPES: Record<BlockType, BlockData> = {
  [BlockType.AIR]: { 
    type: BlockType.AIR, 
    name: 'Air', 
    color: new THREE.Color(0x000000),
    transparent: true 
  },
  [BlockType.GRASS]: { 
    type: BlockType.GRASS, 
    name: 'Grass', 
    color: new THREE.Color(0x5da130) 
  },
  [BlockType.DIRT]: { 
    type: BlockType.DIRT, 
    name: 'Dirt', 
    color: new THREE.Color(0x8b6f47) 
  },
  [BlockType.STONE]: { 
    type: BlockType.STONE, 
    name: 'Stone', 
    color: new THREE.Color(0x808080) 
  },
  [BlockType.SAND]: { 
    type: BlockType.SAND, 
    name: 'Sand', 
    color: new THREE.Color(0xf4e7c3) 
  },
  [BlockType.WATER]: { 
    type: BlockType.WATER, 
    name: 'Water', 
    color: new THREE.Color(0x3399ff),
    transparent: true 
  },
  [BlockType.WOOD]: { 
    type: BlockType.WOOD, 
    name: 'Wood', 
    color: new THREE.Color(0x8b5a2b) 
  },
  [BlockType.LEAVES]: { 
    type: BlockType.LEAVES, 
    name: 'Leaves', 
    color: new THREE.Color(0x228b22),
    transparent: true 
  },
  [BlockType.SNOW]: { 
    type: BlockType.SNOW, 
    name: 'Snow', 
    color: new THREE.Color(0xffffff) 
  },
  [BlockType.COBBLESTONE]: { 
    type: BlockType.COBBLESTONE, 
    name: 'Cobblestone', 
    color: new THREE.Color(0x696969) 
  },
  [BlockType.BEDROCK]: { 
    type: BlockType.BEDROCK, 
    name: 'Bedrock', 
    color: new THREE.Color(0x333333) 
  },
  [BlockType.PRISMARINE]: { 
    type: BlockType.PRISMARINE, 
    name: 'Prismarine', 
    color: new THREE.Color(0x4e9699) 
  },
  [BlockType.PRISMARINE_BRICKS]: { 
    type: BlockType.PRISMARINE_BRICKS, 
    name: 'Prismarine Bricks', 
    color: new THREE.Color(0x3d8b8e) 
  },
  [BlockType.DARK_PRISMARINE]: { 
    type: BlockType.DARK_PRISMARINE, 
    name: 'Dark Prismarine', 
    color: new THREE.Color(0x2d5a5c) 
  },
  [BlockType.WOOL_WHITE]: { 
    type: BlockType.WOOL_WHITE, 
    name: 'White Wool', 
    color: new THREE.Color(0xffffff) 
  },
  [BlockType.WOOL_BLACK]: { 
    type: BlockType.WOOL_BLACK, 
    name: 'Black Wool', 
    color: new THREE.Color(0x1e1e1e) 
  },
  [BlockType.WOOL_RED]: { 
    type: BlockType.WOOL_RED, 
    name: 'Red Wool', 
    color: new THREE.Color(0xb02e26) 
  },
  [BlockType.WOOL_BLUE]: { 
    type: BlockType.WOOL_BLUE, 
    name: 'Blue Wool', 
    color: new THREE.Color(0x3c44aa) 
  },
  [BlockType.WOOL_GREEN]: { 
    type: BlockType.WOOL_GREEN, 
    name: 'Green Wool', 
    color: new THREE.Color(0x5e7c16) 
  },
  [BlockType.WOOL_YELLOW]: { 
    type: BlockType.WOOL_YELLOW, 
    name: 'Yellow Wool', 
    color: new THREE.Color(0xfed83d) 
  },
  [BlockType.BEACON]: { 
    type: BlockType.BEACON, 
    name: 'Beacon', 
    color: new THREE.Color(0x20c997),
    transparent: true 
  },
  [BlockType.IRON_BLOCK]: { 
    type: BlockType.IRON_BLOCK, 
    name: 'Iron Block', 
    color: new THREE.Color(0xcccccc) 
  },
};

export interface VoxelPosition {
  x: number;
  y: number;
  z: number;
}

export interface Chunk {
  x: number;
  z: number;
  blocks: Uint8Array; // Flat array of block types
  mesh: THREE.InstancedMesh | null;
}

export interface WorldSettings {
  chunkSize: number;
  chunkHeight: number;
  renderDistance: number;
  seaLevel: number;
}

export type ToolMode = 
  | 'place' 
  | 'break' 
  | 'paint' 
  | 'fill';

export interface VoxelGameState {
  currentBlock: BlockType;
  currentTool: ToolMode;
  selectedPosition: VoxelPosition | null;
  fps: number;
  blockCount: number;
}

