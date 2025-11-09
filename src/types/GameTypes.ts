import * as THREE from 'three';

export type ToolType = 
  | 'raise' 
  | 'lower' 
  | 'smooth' 
  | 'flatten' 
  | 'water' 
  | 'forest' 
  | 'desert' 
  | 'snow' 
  | 'regenerate' 
  | 'reset';

export interface BrushSettings {
  size: number;
  strength: number;
}

export interface WorldSettings {
  width: number;
  height: number;
  segments: number;
  maxElevation: number;
  noiseScale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
}

export interface TerrainPoint {
  x: number;
  y: number;
  z: number;
  index: number;
}

export interface ToolData {
  type: ToolType;
  position: THREE.Vector3;
  brush: BrushSettings;
  delta: number;
}

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  distance: number;
  phi: number;
  theta: number;
}

export interface GameState {
  currentTool: ToolType;
  brushSettings: BrushSettings;
  worldSettings: WorldSettings;
  isPainting: boolean;
  fps: number;
  vertexCount: number;
}

export interface BiomeData {
  name: string;
  color: THREE.Color;
  heightRange: [number, number];
  moisture: number;
}

export const BIOMES: Record<string, BiomeData> = {
  deepWater: { name: 'Deep Water', color: new THREE.Color(0x003366), heightRange: [-1, -0.3], moisture: 1.0 },
  shallowWater: { name: 'Shallow Water', color: new THREE.Color(0x0066cc), heightRange: [-0.3, 0], moisture: 1.0 },
  beach: { name: 'Beach', color: new THREE.Color(0xf4e7d7), heightRange: [0, 0.05], moisture: 0.3 },
  grassland: { name: 'Grassland', color: new THREE.Color(0x5da130), heightRange: [0.05, 0.3], moisture: 0.6 },
  forest: { name: 'Forest', color: new THREE.Color(0x2d5016), heightRange: [0.15, 0.5], moisture: 0.8 },
  highland: { name: 'Highland', color: new THREE.Color(0x8b7355), heightRange: [0.4, 0.7], moisture: 0.4 },
  mountain: { name: 'Mountain', color: new THREE.Color(0x666666), heightRange: [0.7, 0.9], moisture: 0.2 },
  peak: { name: 'Peak', color: new THREE.Color(0xffffff), heightRange: [0.9, 1.0], moisture: 0.1 },
};

