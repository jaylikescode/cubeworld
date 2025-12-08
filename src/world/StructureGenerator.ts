import { BlockType } from '../types/VoxelTypes';

export enum StructureType {
  HOUSE = 'house',
  TOWER = 'tower',
  CASTLE = 'castle',
  DUNGEON = 'dungeon',
  TEMPLE = 'temple',
  WELL = 'well',
}

export interface StructureBlock {
  x: number;
  y: number;
  z: number;
  blockType: BlockType;
}

export interface Structure {
  type: StructureType;
  blocks: StructureBlock[];
  width: number;
  height: number;
  depth: number;
}

export class StructureGenerator {
  private seed: number;
  private spawnProbability: number = 0.05; // 5% chance per chunk

  constructor(seed: number) {
    this.seed = seed;
  }

  private seededRandom(x: number, y: number = 0): number {
    const combined = this.seed + x * 374761393 + y * 668265263;
    const value = Math.sin(combined) * 43758.5453;
    return value - Math.floor(value);
  }

  public shouldSpawnStructure(chunkX: number, chunkZ: number): boolean {
    return this.seededRandom(chunkX, chunkZ) < this.spawnProbability;
  }

  public getRandomStructurePosition(chunkX: number, chunkZ: number): { x: number; z: number } {
    const baseX = chunkX * 16;
    const baseZ = chunkZ * 16;

    const offsetX = Math.floor(this.seededRandom(chunkX + 1000, chunkZ) * 16);
    const offsetZ = Math.floor(this.seededRandom(chunkX, chunkZ + 1000) * 16);

    return {
      x: baseX + offsetX,
      z: baseZ + offsetZ,
    };
  }

  public selectRandomStructureType(): StructureType {
    const random = this.seededRandom(this.seed++);
    const types = [
      StructureType.HOUSE,
      StructureType.TOWER,
      StructureType.WELL,
      StructureType.CASTLE,
      StructureType.TEMPLE,
      StructureType.DUNGEON,
    ];

    const index = Math.floor(random * types.length);
    return types[index];
  }

  public generateHouse(): Structure {
    const random1 = this.seededRandom(this.seed++);
    const random2 = this.seededRandom(this.seed++);

    // House dimensions: 5-9 blocks wide/deep, 4-6 tall
    const width = 5 + Math.floor(random1 * 5);
    const height = 4 + Math.floor(random2 * 3);
    const depth = 5 + Math.floor(this.seededRandom(this.seed++) * 5);

    const blocks: StructureBlock[] = [];

    // Choose wall material
    const wallMaterials = [BlockType.PLANK, BlockType.OAK_PLANK, BlockType.COBBLESTONE, BlockType.BRICK];
    const wallMaterial = wallMaterials[Math.floor(this.seededRandom(this.seed++) * wallMaterials.length)];

    // Create a 3D grid to track what we've placed
    const grid = new Map<string, BlockType>();

    const setBlock = (x: number, y: number, z: number, blockType: BlockType) => {
      const key = `${x},${y},${z}`;
      grid.set(key, blockType);
    };

    // Build floor
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        setBlock(x, 0, z, wallMaterial);
      }
    }

    // Build walls
    for (let y = 1; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          const isWall = x === 0 || x === width - 1 || z === 0 || z === depth - 1;

          if (isWall) {
            // Check for door
            if (z === 0 && y < 3 && x >= Math.floor(width / 2) - 1 && x <= Math.floor(width / 2)) {
              setBlock(x, y, z, BlockType.AIR);
            }
            // Check for windows
            else if (y === 2 && (x === 0 || x === width - 1) && z % 3 === 1) {
              setBlock(x, y, z, BlockType.GLASS);
            } else {
              setBlock(x, y, z, wallMaterial);
            }
          } else {
            // Interior is air
            setBlock(x, y, z, BlockType.AIR);
          }
        }
      }
    }

    // Build roof
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        setBlock(x, height, z, wallMaterial);
      }
    }

    // Convert grid to blocks array
    grid.forEach((blockType, key) => {
      const [x, y, z] = key.split(',').map(Number);
      blocks.push({ x, y, z, blockType });
    });

    return {
      type: StructureType.HOUSE,
      blocks,
      width,
      height: height + 1,
      depth,
    };
  }

  public generateTower(): Structure {
    const random = this.seededRandom(this.seed++);

    // Tower dimensions: 4-6 wide, 10-20 tall
    const width = 4 + Math.floor(random * 3);
    const height = 10 + Math.floor(this.seededRandom(this.seed++) * 11);
    const depth = width;

    const blocks: StructureBlock[] = [];
    const material = BlockType.STONE_BRICK;

    // Build tower floors and walls
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          // Hollow interior
          const isWall = x === 0 || x === width - 1 || z === 0 || z === depth - 1;
          const isFloor = y === 0 || y % 4 === 0; // Floor every 4 blocks

          if (isWall || isFloor) {
            blocks.push({ x, y, z, blockType: material });
          } else if (!isFloor) {
            blocks.push({ x, y, z, blockType: BlockType.AIR });
          }
        }
      }
    }

    // Add battlements at top
    const battlementY = height;
    for (let x = 0; x < width; x += 2) {
      blocks.push({ x, y: battlementY, z: 0, blockType: material });
      blocks.push({ x, y: battlementY, z: depth - 1, blockType: material });
    }
    for (let z = 0; z < depth; z += 2) {
      blocks.push({ x: 0, y: battlementY, z, blockType: material });
      blocks.push({ x: width - 1, y: battlementY, z, blockType: material });
    }

    return {
      type: StructureType.TOWER,
      blocks,
      width,
      height: height + 1,
      depth,
    };
  }

  public generateWell(): Structure {
    const blocks: StructureBlock[] = [];
    const radius = 2;
    const height = 3;
    const width = radius * 2 + 1;
    const depth = radius * 2 + 1;

    // Build circular well
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const dx = x - radius;
        const dz = z - radius;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= radius && dist > radius - 1) {
          // Wall
          for (let y = 0; y < height; y++) {
            blocks.push({ x, y, z, blockType: BlockType.COBBLESTONE });
          }
        } else if (dist < radius - 1) {
          // Water interior
          blocks.push({ x, y: 0, z: radius, blockType: BlockType.WATER });
        }
      }
    }

    return {
      type: StructureType.WELL,
      blocks,
      width,
      height,
      depth,
    };
  }

  public generateCastle(): Structure {
    const blocks: StructureBlock[] = [];
    const width = 20;
    const height = 15;
    const depth = 20;

    // Main castle walls
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          const isOuterWall = x === 0 || x === width - 1 || z === 0 || z === depth - 1;
          const isInnerWall = (x === 3 || x === width - 4 || z === 3 || z === depth - 4) && y < height - 5;

          if (isOuterWall || isInnerWall) {
            blocks.push({ x, y, z, blockType: BlockType.STONE_BRICK });
          } else if (y === 0) {
            blocks.push({ x, y, z, blockType: BlockType.COBBLESTONE });
          } else if (!isInnerWall && y < height - 5) {
            blocks.push({ x, y, z, blockType: BlockType.AIR });
          }
        }
      }
    }

    // Add corner towers
    const towerHeight = 20;
    const towerPositions = [
      { x: 0, z: 0 },
      { x: width - 3, z: 0 },
      { x: 0, z: depth - 3 },
      { x: width - 3, z: depth - 3 },
    ];

    towerPositions.forEach(pos => {
      for (let y = 0; y < towerHeight; y++) {
        for (let dx = 0; dx < 3; dx++) {
          for (let dz = 0; dz < 3; dz++) {
            const x = pos.x + dx;
            const z = pos.z + dz;
            const isWall = dx === 0 || dx === 2 || dz === 0 || dz === 2;

            if (isWall || y === 0) {
              blocks.push({ x, y, z, blockType: BlockType.STONE_BRICK });
            } else {
              blocks.push({ x, y, z, blockType: BlockType.AIR });
            }
          }
        }
      }
    });

    // Entrance
    for (let y = 1; y < 4; y++) {
      for (let x = Math.floor(width / 2) - 1; x <= Math.floor(width / 2) + 1; x++) {
        blocks.push({ x, y, z: 0, blockType: BlockType.AIR });
      }
    }

    return {
      type: StructureType.CASTLE,
      blocks,
      width,
      height: towerHeight,
      depth,
    };
  }

  public generateTemple(): Structure {
    const blocks: StructureBlock[] = [];
    const width = 12;
    const height = 8;
    const depth = 12;

    // Build temple base
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        blocks.push({ x, y: 0, z, blockType: BlockType.SANDSTONE });
      }
    }

    // Build pillars at corners and middle
    const pillarPositions = [
      { x: 1, z: 1 },
      { x: width - 2, z: 1 },
      { x: 1, z: depth - 2 },
      { x: width - 2, z: depth - 2 },
      { x: Math.floor(width / 2), z: 1 },
      { x: Math.floor(width / 2), z: depth - 2 },
    ];

    pillarPositions.forEach(pos => {
      for (let y = 1; y < height; y++) {
        blocks.push({ x: pos.x, y, z: pos.z, blockType: BlockType.SANDSTONE });
      }
    });

    // Build roof
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        blocks.push({ x, y: height, z, blockType: BlockType.SANDSTONE });
      }
    }

    // Interior space
    for (let y = 1; y < height; y++) {
      for (let x = 2; x < width - 2; x++) {
        for (let z = 2; z < depth - 2; z++) {
          const isPillar = pillarPositions.some(p => p.x === x && p.z === z);
          if (!isPillar) {
            blocks.push({ x, y, z, blockType: BlockType.AIR });
          }
        }
      }
    }

    return {
      type: StructureType.TEMPLE,
      blocks,
      width,
      height: height + 1,
      depth,
    };
  }

  public generateDungeon(): Structure {
    const blocks: StructureBlock[] = [];
    const width = 8;
    const height = 5;
    const depth = 8;

    // Underground dungeon
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        for (let y = 0; y < height; y++) {
          const isWall = x === 0 || x === width - 1 || z === 0 || z === depth - 1 || y === 0 || y === height - 1;

          if (isWall) {
            blocks.push({ x, y, z, blockType: BlockType.COBBLESTONE });
          } else {
            blocks.push({ x, y, z, blockType: BlockType.AIR });
          }
        }
      }
    }

    // Add some cobwebs or decorations
    blocks.push({ x: 2, y: 2, z: 2, blockType: BlockType.TORCH });
    blocks.push({ x: width - 3, y: 2, z: depth - 3, blockType: BlockType.TORCH });

    return {
      type: StructureType.DUNGEON,
      blocks,
      width,
      height,
      depth,
    };
  }
}
