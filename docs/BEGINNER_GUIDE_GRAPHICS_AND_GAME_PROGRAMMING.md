# CubeWorld: Graphics and Game Programming for Beginners

**For Ages 10 and Up!** 🎮✨

---

## Welcome, Young Game Developer! 👋

This guide will teach you how to make your own 3D block game like Minecraft! Don't worry if you've never coded before - we'll explain everything step by step.

---

## Table of Contents

1. [What is 3D Graphics?](#what-is-3d-graphics)
2. [How CubeWorld Works](#how-cubeworld-works)
3. [Making Your First Block](#making-your-first-block)
4. [Creating Cool Structures](#creating-cool-structures)
5. [Adding Characters and Animals](#adding-characters-and-animals)
6. [Making It Look Better (Graphics)](#making-it-look-better-graphics)
7. [Fun Projects to Try](#fun-projects-to-try)
8. [Troubleshooting (When Things Go Wrong)](#troubleshooting)

---

## What is 3D Graphics?

### The Magic of 3D

Imagine you're making a sculpture out of LEGO blocks. You can see it from different angles, walk around it, and it looks real!

**3D graphics on a computer works the same way:**
- We create shapes using **triangles** (the computer's LEGO blocks)
- We put **colors** and **pictures** (textures) on them
- We add **lights** so they look realistic
- We use a **camera** to look at them from different angles

### How Your Computer Draws 3D

```
1. Create Shapes (Geometry)
   ↓
2. Add Colors/Textures (Materials)
   ↓
3. Position Lights (Lighting)
   ↓
4. Look Through Camera (Viewing)
   ↓
5. Computer Calculates (Rendering)
   ↓
6. You See It On Screen! ✨
```

---

## How CubeWorld Works

### The Big Picture

CubeWorld is like building with magical LEGO blocks that:
- Generate themselves automatically
- Remember where they are
- Know if they're visible or hidden
- Can change into different types

### The Three Main Parts

#### 1. The World (VoxelWorld)

Think of the world like a giant 3D grid, like a Rubik's cube but HUGE!

```
Each "chunk" is a piece of the world:
┌─────────────────┐
│ □ □ □ □ □ □ □ □ │  ← 16 blocks wide
│ □ □ □ □ □ □ □ □ │
│ □ □ □ □ □ □ □ □ │
│ □ □ □ □ □ □ □ □ │
│ □ □ □ □ □ □ □ □ │  ← 64 blocks tall
│ □ □ □ □ □ □ □ □ │
│ □ □ □ □ □ □ □ □ │
│ □ □ □ □ □ □ □ □ │
└─────────────────┘
     16 blocks deep
```

**Why chunks?**
- Your computer can't draw EVERYTHING at once (it would be too slow!)
- Chunks let us draw only the parts you can see
- It's like only opening the LEGO boxes you're using right now

#### 2. The Renderer (Drawing System)

This is like a super-fast artist that draws 60 pictures per second!

```
Every 1/60th of a second:
1. Check what the camera can see
2. Draw all the blocks in view
3. Add shadows and light
4. Show it on your screen
5. Repeat!
```

#### 3. The Tools (VoxelToolSystem)

Tools let you:
- **Place blocks** - like placing LEGO bricks
- **Break blocks** - like removing LEGO bricks
- **Paint blocks** - like coloring LEGO bricks
- **Fill areas** - like using a bucket of LEGO bricks

---

## Making Your First Block

### Step 1: Understanding Block Types

Every block in CubeWorld has:
- **A number** (its ID)
- **A name** (what it's called)
- **A color** (what it looks like)

Let's make a **DIAMOND BLOCK**! 💎

### Step 2: Add It to the Code

Open `src/types/VoxelTypes.ts` and find where all the blocks are listed:

```typescript
// BEFORE (what you see now):
export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  // ... more blocks ...
  BEDROCK = 10,
}

// AFTER (add your diamond block):
export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  // ... more blocks ...
  BEDROCK = 10,
  DIAMOND = 11,  // ← Your new block!
}
```

### Step 3: Give It a Color

Find the `BLOCK_TYPES` object and add:

```typescript
export const BLOCK_TYPES: Record<BlockType, BlockData> = {
  // ... existing blocks ...

  [BlockType.DIAMOND]: {
    type: BlockType.DIAMOND,
    name: 'Diamond',
    color: new THREE.Color(0x00ffff), // Cyan blue color!
  },
};
```

### Step 4: Add a Button to Select It

Open `index.html` and find the block selector section:

```html
<!-- Existing buttons -->
<button data-block="10" title="Bedrock">⬛</button>

<!-- Add your button -->
<button data-block="11" title="Diamond">💎</button>
```

### Step 5: Try It!

1. Save all files
2. Run `npm run dev` in terminal
3. Click your diamond button
4. Click on the world to place diamond blocks!
5. You did it! 🎉

---

## Creating Cool Structures

### What is a Structure?

A structure is a pre-built building or object, like:
- A house 🏠
- A tree 🌳
- A castle 🏰
- A spaceship 🚀

### Let's Build a Simple House!

#### Step 1: Plan Your House

Draw it on paper first:
```
Top view:
□ □ □ □ □  ← 5 blocks wide
□       □  ← Walls with empty middle
□   D   □  ← D = door
□       □
□ □ □ □ □  ← 5 blocks deep
```

Side view:
```
    R R R R R  ← R = roof
    □ □ □ □ □  ← Walls (4 blocks tall)
    □       □
    □   D   □
    □   D   □
```

#### Step 2: Write the Code

Create a new file `src/structures/SimpleHouse.ts`:

```typescript
import { BlockType } from '../types/VoxelTypes';

export function createSimpleHouse() {
  const blocks = [];

  // Floor (y = 0)
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      blocks.push({
        x: x,
        y: 0,
        z: z,
        type: BlockType.PLANK, // Wooden floor
      });
    }
  }

  // Walls (y = 1 to 4)
  for (let y = 1; y <= 4; y++) {
    // Front wall
    for (let x = 0; x < 5; x++) {
      // Skip middle for door
      if (y <= 2 && x === 2) continue;

      blocks.push({ x, y, z: 0, type: BlockType.PLANK });
    }

    // Back wall
    for (let x = 0; x < 5; x++) {
      blocks.push({ x, y, z: 4, type: BlockType.PLANK });
    }

    // Left wall
    for (let z = 1; z < 4; z++) {
      blocks.push({ x: 0, y, z, type: BlockType.PLANK });
    }

    // Right wall
    for (let z = 1; z < 4; z++) {
      blocks.push({ x: 4, y, z, type: BlockType.PLANK });
    }
  }

  // Roof (y = 5)
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      blocks.push({ x, y: 5, z, type: BlockType.BRICK });
    }
  }

  return {
    name: 'Simple House',
    size: { x: 5, y: 6, z: 5 },
    blocks: blocks,
  };
}
```

#### Step 3: Place Your House in the World

Add a button to spawn the house:

```html
<button id="spawn-house">🏠 Build House</button>
```

Add JavaScript to handle it:

```typescript
document.getElementById('spawn-house')?.addEventListener('click', () => {
  const house = createSimpleHouse();

  // Place at camera position
  const playerX = Math.floor(camera.position.x);
  const playerZ = Math.floor(camera.position.z);
  const groundY = findGroundLevel(playerX, playerZ);

  // Build the house!
  for (const block of house.blocks) {
    voxelWorld.setBlock(
      playerX + block.x,
      groundY + block.y,
      playerZ + block.z,
      block.type
    );
  }

  console.log('House built! 🏠');
});
```

---

## Adding Characters and Animals

### Making a Simple Cow 🐄

Characters and animals are made of **boxes**, just like blocks!

#### The Cow's Body Parts

```
    Head       ← Small box
     □
    Body      ← Bigger box
   □□□□
  Legs Legs   ← 4 tiny boxes
  □□  □□
```

#### The Code

```typescript
export class Cow {
  createModel() {
    const cow = new THREE.Group(); // Container for all parts

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.0, 0.8, 1.6);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.0; // Height from ground
    cow.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.0, 1.0); // In front of body
    cow.add(head);

    // Legs (4 corners)
    const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 }); // Dark brown

    const legPositions = [
      [-0.3, 0.4, 0.6],  // Front-left
      [0.3, 0.4, 0.6],   // Front-right
      [-0.3, 0.4, -0.6], // Back-left
      [0.3, 0.4, -0.6],  // Back-right
    ];

    for (const pos of legPositions) {
      const leg = new THREE.Mesh(legGeometry, legMaterial.clone());
      leg.position.set(pos[0], pos[1], pos[2]);
      cow.add(leg);
    }

    return cow;
  }

  // Make the cow walk!
  update(deltaTime) {
    // Move forward slowly
    this.position.z += 0.5 * deltaTime;

    // Simple animation: bob up and down
    this.position.y = 1.0 + Math.sin(Date.now() / 500) * 0.1;
  }
}
```

### Making the Cow Walk Around

```typescript
class Cow {
  constructor() {
    this.position = { x: 0, y: 0, z: 0 };
    this.direction = Math.random() * Math.PI * 2; // Random direction
  }

  update(deltaTime) {
    // Walk in current direction
    this.position.x += Math.cos(this.direction) * 0.5 * deltaTime;
    this.position.z += Math.sin(this.direction) * 0.5 * deltaTime;

    // Sometimes change direction
    if (Math.random() < 0.01) { // 1% chance each frame
      this.direction = Math.random() * Math.PI * 2;
    }

    // Don't walk through blocks!
    const blockAhead = world.getBlock(
      Math.floor(this.position.x),
      Math.floor(this.position.y),
      Math.floor(this.position.z)
    );

    if (blockAhead !== BlockType.AIR) {
      // Hit a wall! Turn around
      this.direction += Math.PI; // Turn 180 degrees
    }
  }
}
```

---

## Making It Look Better (Graphics)

### Adding Textures (Pictures on Blocks)

Instead of solid colors, we can add **textures** - like wallpaper for blocks!

#### What You Need

1. **Image files** (16×16 pixels for best results)
2. **Image editing software** (like Piskel, GIMP, or MS Paint)

#### Creating a Grass Texture

Open your image editor and create a 16×16 pixel image:

```
Top of grass block:
🟩🟩🟩🟩🟩🟩🟩🟩
🟩🟩⬜🟩🟩🟩⬜🟩  ← Light green with white flowers
🟩🟩🟩🟩⬜🟩🟩🟩
🟩⬜🟩🟩🟩🟩🟩🟩
```

Save as `grass_top.png`

#### Loading Textures in Code

```typescript
const textureLoader = new THREE.TextureLoader();

const grassTopTexture = textureLoader.load('assets/textures/grass_top.png');
grassTopTexture.magFilter = THREE.NearestFilter; // Keeps it pixelated (not blurry)

const material = new THREE.MeshLambertMaterial({
  map: grassTopTexture, // Use the texture instead of solid color
});
```

### Making Better Lighting

Lighting makes your game look real! There are different types:

#### 1. Sun Light (Directional)

```typescript
const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(100, 100, 50); // High in the sky
sunLight.castShadow = true; // Creates shadows
```

**What it does:**
- Shines from one direction (like the real sun!)
- Creates shadows
- Makes one side of blocks brighter than others

#### 2. Ambient Light (Fill Light)

```typescript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
```

**What it does:**
- Lights everything equally
- No harsh shadows
- Makes dark areas visible

#### 3. Adding a Day/Night Cycle

```typescript
let timeOfDay = 0; // 0 to 24 hours

function updateDayNight() {
  timeOfDay += 0.01; // Speed of time
  if (timeOfDay >= 24) timeOfDay = 0;

  // Calculate sun position
  const sunAngle = (timeOfDay / 24) * Math.PI * 2;
  const sunX = Math.cos(sunAngle) * 100;
  const sunY = Math.sin(sunAngle) * 100;

  sunLight.position.set(sunX, sunY, 50);

  // Darker at night
  if (timeOfDay >= 18 || timeOfDay < 6) {
    sunLight.intensity = 0.2; // Night
    scene.background = new THREE.Color(0x0a0a1e); // Dark sky
  } else {
    sunLight.intensity = 0.8; // Day
    scene.background = new THREE.Color(0x87ceeb); // Blue sky
  }
}

// Call this every frame
function animate() {
  updateDayNight();
  // ... rest of your game loop
}
```

---

## Fun Projects to Try

### Project 1: Rainbow Road 🌈

Make a colorful path across the sky!

```typescript
function buildRainbowRoad() {
  const colors = [
    BlockType.CONCRETE_RED,
    BlockType.CONCRETE_ORANGE,
    BlockType.CONCRETE_YELLOW,
    BlockType.CONCRETE_GREEN,
    BlockType.CONCRETE_BLUE,
    BlockType.CONCRETE_PURPLE,
  ];

  let colorIndex = 0;
  for (let x = 0; x < 100; x++) {
    const y = 50; // High in the sky
    const z = 0;

    // Change color every 5 blocks
    if (x % 5 === 0) {
      colorIndex = (colorIndex + 1) % colors.length;
    }

    world.setBlock(x, y, z, colors[colorIndex]);
    world.setBlock(x, y, z + 1, colors[colorIndex]); // 2 blocks wide
  }
}
```

### Project 2: Automatic Tree Planter 🌳

Press a button to plant trees all around you!

```typescript
function plantForest(centerX, centerZ, count) {
  for (let i = 0; i < count; i++) {
    // Random position near center
    const x = centerX + Math.random() * 20 - 10;
    const z = centerZ + Math.random() * 20 - 10;
    const y = findGroundLevel(x, z);

    // Only plant on grass
    const groundBlock = world.getBlock(x, y - 1, z);
    if (groundBlock === BlockType.GRASS) {
      plantTree(x, y, z);
    }
  }
}

function plantTree(x, y, z) {
  // Trunk (4 blocks tall)
  for (let i = 0; i < 4; i++) {
    world.setBlock(x, y + i, z, BlockType.WOOD);
  }

  // Leaves (sphere shape)
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = 0; dy <= 2; dy++) {
      for (let dz = -2; dz <= 2; dz++) {
        // Check if inside sphere
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (distance <= 2) {
          world.setBlock(x + dx, y + 4 + dy, z + dz, BlockType.LEAVES);
        }
      }
    }
  }
}
```

### Project 3: Volcano Generator 🌋

Create a volcano that changes height based on a button!

```typescript
function createVolcano(centerX, centerZ, height) {
  const baseRadius = height;

  for (let x = -baseRadius; x <= baseRadius; x++) {
    for (let z = -baseRadius; z <= baseRadius; z++) {
      // Distance from center
      const distance = Math.sqrt(x*x + z*z);

      if (distance <= baseRadius) {
        // Height decreases as we go out
        const blockHeight = Math.floor(height * (1 - distance / baseRadius));

        for (let y = 0; y < blockHeight; y++) {
          let blockType;

          if (y < blockHeight * 0.3) {
            blockType = BlockType.STONE; // Bottom is stone
          } else if (y < blockHeight * 0.8) {
            blockType = BlockType.COBBLESTONE; // Middle
          } else {
            blockType = BlockType.COAL_ORE; // Top looks burnt
          }

          world.setBlock(centerX + x, y, centerZ + z, blockType);
        }
      }
    }
  }

  // Crater at top (remove center blocks)
  const craterRadius = height / 4;
  for (let x = -craterRadius; x <= craterRadius; x++) {
    for (let z = -craterRadius; z <= craterRadius; z++) {
      if (Math.sqrt(x*x + z*z) <= craterRadius) {
        for (let y = height - 5; y < height; y++) {
          world.setBlock(centerX + x, y, centerZ + z, BlockType.AIR);
        }
      }
    }
  }

  // Lava at bottom of crater
  for (let x = -craterRadius; x <= craterRadius; x++) {
    for (let z = -craterRadius; z <= craterRadius; z++) {
      if (Math.sqrt(x*x + z*z) <= craterRadius) {
        world.setBlock(centerX + x, height - 5, centerZ + z, BlockType.LAVA);
      }
    }
  }
}
```

### Project 4: Fireworks Display 🎆

Create particle effects that look like fireworks!

```typescript
class Firework {
  constructor(x, y, z) {
    this.position = { x, y, z };
    this.particles = [];
    this.exploded = false;

    // Create particles
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: Math.random() * 10,
          z: (Math.random() - 0.5) * 10,
        },
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        life: 1.0, // Fades over time
      });
    }
  }

  update(deltaTime) {
    if (!this.exploded) {
      // Rising up
      this.position.y += 10 * deltaTime;

      if (this.position.y > 50) {
        this.exploded = true;
      }
    } else {
      // Update particles
      for (const particle of this.particles) {
        // Gravity
        particle.velocity.y -= 9.8 * deltaTime;

        // Move particle
        particle.position.x += particle.velocity.x * deltaTime;
        particle.position.y += particle.velocity.y * deltaTime;
        particle.position.z += particle.velocity.z * deltaTime;

        // Fade out
        particle.life -= deltaTime;
      }

      // Remove dead particles
      this.particles = this.particles.filter(p => p.life > 0);
    }
  }

  draw() {
    for (const particle of this.particles) {
      // Draw a small cube for each particle
      drawParticle(particle.position, particle.color, particle.life);
    }
  }
}

// Launch fireworks!
function launchFirework() {
  const x = Math.random() * 100;
  const z = Math.random() * 100;
  const firework = new Firework(x, 0, z);
  fireworks.push(firework);
}
```

---

## Troubleshooting

### Problem: My Game is Slow / Laggy

**Possible Causes:**
1. Too many blocks visible
2. Render distance too high
3. Too many particles

**Solutions:**
```typescript
// 1. Reduce render distance
const config = {
  renderDistance: 2, // Instead of 3 or higher
};

// 2. Reduce particle count
const particleCount = 500; // Instead of 1000

// 3. Turn off shadows
renderer.shadowMap.enabled = false;
```

### Problem: Blocks Look Blurry

**Solution:**
```typescript
// Make textures crisp and pixelated
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
```

### Problem: I Can't See Any Blocks!

**Possible Causes:**
1. Camera is inside the ground
2. Blocks are the same color as background
3. No lighting

**Solutions:**
```typescript
// 1. Move camera higher
camera.position.set(0, 50, 0); // High up

// 2. Change background color
scene.background = new THREE.Color(0x87ceeb); // Sky blue

// 3. Add lights
const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
scene.add(sunLight);
```

### Problem: Blocks are Flashing/Flickering

**Cause:** Z-fighting (two surfaces at same position)

**Solution:**
```typescript
// Add tiny offset
block.position.y += 0.001;
```

### Getting Help

1. **Read error messages** in the browser console (press F12)
2. **Google the error** - someone else probably had the same problem!
3. **Ask on forums:**
   - [Three.js Discord](https://discord.gg/HF4UdyF)
   - [Reddit r/threejs](https://reddit.com/r/threejs)
4. **Check the documentation:**
   - [Three.js Docs](https://threejs.org/docs/)
   - [MDN Web Docs](https://developer.mozilla.org/)

---

## Congratulations! 🎉

You've learned:
- ✅ How 3D graphics work
- ✅ How to create new blocks
- ✅ How to build structures
- ✅ How to add characters
- ✅ How to make it look better
- ✅ How to fix problems

### What's Next?

1. **Experiment!** Try changing numbers and see what happens
2. **Combine ideas** - Make a rainbow volcano that shoots fireworks!
3. **Share your creations** - Show friends what you made
4. **Keep learning** - There's always more to discover!

### Advanced Topics to Explore Later

- Multiplayer (playing with friends online)
- Mobile controls (touch screen support)
- Sound effects and music
- Artificial Intelligence (NPCs that think!)
- Shaders (custom visual effects)

---

## Quick Reference

### Common Three.js Shapes

```typescript
// Box (cube)
new THREE.BoxGeometry(width, height, depth)

// Sphere
new THREE.SphereGeometry(radius, segments, segments)

// Cylinder
new THREE.CylinderGeometry(topRadius, bottomRadius, height)

// Plane (flat surface)
new THREE.PlaneGeometry(width, height)
```

### Common Colors

```typescript
0xff0000  // Red
0x00ff00  // Green
0x0000ff  // Blue
0xffff00  // Yellow
0xff00ff  // Magenta
0x00ffff  // Cyan
0xffffff  // White
0x000000  // Black
0x808080  // Gray
0x8b4513  // Brown
0xffa500  // Orange
0x800080  // Purple
```

### Math Helpers

```typescript
// Random number between 0 and 1
Math.random()

// Random integer between min and max
Math.floor(Math.random() * (max - min + 1)) + min

// Distance between two points
Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2)

// Sine wave (smooth up and down)
Math.sin(time)

// Convert degrees to radians
degrees * (Math.PI / 180)
```

---

**Remember:** Every great game developer started exactly where you are now. Keep experimenting, stay curious, and most importantly - have fun! 🚀🎮

**Happy Coding!** 💻✨
