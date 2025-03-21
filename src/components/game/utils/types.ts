export interface Position {
  x: number;
  y: number;
}

export interface SnakeSegment extends Position {
  id: string;
}

export interface SnakeProps {
  segments: SnakeSegment[];
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface FoodItem {
  id: string;
  position: Position;
  value: number;
  weight: number;
  type: FoodType;
  color: string;
}

export interface Collectible {
  id: string;
  position: Position;
  value: number; // Value in points when collected
  sellValue: number; // Value in coins when sold
  weight: number;
  type: CollectibleType;
  color: string;
}

export interface FoodProps {
  food: FoodItem[];
  collectibles: Collectible[];
}

export enum FoodType {
  APPLE = 'APPLE',
  CHERRY = 'CHERRY',
  BANANA = 'BANANA',
  BERRY = 'BERRY',
}

export enum GameState {
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN',
}

export enum CollectibleType {
  CRYSTAL = "CRYSTAL",
  GEM = "GEM",
  POTION = "POTION",
  ARTIFACT = "ARTIFACT"
}

export interface InventoryProps {
  items: InventoryItem[];
  capacity: number;
  currentWeight: number;
  onDeleteItem?: (id: string) => void;
}

export interface InventoryItem {
  id: string;
  type: FoodType | CollectibleType;
  value: number;
  weight: number;
  sellValue?: number; // Only for collectibles
  timestamp: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  foodEaten: number;
  coinsCollected: number; // Currency for upgrades
  inventoryCapacity: number;
  inventoryCurrentWeight: number;
  level: number;
}
