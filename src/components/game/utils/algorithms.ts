import { FoodItem, Position } from "@/components/game/utils/types";
import { MAX_STOMACH_CAPACITY } from "./gameLogic";

// Knapsack algorithm
export const knapsackAlgorithm = (
  items: FoodItem[],
  currentWeight: number,
  capacity: number = MAX_STOMACH_CAPACITY
): FoodItem[] => {
  // Create a copy of items to avoid mutations
  const availableSpace = capacity - currentWeight;
  
  if (availableSpace <= 0) return [];
  
  // Initialize the DP table for knapsack
  const n = items.length;
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(availableSpace + 1).fill(0));
  
  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= availableSpace; w++) {
      if (item.weight <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - item.weight] + item.value
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  // Backtrack to find the selected items
  const result: FoodItem[] = [];
  let w = availableSpace;
  
  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      const item = items[i - 1];
      result.push(item);
      w -= item.weight;
    }
  }
  
  return result;
};

// Traveling Salesman Problem algorithm (nearest neighbor approximation)
export const tspNearestNeighbor = (
  start: Position,
  destinations: Position[]
): Position[] => {
  if (destinations.length === 0) return [];
  
  const result: Position[] = [start];
  const unvisited = [...destinations];
  let current = start;
  
  while (unvisited.length > 0) {
    // Find the nearest unvisited destination
    let minDist = Infinity;
    let nearestIndex = -1;
    
    for (let i = 0; i < unvisited.length; i++) {
      const dest = unvisited[i];
      const dist = manhattanDistance(current, dest);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = i;
      }
    }
    
    if (nearestIndex === -1) break; // Should not happen
    
    current = unvisited[nearestIndex];
    result.push(current);
    unvisited.splice(nearestIndex, 1);
  }
  
  return result;
};

// Manhattan distance between two positions
export const manhattanDistance = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Bubble sort algorithm with visualization steps
export interface SortStep<T> {
  array: T[];
  comparedIndices: [number, number];
  swapped: boolean;
}

export const bubbleSort = <T>(
  array: T[],
  compareFn: (a: T, b: T) => number
): SortStep<T>[] => {
  const steps: SortStep<T>[] = [];
  const arr = [...array];
  const n = arr.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const comparisonResult = compareFn(arr[j], arr[j + 1]);
      const swapped = comparisonResult > 0;
      
      steps.push({
        array: [...arr],
        comparedIndices: [j, j + 1],
        swapped,
      });
      
      if (swapped) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        
        steps.push({
          array: [...arr],
          comparedIndices: [j, j + 1],
          swapped: true,
        });
      }
    }
  }
  
  return steps;
};

// Linear search algorithm with visualization steps
export interface SearchStep<T> {
  array: T[];
  currentIndex: number;
  foundIndices: number[];  // Changed from 'found: boolean' to track all matches
}

export const linearSearch = <T>(
  array: T[],
  predicate: (item: T) => boolean
): SearchStep<T>[] => {
  const steps: SearchStep<T>[] = [];
  const foundIndices: number[] = [];
  
  for (let i = 0; i < array.length; i++) {
    const found = predicate(array[i]);
    
    if (found) {
      foundIndices.push(i);
    }
    
    steps.push({
      array,
      currentIndex: i,
      foundIndices: [...foundIndices], // Clone the array to avoid reference issues
    });
  }
  
  return steps;
};
