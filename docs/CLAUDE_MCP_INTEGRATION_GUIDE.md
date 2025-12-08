# CubeWorld: Claude Code & MCP Integration Guide

**Using AI to Supercharge Your Game Development**

---

## Table of Contents

1. [Introduction to MCP](#introduction-to-mcp)
2. [Setting Up MCP for CubeWorld](#setting-up-mcp-for-cubeworld)
3. [Use Case 1: Structure Generation](#use-case-1-structure-generation)
4. [Use Case 2: Quest & Dialogue System](#use-case-2-quest--dialogue-system)
5. [Use Case 3: Procedural Content Pipeline](#use-case-3-procedural-content-pipeline)
6. [Use Case 4: Game Data Management](#use-case-4-game-data-management)
7. [Use Case 5: Analytics & Balancing](#use-case-5-analytics--balancing)
8. [Claude Skills Integration](#claude-skills-integration)
9. [Best Practices](#best-practices)
10. [Example Prompts](#example-prompts)

---

## Introduction to MCP

### What is MCP?

**Model Context Protocol (MCP)** is a standard that lets AI assistants like Claude interact with your development tools:

- **Read/write files** (save game data, load configurations)
- **Query databases** (analytics, leaderboards, player stats)
- **Fetch web resources** (download textures, check documentation)
- **Execute commands** (build scripts, tests, deployments)

### Why Use MCP with CubeWorld?

**Traditional Development:**
```
You: "I need to create 50 different tree structures"
↓
You manually code each one → 5 hours of work
```

**With MCP + Claude:**
```
You: "Generate 50 unique tree structures in different styles"
↓
Claude uses MCP to generate JSON files → 5 minutes
```

### MCP vs Direct API Calls

| Feature | MCP | Direct API |
|---------|-----|------------|
| **File Access** | ✅ Direct read/write | ❌ Must copy-paste |
| **Database** | ✅ Query SQLite | ❌ Manual export |
| **Persistence** | ✅ Saves between sessions | ❌ Starts fresh |
| **Context** | ✅ Knows your project structure | ❌ Generic responses |

---

## Setting Up MCP for CubeWorld

### Prerequisites

```bash
# Node.js 18+ required
node --version  # Should be v18 or higher

# Install Claude Desktop (if not installed)
# Download from: https://claude.ai/desktop
```

### Step 1: Install MCP Servers

```bash
# Create MCP configuration directory
mkdir -p ~/.config/claude/

# Install useful MCP servers
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-sqlite
npm install -g @modelcontextprotocol/server-fetch
```

### Step 2: Configure Claude Desktop

Create or edit `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/seinoh/Desktop/github/cubeworld"
      ]
    },
    "gamedata": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/seinoh/Desktop/github/cubeworld/game-data"
      ]
    },
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "--db-path",
        "/Users/seinoh/Desktop/github/cubeworld/cubeworld.db"
      ]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### Step 3: Create Game Data Directory

```bash
cd /Users/seinoh/Desktop/github/cubeworld
mkdir -p game-data/{structures,quests,dialogues,items,recipes}
```

### Step 4: Initialize Database

```sql
-- cubeworld.db schema

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    playtime_seconds INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS player_stats (
    player_id INTEGER,
    stat_name TEXT,
    stat_value INTEGER,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS world_data (
    world_id INTEGER PRIMARY KEY,
    world_name TEXT,
    seed INTEGER,
    created_at TIMESTAMP,
    size_chunks INTEGER
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT,
    event_data TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_catalog (
    item_id INTEGER PRIMARY KEY,
    item_name TEXT,
    item_type TEXT,
    rarity TEXT,
    properties TEXT -- JSON
);
```

### Step 5: Verify Setup

Restart Claude Desktop, then ask:

```
Claude, can you:
1. List files in my CubeWorld project
2. Read the package.json
3. Query the cubeworld.db to show all tables
```

If all works, you're ready! ✅

---

## Use Case 1: Structure Generation

### Goal: Generate 50 Unique Buildings

#### Prompt to Claude:

```
I need you to generate 50 unique building structures for my voxel game CubeWorld.

Requirements:
- Output format: JSON files in game-data/structures/
- Each file should follow this schema:

{
  "name": "Structure Name",
  "category": "house" | "tower" | "castle" | "shop" | "decoration",
  "size": { "x": number, "y": number, "z": number },
  "blocks": [
    { "x": number, "y": number, "z": number, "type": "BlockType" }
  ],
  "spawnRules": {
    "biomes": ["plains", "forest", "desert"],
    "minDistance": 50,
    "spawnChance": 0.1
  }
}

Available block types: GRASS, DIRT, STONE, SAND, WOOD, PLANK, BRICK, GLASS, COBBLESTONE

Building categories (10 each):
1. Small houses (5x5x5 to 10x8x10)
2. Towers (3x3x20 to 5x5x30)
3. Castles (20x15x20 to 40x20x40)
4. Shops (8x6x8 to 12x8x12)
5. Decorations (fountains, statues, wells)

Make them varied and creative!
```

#### Claude's Response (via MCP):

Claude will:
1. Generate 50 structure definitions
2. Save them to `game-data/structures/house_001.json` through `decoration_010.json`
3. Validate JSON syntax
4. Provide summary statistics

#### Loading Structures in Game:

```typescript
// src/structures/StructureLoader.ts
export class StructureLoader {
  private structures: Map<string, Structure> = new Map();

  async loadAll(): Promise<void> {
    const response = await fetch('/game-data/structures/');
    const files = await response.json();

    for (const file of files) {
      if (file.endsWith('.json')) {
        const structure = await fetch(`/game-data/structures/${file}`).then(r => r.json());
        this.structures.set(structure.name, structure);
      }
    }

    console.log(`Loaded ${this.structures.size} structures`);
  }

  getByCategory(category: string): Structure[] {
    return Array.from(this.structures.values())
      .filter(s => s.category === category);
  }

  getRandom(): Structure {
    const all = Array.from(this.structures.values());
    return all[Math.floor(Math.random() * all.length)];
  }
}
```

---

## Use Case 2: Quest & Dialogue System

### Goal: Create RPG-Style Quest System

#### Prompt to Claude:

```
Generate a quest system for CubeWorld with 20 quests across 4 difficulty tiers.

Quest Schema:
{
  "id": "quest_001",
  "title": "Quest Title",
  "description": "Quest description",
  "difficulty": "easy" | "medium" | "hard" | "expert",
  "objectives": [
    {
      "type": "collect" | "build" | "explore" | "defeat",
      "target": "item_name" | "structure_name" | "location" | "mob_type",
      "count": number,
      "description": "Objective text"
    }
  ],
  "rewards": {
    "experience": number,
    "items": [
      { "type": "ItemType", "count": number }
    ]
  },
  "prerequisites": ["quest_id"] | [],
  "npcGiver": "NPC name",
  "dialogue": {
    "initial": "Quest offer dialogue",
    "accepted": "After accepting",
    "inProgress": "Reminder dialogue",
    "completed": "Completion dialogue"
  }
}

Quest Ideas:
- Tutorial quests (gather resources, build first house)
- Exploration quests (find biomes, discover structures)
- Collection quests (gather rare blocks, mine ores)
- Building quests (construct specific structures)
- Combat quests (defeat hostile mobs)

Save to: game-data/quests/
```

#### Example Generated Quest:

```json
{
  "id": "quest_001",
  "title": "First Steps",
  "description": "Gather basic resources to start your journey",
  "difficulty": "easy",
  "objectives": [
    {
      "type": "collect",
      "target": "WOOD",
      "count": 10,
      "description": "Collect 10 wood blocks"
    },
    {
      "type": "collect",
      "target": "STONE",
      "count": 20,
      "description": "Mine 20 stone blocks"
    }
  ],
  "rewards": {
    "experience": 100,
    "items": [
      { "type": "WOODEN_PICKAXE", "count": 1 }
    ]
  },
  "prerequisites": [],
  "npcGiver": "Village Elder",
  "dialogue": {
    "initial": "Ah, a new adventurer! I could use someone with your energy. Our village needs basic resources. Can you help?",
    "accepted": "Excellent! Gather some wood from the forest and mine stone from the nearby hills. Come back when you're done.",
    "inProgress": "Making progress? Wood and stone are what we need most right now.",
    "completed": "Wonderful work! You're a natural. Here, take this pickaxe - you've earned it."
  }
}
```

#### Implementing Quest System:

```typescript
// src/quests/QuestManager.ts
export class QuestManager {
  private allQuests: Quest[] = [];
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();

  async loadQuests(): Promise<void> {
    const files = await this.fetchQuestFiles();

    for (const file of files) {
      const quest = await fetch(`/game-data/quests/${file}`).then(r => r.json());
      this.allQuests.push(quest);
    }
  }

  getAvailableQuests(): Quest[] {
    return this.allQuests.filter(quest => {
      // Not already active or completed
      if (this.activeQuests.has(quest.id) || this.completedQuests.has(quest.id)) {
        return false;
      }

      // Check prerequisites
      if (quest.prerequisites.length > 0) {
        return quest.prerequisites.every(prereq => this.completedQuests.has(prereq));
      }

      return true;
    });
  }

  acceptQuest(questId: string): void {
    this.activeQuests.add(questId);
    this.saveProgress();
  }

  updateProgress(questId: string, objectiveIndex: number, progress: number): void {
    // Track objective completion
  }

  completeQuest(questId: string): void {
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);

    const quest = this.allQuests.find(q => q.id === questId);
    if (quest) {
      this.grantRewards(quest.rewards);
    }

    this.saveProgress();
  }

  private grantRewards(rewards: QuestRewards): void {
    // Add experience
    player.addExperience(rewards.experience);

    // Add items to inventory
    for (const item of rewards.items) {
      inventory.addItem(item.type, item.count);
    }
  }
}
```

---

## Use Case 3: Procedural Content Pipeline

### Goal: Generate Balanced Item System

#### Prompt to Claude:

```
Create a complete item system for CubeWorld with 100+ items across these categories:

1. Tools (pickaxes, axes, shovels) - 20 items
   - Tiers: Wood, Stone, Iron, Gold, Diamond
   - Properties: durability, mining speed, damage

2. Weapons (swords, bows, magic staves) - 30 items
   - Types: Melee, ranged, magic
   - Properties: damage, attack speed, special effects

3. Armor (helmets, chestplates, leggings, boots) - 40 items
   - Sets: Leather, Chainmail, Iron, Diamond, Enchanted
   - Properties: defense, durability, bonuses

4. Consumables (food, potions) - 30 items
   - Food: restore hunger
   - Potions: buffs/healing

5. Materials (crafting components) - 50 items

Output Schema:
{
  "itemId": number,
  "name": "Item Name",
  "category": "tool" | "weapon" | "armor" | "consumable" | "material",
  "tier": "common" | "uncommon" | "rare" | "epic" | "legendary",
  "properties": {
    "durability": number,
    "damage": number,
    "defense": number,
    "stackSize": number,
    "craftable": boolean,
    "effects": []
  },
  "recipe": {
    "ingredients": [
      { "item": "WOOD", "count": 3 }
    ],
    "output": 1
  },
  "lore": "Flavor text"
}

Balance guidelines:
- Higher tiers should be significantly better but harder to obtain
- Crafting recipes should make sense (wood tools need wood, etc.)
- Stack sizes: tools/armor = 1, materials = 64, food = 16

Save to: game-data/items/
```

#### Using Generated Items:

```typescript
// src/items/ItemRegistry.ts
export class ItemRegistry {
  private static items: Map<number, Item> = new Map();

  static async loadItems(): Promise<void> {
    const categories = ['tools', 'weapons', 'armor', 'consumables', 'materials'];

    for (const category of categories) {
      const files = await fetch(`/game-data/items/${category}/`).then(r => r.json());

      for (const file of files) {
        const item = await fetch(`/game-data/items/${category}/${file}`).then(r => r.json());
        this.items.set(item.itemId, item);
      }
    }
  }

  static getItem(itemId: number): Item | undefined {
    return this.items.get(itemId);
  }

  static getItemsByTier(tier: ItemTier): Item[] {
    return Array.from(this.items.values()).filter(item => item.tier === tier);
  }

  static getCraftableItems(): Item[] {
    return Array.from(this.items.values()).filter(item => item.properties.craftable);
  }
}
```

---

## Use Case 4: Game Data Management

### Tracking Player Analytics with MCP + SQLite

#### Prompt to Claude:

```
Using the MCP SQLite server, help me:

1. Track player statistics:
   - Total blocks placed/broken
   - Distance traveled
   - Time played
   - Mobs defeated
   - Items crafted

2. Generate a daily analytics report showing:
   - Most popular blocks
   - Average session length
   - Player progression (levels gained)

3. Create a function to query top players by experience
```

#### Claude's Response (via MCP):

```typescript
// Generated by Claude using MCP

// Track event
export function trackEvent(eventType: string, eventData: object): void {
  const query = `
    INSERT INTO analytics_events (event_type, event_data)
    VALUES (?, ?)
  `;

  db.run(query, [eventType, JSON.stringify(eventData)]);
}

// Usage in game
voxelWorld.on('blockPlaced', (block) => {
  trackEvent('block_placed', {
    blockType: block.type,
    position: { x: block.x, y: block.y, z: block.z },
    timestamp: Date.now()
  });
});

// Query analytics
export async function getDailyReport(): Promise<AnalyticsReport> {
  const blocksPlaced = await db.get(`
    SELECT COUNT(*) as count
    FROM analytics_events
    WHERE event_type = 'block_placed'
    AND timestamp > datetime('now', '-1 day')
  `);

  const topBlocks = await db.all(`
    SELECT
      json_extract(event_data, '$.blockType') as block_type,
      COUNT(*) as count
    FROM analytics_events
    WHERE event_type = 'block_placed'
    AND timestamp > datetime('now', '-1 day')
    GROUP BY block_type
    ORDER BY count DESC
    LIMIT 10
  `);

  return {
    totalBlocksPlaced: blocksPlaced.count,
    topBlocks: topBlocks
  };
}
```

---

## Use Case 5: Analytics & Balancing

### AI-Powered Game Balancing

#### Prompt to Claude:

```
Analyze the current item database and suggest balance changes.

Using MCP, read all item files and:
1. Check for power creep (items that make others obsolete)
2. Identify crafting recipes that are too cheap/expensive
3. Suggest difficulty progression improvements
4. Generate balance patch notes

Consider:
- Iron pickaxe should be ~2x better than stone
- Diamond should be rare and expensive
- Early-game items should be accessible
- Late-game items should feel rewarding
```

#### Claude's Analysis:

```markdown
# Balance Analysis Report

## Issues Found:

### 1. Power Creep
- **Diamond Pickaxe** (durability: 10000, speed: 10x)
  vs **Iron Pickaxe** (durability: 500, speed: 5x)

  **Problem:** Diamond is 20x better but only 3x harder to obtain

  **Suggestion:**
  - Diamond: durability 5000, speed 7x
  - Iron: durability 1000, speed 5x

### 2. Crafting Imbalance
- **Iron Sword** requires 2 iron, deals 10 damage
- **Iron Pickaxe** requires 3 iron, deals 5 damage

  **Problem:** Pickaxe costs more but weaker in combat

  **Suggestion:** Pickaxe should require 2 iron (it's a tool, not weapon)

### 3. Missing Progression
- **Gap between Stone (tier 2) and Iron (tier 3)**

  **Suggestion:** Add Bronze tier (requires copper + tin)

## Recommended Changes:

```json
{
  "balancePatches": [
    {
      "item": "diamond_pickaxe",
      "changes": {
        "durability": "10000 → 5000",
        "miningSpeed": "10x → 7x"
      },
      "reason": "Too powerful relative to cost"
    }
  ]
}
```
```

---

## Claude Skills Integration

### Creating Custom Skills for CubeWorld

#### Skill 1: Structure Validator

**File:** `.claude/skills/validate-structure.md`

```markdown
# Validate Structure

When the user provides a structure JSON file, validate it:

1. Check schema correctness
2. Ensure all block types exist
3. Verify size constraints (max 100x100x100)
4. Check for floating blocks
5. Suggest optimizations

Example:
User: "Validate game-data/structures/castle_001.json"

Response format:
✅ Schema valid
✅ Block types valid
⚠️  Size: 45x30x45 (OK, but large)
❌ Found 12 floating blocks at positions: [(5,10,3), ...]
💡 Suggestion: Add support columns or reduce overhang
```

#### Skill 2: Loot Table Generator

**File:** `.claude/skills/generate-loot-tables.md`

```markdown
# Generate Loot Tables

Create balanced loot tables for chests, mobs, and structures.

Input parameters:
- Location type (dungeon, house, treasure)
- Difficulty level (1-10)
- Number of items (1-10)
- Rarity distribution

Output JSON:
{
  "lootTable": "dungeon_common",
  "rolls": 3,
  "items": [
    {
      "item": "IRON_SWORD",
      "weight": 10,
      "countRange": [1, 1]
    },
    {
      "item": "GOLD_NUGGET",
      "weight": 5,
      "countRange": [1, 3]
    }
  ]
}
```

#### Using Skills:

```
You: /generate-loot-tables

Claude: I'll generate loot tables for your game. What type of loot table do you need?

You: Create a loot table for a desert temple treasure chest, difficulty 7, 5-8 items, focus on rare/epic tier

Claude: [Generates balanced loot table and saves to game-data/loot-tables/desert_temple_treasure.json]
```

---

## Best Practices

### 1. Version Control Generated Content

```bash
# .gitignore
game-data/generated/  # Don't commit AI-generated drafts

# But DO commit reviewed content:
game-data/structures/  # Reviewed structures
game-data/quests/      # Reviewed quests
```

### 2. Validate AI Output

```typescript
// Always validate generated JSON
import Ajv from 'ajv';

const ajv = new Ajv();
const schema = {
  type: 'object',
  required: ['name', 'size', 'blocks'],
  properties: {
    name: { type: 'string' },
    size: {
      type: 'object',
      required: ['x', 'y', 'z'],
      properties: {
        x: { type: 'number', minimum: 1, maximum: 100 },
        y: { type: 'number', minimum: 1, maximum: 100 },
        z: { type: 'number', minimum: 1, maximum: 100 }
      }
    },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['x', 'y', 'z', 'type']
      }
    }
  }
};

const validate = ajv.compile(schema);

if (!validate(generatedStructure)) {
  console.error('Invalid structure:', validate.errors);
}
```

### 3. Iterate and Refine

```
First pass: "Generate 10 house structures"
Review: Houses are too similar

Second pass: "Generate 10 houses with different architectural styles: medieval, modern, fantasy, futuristic, rustic"
Review: Better variety, but sizes inconsistent

Third pass: "Generate 10 houses, sizes 8x6x8 to 12x8x12, styles: medieval (3), modern (2), fantasy (2), futuristic (2), rustic (1)"
Result: Perfect! ✅
```

### 4. Combine AI with Procedural

```typescript
// AI generates templates
const houseTemplate = loadAIGeneratedStructure('medieval_house_01');

// Procedural system adds variation
function generateHouseVariant(template: Structure): Structure {
  const variant = cloneStructure(template);

  // Randomize roof color
  variant.blocks
    .filter(b => b.y > template.size.y - 3)
    .forEach(b => {
      b.type = randomChoice([BlockType.BRICK, BlockType.WOOD, BlockType.TILE]);
    });

  // Add random decorations
  if (Math.random() > 0.5) {
    addChimney(variant);
  }

  return variant;
}
```

---

## Example Prompts

### Content Generation

```
1. "Generate 20 biome definitions with temperature, humidity, vegetation, and terrain parameters"

2. "Create a tech tree for CubeWorld with 50 craftable items showing prerequisites"

3. "Generate 100 unique block names and colors for a fantasy theme"

4. "Create 30 NPC characters with names, personalities, and dialogue variations"

5. "Generate a dungeon layout system with rooms, corridors, and treasure placement"
```

### Code Generation

```
6. "Create a particle system for block breaking effects in Three.js"

7. "Implement A* pathfinding for NPC movement in voxel grid"

8. "Generate a shader for animated water blocks with reflections"

9. "Create a save/load system using IndexedDB with compression"

10. "Implement a chunk streaming system for infinite worlds"
```

### Analysis & Optimization

```
11. "Analyze my VoxelWorld.ts and suggest performance optimizations"

12. "Review my inventory system and identify potential bugs"

13. "Compare greedy meshing vs naive meshing and show performance difference"

14. "Suggest improvements to my entity update loop"

15. "Find memory leaks in my mesh disposal code"
```

### Documentation

```
16. "Generate JSDoc comments for all functions in VoxelToolSystem.ts"

17. "Create API documentation for my multiplayer networking module"

18. "Write a tutorial for adding new block types"

19. "Generate a changelog from git commits this month"

20. "Create user documentation for game controls and features"
```

---

## Advanced: Custom MCP Server

### Building a CubeWorld-Specific MCP Server

```typescript
// cubeworld-mcp-server.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'cubeworld-tools',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Generate Structure
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'generate_structure') {
    const { structureType, size } = request.params.arguments;

    // Your custom structure generation logic
    const structure = generateStructure(structureType, size);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(structure, null, 2),
        },
      ],
    };
  }
});

// Tool: Validate World
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'validate_world') {
    const { worldPath } = request.params.arguments;

    const issues = await validateWorldData(worldPath);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${issues.length} issues:\n${issues.join('\n')}`,
        },
      ],
    };
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_structure',
        description: 'Generate voxel structure based on type and size',
        inputSchema: {
          type: 'object',
          properties: {
            structureType: {
              type: 'string',
              description: 'Type: house, tower, castle, etc.',
            },
            size: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
                z: { type: 'number' },
              },
            },
          },
        },
      },
      {
        name: 'validate_world',
        description: 'Validate world data for errors',
        inputSchema: {
          type: 'object',
          properties: {
            worldPath: {
              type: 'string',
              description: 'Path to world save file',
            },
          },
        },
      },
    ],
  };
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
```

**Add to claude_desktop_config.json:**

```json
{
  "mcpServers": {
    "cubeworld": {
      "command": "node",
      "args": ["/path/to/cubeworld-mcp-server.js"]
    }
  }
}
```

---

## Conclusion

By integrating Claude Code with MCP, you can:

- ✅ **Generate content 100x faster** (structures, quests, items)
- ✅ **Automate repetitive tasks** (data validation, formatting)
- ✅ **Analyze game balance** (detect issues, suggest fixes)
- ✅ **Manage game data** (SQLite queries, file operations)
- ✅ **Write better code** (reviews, documentation, tests)

**Next Steps:**
1. Set up MCP servers (follow Step 1-5)
2. Try example prompts
3. Create game-data directories
4. Generate your first 10 structures!
5. Build something amazing! 🚀

**Remember:** AI is a tool to augment your creativity, not replace it. Review and refine all generated content before using in production!

---

**Questions?** Experiment with the example prompts and see what Claude can help you build!
