import * as THREE from 'three';
import { TextureAtlas } from './TextureAtlas';

export function createVoxelMaterial(textureAtlas: TextureAtlas): THREE.MeshLambertMaterial {
  const material = new THREE.MeshLambertMaterial({
    map: textureAtlas.generateTexture(),
    transparent: true,
    alphaTest: 0.1, // Discard transparent pixels
    vertexColors: true, // Use vertex colors for shading/tinting
  });

  // Inject custom logic for texture atlas and UV repetition
  material.onBeforeCompile = (shader) => {
    // Add custom uniforms
    shader.uniforms.uTilesPerRow = { value: textureAtlas.getTilesPerRow() };
    
    // Add attribute definition
    shader.vertexShader = `
      attribute float tileIndex;
      varying float vTileIndex;
      ${shader.vertexShader}
    `;

    // Pass attribute to fragment shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vTileIndex = tileIndex;
      `
    );

    // Add varying definition to fragment shader
    shader.fragmentShader = `
      uniform float uTilesPerRow;
      varying float vTileIndex;
      ${shader.fragmentShader}
    `;

    // Replace map fragment to implement atlas logic
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #ifdef USE_MAP
        // Calculate tile position
        float tilesPerRow = uTilesPerRow;
        float tileIdx = floor(vTileIndex + 0.5); // Round to nearest integer to be safe
        
        float col = mod(tileIdx, tilesPerRow);
        float row = floor(tileIdx / tilesPerRow);
        
        // Invert Y for texture coordinates (0 is bottom in UV, but top in our atlas logic? 
        // TextureAtlas.ts uses: v = 1 - (tileY + 1) * tileSize. 
        // So row 0 is at top (v=1).
        // Let's match TextureAtlas logic. 
        // v = row * tileSizeUV in TextureAtlas.ts is actually doing:
        // v = row * tileSizeUV.
        // Wait, TextureAtlas.ts generateTexture draws row 0 at y=0 (top of canvas).
        // Canvas Y=0 is Top.
        // THREE.Texture UV (0,0) is Bottom-Left.
        // So Canvas(0,0) maps to UV(0,1).
        // So row 0 (Top) corresponds to High V.
        
        // Let's look at TextureAtlas.drawBlockTile:
        // y = row * tileSize. (0 is top).
        // So we need to invert row index for UVs?
        // Or just calculate UVs from top-left (0,1) and go down.
        
        vec2 tileSize = vec2(1.0) / tilesPerRow;
        
        // We want row 0 to be at V = 1.0 - tileSize.y
        // row 1 to be at V = 1.0 - 2*tileSize.y
        // So V_start = 1.0 - (row + 1.0) * tileSize.y
        
        // But wait, TextureAtlas.getTextureCoordinates uses:
        // v: row * tileSizeUV
        // This implies it assumes UV origin is Top-Left? 
        // Standard Three.js PlaneGeometry UVs are (0,1) top-left.
        // But we are generating our own UVs in GreedyMesher.
        // If we assume standard GL UVs (0,0 bottom-left), then:
        // Canvas Top (Row 0) -> V ~ 1.0
        // Canvas Bottom (Row 15) -> V ~ 0.0
        
        // Let's stick to standard GL UVs.
        // Row 0 is at top of texture.
        // vOffset = 1.0 - (row + 1.0) * tileSize.y;
        
        vec2 tileOffset = vec2(
          col * tileSize.x, 
          1.0 - (row + 1.0) * tileSize.y
        );
        
        // Handle repetition using fract()
        // vMapUv contains our repeating UVs (e.g. 0..width, 0..height)
        vec2 uvInTile = fract(vMapUv);
        
        // Apply to atlas
        vec2 atlasUV = tileOffset + uvInTile * tileSize;
        
        // Sample texture
        vec4 sampledDiffuseColor = texture2D( map, atlasUV );
        diffuseColor *= sampledDiffuseColor;
      #endif
      `
    );
  };

  // Required for Three.js to recognize this material as unique
  material.customProgramCacheKey = () => {
    return 'VoxelMaterial';
  };

  return material;
}

