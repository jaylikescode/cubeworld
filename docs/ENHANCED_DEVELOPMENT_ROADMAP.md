# CubeWorld Enhanced Development Roadmap

**Version:** 2.0 - Expert Edition
**Last Updated:** 2025-11-10
**Timeline:** 12 weeks to production-ready game

---

## Table of Contents

1. [Overview & Strategy](#overview--strategy)
2. [Phase 1: Foundation & Performance (Weeks 1-3)](#phase-1-foundation--performance-weeks-1-3)
3. [Phase 2: Rich Content System (Weeks 4-6)](#phase-2-rich-content-system-weeks-4-6)
4. [Phase 3: Living World (Weeks 7-9)](#phase-3-living-world-weeks-7-9)
5. [Phase 4: Polish & Ship (Weeks 10-12)](#phase-4-polish--ship-weeks-10-12)
6. [AI/MCP Integration Opportunities](#aimcp-integration-opportunities)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Pipeline](#deployment-pipeline)

---

## Overview & Strategy

### Development Philosophy

This roadmap follows **iterative vertical slices** - each phase delivers a playable, shippable increment:

- **Week 3:** Performance-optimized builder (can ship as "CubeWorld Lite")
- **Week 6:** Content-rich creative mode (can ship as "CubeWorld Creative")
- **Week 9:** Full survival game (can ship as "CubeWorld")
- **Week 12:** Polished commercial product (can ship on Steam/itch.io)

### Success Metrics

Each phase has clear, measurable goals:

| Phase | Performance | Content | Gameplay | Polish |
|-------|-------------|---------|----------|--------|
| 1 | 120 FPS @ 2× render dist | - | - | - |
| 2 | 100 FPS | 50+ blocks, 10+ structures | - | - |
| 3 | 80 FPS | - | Player, 5+ mobs, inventory | - |
| 4 | 60+ FPS | - | Quests, progression | 95% complete |

### Technology Additions

| Technology | Purpose | Phase |
|------------|---------|-------|
| Vitest | Unit testing | 1 |
| LZ-String | Save compression | 1 |
| bitECS | Entity system | 3 |
| Howler.js | Spatial audio | 4 |
| Workbox | PWA/offline | 4 |

---

## Phase 1: Foundation & Performance (Weeks 1-3)

**Goal:** Double performance, add testing, establish scalable architecture

### Week 1: Testing Infrastructure & Code Quality

#### Day 1-2: Test Framework Setup

```bash
npm install -D vitest @vitest/ui happy-dom
npm install -D @testing-library/dom @testing-library/user-event
```

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    },
    globals: true,
  },
});
```

**File Structure:**

```
tests/
├── unit/
│   ├── NoiseGenerator.test.ts
│   ├── VoxelWorld.test.ts
│   ├── BlockTypes.test.ts
│   └── ChunkCoordinates.test.ts
├── integration/
│   ├── ToolSystem.test.ts
│   ├── ChunkLoading.test.ts
│   └── WorldGeneration.test.ts
├── performance/
│   ├── FaceCulling.bench.ts
│   ├── ChunkMeshing.bench.ts
│   └── Raycasting.bench.ts
└── fixtures/
    └── testWorlds.ts
```

**Example Test:**

```typescript
// tests/unit/VoxelWorld.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { VoxelWorld } from '../../src/core/VoxelWorld';
import { BlockType } from '../../src/types/VoxelTypes';

describe('VoxelWorld', () => {
  let world: VoxelWorld;

  beforeEach(() => {
    world = new VoxelWorld(mockScene, { seed: 12345 });
  });

  describe('setBlock', () => {
    it('should place block at valid position', () => {
      world.setBlock(0, 10, 0, BlockType.STONE);
      expect(world.getBlock(0, 10, 0)).toBe(BlockType.STONE);
    });

    it('should not place block below bedrock', () => {
      world.setBlock(0, -1, 0, BlockType.STONE);
      expect(world.getBlock(0, -1, 0)).toBe(BlockType.AIR);
    });

    it('should update chunk mesh after block change', () => {
      const updateSpy = vi.spyOn(world, 'updateChunkMesh');
      world.setBlock(5, 10, 5, BlockType.STONE);
      expect(updateSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('chunk generation', () => {
    it('should generate deterministic terrain from seed', () => {
      const world1 = new VoxelWorld(mockScene, { seed: 999 });
      const world2 = new VoxelWorld(mockScene, { seed: 999 });

      expect(world1.getBlock(10, 32, 10)).toBe(world2.getBlock(10, 32, 10));
    });

    it('should place trees only on grass above sea level', () => {
      const treeBlock = world.getBlock(8, 40, 8);
      if (treeBlock === BlockType.WOOD) {
        const groundBlock = world.getBlock(8, 39, 8);
        expect(groundBlock).toBe(BlockType.GRASS);
        expect(39).toBeGreaterThan(32); // above sea level
      }
    });
  });
});
```

**Performance Benchmarks:**

```typescript
// tests/performance/FaceCulling.bench.ts
import { describe, bench } from 'vitest';
import { VoxelWorld } from '../../src/core/VoxelWorld';

describe('Face Culling Performance', () => {
  const world = new VoxelWorld(mockScene, { seed: 123 });

  bench('buildChunkMesh with culling', () => {
    world.buildChunkMesh(world.getChunk(0, 0));
  }, { iterations: 100 });

  bench('buildChunkMesh without culling', () => {
    world.buildChunkMeshNoCulling(world.getChunk(0, 0));
  }, { iterations: 100 });
});
```

**Deliverables:**
- ✅ 30+ unit tests (>80% coverage)
- ✅ 10+ integration tests
- ✅ 5+ performance benchmarks
- ✅ CI/CD pipeline (GitHub Actions)

#### Day 3-4: Configuration System

**src/config/GameConfig.ts:**

```typescript
export interface GraphicsConfig {
  renderDistance: number;          // 2-10 chunks
  shadowQuality: 'off' | 'low' | 'medium' | 'high';
  particleCount: number;            // 0-5000
  fogEnabled: boolean;
  antialiasing: boolean;
  maxFPS: number;                   // 30, 60, 120, unlimited
  vsync: boolean;
}

export interface ControlsConfig {
  mouseSensitivity: number;         // 0.1-5.0
  invertY: boolean;
  invertX: boolean;
  keyBindings: Record<GameAction, string>;
  gamepadEnabled: boolean;
}

export interface AudioConfig {
  masterVolume: number;             // 0.0-1.0
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  spatialAudio: boolean;
}

export interface GameplayConfig {
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard';
  autoSave: boolean;
  autoSaveInterval: number;         // seconds
  showTooltips: boolean;
  showCoordinates: boolean;
  fov: number;                      // 60-110
}

export class ConfigManager {
  private config: GameConfig;
  private readonly STORAGE_KEY = 'cubeworld_config_v1';
  private readonly VERSION = 1;

  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig(): GameConfig {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return this.getDefaultConfig();

      const parsed = JSON.parse(saved);

      // Validate version
      if (parsed.version !== this.VERSION) {
        console.warn('Config version mismatch, using defaults');
        return this.getDefaultConfig();
      }

      // Validate schema
      if (!this.validateConfig(parsed)) {
        console.warn('Invalid config schema, using defaults');
        return this.getDefaultConfig();
      }

      return parsed;
    } catch (e) {
      console.error('Failed to load config:', e);
      return this.getDefaultConfig();
    }
  }

  saveConfig(): void {
    try {
      const serialized = JSON.stringify({
        ...this.config,
        version: this.VERSION,
      });
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  }

  get graphics(): GraphicsConfig {
    return this.config.graphics;
  }

  set graphics(value: Partial<GraphicsConfig>) {
    this.config.graphics = { ...this.config.graphics, ...value };
    this.saveConfig();
    this.emitChange('graphics');
  }

  private validateConfig(config: any): boolean {
    // Validate structure
    if (!config.graphics || !config.controls || !config.audio || !config.gameplay) {
      return false;
    }

    // Validate ranges
    if (config.graphics.renderDistance < 2 || config.graphics.renderDistance > 10) {
      return false;
    }

    return true;
  }

  private emitChange(section: keyof GameConfig): void {
    window.dispatchEvent(new CustomEvent('configChange', {
      detail: { section, config: this.config }
    }));
  }

  getDefaultConfig(): GameConfig {
    return {
      version: this.VERSION,
      graphics: {
        renderDistance: 3,
        shadowQuality: 'medium',
        particleCount: 1000,
        fogEnabled: true,
        antialiasing: true,
        maxFPS: 60,
        vsync: true,
      },
      controls: {
        mouseSensitivity: 1.0,
        invertY: false,
        invertX: false,
        keyBindings: {
          forward: 'KeyW',
          backward: 'KeyS',
          left: 'KeyA',
          right: 'KeyD',
          jump: 'Space',
          crouch: 'ShiftLeft',
          inventory: 'KeyE',
          drop: 'KeyQ',
        },
        gamepadEnabled: false,
      },
      audio: {
        masterVolume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.8,
        ambientVolume: 0.6,
        spatialAudio: true,
      },
      gameplay: {
        difficulty: 'normal',
        autoSave: true,
        autoSaveInterval: 300, // 5 minutes
        showTooltips: true,
        showCoordinates: false,
        fov: 75,
      },
    };
  }
}
```

**UI Integration:**

```typescript
// src/ui/SettingsPanel.ts
export class SettingsPanel {
  private config: ConfigManager;

  constructor(config: ConfigManager) {
    this.config = config;
    this.createUI();
  }

  private createUI(): void {
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'settings-panel hidden';

    panel.innerHTML = `
      <div class="settings-content">
        <h2>Settings</h2>

        <section class="settings-section">
          <h3>Graphics</h3>
          <label>
            Render Distance: <span id="render-distance-value">3</span>
            <input type="range" id="render-distance" min="2" max="10" value="3">
          </label>
          <label>
            Shadow Quality:
            <select id="shadow-quality">
              <option value="off">Off</option>
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            <input type="checkbox" id="fog-enabled" checked>
            Enable Fog
          </label>
        </section>

        <section class="settings-section">
          <h3>Audio</h3>
          <label>
            Master Volume: <span id="master-volume-value">70%</span>
            <input type="range" id="master-volume" min="0" max="100" value="70">
          </label>
        </section>

        <button id="settings-close">Close</button>
      </div>
    `;

    document.body.appendChild(panel);
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const renderDistance = document.getElementById('render-distance') as HTMLInputElement;
    renderDistance.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      document.getElementById('render-distance-value')!.textContent = value.toString();
      this.config.graphics = { renderDistance: value };
    });

    // Similar for other controls...
  }

  show(): void {
    document.getElementById('settings-panel')!.classList.remove('hidden');
  }

  hide(): void {
    document.getElementById('settings-panel')!.classList.add('hidden');
  }
}
```

**Deliverables:**
- ✅ Comprehensive configuration system
- ✅ Persistent settings (localStorage)
- ✅ Settings UI panel
- ✅ Real-time config updates

#### Day 5-7: Constants & Code Organization

Extract all magic numbers to constants:

**src/constants/WorldConstants.ts:**

```typescript
export const WORLD_CONSTANTS = {
  CHUNK_SIZE: 16,
  CHUNK_HEIGHT: 64,
  SEA_LEVEL: 32,
  MAX_HEIGHT: 63,
  BEDROCK_LEVEL: 0,

  // Generation
  TREE_SPAWN_CHANCE: 0.02,
  MIN_TREE_HEIGHT: 4,
  MAX_TREE_HEIGHT: 6,
  LEAF_RADIUS: 2,
  SNOW_HEIGHT_THRESHOLD: 47,

  // Noise
  CONTINENTAL_SCALE: 0.005,
  EROSION_SCALE: 0.01,
  PEAKS_SCALE: 0.02,
  CONTINENTAL_AMPLITUDE: 20,
  EROSION_AMPLITUDE: 10,
  PEAKS_AMPLITUDE: 15,

  // Limits
  MAX_RENDER_DISTANCE: 10,
  MIN_RENDER_DISTANCE: 2,
  DEFAULT_RENDER_DISTANCE: 3,
} as const;

export const GRAPHICS_CONSTANTS = {
  SKY_COLOR: 0x87ceeb,
  FOG_COLOR: 0x87ceeb,
  FOG_NEAR: 100,
  FOG_FAR: 300,

  SHADOW_MAP_SIZE: 2048,
  SHADOW_CAMERA_SIZE: 100,
  SHADOW_CAMERA_NEAR: 0.5,
  SHADOW_CAMERA_FAR: 500,

  AMBIENT_LIGHT_INTENSITY: 0.6,
  SUN_LIGHT_INTENSITY: 0.8,
  HEMISPHERE_LIGHT_INTENSITY: 0.4,

  TARGET_FPS: 60,
  MAX_PIXEL_RATIO: 2,
} as const;

export const PHYSICS_CONSTANTS = {
  GRAVITY: 9.8,
  PLAYER_SPEED: 5.0,
  PLAYER_JUMP_FORCE: 5.0,
  PLAYER_HEIGHT: 1.8,
  PLAYER_WIDTH: 0.6,

  MOB_WALK_SPEED: 1.5,
  MOB_RUN_SPEED: 3.0,

  TERMINAL_VELOCITY: 50.0,
} as const;

export const GAMEPLAY_CONSTANTS = {
  MAX_INVENTORY_SLOTS: 36,
  HOTBAR_SLOTS: 9,
  MAX_STACK_SIZE: 64,
  TOOL_STACK_SIZE: 1,

  PLAYER_MAX_HEALTH: 20,
  PLAYER_MAX_HUNGER: 20,

  PICKUP_RADIUS: 1.5,
  INTERACTION_RADIUS: 5.0,

  AUTO_SAVE_INTERVAL: 300, // seconds
  MAX_SAVE_SLOTS: 10,
} as const;
```

**Deliverables:**
- ✅ All magic numbers extracted
- ✅ Type-safe constants (as const)
- ✅ Organized by domain
- ✅ JSDoc comments for each constant

### Week 2: Performance Optimization - Greedy Meshing

**Goal:** Reduce triangle count by 40-60%, increase FPS from 60 to 100+

#### Implementation: Greedy Meshing Algorithm

**src/graphics/GreedyMesher.ts:**

```typescript
export class GreedyMesher {
  /**
   * Generates optimized mesh using greedy meshing algorithm
   * Combines adjacent same-type faces into larger quads
   *
   * Performance: 40-60% triangle reduction on natural terrain
   */
  buildMesh(chunk: Chunk): THREE.BufferGeometry {
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];

    // Process each axis (X, Y, Z)
    for (let axis = 0; axis < 3; axis++) {
      const u = (axis + 1) % 3; // Perpendicular axis 1
      const v = (axis + 2) % 3; // Perpendicular axis 2

      const dims = [CHUNK_SIZE, CHUNK_HEIGHT, CHUNK_SIZE];
      const chunkPos = [chunk.x * CHUNK_SIZE, 0, chunk.z * CHUNK_SIZE];

      // For each slice perpendicular to axis
      for (let d = -1; d <= dims[axis]; d++) {
        // Create mask for this slice
        const mask = this.createMask(chunk, axis, d, dims);

        // Greedy algorithm: build rectangles
        for (let j = 0; j < dims[v]; j++) {
          for (let i = 0; i < dims[u]; i++) {
            if (mask[i + j * dims[u]] === null) continue;

            const currentBlock = mask[i + j * dims[u]]!;

            // Compute width
            let width = 1;
            while (
              i + width < dims[u] &&
              mask[i + width + j * dims[u]] === currentBlock
            ) {
              width++;
            }

            // Compute height
            let height = 1;
            let done = false;
            while (j + height < dims[v] && !done) {
              for (let k = 0; k < width; k++) {
                if (mask[i + k + (j + height) * dims[u]] !== currentBlock) {
                  done = true;
                  break;
                }
              }
              if (!done) height++;
            }

            // Add quad
            this.addQuad(
              vertices,
              normals,
              uvs,
              colors,
              axis,
              d,
              i,
              j,
              width,
              height,
              currentBlock,
              dims,
              chunkPos
            );

            // Clear mask
            for (let h = 0; h < height; h++) {
              for (let w = 0; w < width; w++) {
                mask[i + w + (j + h) * dims[u]] = null;
              }
            }
          }
        }
      }
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return geometry;
  }

  private createMask(
    chunk: Chunk,
    axis: number,
    d: number,
    dims: number[]
  ): (BlockType | null)[] {
    const u = (axis + 1) % 3;
    const v = (axis + 2) % 3;
    const maskSize = dims[u] * dims[v];
    const mask: (BlockType | null)[] = new Array(maskSize).fill(null);

    for (let j = 0; j < dims[v]; j++) {
      for (let i = 0; i < dims[u]; i++) {
        const pos = [0, 0, 0];
        pos[axis] = d;
        pos[u] = i;
        pos[v] = j;

        const block1 = this.getBlock(chunk, pos[0], pos[1], pos[2]);
        pos[axis] = d + 1;
        const block2 = this.getBlock(chunk, pos[0], pos[1], pos[2]);

        // Determine if face should be rendered
        const isBlock1Solid = block1 !== BlockType.AIR && block1 !== null;
        const isBlock2Solid = block2 !== BlockType.AIR && block2 !== null;

        if (isBlock1Solid === isBlock2Solid) {
          // Both solid or both air - no face needed
          mask[i + j * dims[u]] = null;
        } else if (isBlock1Solid) {
          // Face on positive side of block1
          mask[i + j * dims[u]] = block1;
        } else {
          // Face on negative side of block2
          mask[i + j * dims[u]] = block2;
        }
      }
    }

    return mask;
  }

  private addQuad(
    vertices: number[],
    normals: number[],
    uvs: number[],
    colors: number[],
    axis: number,
    d: number,
    i: number,
    j: number,
    width: number,
    height: number,
    blockType: BlockType,
    dims: number[],
    chunkPos: number[]
  ): void {
    const u = (axis + 1) % 3;
    const v = (axis + 2) % 3;

    const pos = [0, 0, 0];
    pos[axis] = d;
    pos[u] = i;
    pos[v] = j;

    // Convert to world coordinates
    const worldPos = [
      pos[0] + chunkPos[0],
      pos[1] + chunkPos[1],
      pos[2] + chunkPos[2]
    ];

    // Quad corners
    const du = [0, 0, 0];
    const dv = [0, 0, 0];
    du[u] = width;
    dv[v] = height;

    const corners = [
      worldPos,
      [worldPos[0] + du[0], worldPos[1] + du[1], worldPos[2] + du[2]],
      [worldPos[0] + du[0] + dv[0], worldPos[1] + du[1] + dv[1], worldPos[2] + du[2] + dv[2]],
      [worldPos[0] + dv[0], worldPos[1] + dv[1], worldPos[2] + dv[2]]
    ];

    // Add two triangles
    // Triangle 1: 0, 1, 2
    vertices.push(...corners[0], ...corners[1], ...corners[2]);
    // Triangle 2: 0, 2, 3
    vertices.push(...corners[0], ...corners[2], ...corners[3]);

    // Normals
    const normal = [0, 0, 0];
    normal[axis] = d >= 0 ? 1 : -1;
    for (let i = 0; i < 6; i++) {
      normals.push(...normal);
    }

    // UVs
    uvs.push(
      0, 0,
      width, 0,
      width, height,
      0, 0,
      width, height,
      0, height
    );

    // Colors
    const color = BLOCK_TYPES[blockType].color;
    const rgb = [color.r, color.g, color.b];
    for (let i = 0; i < 6; i++) {
      colors.push(...rgb);
    }
  }

  private getBlock(chunk: Chunk, x: number, y: number, z: number): BlockType | null {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return null; // Outside chunk
    }

    const index = x + CHUNK_SIZE * (y + CHUNK_HEIGHT * z);
    return chunk.blocks[index];
  }
}
```

**Performance Comparison:**

```typescript
// Before greedy meshing:
// 16×16 flat grass field = 256 blocks × 2 triangles = 512 triangles

// After greedy meshing:
// 16×16 flat grass field = 1 quad × 2 triangles = 2 triangles
// Reduction: 99.6%!

// Realistic terrain (mixed blocks):
// Before: ~40,000 triangles
// After: ~18,000 triangles
// Reduction: 55%
```

**Deliverables:**
- ✅ Greedy meshing implementation
- ✅ 40-60% triangle reduction
- ✅ FPS increase from 60 to 100+
- ✅ Benchmark comparison

### Week 3: Texture Atlas & LOD

#### Texture Atlas System

**assets/textures/atlas.png:**
- 256×256 image containing 16×16 tile textures
- 16 tiles per row = 256 total possible textures

**src/graphics/TextureAtlas.ts:**

```typescript
export class TextureAtlas {
  private texture: THREE.Texture;
  private readonly ATLAS_SIZE = 256;
  private readonly TILE_SIZE = 16;
  private readonly TILES_PER_ROW = this.ATLAS_SIZE / this.TILE_SIZE; // 16

  async load(path: string): Promise<void> {
    const loader = new THREE.TextureLoader();
    this.texture = await loader.loadAsync(path);

    // Crisp pixel art
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestMipMapLinearFilter;
    this.texture.generateMipmaps = true;
  }

  getTexture(): THREE.Texture {
    return this.texture;
  }

  getUVForBlock(blockType: BlockType, face: BlockFace): UVCoords {
    const tileIndex = this.getTileIndex(blockType, face);
    return this.getTileUV(tileIndex);
  }

  private getTileIndex(blockType: BlockType, face: BlockFace): number {
    // Special blocks with different faces
    if (blockType === BlockType.GRASS) {
      if (face === BlockFace.TOP) return 0;    // Grass top
      if (face === BlockFace.BOTTOM) return 2; // Dirt
      return 1;                                 // Grass side
    }

    // Map each block type to tile index
    const tileMap: Record<BlockType, number> = {
      [BlockType.DIRT]: 2,
      [BlockType.STONE]: 3,
      [BlockType.SAND]: 4,
      [BlockType.WATER]: 5,
      [BlockType.WOOD]: 6,
      [BlockType.LEAVES]: 7,
      [BlockType.SNOW]: 8,
      [BlockType.COBBLESTONE]: 9,
      [BlockType.BEDROCK]: 10,
      // ... more blocks
    };

    return tileMap[blockType] || 0;
  }

  private getTileUV(tileIndex: number): UVCoords {
    const tileX = tileIndex % this.TILES_PER_ROW;
    const tileY = Math.floor(tileIndex / this.TILES_PER_ROW);

    const pixelSize = 1 / this.ATLAS_SIZE;
    const tileSize = this.TILE_SIZE / this.ATLAS_SIZE;

    // Slight inset to prevent bleeding
    const inset = pixelSize * 0.5;

    const u = tileX * tileSize + inset;
    const v = 1 - (tileY + 1) * tileSize + inset; // Flip Y
    const uEnd = u + tileSize - inset * 2;
    const vEnd = v + tileSize - inset * 2;

    return {
      bottomLeft: [u, v],
      bottomRight: [uEnd, v],
      topRight: [uEnd, vEnd],
      topLeft: [u, vEnd],
    };
  }
}
```

**Creating the Atlas:**

Use a tool like [TexturePacker](https://www.codeandweb.com/texturepacker) or create manually:

```python
# scripts/create_atlas.py
from PIL import Image
import os

TILE_SIZE = 16
TILES_PER_ROW = 16
ATLAS_SIZE = TILE_SIZE * TILES_PER_ROW

# Create blank atlas
atlas = Image.new('RGBA', (ATLAS_SIZE, ATLAS_SIZE), (0, 0, 0, 0))

# Paste each texture
tile_files = sorted(os.listdir('assets/textures/blocks/'))
for i, filename in enumerate(tile_files):
    if not filename.endswith('.png'):
        continue

    tile = Image.open(f'assets/textures/blocks/{filename}')
    tile = tile.resize((TILE_SIZE, TILE_SIZE), Image.NEAREST)

    x = (i % TILES_PER_ROW) * TILE_SIZE
    y = (i // TILES_PER_ROW) * TILE_SIZE

    atlas.paste(tile, (x, y))

atlas.save('assets/textures/atlas.png')
print(f'Created atlas with {len(tile_files)} textures')
```

**Deliverables:**
- ✅ Texture atlas system
- ✅ 50+ block textures
- ✅ UV mapping for all blocks
- ✅ Pixel-perfect rendering

#### Level of Detail (LOD)

```typescript
class LODManager {
  private readonly LOD_LEVELS = [
    { distance: 0,   detail: 1.0 },  // Full detail
    { distance: 150, detail: 0.5 },  // Half detail
    { distance: 250, detail: 0.25 }, // Quarter detail
  ];

  updateChunkLOD(chunk: Chunk, cameraPos: THREE.Vector3): void {
    const chunkCenter = new THREE.Vector3(
      chunk.x * CHUNK_SIZE + CHUNK_SIZE / 2,
      CHUNK_HEIGHT / 2,
      chunk.z * CHUNK_SIZE + CHUNK_SIZE / 2
    );

    const distance = cameraPos.distanceTo(chunkCenter);
    const lod = this.selectLOD(distance);

    // Rebuild mesh at appropriate LOD if needed
    if (chunk.currentLOD !== lod) {
      this.rebuildChunkAtLOD(chunk, lod);
      chunk.currentLOD = lod;
    }
  }

  private selectLOD(distance: number): number {
    for (let i = this.LOD_LEVELS.length - 1; i >= 0; i--) {
      if (distance >= this.LOD_LEVELS[i].distance) {
        return i;
      }
    }
    return 0;
  }

  private rebuildChunkAtLOD(chunk: Chunk, lodLevel: number): void {
    const detail = this.LOD_LEVELS[lodLevel].detail;

    if (detail === 1.0) {
      // Full detail - use greedy meshing
      chunk.mesh = this.greedyMesher.buildMesh(chunk);
    } else {
      // Lower detail - skip some blocks
      const stride = Math.floor(1 / detail);
      chunk.mesh = this.buildLowDetailMesh(chunk, stride);
    }
  }
}
```

**Performance Impact:**
- Render distance increased from 3 to 6 chunks
- Same FPS as before (100+)
- Visible world 4× larger

**Deliverables:**
- ✅ 3-level LOD system
- ✅ Automatic LOD selection
- ✅ Doubled render distance
- ✅ Maintained 100+ FPS

---

### Phase 1 Deliverables Summary

By end of Week 3:

- ✅ **Testing:** 30+ unit tests, 10+ integration tests, 5+ benchmarks
- ✅ **Config:** Full settings system with UI
- ✅ **Performance:** 100+ FPS (66% increase)
- ✅ **Optimization:** Greedy meshing (50% triangle reduction)
- ✅ **Graphics:** Texture atlas with 50+ textures
- ✅ **Rendering:** LOD system, 2× render distance
- ✅ **Code Quality:** Zero magic numbers, full type safety

**Ship Milestone:** "CubeWorld Lite" - optimized creative building tool

---

## Phase 2: Rich Content System (Weeks 4-6)

**Goal:** Expand from 11 blocks to 100+, add structures, biomes, and advanced world generation

### Week 4: Block Expansion & Categories

See file for 100+ block implementation details...

[Continue with remaining phases...]

---

## AI/MCP Integration Opportunities

### Claude Code Skills for Game Development

#### 1. Structure Generation via Prompts

**Use Case:** Describe a building in natural language, get voxel structure

**Implementation:**

```typescript
// MCP Tool: generate-structure
interface GenerateStructureParams {
  description: string;
  maxSize: { x: number; y: number; z: number };
}

async function generateStructure(params: GenerateStructureParams): Promise<Structure> {
  // Use Claude to convert description to block placements
  const prompt = `
Generate a Minecraft-style voxel structure based on this description:
"${params.description}"

Available block types: ${Object.keys(BlockType).join(', ')}
Maximum size: ${params.maxSize.x}×${params.maxSize.y}×${params.maxSize.z}

Output format (JSON):
{
  "name": "Structure name",
  "blocks": [
    { "x": 0, "y": 0, "z": 0, "type": "STONE" },
    ...
  ]
}
`;

  const response = await claudeAPI.complete(prompt);
  return JSON.parse(response);
}

// Usage:
const castle = await generateStructure({
  description: "A medieval castle with four corner towers, a main gate, and a courtyard",
  maxSize: { x: 30, y: 20, z: 30 }
});
```

#### 2. NPC Dialogue Generation

**MCP Tool:** generate-dialogue-tree

```typescript
interface GenerateDialogueParams {
  npcName: string;
  personality: string;
  questContext?: string;
}

const dialogue = await generateDialogue({
  npcName: "Village Elder",
  personality: "Wise, cryptic, slightly forgetful",
  questContext: "Player needs to find ancient artifact"
});
```

#### 3. Quest Generation

**MCP Tool:** generate-quest

```typescript
const quest = await generateQuest({
  difficulty: "medium",
  type: "fetch",
  theme: "mining",
  rewardTier: "uncommon"
});
```

### Recommended MCP Servers

1. **filesystem:** Read/write save files, schematics
2. **fetch:** Download community structures, texture packs
3. **sqlite:** Store game analytics, leaderboards
4. **github:** Version control for game content

**Setup Example:**

```json
// mcp_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./game-data"]
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./cubeworld.db"]
    }
  }
}
```

---

## Testing Strategy

### Unit Tests (Target: 80% coverage)

```typescript
// Core systems
tests/unit/VoxelWorld.test.ts          // 20 tests
tests/unit/ChunkManager.test.ts        // 15 tests
tests/unit/BlockTypes.test.ts          // 10 tests
tests/unit/NoiseGenerator.test.ts      // 12 tests
tests/unit/InventoryManager.test.ts    // 18 tests
tests/unit/EntityManager.test.ts       // 15 tests
```

### Integration Tests

```typescript
// Cross-system tests
tests/integration/WorldGeneration.test.ts    // Noise → Chunks → Mesh
tests/integration/SaveLoad.test.ts           // Save → Compress → Load → Verify
tests/integration/MultiplayerSync.test.ts    // Client → Server → Broadcast
```

### Performance Benchmarks

```typescript
// Critical paths
tests/bench/ChunkGeneration.bench.ts   // Target: <50ms per chunk
tests/bench/MeshBuilding.bench.ts      // Target: <30ms per chunk
tests/bench/Raycasting.bench.ts        // Target: <1ms per frame
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test & Build

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Deployment Pipeline

### Production Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,        // Remove console.log in production
        dead_code: true,
        passes: 2,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],      // Separate Three.js chunk
          'vendor': ['simplex-noise', 'lz-string'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['three', 'simplex-noise'],
  },
});
```

### PWA Setup (Offline Play)

```typescript
// vite-plugin-pwa config
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt', 'assets/**/*'],
  manifest: {
    name: 'CubeWorld',
    short_name: 'CubeWorld',
    description: '3D voxel world creator',
    theme_color: '#1a1a2e',
    icons: [
      {
        src: 'icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,jpg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          }
        }
      }
    ]
  }
})
```

### Deployment Targets

1. **GitHub Pages:** Free hosting for static sites
2. **Netlify:** Auto-deploy from Git with CDN
3. **Vercel:** Zero-config deployment
4. **itch.io:** Game distribution platform

**Deploy Script:**

```bash
#!/bin/bash
# scripts/deploy.sh

npm run build
npm run test

# Deploy to GitHub Pages
gh-pages -d dist

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

---

## Conclusion

This roadmap delivers a **production-ready voxel game** in 12 weeks with:

- **100+ FPS** performance
- **100+ block types** and 20+ structures
- **Living world** with mobs, NPCs, quests
- **Save/load** system
- **Polished UI/UX** with sound
- **PWA support** for offline play

Each phase is **independently shippable**, allowing for early user feedback and iterative development.

**Next Steps:**
1. Review and approve roadmap
2. Set up development environment
3. Begin Week 1: Testing Infrastructure
4. Start building! 🚀
