import { 
  Direction, 
  FoodItem, 
  FoodType, 
  InventoryItem, 
  Position, 
  SnakeSegment, 
  Collectible, 
  CollectibleType 
} from "@/components/game/utils/types";
import { v4 as uuidv4 } from 'uuid';

// Constants
export const GRID_SIZE = 30;
export const CELL_SIZE = 30;
export const INITIAL_SNAKE_LENGTH = 3;
export const INITIAL_SPEED = 200;
export const MAX_STOMACH_CAPACITY = 10;
export const MAX_FOOD_ITEMS = 3;
export const MAX_COLLECTIBLES = 1;
export const COLLECTIBLE_THRESHOLD = 3;

// Food colors
export const FOOD_COLORS = {
  [FoodType.APPLE]: 'rgb(239, 68, 68)',
  [FoodType.CHERRY]: 'rgb(236, 72, 153)',
  [FoodType.BANANA]: 'rgb(234, 179, 8)',
  [FoodType.BERRY]: 'rgb(147, 51, 234)',
};

// Collectible colors
export const COLLECTIBLE_COLORS = {
  [CollectibleType.CRYSTAL]: 'rgb(76, 175, 80)',
  [CollectibleType.GEM]: 'rgb(59, 130, 246)',
  [CollectibleType.POTION]: 'rgb(147, 51, 234)',
  [CollectibleType.ARTIFACT]: 'rgb(239, 68, 68)',
};

// Food properties - all food now gives 1 score point
export const FOOD_PROPERTIES = {
  [FoodType.APPLE]: { minValue: 1, maxValue: 1, minWeight: 5, maxWeight: 15 },
  [FoodType.CHERRY]: { minValue: 1, maxValue: 1, minWeight: 2, maxWeight: 8 },
  [FoodType.BANANA]: { minValue: 1, maxValue: 1, minWeight: 10, maxWeight: 25 },
  [FoodType.BERRY]: { minValue: 1, maxValue: 1, minWeight: 15, maxWeight: 30 },
};

// Collectible properties - adjusted for beginners
export const COLLECTIBLE_PROPERTIES = {
  [CollectibleType.CRYSTAL]: { 
    minValue: 2,
    maxValue: 5,
    minWeight: 1,
    maxWeight: 3,
    minSellValue: 1,
    maxSellValue: 3
  },
  [CollectibleType.GEM]: { 
    minValue: 5, 
    maxValue: 10, 
    minWeight: 3, 
    maxWeight: 5, 
    minSellValue: 3, 
    maxSellValue: 5 
  },
  [CollectibleType.POTION]: { 
    minValue: 8, 
    maxValue: 12, 
    minWeight: 5, 
    maxWeight: 7, 
    minSellValue: 5, 
    maxSellValue: 8 
  },
  [CollectibleType.ARTIFACT]: { 
    minValue: 12, 
    maxValue: 15, 
    minWeight: 8, 
    maxWeight: 10, 
    minSellValue: 8, 
    maxSellValue: 12 
  },
};

// Helper to create initial snake
export const createInitialSnake = (gridWidth: number, gridHeight: number): SnakeSegment[] => {
  const centerX = Math.floor(gridWidth / 2);
  const centerY = Math.floor(gridHeight / 2);
  
  const snake: SnakeSegment[] = [];
  
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({
      x: Math.min(Math.max(centerX - i, 0), gridWidth - 1),
      y: Math.min(Math.max(centerY, 0), gridHeight - 1),
      id: uuidv4(),
    });
  }
  
  return snake;
};

// Generate a random food item
export const generateFood = (
  snake: SnakeSegment[],
  existingFood: FoodItem[] = [],
  existingCollectibles: Collectible[] = [],
  gridWidth: number,
  gridHeight: number
): FoodItem => {
  const occupiedPositions = [
    ...snake.map(segment => `${segment.x},${segment.y}`),
    ...existingFood.map(food => `${food.position.x},${food.position.y}`),
    ...existingCollectibles.map(collectible => `${collectible.position.x},${collectible.position.y}`)
  ];
  
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * (gridWidth - 2)) + 1,
      y: Math.floor(Math.random() * (gridHeight - 2)) + 1,
    };
  } while (occupiedPositions.includes(`${position.x},${position.y}`));
  
  const foodTypes = Object.values(FoodType);
  const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
  const props = FOOD_PROPERTIES[type];
  
  const value = Math.floor(Math.random() * (props.maxValue - props.minValue + 1)) + props.minValue;
  const weight = Math.floor(Math.random() * (props.maxWeight - props.minWeight + 1)) + props.minWeight;
  
  return {
    id: uuidv4(),
    position,
    value,
    weight,
    type,
    color: FOOD_COLORS[type],
  };
};

// Generate a random collectible
export const generateCollectible = (
  snake: SnakeSegment[],
  existingFood: FoodItem[] = [],
  existingCollectibles: Collectible[] = [],
  gridWidth: number,
  gridHeight: number
): Collectible => {
  const occupiedPositions = [
    ...snake.map(segment => `${segment.x},${segment.y}`),
    ...existingFood.map(food => `${food.position.x},${food.position.y}`),
    ...existingCollectibles.map(collectible => `${collectible.position.x},${collectible.position.y}`)
  ];
  
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * (gridWidth - 2)) + 1,
      y: Math.floor(Math.random() * (gridHeight - 2)) + 1,
    };
  } while (occupiedPositions.includes(`${position.x},${position.y}`));
  
  const collectibleTypes = Object.values(CollectibleType);
  const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
  const props = COLLECTIBLE_PROPERTIES[type];
  
  const value = Math.floor(Math.random() * (props.maxValue - props.minValue + 1)) + props.minValue;
  const weight = Math.floor(Math.random() * (props.maxWeight - props.minWeight + 1)) + props.minWeight;
  const sellValue = Math.floor(Math.random() * (props.maxSellValue - props.minSellValue + 1)) + props.minSellValue;
  
  return {
    id: uuidv4(),
    position,
    value,
    sellValue,
    weight,
    type,
    color: COLLECTIBLE_COLORS[type],
  };
};

// Check if snake will hit wall - Fixed to properly detect boundaries
export const willHitWall = (head: Position, direction: Direction, gridSizeX: number, gridSizeY: number): boolean => {
  const newPosition = getNewHeadPosition(head, direction);
  return (
    newPosition.x < 0 ||
    newPosition.x >= gridSizeX ||
    newPosition.y < 0 ||
    newPosition.y >= gridSizeY
  );
};

// Check if snake will hit itself
export const willHitSelf = (
  head: Position,
  snake: SnakeSegment[]
): boolean => {
  // Get next head position
  const newHead = { ...head };
  
  // Check collision with body segments (not the last segment since it will move)
  // Skip checking against the head itself (index 0)
  return snake.slice(1, -1).some(segment => 
    segment.x === newHead.x && segment.y === newHead.y
  );
};

// Check if position is on the food
export const isOnFood = (
  position: Position,
  food: FoodItem[]
): FoodItem | null => {
  return (
    food.find(f => f.position.x === position.x && f.position.y === position.y) ||
    null
  );
};

// Check if position is on a collectible
export const isOnCollectible = (
  position: Position,
  collectibles: Collectible[]
): Collectible | null => {
  return (
    collectibles.find(c => c.position.x === position.x && c.position.y === position.y) ||
    null
  );
};

// Get the new head position based on current direction
export const getNewHeadPosition = (
  currentHead: Position,
  direction: Direction
): Position => {
  switch (direction) {
    case Direction.UP:
      return { x: currentHead.x, y: currentHead.y - 1 };
    case Direction.DOWN:
      return { x: currentHead.x, y: currentHead.y + 1 };
    case Direction.LEFT:
      return { x: currentHead.x - 1, y: currentHead.y };
    case Direction.RIGHT:
      return { x: currentHead.x + 1, y: currentHead.y };
    default:
      return { ...currentHead };
  }
};

// Calculate speed based on snake length
export const calculateSpeed = (snakeLength: number): number => {
  const speed = INITIAL_SPEED - Math.floor(snakeLength / 3) * 3;
  return Math.max(speed, 120);
};

// Sort inventory items
export const sortInventory = (
  items: InventoryItem[],
  sortBy: 'value' | 'weight' | 'timestamp',
  order: 'asc' | 'desc' = 'desc'
): InventoryItem[] => {
  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (order === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
  
  return sortedItems;
};

// Convert collected collectible to inventory item
export const collectibleToInventoryItem = (collectible: Collectible): InventoryItem => {
  return {
    id: collectible.id,
    type: collectible.type,
    value: collectible.value,
    weight: collectible.weight,
    sellValue: collectible.sellValue,
    timestamp: Date.now(),
  };
};

// Get opposite direction
export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.UP:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.UP;
    case Direction.LEFT:
      return Direction.RIGHT;
    case Direction.RIGHT:
      return Direction.LEFT;
    default:
      return direction;
  }
};
