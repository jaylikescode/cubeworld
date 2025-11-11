import * as THREE from 'three';

export enum BlockCategory {
  NATURAL = 0,
  BUILDING = 1,
  MINERAL = 2,
  DECORATION = 3,
  LIQUID = 4,
}

export enum ToolType {
  NONE = 0,
  PICKAXE = 1,
  AXE = 2,
  SHOVEL = 3,
  SWORD = 4,
}

export interface BlockDrop {
  blockType: BlockType;
  quantity: number;
  chance?: number; // 0-1, defaults to 1.0 (100%)
}

export enum BlockType {
  // Air and liquids (0-5)
  AIR = 0,
  WATER = 1,
  LAVA = 2,

  // Natural blocks (3-20)
  GRASS = 3,
  DIRT = 4,
  STONE = 5,
  SAND = 6,
  GRAVEL = 7,
  CLAY = 8,
  SNOW = 9,
  ICE = 10,
  BEDROCK = 11,
  SANDSTONE = 12,
  RED_SAND = 13,
  PODZOL = 14,
  MYCELIUM = 15,
  NETHERRACK = 16,
  END_STONE = 17,
  OBSIDIAN = 18,

  // Wood types (19-25)
  WOOD = 19,
  OAK_LOG = 20,
  BIRCH_LOG = 21,
  SPRUCE_LOG = 22,
  DARK_OAK_LOG = 23,
  ACACIA_LOG = 24,

  // Leaves types (25-30)
  LEAVES = 25,
  OAK_LEAVES = 26,
  BIRCH_LEAVES = 27,
  SPRUCE_LEAVES = 28,
  DARK_OAK_LEAVES = 29,
  ACACIA_LEAVES = 30,

  // Ores (31-40)
  COAL_ORE = 31,
  IRON_ORE = 32,
  GOLD_ORE = 33,
  DIAMOND_ORE = 34,
  EMERALD_ORE = 35,
  REDSTONE_ORE = 36,
  LAPIS_ORE = 37,
  COPPER_ORE = 38,
  QUARTZ_ORE = 39,

  // Mineral blocks (40-45)
  COAL_BLOCK = 40,
  IRON_BLOCK = 41,
  GOLD_BLOCK = 42,
  DIAMOND_BLOCK = 43,
  EMERALD_BLOCK = 44,
  REDSTONE_BLOCK = 45,

  // Building blocks (46-60)
  PLANK = 46,
  OAK_PLANK = 47,
  BIRCH_PLANK = 48,
  SPRUCE_PLANK = 49,
  COBBLESTONE = 50,
  STONE_BRICK = 51,
  BRICK = 52,
  GLASS = 53,
  CONCRETE = 54,
  WHITE_CONCRETE = 55,
  GRAY_CONCRETE = 56,
  BLACK_CONCRETE = 57,
  RED_CONCRETE = 58,
  BLUE_CONCRETE = 59,
  GREEN_CONCRETE = 60,

  // Decoration blocks (61-69)
  FLOWER = 61,
  ROSE = 62,
  DANDELION = 63,
  TULIP = 64,
  MUSHROOM = 65,
  RED_MUSHROOM = 66,
  BROWN_MUSHROOM = 67,
  TORCH = 68,
  LANTERN = 69,
}

export interface BlockData {
  type: BlockType;
  name: string;
  color: THREE.Color;
  transparent?: boolean;
  category: BlockCategory;
  hardness: number; // 0-100, where 100 is unbreakable
  toolRequired?: ToolType; // Tool required to mine efficiently
  drops: BlockDrop[]; // What this block drops when broken
}

export const BLOCK_TYPES: Record<BlockType, BlockData> = {
  // Air and liquids
  [BlockType.AIR]: {
    type: BlockType.AIR,
    name: 'Air',
    color: new THREE.Color(0x000000),
    transparent: true,
    category: BlockCategory.NATURAL,
    hardness: 0,
    drops: [],
  },
  [BlockType.WATER]: {
    type: BlockType.WATER,
    name: 'Water',
    color: new THREE.Color(0x3399ff),
    transparent: true,
    category: BlockCategory.LIQUID,
    hardness: 0,
    drops: [],
  },
  [BlockType.LAVA]: {
    type: BlockType.LAVA,
    name: 'Lava',
    color: new THREE.Color(0xff6600),
    transparent: true,
    category: BlockCategory.LIQUID,
    hardness: 0,
    drops: [],
  },

  // Natural blocks
  [BlockType.GRASS]: {
    type: BlockType.GRASS,
    name: 'Grass',
    color: new THREE.Color(0x5da130),
    category: BlockCategory.NATURAL,
    hardness: 1,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.DIRT, quantity: 1 }],
  },
  [BlockType.DIRT]: {
    type: BlockType.DIRT,
    name: 'Dirt',
    color: new THREE.Color(0x8b6f47),
    category: BlockCategory.NATURAL,
    hardness: 1,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.DIRT, quantity: 1 }],
  },
  [BlockType.STONE]: {
    type: BlockType.STONE,
    name: 'Stone',
    color: new THREE.Color(0x808080),
    category: BlockCategory.NATURAL,
    hardness: 8,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.COBBLESTONE, quantity: 1 }],
  },
  [BlockType.SAND]: {
    type: BlockType.SAND,
    name: 'Sand',
    color: new THREE.Color(0xf4e7c3),
    category: BlockCategory.NATURAL,
    hardness: 1,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.SAND, quantity: 1 }],
  },
  [BlockType.GRAVEL]: {
    type: BlockType.GRAVEL,
    name: 'Gravel',
    color: new THREE.Color(0x888888),
    category: BlockCategory.NATURAL,
    hardness: 1,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.GRAVEL, quantity: 1 }],
  },
  [BlockType.CLAY]: {
    type: BlockType.CLAY,
    name: 'Clay',
    color: new THREE.Color(0xa0a0a0),
    category: BlockCategory.NATURAL,
    hardness: 1,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.CLAY, quantity: 1 }],
  },
  [BlockType.SNOW]: {
    type: BlockType.SNOW,
    name: 'Snow',
    color: new THREE.Color(0xffffff),
    category: BlockCategory.NATURAL,
    hardness: 0.5,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.SNOW, quantity: 1 }],
  },
  [BlockType.ICE]: {
    type: BlockType.ICE,
    name: 'Ice',
    color: new THREE.Color(0x9db5ff),
    transparent: true,
    category: BlockCategory.NATURAL,
    hardness: 2,
    drops: [],
  },
  [BlockType.BEDROCK]: {
    type: BlockType.BEDROCK,
    name: 'Bedrock',
    color: new THREE.Color(0x333333),
    category: BlockCategory.NATURAL,
    hardness: 100,
    drops: [],
  },
  [BlockType.SANDSTONE]: {
    type: BlockType.SANDSTONE,
    name: 'Sandstone',
    color: new THREE.Color(0xe0d0a0),
    category: BlockCategory.NATURAL,
    hardness: 4,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.SANDSTONE, quantity: 1 }],
  },
  [BlockType.RED_SAND]: {
    type: BlockType.RED_SAND,
    name: 'Red Sand',
    color: new THREE.Color(0xd66a3c),
    category: BlockCategory.NATURAL,
    hardness: 1,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.RED_SAND, quantity: 1 }],
  },
  [BlockType.PODZOL]: {
    type: BlockType.PODZOL,
    name: 'Podzol',
    color: new THREE.Color(0x5d4a2f),
    category: BlockCategory.NATURAL,
    hardness: 1,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.DIRT, quantity: 1 }],
  },
  [BlockType.MYCELIUM]: {
    type: BlockType.MYCELIUM,
    name: 'Mycelium',
    color: new THREE.Color(0x6f5c52),
    category: BlockCategory.NATURAL,
    hardness: 1,
    toolRequired: ToolType.SHOVEL,
    drops: [{ blockType: BlockType.DIRT, quantity: 1 }],
  },
  [BlockType.NETHERRACK]: {
    type: BlockType.NETHERRACK,
    name: 'Netherrack',
    color: new THREE.Color(0x8b3a3a),
    category: BlockCategory.NATURAL,
    hardness: 2,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.NETHERRACK, quantity: 1 }],
  },
  [BlockType.END_STONE]: {
    type: BlockType.END_STONE,
    name: 'End Stone',
    color: new THREE.Color(0xe3e394),
    category: BlockCategory.NATURAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.END_STONE, quantity: 1 }],
  },
  [BlockType.OBSIDIAN]: {
    type: BlockType.OBSIDIAN,
    name: 'Obsidian',
    color: new THREE.Color(0x1a1a2e),
    category: BlockCategory.NATURAL,
    hardness: 50,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.OBSIDIAN, quantity: 1 }],
  },

  // Wood types
  [BlockType.WOOD]: {
    type: BlockType.WOOD,
    name: 'Wood',
    color: new THREE.Color(0x8b5a2b),
    category: BlockCategory.NATURAL,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.WOOD, quantity: 1 }],
  },
  [BlockType.OAK_LOG]: {
    type: BlockType.OAK_LOG,
    name: 'Oak Log',
    color: new THREE.Color(0x8b6f47),
    category: BlockCategory.NATURAL,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.OAK_LOG, quantity: 1 }],
  },
  [BlockType.BIRCH_LOG]: {
    type: BlockType.BIRCH_LOG,
    name: 'Birch Log',
    color: new THREE.Color(0xd7d3c9),
    category: BlockCategory.NATURAL,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.BIRCH_LOG, quantity: 1 }],
  },
  [BlockType.SPRUCE_LOG]: {
    type: BlockType.SPRUCE_LOG,
    name: 'Spruce Log',
    color: new THREE.Color(0x6b5137),
    category: BlockCategory.NATURAL,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.SPRUCE_LOG, quantity: 1 }],
  },
  [BlockType.DARK_OAK_LOG]: {
    type: BlockType.DARK_OAK_LOG,
    name: 'Dark Oak Log',
    color: new THREE.Color(0x3d2817),
    category: BlockCategory.NATURAL,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.DARK_OAK_LOG, quantity: 1 }],
  },
  [BlockType.ACACIA_LOG]: {
    type: BlockType.ACACIA_LOG,
    name: 'Acacia Log',
    color: new THREE.Color(0xba5d3b),
    category: BlockCategory.NATURAL,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.ACACIA_LOG, quantity: 1 }],
  },

  // Leaves types
  [BlockType.LEAVES]: {
    type: BlockType.LEAVES,
    name: 'Leaves',
    color: new THREE.Color(0x228b22),
    transparent: true,
    category: BlockCategory.NATURAL,
    hardness: 0.3,
    drops: [],
  },
  [BlockType.OAK_LEAVES]: {
    type: BlockType.OAK_LEAVES,
    name: 'Oak Leaves',
    color: new THREE.Color(0x228b22),
    transparent: true,
    category: BlockCategory.NATURAL,
    hardness: 0.3,
    drops: [],
  },
  [BlockType.BIRCH_LEAVES]: {
    type: BlockType.BIRCH_LEAVES,
    name: 'Birch Leaves',
    color: new THREE.Color(0x80a755),
    transparent: true,
    category: BlockCategory.NATURAL,
    hardness: 0.3,
    drops: [],
  },
  [BlockType.SPRUCE_LEAVES]: {
    type: BlockType.SPRUCE_LEAVES,
    name: 'Spruce Leaves',
    color: new THREE.Color(0x3e6e3e),
    transparent: true,
    category: BlockCategory.NATURAL,
    hardness: 0.3,
    drops: [],
  },
  [BlockType.DARK_OAK_LEAVES]: {
    type: BlockType.DARK_OAK_LEAVES,
    name: 'Dark Oak Leaves',
    color: new THREE.Color(0x2d5016),
    transparent: true,
    category: BlockCategory.NATURAL,
    hardness: 0.3,
    drops: [],
  },
  [BlockType.ACACIA_LEAVES]: {
    type: BlockType.ACACIA_LEAVES,
    name: 'Acacia Leaves',
    color: new THREE.Color(0x6dac3a),
    transparent: true,
    category: BlockCategory.NATURAL,
    hardness: 0.3,
    drops: [],
  },

  // Ores
  [BlockType.COAL_ORE]: {
    type: BlockType.COAL_ORE,
    name: 'Coal Ore',
    color: new THREE.Color(0x4a4a4a),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.COAL_BLOCK, quantity: 1 }],
  },
  [BlockType.IRON_ORE]: {
    type: BlockType.IRON_ORE,
    name: 'Iron Ore',
    color: new THREE.Color(0xd8af93),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.IRON_ORE, quantity: 1 }],
  },
  [BlockType.GOLD_ORE]: {
    type: BlockType.GOLD_ORE,
    name: 'Gold Ore',
    color: new THREE.Color(0xfcee4b),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.GOLD_ORE, quantity: 1 }],
  },
  [BlockType.DIAMOND_ORE]: {
    type: BlockType.DIAMOND_ORE,
    name: 'Diamond Ore',
    color: new THREE.Color(0x5decf5),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.DIAMOND_BLOCK, quantity: 1 }],
  },
  [BlockType.EMERALD_ORE]: {
    type: BlockType.EMERALD_ORE,
    name: 'Emerald Ore',
    color: new THREE.Color(0x17dd62),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.EMERALD_BLOCK, quantity: 1 }],
  },
  [BlockType.REDSTONE_ORE]: {
    type: BlockType.REDSTONE_ORE,
    name: 'Redstone Ore',
    color: new THREE.Color(0xff0000),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.REDSTONE_BLOCK, quantity: 1 }],
  },
  [BlockType.LAPIS_ORE]: {
    type: BlockType.LAPIS_ORE,
    name: 'Lapis Ore',
    color: new THREE.Color(0x2450a4),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.LAPIS_ORE, quantity: 1 }],
  },
  [BlockType.COPPER_ORE]: {
    type: BlockType.COPPER_ORE,
    name: 'Copper Ore',
    color: new THREE.Color(0xe87751),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.COPPER_ORE, quantity: 1 }],
  },
  [BlockType.QUARTZ_ORE]: {
    type: BlockType.QUARTZ_ORE,
    name: 'Quartz Ore',
    color: new THREE.Color(0xe3d4d1),
    category: BlockCategory.MINERAL,
    hardness: 15,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.QUARTZ_ORE, quantity: 1 }],
  },

  // Mineral blocks
  [BlockType.COAL_BLOCK]: {
    type: BlockType.COAL_BLOCK,
    name: 'Coal Block',
    color: new THREE.Color(0x1a1a1a),
    category: BlockCategory.MINERAL,
    hardness: 25,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.COAL_BLOCK, quantity: 1 }],
  },
  [BlockType.IRON_BLOCK]: {
    type: BlockType.IRON_BLOCK,
    name: 'Iron Block',
    color: new THREE.Color(0xd8d8d8),
    category: BlockCategory.MINERAL,
    hardness: 25,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.IRON_BLOCK, quantity: 1 }],
  },
  [BlockType.GOLD_BLOCK]: {
    type: BlockType.GOLD_BLOCK,
    name: 'Gold Block',
    color: new THREE.Color(0xffd700),
    category: BlockCategory.MINERAL,
    hardness: 25,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.GOLD_BLOCK, quantity: 1 }],
  },
  [BlockType.DIAMOND_BLOCK]: {
    type: BlockType.DIAMOND_BLOCK,
    name: 'Diamond Block',
    color: new THREE.Color(0x5decf5),
    category: BlockCategory.MINERAL,
    hardness: 25,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.DIAMOND_BLOCK, quantity: 1 }],
  },
  [BlockType.EMERALD_BLOCK]: {
    type: BlockType.EMERALD_BLOCK,
    name: 'Emerald Block',
    color: new THREE.Color(0x17dd62),
    category: BlockCategory.MINERAL,
    hardness: 25,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.EMERALD_BLOCK, quantity: 1 }],
  },
  [BlockType.REDSTONE_BLOCK]: {
    type: BlockType.REDSTONE_BLOCK,
    name: 'Redstone Block',
    color: new THREE.Color(0xaa0000),
    category: BlockCategory.MINERAL,
    hardness: 25,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.REDSTONE_BLOCK, quantity: 1 }],
  },

  // Building blocks
  [BlockType.PLANK]: {
    type: BlockType.PLANK,
    name: 'Plank',
    color: new THREE.Color(0xc9a875),
    category: BlockCategory.BUILDING,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.PLANK, quantity: 1 }],
  },
  [BlockType.OAK_PLANK]: {
    type: BlockType.OAK_PLANK,
    name: 'Oak Plank',
    color: new THREE.Color(0xa87d4f),
    category: BlockCategory.BUILDING,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.OAK_PLANK, quantity: 1 }],
  },
  [BlockType.BIRCH_PLANK]: {
    type: BlockType.BIRCH_PLANK,
    name: 'Birch Plank',
    color: new THREE.Color(0xd8cfa8),
    category: BlockCategory.BUILDING,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.BIRCH_PLANK, quantity: 1 }],
  },
  [BlockType.SPRUCE_PLANK]: {
    type: BlockType.SPRUCE_PLANK,
    name: 'Spruce Plank',
    color: new THREE.Color(0x7a5c3d),
    category: BlockCategory.BUILDING,
    hardness: 3,
    toolRequired: ToolType.AXE,
    drops: [{ blockType: BlockType.SPRUCE_PLANK, quantity: 1 }],
  },
  [BlockType.COBBLESTONE]: {
    type: BlockType.COBBLESTONE,
    name: 'Cobblestone',
    color: new THREE.Color(0x696969),
    category: BlockCategory.BUILDING,
    hardness: 10,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.COBBLESTONE, quantity: 1 }],
  },
  [BlockType.STONE_BRICK]: {
    type: BlockType.STONE_BRICK,
    name: 'Stone Brick',
    color: new THREE.Color(0x797979),
    category: BlockCategory.BUILDING,
    hardness: 8,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.STONE_BRICK, quantity: 1 }],
  },
  [BlockType.BRICK]: {
    type: BlockType.BRICK,
    name: 'Brick',
    color: new THREE.Color(0x9a5a40),
    category: BlockCategory.BUILDING,
    hardness: 10,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.BRICK, quantity: 1 }],
  },
  [BlockType.GLASS]: {
    type: BlockType.GLASS,
    name: 'Glass',
    color: new THREE.Color(0xc8e8ff),
    transparent: true,
    category: BlockCategory.BUILDING,
    hardness: 1,
    drops: [],
  },
  [BlockType.CONCRETE]: {
    type: BlockType.CONCRETE,
    name: 'Concrete',
    color: new THREE.Color(0xb0b0b0),
    category: BlockCategory.BUILDING,
    hardness: 9,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.CONCRETE, quantity: 1 }],
  },
  [BlockType.WHITE_CONCRETE]: {
    type: BlockType.WHITE_CONCRETE,
    name: 'White Concrete',
    color: new THREE.Color(0xf0f0f0),
    category: BlockCategory.BUILDING,
    hardness: 9,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.WHITE_CONCRETE, quantity: 1 }],
  },
  [BlockType.GRAY_CONCRETE]: {
    type: BlockType.GRAY_CONCRETE,
    name: 'Gray Concrete',
    color: new THREE.Color(0x808080),
    category: BlockCategory.BUILDING,
    hardness: 9,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.GRAY_CONCRETE, quantity: 1 }],
  },
  [BlockType.BLACK_CONCRETE]: {
    type: BlockType.BLACK_CONCRETE,
    name: 'Black Concrete',
    color: new THREE.Color(0x1a1a1a),
    category: BlockCategory.BUILDING,
    hardness: 9,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.BLACK_CONCRETE, quantity: 1 }],
  },
  [BlockType.RED_CONCRETE]: {
    type: BlockType.RED_CONCRETE,
    name: 'Red Concrete',
    color: new THREE.Color(0xb02e26),
    category: BlockCategory.BUILDING,
    hardness: 9,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.RED_CONCRETE, quantity: 1 }],
  },
  [BlockType.BLUE_CONCRETE]: {
    type: BlockType.BLUE_CONCRETE,
    name: 'Blue Concrete',
    color: new THREE.Color(0x2c2c8f),
    category: BlockCategory.BUILDING,
    hardness: 9,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.BLUE_CONCRETE, quantity: 1 }],
  },
  [BlockType.GREEN_CONCRETE]: {
    type: BlockType.GREEN_CONCRETE,
    name: 'Green Concrete',
    color: new THREE.Color(0x5e7c16),
    category: BlockCategory.BUILDING,
    hardness: 9,
    toolRequired: ToolType.PICKAXE,
    drops: [{ blockType: BlockType.GREEN_CONCRETE, quantity: 1 }],
  },

  // Decoration blocks
  [BlockType.FLOWER]: {
    type: BlockType.FLOWER,
    name: 'Flower',
    color: new THREE.Color(0xff69b4),
    category: BlockCategory.DECORATION,
    hardness: 0,
    drops: [{ blockType: BlockType.FLOWER, quantity: 1 }],
  },
  [BlockType.ROSE]: {
    type: BlockType.ROSE,
    name: 'Rose',
    color: new THREE.Color(0xff0000),
    category: BlockCategory.DECORATION,
    hardness: 0,
    drops: [{ blockType: BlockType.ROSE, quantity: 1 }],
  },
  [BlockType.DANDELION]: {
    type: BlockType.DANDELION,
    name: 'Dandelion',
    color: new THREE.Color(0xffec4f),
    category: BlockCategory.DECORATION,
    hardness: 0,
    drops: [{ blockType: BlockType.DANDELION, quantity: 1 }],
  },
  [BlockType.TULIP]: {
    type: BlockType.TULIP,
    name: 'Tulip',
    color: new THREE.Color(0xff8c00),
    category: BlockCategory.DECORATION,
    hardness: 0,
    drops: [{ blockType: BlockType.TULIP, quantity: 1 }],
  },
  [BlockType.MUSHROOM]: {
    type: BlockType.MUSHROOM,
    name: 'Mushroom',
    color: new THREE.Color(0x8b4513),
    category: BlockCategory.DECORATION,
    hardness: 0,
    drops: [{ blockType: BlockType.MUSHROOM, quantity: 1 }],
  },
  [BlockType.RED_MUSHROOM]: {
    type: BlockType.RED_MUSHROOM,
    name: 'Red Mushroom',
    color: new THREE.Color(0xaa2222),
    category: BlockCategory.DECORATION,
    hardness: 0,
    drops: [{ blockType: BlockType.RED_MUSHROOM, quantity: 1 }],
  },
  [BlockType.BROWN_MUSHROOM]: {
    type: BlockType.BROWN_MUSHROOM,
    name: 'Brown Mushroom',
    color: new THREE.Color(0x8b7355),
    category: BlockCategory.DECORATION,
    hardness: 0,
    drops: [{ blockType: BlockType.BROWN_MUSHROOM, quantity: 1 }],
  },
  [BlockType.TORCH]: {
    type: BlockType.TORCH,
    name: 'Torch',
    color: new THREE.Color(0xffaa00),
    category: BlockCategory.DECORATION,
    hardness: 0,
    drops: [{ blockType: BlockType.TORCH, quantity: 1 }],
  },
  [BlockType.LANTERN]: {
    type: BlockType.LANTERN,
    name: 'Lantern',
    color: new THREE.Color(0xffcc66),
    category: BlockCategory.DECORATION,
    hardness: 2,
    drops: [{ blockType: BlockType.LANTERN, quantity: 1 }],
  },
};

export interface VoxelPosition {
  x: number;
  y: number;
  z: number;
}

export interface Chunk {
  x: number;
  z: number;
  blocks: Uint8Array; // Flat array of block types
  mesh: THREE.InstancedMesh | null;
}

export interface WorldSettings {
  chunkSize: number;
  chunkHeight: number;
  renderDistance: number;
  seaLevel: number;
}

export type ToolMode = 
  | 'place' 
  | 'break' 
  | 'paint' 
  | 'fill';

export interface VoxelGameState {
  currentBlock: BlockType;
  currentTool: ToolMode;
  selectedPosition: VoxelPosition | null;
  fps: number;
  blockCount: number;
}

