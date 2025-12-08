# CubeWorld Resources Guide

**Complete Resource Collection for Graphics, Models, Textures, and Audio**

---

## Table of Contents

1. [3D Models & Characters](#3d-models--characters)
2. [Textures & Materials](#textures--materials)
3. [Audio & Sound Effects](#audio--sound-effects)
4. [Tools & Software](#tools--software)
5. [Learning Resources](#learning-resources)
6. [Asset Creation Workflow](#asset-creation-workflow)
7. [Legal & Licensing](#legal--licensing)

---

## 3D Models & Characters

### Free 3D Model Repositories

#### 1. **Mixamo** (Best for Characters)
- **URL:** https://www.mixamo.com
- **Content:** 100+ rigged characters with animations
- **Format:** FBX, COLLADA
- **License:** Free for commercial use
- **Perfect For:** Player characters, NPCs, humanoid mobs

**How to Use:**
1. Create free Adobe account
2. Browse character library
3. Select character → Download (FBX for Unity/Blender)
4. Browse animations → Download "without skin" (uses same rig)
5. Import into Blender, export as GLB for Three.js

**Recommended Characters for CubeWorld:**
- **Medieval Knight** - Perfect for player character
- **Zombie** - For hostile mobs
- **Villager** - For NPCs
- **Wolf** - For animal companions

#### 2. **Sketchfab** (Huge Library)
- **URL:** https://sketchfab.com/features/free-3d-models
- **Content:** 100,000+ free models
- **Format:** GLB, GLTF, FBX, OBJ
- **License:** CC-BY or CC0 (check each model)
- **Perfect For:** Props, buildings, animals, fantasy creatures

**Search Tips:**
- Use filter: "Downloadable" + "Free"
- Search terms: "low poly voxel", "minecraft style", "blocky character"
- Sort by: "Most downloaded" for quality

**Recommended Models:**
- Low-poly trees and plants
- Furniture for houses
- Tools and weapons
- Fantasy creatures

#### 3. **Poly Pizza** (Google Poly Archive)
- **URL:** https://poly.pizza
- **Content:** 10,000+ models from Google Poly
- **Format:** GLB, OBJ
- **License:** CC-BY
- **Perfect For:** Simple, clean, low-poly assets

#### 4. **Quaternius** (Game-Ready Assets)
- **URL:** https://quaternius.com/index.html
- **Content:** 1,000+ game-ready models
- **Format:** FBX, GLB
- **License:** CC0 (completely free!)
- **Perfect For:** Animals, monsters, characters, props

**Collections:**
- **Ultimate Animated Animals** - 30+ animals with animations
- **Ultimate Monsters** - 50+ fantasy creatures
- **Medieval Characters** - Knights, wizards, villagers

#### 5. **Kenny.nl** (2D/3D Game Assets)
- **URL:** https://kenney.nl/assets
- **Content:** 10,000+ 2D and 3D assets
- **Format:** OBJ, FBX, GLB
- **License:** CC0
- **Perfect For:** Prototype assets, UI elements

### Paid Model Marketplaces (Higher Quality)

#### 1. **Synty Store**
- **URL:** https://syntystore.com
- **Price:** $10-50 per pack
- **Content:** Professional low-poly asset packs
- **Recommended Packs:**
  - **POLYGON - Dungeons** ($39)
  - **POLYGON - Farm** ($29)
  - **POLYGON - Fantasy Characters** ($49)

#### 2. **TurboSquid**
- **URL:** https://www.turbosquid.com
- **Price:** $5-500 per model
- **Content:** Professional quality, game-ready
- **Filter:** "Low Poly" + "Rigged" for best results

---

## Textures & Materials

### Free Texture Websites

#### 1. **OpenGameArt.org** (Best for Pixel Art)
- **URL:** https://opengameart.org
- **Content:** Pixel art, tileable textures, sprites
- **Format:** PNG, JPG
- **License:** CC0, CC-BY (check each)
- **Perfect For:** Block textures (16×16), UI elements

**Search:** "minecraft texture", "voxel", "16x16"

**How to Create Texture Atlas:**
```bash
# Download individual textures
# Organize in folder: assets/textures/blocks/
# Use Python script (see Asset Creation Workflow section)
```

#### 2. **Polyhaven** (Photorealistic)
- **URL:** https://polyhaven.com/textures
- **Content:** 1,000+ PBR textures
- **Format:** PNG, JPG (with normal, roughness, displacement maps)
- **License:** CC0
- **Perfect For:** Realistic terrain, stone, wood, metal

**Recommended Textures:**
- **Rock** - For stone blocks
- **Wood** - For plank blocks
- **Grass** - For ground
- **Sand** - For beach/desert

**How to Use PBR Textures:**
```typescript
const textureLoader = new THREE.TextureLoader();

const material = new THREE.MeshStandardMaterial({
  map: textureLoader.load('color.jpg'),
  normalMap: textureLoader.load('normal.jpg'),
  roughnessMap: textureLoader.load('roughness.jpg'),
  metalnessMap: textureLoader.load('metallic.jpg'),
});
```

#### 3. **Textures.com** (15 Free/Day)
- **URL:** https://www.textures.com
- **Content:** 200,000+ textures
- **License:** Free tier: 15 downloads/day
- **Perfect For:** High-quality tileable textures

#### 4. **CC0 Textures**
- **URL:** https://cc0textures.com
- **Content:** 500+ PBR textures
- **License:** CC0
- **Perfect For:** Completely free, no attribution

### Creating Your Own Textures

#### Pixel Art Tools (Free)

**1. Piskel** (Web-based)
- **URL:** https://www.piskelapp.com
- **Best For:** Simple 16×16 block textures
- **Features:** Animation support, export as sprite sheet

**2. Aseprite** ($20, but worth it!)
- **URL:** https://www.aseprite.org
- **Best For:** Professional pixel art
- **Features:** Layers, animation, tilesets

**Quick Tutorial:**
```
1. Create new file: 16×16 pixels
2. Zoom in to 800% for easier editing
3. Use pencil tool (1px brush)
4. Add base color (fill tool)
5. Add highlights (lighter color on top edges)
6. Add shadows (darker color on bottom edges)
7. Export as PNG
```

#### Procedural Texture Tools

**1. Material Maker** (Free)
- **URL:** https://www.materialmaker.org
- **Best For:** Generating unique textures with nodes
- **Output:** Albedo, normal, roughness, metallic maps

**2. PixPlant** ($99)
- **URL:** https://www.pixplant.com
- **Best For:** Converting photos to tileable textures

---

## Audio & Sound Effects

### Free Sound Libraries

#### 1. **Freesound** (Community Library)
- **URL:** https://freesound.org
- **Content:** 500,000+ sounds
- **License:** CC0, CC-BY (check each)
- **Perfect For:** Block place/break, footsteps, ambience

**Recommended Searches:**
- "minecraft block" - Block sounds
- "footstep grass" - Walking sounds
- "forest ambience" - Background audio
- "inventory click" - UI sounds

#### 2. **Zapsplat** (Free with Attribution)
- **URL:** https://www.zapsplat.com
- **Content:** 100,000+ sounds
- **License:** Free with attribution or paid ($50/year)
- **Perfect For:** High-quality game SFX

#### 3. **Sonniss Game Audio** (Annual Free Packs)
- **URL:** https://sonniss.com/gameaudiogdc
- **Content:** 20GB+ of professional sounds (released annually)
- **License:** Free for indie games
- **Perfect For:** Professional sound effects

#### 4. **BBC Sound Effects**
- **URL:** https://sound-effects.bbcrewind.co.uk
- **Content:** 16,000+ BBC archive sounds
- **License:** Personal, educational, research use only
- **Perfect For:** Nature sounds, animals, weather

### Free Music

#### 1. **Kevin MacLeod** (Incompetech)
- **URL:** https://incompetech.com/music
- **Content:** 2,000+ royalty-free tracks
- **License:** CC-BY (credit required)
- **Perfect For:** Background music

**Recommended Tracks:**
- **Cipher** - Mysterious exploration
- **Fairytale Waltz** - Peaceful building
- **Warrior** - Combat/adventure

#### 2. **Purple Planet**
- **URL:** https://www.purple-planet.com
- **Content:** 1,000+ free tracks
- **License:** CC-BY
- **Perfect For:** Game soundtracks

#### 3. **Bensound**
- **URL:** https://www.bensound.com
- **Content:** 100+ tracks
- **License:** Free with credit
- **Perfect For:** High-quality, professional music

### Audio Tools

#### 1. **Audacity** (Free Audio Editor)
- **URL:** https://www.audacityteam.org
- **Use For:**
  - Trimming sounds
  - Normalizing volume
  - Adding effects (reverb, echo)
  - Format conversion

**Quick Tutorial:**
```
1. Import sound (drag file into Audacity)
2. Trim: Select unwanted parts, press Delete
3. Normalize: Effect → Normalize (make louder)
4. Export: File → Export → Export as WAV or MP3
```

#### 2. **BFXR** (8-bit Sound Generator)
- **URL:** https://www.bfxr.net
- **Use For:** Retro game sounds
- **Perfect For:** Jump sounds, UI beeps, power-ups

**How to Use:**
1. Click "Pickup/Coin" for item collection sound
2. Click "Jump" for player jump
3. Click "Explosion" for block breaking
4. Randomize until you like it
5. Export as WAV

---

## Tools & Software

### 3D Modeling Software

#### 1. **Blender** (Free, Professional)
- **URL:** https://www.blender.org
- **Price:** Free
- **Best For:** Everything! Modeling, rigging, animation
- **Learning Curve:** Moderate

**Essential Blender Skills for CubeWorld:**
- Basic modeling (adding cubes, scaling)
- UV unwrapping (applying textures)
- Rigging (bones for characters)
- Animation (walk cycles)
- Export to GLB/GLTF

**Recommended Tutorials:**
- **Blender Guru** - Donut tutorial (start here!)
- **Grant Abbitt** - Low-poly character modeling
- **CG Boost** - Animation basics

#### 2. **MagicaVoxel** (Free, Voxel Art)
- **URL:** https://ephtracy.github.io
- **Price:** Free
- **Best For:** Creating voxel models (like Minecraft)
- **Learning Curve:** Easy!

**Perfect For:**
- Block-style characters
- Structures (export as OBJ, import to Three.js)
- Props and items

**Quick Start:**
```
1. Open MagicaVoxel
2. Use brush tool to add voxels (like 3D painting)
3. Use paint tool to color
4. Export → OBJ
5. Import to Blender, export as GLB for Three.js
```

#### 3. **Blockbench** (Free, Block Modeling)
- **URL:** https://www.blockbench.net
- **Price:** Free
- **Best For:** Minecraft-style block models
- **Learning Curve:** Very easy

### Texture Creation Tools

#### 1. **GIMP** (Free Photoshop Alternative)
- **URL:** https://www.gimp.org
- **Use For:**
  - Creating texture atlases
  - Editing textures
  - Making seamless tiles

#### 2. **Krita** (Free, Artist-Friendly)
- **URL:** https://krita.org
- **Use For:** Digital painting, textures
- **Better For:** Drawing compared to GIMP

### Code & Development

#### 1. **VS Code** (Code Editor)
- **URL:** https://code.visualstudio.com
- **Extensions to Install:**
  - **Three.js Snippets** - Code shortcuts
  - **GLSL Canvas** - Shader preview
  - **Live Server** - Auto-refresh browser

#### 2. **Chrome DevTools**
- Press **F12** in Chrome
- **Console:** See errors
- **Network:** Check if textures/models loaded
- **Performance:** Profile FPS issues

---

## Learning Resources

### Three.js Tutorials

#### Official Documentation
- **URL:** https://threejs.org/docs
- **Examples:** https://threejs.org/examples
- **Start With:**
  - Creating a scene
  - Drawing a cube
  - Adding textures

#### Video Courses

**1. Bruno Simon - Three.js Journey** (Paid, $95)
- **URL:** https://threejs-journey.com
- **Best Course:** Most comprehensive Three.js course
- **Includes:** 71 hours of video, source code

**2. Wael Yasmina (YouTube - Free)**
- **URL:** https://www.youtube.com/@WaelYasmina
- **Series:** Three.js tutorials for beginners
- **Great For:** Quick start

**3. DesignCourse (YouTube - Free)**
- **URL:** Search "DesignCourse Three.js"
- **Great For:** Visual learners

### Game Development Concepts

#### Books (Free PDFs)

**1. Game Programming Patterns**
- **URL:** https://gameprogrammingpatterns.com
- **Topics:** Entity systems, optimization, architecture

**2. The Book of Shaders**
- **URL:** https://thebookofshaders.com
- **Topics:** GLSL, custom effects, procedural generation

#### Websites

**1. Red Blob Games**
- **URL:** https://www.redblobgames.com
- **Topics:** Pathfinding, procedural generation, algorithms
- **Interactive:** Amazing visual explanations!

**2. Game Dev Stack Exchange**
- **URL:** https://gamedev.stackexchange.com
- **Use For:** Asking specific questions

---

## Asset Creation Workflow

### Workflow 1: Creating a Textured Character

```
Step 1: Get Base Model
├─ Download from Mixamo
└─ Or create in Blender

Step 2: UV Unwrap
├─ Open in Blender
├─ Select model → U → Smart UV Project
└─ Export UV layout

Step 3: Paint Texture
├─ Open UV layout in GIMP/Krita
├─ Paint colors on the flat layout
└─ Save as PNG

Step 4: Apply Texture
├─ In Blender: Add material → Image texture → Select your PNG
├─ Export as GLB
└─ Import to Three.js

Step 5: Add Animation
├─ Download animations from Mixamo
├─ Import to Blender
├─ Bake animations
└─ Export GLB with animations
```

### Workflow 2: Creating Block Textures

```python
# create_texture_atlas.py

from PIL import Image
import os

TILE_SIZE = 16
TILES_PER_ROW = 16
ATLAS_SIZE = TILE_SIZE * TILES_PER_ROW  # 256

# Create blank atlas
atlas = Image.new('RGBA', (ATLAS_SIZE, ATLAS_SIZE), (0, 0, 0, 0))

# Get all texture files
texture_dir = 'assets/textures/blocks/'
textures = sorted([f for f in os.listdir(texture_dir) if f.endswith('.png')])

print(f'Found {len(textures)} textures')

# Paste each texture into atlas
for i, filename in enumerate(textures):
    if i >= TILES_PER_ROW * TILES_PER_ROW:
        print(f'Warning: Too many textures! Max is {TILES_PER_ROW * TILES_PER_ROW}')
        break

    # Load and resize texture
    texture_path = os.path.join(texture_dir, filename)
    texture = Image.open(texture_path).convert('RGBA')
    texture = texture.resize((TILE_SIZE, TILE_SIZE), Image.NEAREST)

    # Calculate position in atlas
    x = (i % TILES_PER_ROW) * TILE_SIZE
    y = (i // TILES_PER_ROW) * TILE_SIZE

    # Paste into atlas
    atlas.paste(texture, (x, y))

    print(f'  [{i:3d}] {filename:30s} → ({x:3d}, {y:3d})')

# Save atlas
output_path = 'assets/textures/atlas.png'
atlas.save(output_path)
print(f'\nAtlas saved to {output_path}')

# Generate TypeScript mapping
print('\n// Texture Atlas Mapping')
print('export const TEXTURE_ATLAS_MAP = {')
for i, filename in enumerate(textures[:TILES_PER_ROW * TILES_PER_ROW]):
    name = filename.replace('.png', '').upper()
    print(f'  {name}: {i},')
print('};')
```

**Usage:**
```bash
python create_texture_atlas.py
```

### Workflow 3: Converting FBX to GLB

```bash
# Install Blender command-line tools

# Convert FBX to GLB
blender --background --python fbx_to_glb.py -- input.fbx output.glb
```

**fbx_to_glb.py:**
```python
import bpy
import sys

# Get arguments
argv = sys.argv
argv = argv[argv.index("--") + 1:]
input_file = argv[0]
output_file = argv[1]

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import FBX
bpy.ops.import_scene.fbx(filepath=input_file)

# Export GLB
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    export_animations=True,
    export_apply=True
)

print(f'Converted {input_file} → {output_file}')
```

---

## Legal & Licensing

### License Types Explained

#### CC0 (Public Domain)
- ✅ Use commercially
- ✅ Modify freely
- ✅ No attribution required
- **Best License!**

#### CC-BY (Attribution Required)
- ✅ Use commercially
- ✅ Modify freely
- ⚠️ Must credit creator
- **Example:** "Character by Artist Name (CC-BY)"

#### CC-BY-SA (Share-Alike)
- ✅ Use commercially
- ✅ Modify freely
- ⚠️ Must credit creator
- ⚠️ Derivatives must use same license

#### CC-BY-NC (Non-Commercial)
- ❌ Cannot use commercially
- ✅ Free for hobby projects
- ⚠️ Must credit creator

### Giving Proper Attribution

**In-Game Credits Screen:**
```
CREDITS
-------

3D Models:
- Character models by Mixamo (Adobe)
- Trees by Quaternius (CC0)
- Props by Kenny.nl (CC0)

Textures:
- Block textures by OpenGameArt contributors
- PBR materials by Poly Haven (CC0)

Audio:
- Music by Kevin MacLeod (incompetech.com)
  Licensed under CC-BY 3.0
- Sound effects from Freesound.org

Font:
- Press Start 2P by CodeMan38 (OFL)
```

**In README.md:**
```markdown
## Assets & Attribution

This game uses the following third-party assets:

### 3D Models
- Character rigs: [Mixamo](https://www.mixamo.com) - Adobe
- Animals: [Quaternius](https://quaternius.com) - CC0

### Audio
- Music: ["Cipher" by Kevin MacLeod](https://incompetech.com) - CC-BY 3.0
- SFX: [Freesound.org](https://freesound.org) - Various licenses (see /credits.txt)
```

### Commercial Use Checklist

Before releasing a commercial game:

- [ ] Verify all assets have commercial-friendly licenses
- [ ] Create credits.txt with all attributions
- [ ] Add in-game credits screen
- [ ] Save license files in /licenses/ folder
- [ ] Check Mixamo terms (allowed for commercial)
- [ ] Check font licenses (some prohibit commercial use)
- [ ] Review sound licenses (Freesound varies by sound)

---

## Quick Start Asset Pack

**Minimal Asset Pack for CubeWorld (All Free):**

### 3D Models
- **Characters:** Mixamo (5 characters, 20 animations)
- **Animals:** Quaternius Ultimate Animals (10 animals)
- **Props:** Kenny.nl Prototype Pack

### Textures
- **Blocks:** 50 textures from OpenGameArt
- **Terrain:** 5 PBR sets from Poly Haven

### Audio
- **Music:** 3 tracks from Kevin MacLeod
- **SFX:** 20 sounds from Freesound

**Total Cost:** $0
**Total Download Size:** ~500MB
**Total Setup Time:** 2-3 hours

---

## Advanced Resources

### Shader Resources

**1. ShaderToy**
- **URL:** https://www.shadertoy.com
- **Use For:** Learning GLSL, finding effects
- **Can Port:** Many shaders work in Three.js

**2. The Book of Shaders**
- **URL:** https://thebookofshaders.com
- **Interactive tutorial**

### Procedural Generation

**1. ProcJam Resources**
- **URL:** https://www.procjam.com/tutorials
- **Topics:** World generation, dungeons, caves

**2. Wave Function Collapse**
- **URL:** https://github.com/mxgmn/WaveFunctionCollapse
- **Use For:** Automatic level generation

---

## Conclusion

This guide provides everything you need to create a fully-featured voxel game with professional-quality assets, all available for free or at low cost.

**Next Steps:**
1. Download asset pack recommendations
2. Set up tools (Blender, Audacity)
3. Follow workflows to integrate assets
4. Build something amazing! 🚀

**Questions?** Check the [Learning Resources](#learning-resources) section or ask in the Three.js community!
