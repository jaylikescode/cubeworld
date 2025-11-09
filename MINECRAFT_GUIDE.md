# 🧱 Minecraft-Style Building Guide

## 🚀 Quick Start

```bash
cd creator-of-worlds
npm run dev
```

Game opens at `http://localhost:3000`

## 🎮 First Steps

### 1. **Understand the World**
- You spawn in a procedurally-generated voxel world
- Terrain has grass, dirt, stone, water, trees, and snow
- Each chunk is 16x64x16 blocks
- World generates 7x7 chunks (49 total)

### 2. **Camera Movement**
- **Right-click + Drag**: Rotate camera around world
- **Mouse Wheel**: Zoom in/out
- **Middle-click + Drag**: Pan camera
- **WASD**: Move camera position
- **R**: Reset camera to default view

### 3. **Block Placement**
1. Select "Place Block" tool (default)
2. Choose a block type (Grass, Dirt, Stone, etc.)
3. Click on any block face where you want to place
4. Black outline shows where block will appear

### 4. **Mining Blocks**
1. Select "Break Block" tool (⛏️)
2. Click on any block to remove it
3. Carve tunnels, create caves, dig holes

### 5. **Painting Blocks**
1. Select "Paint Block" tool (🎨)
2. Choose a new block type
3. Click existing blocks to change their type
4. Great for quick recoloring!

### 6. **Fill Tool**
1. Select "Fill Area" tool (🪣)
2. Choose a block type
3. Click to place blocks in 3-block radius sphere
4. Perfect for quick foundation building

## 🏗️ Building Ideas

### **Simple House**
1. Place grass blocks in 5x5 square (floor)
2. Build wood walls 4 blocks high
3. Fill top with wood (roof)
4. Break one block for door
5. Paint some blocks as windows

### **Underground Base**
1. Select Break tool
2. Dig down into hillside
3. Create large cavern
4. Use Place tool to add stone walls
5. Build rooms and corridors

### **Tower**
1. Place cobblestone in vertical column
2. Build 10-20 blocks high
3. Add floor platforms every 4 blocks
4. Place wood blocks for stairs
5. Snow block on top as flag

### **Bridge**
1. Find two terrain features to connect
2. Use Fill tool with stone
3. Build horizontal path
4. Add wood railings on sides
5. Paint cobblestone for decoration

### **Tree Farm**
1. Flatten area with Break tool
2. Paint grass blocks
3. Natural trees already exist!
4. Build fence with wood blocks
5. Add water pool

### **Castle**
1. Use Fill tool for large stone base
2. Build walls 10+ blocks high
3. Add towers at corners
4. Create battlements with stone
5. Paint cobblestone for texture

## 🎨 Block Type Guide

| Block | Best For | Tips |
|-------|----------|------|
| 🟩 **Grass** | Floors, gardens | Natural looking |
| 🟫 **Dirt** | Underground, paths | Good filler |
| ⬜ **Stone** | Walls, foundations | Strong appearance |
| 🟨 **Sand** | Beaches, deserts | Soft color |
| 💧 **Water** | Pools, decorative | Transparent |
| 🪵 **Wood** | Buildings, floors | Warm tone |
| 🍃 **Leaves** | Roofs, decorative | See-through |
| ❄️ **Snow** | Accents, flags | Bright white |
| 🪨 **Cobblestone** | Refined buildings | Classic look |

## ⚡ Pro Tips

### **Speed Building**
- Use Fill tool for large volumes
- Paint tool for quick texture changes
- Place blocks face-by-face for precision

### **Terrain Shaping**
- Break blocks to flatten areas
- Build up with dirt for elevation
- Paint grass on top for natural look

### **Performance**
- Breaking interior blocks improves FPS (culling)
- Don't place too many transparent blocks
- Regenerate world if FPS drops

### **Creative Techniques**
1. **Layering**: Different blocks for depth
2. **Patterns**: Alternating colors for interest
3. **Shapes**: Think in 3D - spheres, pyramids
4. **Landscape**: Work with natural terrain
5. **Lighting**: Use white blocks for bright areas

## 🌦️ Weather System

- **Toggle Rain**: Adds falling rain particles
- **Toggle Snow**: Adds falling snowflakes
- **Clouds**: Slowly rotate around world
- Weather is visual only (no block changes)

## 🔄 World Generation

### **Regenerate World**
- Click "Regenerate World" button
- Creates completely new terrain
- All placed/removed blocks are reset
- New seed for different landscape

### **What Generates**
- Hills and valleys (continental noise)
- Mountains and peaks (ridged noise)
- Underground stone layers
- Water at sea level (Y=32)
- Snow on high peaks (Y>47)
- Random trees (2% spawn rate)

## 🐛 Troubleshooting

**Can't place blocks?**
- Make sure "Place Block" tool is selected
- Aim at face of existing block
- Black outline shows placement location

**Low FPS?**
- Break some blocks (culling helps)
- Close other browser tabs
- Reduce browser window size
- Try different browser (Chrome/Edge best)

**Block not highlighting?**
- Move closer to terrain
- Aim directly at block face
- Camera might be too far

**Blocks look weird?**
- This is chunk-based rendering
- Surrounded blocks are hidden (culling)
- This is normal and improves performance!

## 🎯 Challenges

### **Beginner**
- [ ] Build a simple 5x5 house
- [ ] Dig a tunnel through a hill
- [ ] Create a 10-block tower
- [ ] Make a bridge between two hills

### **Intermediate**
- [ ] Build a castle with towers
- [ ] Create an underground base
- [ ] Construct a multi-floor building
- [ ] Design a town square

### **Advanced**
- [ ] Pixel art on flat surface
- [ ] Floating island with supports
- [ ] Massive pyramid structure
- [ ] Detailed cathedral/temple

## 🎓 Understanding the System

### **Chunks**
- World divided into 16x64x16 block sections
- Each chunk renders as one instanced mesh
- Breaking/placing updates entire chunk
- 49 chunks total (7x7 grid)

### **Block Coordinates**
- X: East/West
- Y: Up/Down (0=bedrock, 64=max)
- Z: North/South
- Shown in UI when hovering blocks

### **Culling**
- Blocks surrounded on all 6 sides aren't rendered
- This is why interior blocks improve performance
- Only visible faces are drawn

### **Instanced Rendering**
- All blocks of same type share one geometry
- Each block is an "instance" with position/color
- Renders thousands of blocks efficiently

## 🎮 Advanced Controls

### **Camera Precision**
- Hold SHIFT while rotating: Fine control
- WASD: Move to specific positions
- Wheel zoom: Get close for detail work
- R key: Quick reset if lost

### **Tool Switching**
- Click tool buttons in sidebar
- Active tool shown in info panel
- Current block type also shown
- Position updates in real-time

## 🌟 Have Fun!

The only limit is your imagination! Build, mine, explore, and create amazing voxel worlds. Share your creations and see what's possible with web-based Minecraft-style building!

---

**Happy Building!** 🧱✨

