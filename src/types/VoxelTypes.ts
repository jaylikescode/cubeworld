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

