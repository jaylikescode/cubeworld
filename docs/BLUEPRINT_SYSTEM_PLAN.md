# Blueprint Construction System Plan

## 🎯 Overview
This document outlines the plan to implement a **Blueprint System** that allows players to construct complex structures (like Golems, Trees) with a single interaction, rather than block-by-block placement.

## 🛠 Feature Specification

### 1. Data Structure Design
We need to define a static structure format different from the procedural generation logic.

**Target File:** `src/types/StructureTypes.ts` (New file)

```typescript
import { BlockType } from './VoxelTypes';

// Definition of a single block within a structure (Relative Coordinates)
export interface BlueprintBlock {
  x: number; // Relative X from origin
  y: number; // Relative Y from origin
  z: number; // Relative Z from origin
  type: BlockType;
}

// Blueprint Definition
export interface Blueprint {
  id: string;
  name: string;
  icon: string; // Emoji or asset path for UI
  blocks: BlueprintBlock[];
  origin: { x: number, y: number, z: number }; // Pivot point (usually bottom center)
}
```

### 2. Blueprints Data (Presets)
Initial implementation will include Iron Golem and Oak Tree.

**Target File:** `src/data/Blueprints.ts` (New file)

```typescript
export const BLUEPRINTS: Record<string, Blueprint> = {
  iron_golem: {
    id: 'iron_golem',
    name: 'Iron Golem',
    icon: '🤖',
    origin: { x: 0, y: 0, z: 0 },
    blocks: [
      { x: 0, y: 0, z: 0, type: BlockType.IRON_BLOCK }, // Legs
      { x: 0, y: 1, z: 0, type: BlockType.IRON_BLOCK }, // Body
      { x: -1, y: 1, z: 0, type: BlockType.IRON_BLOCK }, // Left Arm
      { x: 1, y: 1, z: 0, type: BlockType.IRON_BLOCK }, // Right Arm
      { x: 0, y: 2, z: 0, type: BlockType.TORCH }, // Head (Placeholder)
    ]
  },
  oak_tree: {
    id: 'oak_tree',
    name: 'Oak Tree',
    icon: '🌳',
    origin: { x: 0, y: 0, z: 0 },
    blocks: [
      // Trunk
      { x: 0, y: 0, z: 0, type: BlockType.OAK_LOG },
      { x: 0, y: 1, z: 0, type: BlockType.OAK_LOG },
      { x: 0, y: 2, z: 0, type: BlockType.OAK_LOG },
      { x: 0, y: 3, z: 0, type: BlockType.OAK_LOG },
      // Leaves
      { x: 1, y: 2, z: 0, type: BlockType.OAK_LEAVES },
      { x: -1, y: 2, z: 0, type: BlockType.OAK_LEAVES },
      { x: 0, y: 2, z: 1, type: BlockType.OAK_LEAVES },
      { x: 0, y: 2, z: -1, type: BlockType.OAK_LEAVES },
      { x: 0, y: 4, z: 0, type: BlockType.OAK_LEAVES }, // Top
    ]
  }
};
```

### 3. UI/UX Design

#### Mobile Bottom Navigation
- **Action:** Add a `Craft` (🛠️) button to `MobileBottomNav`.
- **Location:** Next to `Place` and `Break` buttons.

#### Mobile Craft Sheet
- **Component:** `MobileCraftSheet` (New component, based on `MobileBlockSheet`).
- **Behavior:**
  - Clicking `Craft` button opens this sheet.
  - Displays a grid of available blueprints (Golem, Tree).
  - Selecting a blueprint closes the sheet and sets `ToolMode` to `blueprint`.

### 4. Core Logic Implementation

#### VoxelToolSystem Update
- **New ToolMode:** Add `blueprint` to `ToolMode` type.
- **State:** Track the currently selected `activeBlueprint`.
- **Placement Logic:**
  1. Detect user touch/click on a block face.
  2. Calculate absolute world coordinates for each block in the blueprint relative to the clicked position.
  3. Iterate through `activeBlueprint.blocks` and call `VoxelWorld.setBlock()` for each.

## 📅 Development Roadmap

1.  **Step 1: Data Definition**
    - Create `src/types/StructureTypes.ts`
    - Create `src/data/Blueprints.ts`
    
2.  **Step 2: UI Implementation**
    - Update `MobileBottomNav.ts` to include the 'Craft' button.
    - Create `MobileCraftSheet.ts` for blueprint selection.

3.  **Step 3: System Integration**
    - Update `VoxelTypes.ts` to include `blueprint` ToolMode.
    - Update `VoxelToolSystem.ts` to handle blueprint placement logic.

