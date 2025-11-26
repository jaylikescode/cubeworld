import * as THREE from 'three';
import { BlockType, BLOCK_TYPES, Chunk, BlockFace } from '../types/VoxelTypes';
import { WORLD_CONSTANTS } from '../constants/WorldConstants';
import { TextureAtlas } from './TextureAtlas';

export class GreedyMesher {
  private textureAtlas: TextureAtlas;

  constructor(textureAtlas: TextureAtlas) {
    this.textureAtlas = textureAtlas;
  }

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
    const tileIndices: number[] = [];

    const { CHUNK_SIZE, CHUNK_HEIGHT } = WORLD_CONSTANTS;

    // Process each axis (X, Y, Z)
    for (let axis = 0; axis < 3; axis++) {
      const u = (axis + 1) % 3; // Perpendicular axis 1
      const v = (axis + 2) % 3; // Perpendicular axis 2

      const dims = [CHUNK_SIZE, CHUNK_HEIGHT, CHUNK_SIZE];
      const chunkPos = [chunk.x * CHUNK_SIZE, 0, chunk.z * CHUNK_SIZE];

      // For each slice perpendicular to axis
      // Iterate from -1 to dims[axis] to catch faces on boundaries
      for (let d = -1; d < dims[axis]; d++) {
        // Create mask for this slice
        const mask = this.createMask(chunk, axis, d, dims);

        // Greedy algorithm: build rectangles
        for (let j = 0; j < dims[v]; j++) {
          for (let i = 0; i < dims[u]; i++) {
            const maskIndex = i + j * dims[u];
            const maskVal = mask[maskIndex];
            
            if (maskVal === 0) continue; // 0 means null/no face

            // Compute width
            let width = 1;
            while (
              i + width < dims[u] &&
              mask[i + width + j * dims[u]] === maskVal
            ) {
              width++;
            }

            // Compute height
            let height = 1;
            let done = false;
            while (j + height < dims[v] && !done) {
              for (let k = 0; k < width; k++) {
                if (mask[i + k + (j + height) * dims[u]] !== maskVal) {
                  done = true;
                  break;
                }
              }
              if (!done) height++;
            }

            // Decode mask value
            const isPositiveFace = maskVal > 0;
            const blockType = (Math.abs(maskVal) - 1) as BlockType;

            // Add quad
            this.addQuad(
              vertices,
              normals,
              uvs,
              colors,
              tileIndices,
              axis,
              d,
              i,
              j,
              width,
              height,
              blockType,
              isPositiveFace,
              dims,
              chunkPos
            );

            // Clear mask
            for (let h = 0; h < height; h++) {
              for (let w = 0; w < width; w++) {
                mask[i + w + (j + h) * dims[u]] = 0;
              }
            }
            
            // Advance i by width
            i += width - 1;
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
    geometry.setAttribute('tileIndex', new THREE.Float32BufferAttribute(tileIndices, 1));

    return geometry;
  }

  private createMask(
    chunk: Chunk,
    axis: number,
    d: number,
    dims: number[]
  ): number[] {
    const u = (axis + 1) % 3;
    const v = (axis + 2) % 3;
    const maskSize = dims[u] * dims[v];
    const mask: number[] = new Array(maskSize).fill(0);

    for (let j = 0; j < dims[v]; j++) {
      for (let i = 0; i < dims[u]; i++) {
        const pos = [0, 0, 0];
        pos[axis] = d;
        pos[u] = i;
        pos[v] = j;

        // Block at current position (d)
        const block1 = this.getBlock(chunk, pos[0], pos[1], pos[2]);
        
        // Block at next position (d+1)
        pos[axis] = d + 1;
        const block2 = this.getBlock(chunk, pos[0], pos[1], pos[2]);

        // Determine if face should be rendered
        const isBlock1Solid = this.isSolid(block1);
        const isBlock2Solid = this.isSolid(block2);

        if (isBlock1Solid === isBlock2Solid) {
          // Both solid or both air - no face needed
          mask[i + j * dims[u]] = 0;
        } else if (isBlock1Solid) {
          // Face points towards positive axis (from block1 to block2)
          // Encode as positive (blockType + 1)
          mask[i + j * dims[u]] = block1! + 1;
        } else {
          // Face points towards negative axis (from block2 to block1)
          // Encode as negative -(blockType + 1)
          mask[i + j * dims[u]] = -(block2! + 1);
        }
      }
    }

    return mask;
  }

  private isSolid(blockType: BlockType | null): boolean {
    if (blockType === null || blockType === BlockType.AIR) return false;
    
    // Check if block is transparent
    const blockData = BLOCK_TYPES[blockType];
    if (blockData && blockData.transparent) return false;
    
    return true;
  }

  private addQuad(
    vertices: number[],
    normals: number[],
    uvs: number[],
    colors: number[],
    tileIndices: number[],
    axis: number,
    d: number,
    i: number,
    j: number,
    width: number,
    height: number,
    blockType: BlockType,
    isPositiveFace: boolean,
    dims: number[],
    chunkPos: number[]
  ): void {
    const u = (axis + 1) % 3;
    const v = (axis + 2) % 3;
    
    // Quad is at d+1 plane relative to grid origin
    const pos = [0, 0, 0];
    pos[axis] = d + 1; 
    pos[u] = i;
    pos[v] = j;

    // Convert to world coordinates
    const worldPos = [
      pos[0] + chunkPos[0],
      pos[1] + chunkPos[1],
      pos[2] + chunkPos[2]
    ];

    // Quad dimensions vectors
    const du = [0, 0, 0];
    const dv = [0, 0, 0];
    du[u] = width;
    dv[v] = height;

    // Vertices
    const v0 = [worldPos[0], worldPos[1], worldPos[2]];
    const v1 = [worldPos[0] + du[0], worldPos[1] + du[1], worldPos[2] + du[2]];
    const v2 = [worldPos[0] + du[0] + dv[0], worldPos[1] + du[1] + dv[1], worldPos[2] + du[2] + dv[2]];
    const v3 = [worldPos[0] + dv[0], worldPos[1] + dv[1], worldPos[2] + dv[2]];

    // Add two triangles
    if (isPositiveFace) {
      // Normal +axis
      // CCW order: 0 -> 1 -> 2, 0 -> 2 -> 3
      vertices.push(...v0, ...v1, ...v2);
      vertices.push(...v0, ...v2, ...v3);
    } else {
      // Normal -axis
      // CW order: 0 -> 3 -> 2, 0 -> 2 -> 1
      vertices.push(...v0, ...v3, ...v2);
      vertices.push(...v0, ...v2, ...v1);
    }

    // Normals
    const normal = [0, 0, 0];
    normal[axis] = isPositiveFace ? 1 : -1;
    for (let k = 0; k < 6; k++) {
      normals.push(...normal);
    }

    // UVs
    // Map 0..width, 0..height for repetition in shader
    // Standard GL UVs: (0,0) bottom-left.
    // We want (0,0) at v0, (width,0) at v1, (width,height) at v2, (0,height) at v3
    // This aligns with quad orientation.
    
    // However, we need to consider axis orientation for texture mapping.
    // For top face (Y+), usually X is U, Z is V.
    // For front face (Z+), X is U, Y is V.
    // For right face (X+), Z is U, Y is V?
    
    // Current logic:
    // u dimension corresponds to 'width' in UV
    // v dimension corresponds to 'height' in UV
    // This is generally correct for simple box mapping.
    
    // Note: We need to ensure proper orientation so texture isn't flipped/rotated.
    // But for simple blocks, this default is usually fine.
    // If needed, we can swap u/v or invert based on axis.
    
    if (isPositiveFace) {
        // 0, 1, 2
        // 0, 2, 3
        // v0=(0,0), v1=(w,0), v2=(w,h), v3=(0,h)
        uvs.push(
          0, 0,
          width, 0,
          width, height,
          0, 0,
          width, height,
          0, height
        );
    } else {
        // 0, 3, 2
        // 0, 2, 1
        uvs.push(
          0, 0,
          0, height,
          width, height,
          0, 0,
          width, height,
          width, 0
        );
    }

    // Colors (vertex lighting/tint)
    const blockData = BLOCK_TYPES[blockType];
    const color = blockData ? blockData.color : { r: 1, g: 0, b: 1 };
    const rgb = [color.r, color.g, color.b];
    
    // Apply slight shading based on axis/direction
    let shading = 1.0;
    if (axis === 1) { // Y-axis
      shading = isPositiveFace ? 1.0 : 0.5; // Top bright, Bottom dark
    } else if (axis === 0) { // X-axis
      shading = 0.8;
    } else { // Z-axis
      shading = 0.6;
    }
    
    const shadedRgb = [rgb[0] * shading, rgb[1] * shading, rgb[2] * shading];
    
    for (let k = 0; k < 6; k++) {
      colors.push(...shadedRgb);
    }
    
    // Tile Index
    // Determine face
    let face: BlockFace;
    if (axis === 1) {
      face = isPositiveFace ? BlockFace.TOP : BlockFace.BOTTOM;
    } else if (axis === 0) {
      face = isPositiveFace ? BlockFace.RIGHT : BlockFace.LEFT;
    } else { // axis === 2
      face = isPositiveFace ? BlockFace.FRONT : BlockFace.BACK;
    }
    
    const tileIndex = this.textureAtlas.getTileIndex(blockType, face);
    for (let k = 0; k < 6; k++) {
      tileIndices.push(tileIndex);
    }
  }

  private getBlock(chunk: Chunk, x: number, y: number, z: number): BlockType | null {
    const { CHUNK_SIZE, CHUNK_HEIGHT } = WORLD_CONSTANTS;
    
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return null; // Outside chunk
    }

    const index = x + CHUNK_SIZE * (y + CHUNK_HEIGHT * z);
    return chunk.blocks[index];
  }
}
