import * as THREE from 'three';
import { BlockType, BLOCK_TYPES } from '../types/VoxelTypes';
import { TEXTURE_CONSTANTS } from '../constants/GraphicsConstants';

export interface TextureCoordinates {
  u: number;      // UV coordinate X (0-1)
  v: number;      // UV coordinate Y (0-1)
  width: number;  // Width in UV space
  height: number; // Height in UV space
}

export type BlockFace = 'top' | 'bottom' | 'side' | 'front' | 'back' | 'left' | 'right';

interface BlockTextureMapping {
  top?: number;    // Tile index for top face
  bottom?: number; // Tile index for bottom face
  side?: number;   // Tile index for side faces
  all?: number;    // Tile index for all faces (if uniform)
}

export class TextureAtlas {
  private atlasSize: number;
  private tileSize: number;
  private tilesPerRow: number;
  private cachedTexture: THREE.CanvasTexture | null = null;
  private textureMap: Map<BlockType, BlockTextureMapping>;

  constructor() {
    this.atlasSize = TEXTURE_CONSTANTS.ATLAS_SIZE;
    this.tileSize = TEXTURE_CONSTANTS.TILE_SIZE;
    this.tilesPerRow = this.atlasSize / this.tileSize;
    this.textureMap = new Map();

    this.initializeTextureMap();
  }

  private initializeTextureMap(): void {
    // For now, we use a simple mapping where each block type gets its own tile
    // In the future, this could be loaded from a configuration file

    // Blocks with uniform textures on all sides
    const uniformBlocks: BlockType[] = [
      BlockType.AIR,
      BlockType.STONE,
      BlockType.DIRT,
      BlockType.SAND,
      BlockType.WATER,
      BlockType.WOOD,
      BlockType.SNOW,
      BlockType.ICE,
      BlockType.BEDROCK,
      BlockType.COBBLESTONE,
      BlockType.BRICK,
      BlockType.GLASS,
      BlockType.CONCRETE,
      BlockType.WHITE_CONCRETE,
      BlockType.GRAY_CONCRETE,
      BlockType.BLACK_CONCRETE,
      BlockType.RED_CONCRETE,
      BlockType.BLUE_CONCRETE,
      BlockType.GREEN_CONCRETE,
      // Ores
      BlockType.COAL_ORE,
      BlockType.IRON_ORE,
      BlockType.GOLD_ORE,
      BlockType.DIAMOND_ORE,
      BlockType.EMERALD_ORE,
      BlockType.REDSTONE_ORE,
      BlockType.LAPIS_ORE,
      BlockType.COPPER_ORE,
      BlockType.QUARTZ_ORE,
      // Mineral blocks
      BlockType.COAL_BLOCK,
      BlockType.IRON_BLOCK,
      BlockType.GOLD_BLOCK,
      BlockType.DIAMOND_BLOCK,
      BlockType.EMERALD_BLOCK,
      BlockType.REDSTONE_BLOCK,
      // Planks
      BlockType.PLANK,
      BlockType.OAK_PLANK,
      BlockType.BIRCH_PLANK,
      BlockType.SPRUCE_PLANK,
      BlockType.STONE_BRICK,
      // Natural blocks
      BlockType.GRAVEL,
      BlockType.CLAY,
      BlockType.SANDSTONE,
      BlockType.RED_SAND,
      BlockType.PODZOL,
      BlockType.MYCELIUM,
      BlockType.NETHERRACK,
      BlockType.END_STONE,
      BlockType.OBSIDIAN,
      // Leaves
      BlockType.LEAVES,
      BlockType.OAK_LEAVES,
      BlockType.BIRCH_LEAVES,
      BlockType.SPRUCE_LEAVES,
      BlockType.DARK_OAK_LEAVES,
      BlockType.ACACIA_LEAVES,
      // Decorations
      BlockType.FLOWER,
      BlockType.ROSE,
      BlockType.DANDELION,
      BlockType.TULIP,
      BlockType.MUSHROOM,
      BlockType.RED_MUSHROOM,
      BlockType.BROWN_MUSHROOM,
      BlockType.TORCH,
      BlockType.LANTERN,
      BlockType.LAVA,
    ];

    uniformBlocks.forEach(blockType => {
      this.textureMap.set(blockType, { all: blockType });
    });

    // Blocks with different top/bottom/side textures
    // Grass: green top, dirt-grass side, dirt bottom
    this.textureMap.set(BlockType.GRASS, {
      top: 200,    // Will use a special grass-top tile
      side: 201,   // Grass-side with dirt transition
      bottom: BlockType.DIRT,
    });

    // Logs: tree rings on top/bottom, bark on sides
    const logBlocks = [
      BlockType.OAK_LOG,
      BlockType.BIRCH_LOG,
      BlockType.SPRUCE_LOG,
      BlockType.DARK_OAK_LOG,
      BlockType.ACACIA_LOG,
    ];

    logBlocks.forEach((blockType, index) => {
      this.textureMap.set(blockType, {
        top: 210 + index,      // Tree ring textures
        bottom: 210 + index,   // Same for bottom
        side: 220 + index,     // Bark textures
      });
    });
  }

  public getAtlasSize(): number {
    return this.atlasSize;
  }

  public getTileSize(): number {
    return this.tileSize;
  }

  public getTilesPerRow(): number {
    return this.tilesPerRow;
  }

  public getTextureCoordinates(blockType: BlockType, face: BlockFace = 'side'): TextureCoordinates {
    const mapping = this.textureMap.get(blockType);

    // Determine which tile index to use
    let tileIndex: number;
    if (mapping) {
      if (mapping.all !== undefined) {
        tileIndex = mapping.all;
      } else {
        // Handle face-specific textures
        switch (face) {
          case 'top':
            tileIndex = mapping.top ?? mapping.side ?? blockType;
            break;
          case 'bottom':
            tileIndex = mapping.bottom ?? mapping.side ?? blockType;
            break;
          default: // side, front, back, left, right
            tileIndex = mapping.side ?? blockType;
        }
      }
    } else {
      // Default: use block type as tile index
      tileIndex = blockType;
    }

    // Calculate UV coordinates
    const row = Math.floor(tileIndex / this.tilesPerRow);
    const col = tileIndex % this.tilesPerRow;

    const tileSizeUV = this.tileSize / this.atlasSize;

    return {
      u: col * tileSizeUV,
      v: row * tileSizeUV,
      width: tileSizeUV,
      height: tileSizeUV,
    };
  }

  public generateTexture(): THREE.CanvasTexture {
    // Return cached texture if available
    if (this.cachedTexture) {
      return this.cachedTexture;
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = this.atlasSize;
    canvas.height = this.atlasSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context for texture atlas');
    }

    // Fill with transparent background
    ctx.clearRect(0, 0, this.atlasSize, this.atlasSize);

    // Draw each block type's texture
    const blockTypes = Object.values(BlockType).filter(v => typeof v === 'number') as BlockType[];

    blockTypes.forEach(blockType => {
      this.drawBlockTile(ctx, blockType);
    });

    // Draw special tiles for grass
    this.drawGrassTiles(ctx);

    // Draw special tiles for logs
    this.drawLogTiles(ctx);

    // Create THREE.js texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    this.cachedTexture = texture;
    return texture;
  }

  private drawBlockTile(ctx: CanvasRenderingContext2D, blockType: BlockType): void {
    const blockData = BLOCK_TYPES[blockType];
    if (!blockData) return;

    const row = Math.floor(blockType / this.tilesPerRow);
    const col = blockType % this.tilesPerRow;

    const x = col * this.tileSize;
    const y = row * this.tileSize;

    // Get block color and convert to CSS color
    const color = blockData.color;
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);
    const cssColor = `rgb(${r}, ${g}, ${b})`;

    // Fill tile with solid color (placeholder for actual textures)
    ctx.fillStyle = cssColor;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Add a simple pattern for visual distinction
    if (blockType !== BlockType.AIR) {
      ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`;
      ctx.lineWidth = 1;

      // Draw a subtle grid pattern
      for (let i = 0; i < this.tileSize; i += 4) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + this.tileSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + i);
        ctx.lineTo(x + this.tileSize, y + i);
        ctx.stroke();
      }
    }
  }

  private drawGrassTiles(ctx: CanvasRenderingContext2D): void {
    // Draw grass-top tile (tile 200)
    const topRow = Math.floor(200 / this.tilesPerRow);
    const topCol = 200 % this.tilesPerRow;
    const topX = topCol * this.tileSize;
    const topY = topRow * this.tileSize;

    const grassColor = BLOCK_TYPES[BlockType.GRASS].color;
    const r = Math.floor(grassColor.r * 255);
    const g = Math.floor(grassColor.g * 255);
    const b = Math.floor(grassColor.b * 255);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(topX, topY, this.tileSize, this.tileSize);

    // Draw grass-side tile (tile 201) - grass on top half, dirt on bottom
    const sideRow = Math.floor(201 / this.tilesPerRow);
    const sideCol = 201 % this.tilesPerRow;
    const sideX = sideCol * this.tileSize;
    const sideY = sideRow * this.tileSize;

    // Top half: grass
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(sideX, sideY, this.tileSize, this.tileSize / 2);

    // Bottom half: dirt
    const dirtColor = BLOCK_TYPES[BlockType.DIRT].color;
    const dr = Math.floor(dirtColor.r * 255);
    const dg = Math.floor(dirtColor.g * 255);
    const db = Math.floor(dirtColor.b * 255);
    ctx.fillStyle = `rgb(${dr}, ${dg}, ${db})`;
    ctx.fillRect(sideX, sideY + this.tileSize / 2, this.tileSize, this.tileSize / 2);
  }

  private drawLogTiles(ctx: CanvasRenderingContext2D): void {
    // Draw tree ring tiles (210-214) and bark tiles (220-224)
    const logTypes = [
      BlockType.OAK_LOG,
      BlockType.BIRCH_LOG,
      BlockType.SPRUCE_LOG,
      BlockType.DARK_OAK_LOG,
      BlockType.ACACIA_LOG,
    ];

    logTypes.forEach((logType, index) => {
      const logColor = BLOCK_TYPES[logType].color;
      const r = Math.floor(logColor.r * 255);
      const g = Math.floor(logColor.g * 255);
      const b = Math.floor(logColor.b * 255);

      // Draw ring tile (top/bottom)
      const ringTile = 210 + index;
      const ringRow = Math.floor(ringTile / this.tilesPerRow);
      const ringCol = ringTile % this.tilesPerRow;
      const ringX = ringCol * this.tileSize;
      const ringY = ringRow * this.tileSize;

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(ringX, ringY, this.tileSize, this.tileSize);

      // Draw concentric rings
      ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`;
      ctx.lineWidth = 1;
      const centerX = ringX + this.tileSize / 2;
      const centerY = ringY + this.tileSize / 2;
      for (let radius = 2; radius < this.tileSize / 2; radius += 3) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw bark tile (sides)
      const barkTile = 220 + index;
      const barkRow = Math.floor(barkTile / this.tilesPerRow);
      const barkCol = barkTile % this.tilesPerRow;
      const barkX = barkCol * this.tileSize;
      const barkY = barkRow * this.tileSize;

      // Slightly darker for bark
      ctx.fillStyle = `rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)})`;
      ctx.fillRect(barkX, barkY, this.tileSize, this.tileSize);

      // Draw vertical bark lines
      ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
      ctx.lineWidth = 2;
      for (let x = 0; x < this.tileSize; x += 4) {
        ctx.beginPath();
        ctx.moveTo(barkX + x, barkY);
        ctx.lineTo(barkX + x + (Math.random() - 0.5) * 2, barkY + this.tileSize);
        ctx.stroke();
      }
    });
  }

  public dispose(): void {
    if (this.cachedTexture) {
      this.cachedTexture.dispose();
      this.cachedTexture = null;
    }
  }
}
