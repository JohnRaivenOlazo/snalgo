import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Direction,
  FoodItem,
  SnakeSegment,
  GameState,
  InventoryItem,
  Position,
  GameStats,
  Collectible,
  CollectibleType,
} from "@/components/game/utils/types";
import Snake from "./Snake";
import Food from "./Food";
import Inventory from "./Inventory";
import PixelatedContainer from "../ui/PixelatedContainer";
import PixelButton from "../ui/PixelButton";
import { toast } from "sonner";
import {
  createInitialSnake,
  GRID_SIZE,
  CELL_SIZE,
  getNewHeadPosition,
  willHitWall,
  willHitSelf,
  isOnFood,
  isOnCollectible,
  calculateSpeed,
  generateFood,
  generateCollectible,
  collectibleToInventoryItem,
  getOppositeDirection,
  MAX_FOOD_ITEMS,
  MAX_COLLECTIBLES,
  COLLECTIBLE_THRESHOLD,
} from "@/components/game/utils/gameLogic";
import {
  tspNearestNeighbor,
} from "@/components/game/utils/algorithms";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Trophy,
  Lightbulb
} from "lucide-react";
import { useGameStore } from '@/stores/useGameStore';

const GameBoard: React.FC = () => {
  const [snake, setSnake] = useState<SnakeSegment[]>([]);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [food, setFood] = useState<FoodItem[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [foodEatenSinceLastCollectible, setFoodEatenSinceLastCollectible] =
    useState<number>(0);
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [hint, setHint] = useState<Position[]>([]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    foodEaten: 0,
    coinsCollected: 0,
    inventoryCapacity: 0,
    inventoryCurrentWeight: 0,
    level: 1,
  });

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const hintActiveRef = useRef<boolean>(false);
  const directionQueue = useRef<Direction[]>([]);
  const directionRef = useRef(direction);

  const { addCoins, coins } = useGameStore();

  const currentWeightRef = useRef(stats.inventoryCurrentWeight);
  useEffect(() => {
    currentWeightRef.current = stats.inventoryCurrentWeight;
  }, [stats.inventoryCurrentWeight]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const initGame = useCallback(() => {
    const initialSnake = createInitialSnake();
    setSnake(initialSnake);
    setDirection(Direction.RIGHT);

    const initialFood: FoodItem[] = [];
    for (let i = 0; i < MAX_FOOD_ITEMS; i++) {
      initialFood.push(generateFood(initialSnake, initialFood, []));
    }
    setFood(initialFood);

    const initialCollectible = generateCollectible(
      initialSnake,
      initialFood,
      []
    );
    setCollectibles([initialCollectible]);
    setFoodEatenSinceLastCollectible(0);
    setGameState(GameState.READY);
    setHint([]);
    hintActiveRef.current = false;
    setStats((prev) => ({
      ...prev,
      score: 0,
      highScore: localStorage.getItem("snakeHighScore")
        ? parseInt(localStorage.getItem("snakeHighScore") || "0")
        : 0,
      foodEaten: 0,
      inventoryCurrentWeight: prev.inventoryCurrentWeight,
      level: 1,
    }));
  }, []);

  const startGame = useCallback(() => {
    if (
      gameState === GameState.READY ||
      gameState === GameState.GAME_OVER ||
      gameState === GameState.WIN
    ) {
      initGame();
    }

    setGameState(GameState.PLAYING);

    if (boardRef.current) {
      boardRef.current.focus();
    }
  }, [gameState, initGame]);

  const gameOver = useCallback(() => {
    setGameState(GameState.GAME_OVER);

    if (stats.score > stats.highScore) {
      localStorage.setItem("snakeHighScore", stats.score.toString());
      setStats((prev) => ({
        ...prev,
        highScore: stats.score,
      }));
      toast.success("New high score: " + stats.score);
    }
  }, [stats.score, stats.highScore]);

  const checkWinCondition = useCallback(() => {
    if (stats.score > stats.highScore) {
      localStorage.setItem("snakeHighScore", stats.score.toString());
      setStats((prev) => ({
        ...prev,
        highScore: stats.score,
      }));
    }
  }, [stats.score, stats.highScore]);

  const handleDeleteInventoryItem = useCallback((itemId: string) => {
    setInventory(prevInventory => {
      const item = prevInventory.find((i) => i.id === itemId);
      if (!item) return prevInventory;

      if (item.sellValue) {
        addCoins(item.sellValue);
        setStats(prev => ({
          ...prev,
          inventoryCurrentWeight: Math.max(0, prev.inventoryCurrentWeight - item.weight)
        }));
        toast.success(`Sold for ${item.sellValue} coins!`);
      }

      return prevInventory.filter((i) => i.id !== itemId);
    });
  }, [addCoins]);

  const updateHintPath = useCallback(
    (head: Position) => {
      if (
        (food.length === 0 && collectibles.length === 0) ||
        gameState !== GameState.PLAYING ||
        !hintActiveRef.current
      )
        return;

      const allPositions = [
        ...food.map((f) => f.position),
        ...collectibles.map((c) => c.position),
      ];

      const route = tspNearestNeighbor(head, allPositions);

      setHint(route);
    },
    [food, collectibles, gameState]
  );

  const updateGameState = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    // Process direction queue
    let newDirection = directionRef.current;
    while (directionQueue.current.length > 0) {
      const nextDir = directionQueue.current.shift()!;
      const oppositeDirection = getOppositeDirection(newDirection);
      
      if (nextDir !== oppositeDirection) {
        newDirection = nextDir;
        break; // Only process one valid direction per frame
      }
    }

    if (newDirection !== directionRef.current) {
      setDirection(newDirection);
      directionRef.current = newDirection; // Update the ref immediately
    }

    const head = snake[0];

    const newHead: SnakeSegment = {
      ...getNewHeadPosition(head, newDirection),
      id: crypto.randomUUID(),
    };

    if (willHitWall(head, newDirection) || willHitSelf(newHead, snake)) {
      gameOver();
      return;
    }

    const eatenFood = isOnFood(newHead, food);
    const eatenCollectible = isOnCollectible(newHead, collectibles);

    // Modified logic: Always grow when eating food or collectible
    const newSnake = [newHead, ...snake];

    if (!eatenFood && !eatenCollectible) {
      newSnake.pop();
    } else if (eatenCollectible) {
      newSnake.pop();
    }

    setSnake(newSnake);

    // Modified logic for handling food and collectibles
    if (eatenFood) {
      // Remove the eaten food
      const newFood = food.filter((f) => f.id !== eatenFood.id);

      // Update score only for food items
      setStats((prev) => ({
        ...prev,
        score: prev.score + eatenFood.value,
        foodEaten: prev.foodEaten + 1,
      }));

      const newFoodEatenCount = foodEatenSinceLastCollectible + 1;
      setFoodEatenSinceLastCollectible(newFoodEatenCount);

      // Create a collectible after threshold is reached, if one doesn't exist
      if (
        newFoodEatenCount >= COLLECTIBLE_THRESHOLD &&
        collectibles.length < MAX_COLLECTIBLES
      ) {
        const newCollectible = generateCollectible(
          newSnake,
          newFood,
          collectibles
        );
        setCollectibles((prev) => [...prev, newCollectible]);
        setFoodEatenSinceLastCollectible(0);
        toast.info("Collectible spawned!");
      }

      // Only generate new food if all food is eaten AND all collectibles are eaten
      if (newFood.length === 0 && collectibles.length === 0) {
        const additionalFood: React.SetStateAction<FoodItem[]> | undefined = [];
        for (let i = 0; i < MAX_FOOD_ITEMS; i++) {
          additionalFood.push(
            generateFood(newSnake, additionalFood, collectibles)
          );
        }
        setFood(additionalFood);
      } else {
        setFood(newFood);
      }

      // Don't reset the hint path or hintActiveRef if the hint is active
      // Only update the path if hint is active
      if (
        hintActiveRef.current &&
        (newFood.length > 0 || collectibles.length > 0)
      ) {
        updateHintPath(newSnake[0]);
      }

      checkWinCondition();
    }

    if (eatenCollectible) {
      const newCollectibles = collectibles.filter(c => c.id !== eatenCollectible.id);
      const currentCapacity = useGameStore.getState().capacity;
      const totalWeight = currentWeightRef.current + eatenCollectible.weight;

      if (totalWeight <= currentCapacity) {
        setInventory(prev => [...prev, collectibleToInventoryItem(eatenCollectible)]);
        setStats(prev => ({ ...prev, inventoryCurrentWeight: totalWeight }));
      } else {
        toast.error("Inventory full! Collectible not stored.");
      }

      setCollectibles(newCollectibles);

      // Generate new food if all food and collectibles are eaten
      if (food.length === 0 && newCollectibles.length === 0) {
        const additionalFood = [];
        for (let i = 0; i < MAX_FOOD_ITEMS; i++) {
          additionalFood.push(generateFood(newSnake, [], []));
        }
        setFood(additionalFood);
      }

      // Don't reset the hint path or hintActiveRef if the hint is active
      // Only update the path if hint is active
      if (
        hintActiveRef.current &&
        (food.length > 0 || newCollectibles.length > 0)
      ) {
        updateHintPath(newSnake[0]);
      }

      checkWinCondition();
    }

    // Always update hint path if hint is active and there are targets
    if (hintActiveRef.current && (food.length > 0 || collectibles.length > 0)) {
      updateHintPath(newSnake[0]);
    }
  }, [
    gameState,
    snake,
    food,
    collectibles,
    foodEatenSinceLastCollectible,
    gameOver,
    checkWinCondition,
    updateHintPath,
  ]);

  const handleDirectionButton = (newDirection: Direction) => {
    const currentDirection = directionRef.current;
    const oppositeDirection = getOppositeDirection(currentDirection);
    
    if (newDirection !== oppositeDirection && 
        newDirection !== currentDirection &&
        directionQueue.current[directionQueue.current.length - 1] !== newDirection) {
      directionQueue.current.push(newDirection);
    }
  };

  const calculateHint = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    // Toggle hint on/off
    if (hintActiveRef.current) {
      // Turn off hint
      hintActiveRef.current = false;
      setHint([]);
      toast("Path optimization disabled");
    } else {
      // Turn on hint
      if (food.length === 0 && collectibles.length === 0) {
        toast.error("No targets available for path optimization");
        return;
      }

      const head = snake[0];
      const allPositions = [
        ...food.map((f) => f.position),
        ...collectibles.map((c) => c.position),
      ];

      const route = tspNearestNeighbor(head, allPositions);

      setHint(route);
      hintActiveRef.current = true;
      toast("Path optimization enabled!");
    }
  }, [food, collectibles, snake, gameState]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;

      e.preventDefault();

      switch (e.key) {
        case "ArrowUp":
          handleDirectionButton(Direction.UP);
          break;
        case "ArrowDown":
          handleDirectionButton(Direction.DOWN);
          break;
        case "ArrowLeft":
          handleDirectionButton(Direction.LEFT);
          break;
        case "ArrowRight":
          handleDirectionButton(Direction.RIGHT);
          break;
        case "h":
          calculateHint();
          break;
      }
    },
    [gameState, calculateHint]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }

      const speed = calculateSpeed(snake.length);

      gameLoopRef.current = setInterval(updateGameState, speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, snake.length, updateGameState]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="relative">
          <PixelatedContainer className="overflow-hidden relative" tabIndex={0}>
            <div
              className="relative"
              style={{
                width: `${GRID_SIZE * CELL_SIZE}px`,
                height: `${GRID_SIZE * CELL_SIZE}px`,
                margin: "0 auto",
                background:
                  "linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 100%)",
                borderRadius: "8px",
              }}
              ref={boardRef}
            >
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
                  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                  boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.5)",
                }}
              />

              {hint.length > 0 && (
                <div className="absolute top-0 left-0 w-full h-full z-5">
                  <svg
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="absolute top-0 left-0"
                  >
                    <path
                      d={hint
                        .map((pos, i) => {
                          const x = pos.x * CELL_SIZE + CELL_SIZE / 2;
                          const y = pos.y * CELL_SIZE + CELL_SIZE / 2;
                          return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                        })
                        .join(" ")}
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      fill="none"
                    />
                    {hint.map((pos, i) => (
                      <circle
                        key={i}
                        cx={pos.x * CELL_SIZE + CELL_SIZE / 2}
                        cy={pos.y * CELL_SIZE + CELL_SIZE / 2}
                        r={i === 0 ? 4 : 3}
                        fill={
                          i === 0
                            ? "rgba(255, 255, 255, 0.5)"
                            : "rgba(255, 255, 255, 0.3)"
                        }
                      />
                    ))}
                    {hint.slice(1).map((pos, i) => (
                      <text
                        key={`text-${i}`}
                        x={pos.x * CELL_SIZE + CELL_SIZE / 2 + 5}
                        y={pos.y * CELL_SIZE + CELL_SIZE / 2 - 5}
                        fontSize="10"
                        fill="rgba(255, 255, 255, 0.8)"
                        className="font-pixel"
                      >
                        {i + 1}
                      </text>
                    ))}
                  </svg>
                </div>
              )}

              {snake.map((segment, index) => (
                <div
                  key={segment.id}
                  className="absolute transition-all duration-100 ease-linear"
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    left: `${segment.x * CELL_SIZE}px`,
                    top: `${segment.y * CELL_SIZE}px`,
                    background:
                      index === 0
                        ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    borderRadius: index === 0 ? "8px" : "6px",
                    transform: index === 0 ? "scale(1.1)" : "scale(1)",
                    boxShadow:
                      index === 0
                        ? "0 0 15px rgba(16, 185, 129, 0.5)"
                        : "0 0 10px rgba(5, 150, 105, 0.3)",
                    zIndex: snake.length - index,
                  }}
                />
              ))}

              {food.map((item) => (
                <div
                  key={item.id}
                  className="absolute animate-pulse"
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    left: `${item.position.x * CELL_SIZE}px`,
                    top: `${item.position.y * CELL_SIZE}px`,
                  }}
                />
              ))}

              {collectibles.map((item) => (
                <div
                  key={item.id}
                  className="absolute animate-bounce"
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    left: `${item.position.x * CELL_SIZE}px`,
                    top: `${item.position.y * CELL_SIZE}px`,
                    background:
                      "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
                    borderRadius: "50%",
                    boxShadow: "0 0 25px rgba(251, 191, 36, 0.7)",
                    animation: "bounce 1s infinite",
                  }}
                />
              ))}

              <Snake segments={snake} />
              <Food food={food} collectibles={collectibles} />

              {gameState !== GameState.PLAYING && (
                <div className="absolute top-0 left-0 w-[101%] h-[101%] bg-black/80 bg-opacity-60 z-50 flex flex-col items-center justify-center transition-all duration-300 animate-fade-in">
                  {gameState === GameState.READY && (
                    <div className="flex flex-col items-center text-center">
                      <h2 className="font-pixel text-2xl text-white mb-2 animate-pulse">
                        Snake Game
                      </h2>
                      <p className="font-pixel text-sm text-white/80 mb-6">
                        Use arrow keys or touch controls to guide the snake.
                        <br />
                        Press &apos;H&apos; for path optimization.
                      </p>
                      <PixelButton
                        onClick={startGame}
                        size="lg"
                        className="transform hover:scale-110 transition-transform duration-200"
                      >
                        Start Game
                      </PixelButton>
                    </div>
                  )}

                  {gameState === GameState.GAME_OVER && (
                    <div className="text-center animate-pixel-shake">
                      <h2 className="font-pixel text-3xl text-red-500 mb-4 animate-pulse">
                        Game Over
                      </h2>
                      <div className="bg-gray-900/80 p-6 rounded-lg mb-6">
                        <p className="font-pixel text-lg text-white mb-2">
                          Final Score: {stats.score}
                        </p>
                        {stats.score === stats.highScore && stats.score > 0 && (
                          <p className="font-pixel text-lg text-yellow-500 animate-bounce">
                            🏆 New High Score! 🏆
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-gray-400 text-sm">Food Eaten</p>
                            <p className="text-xl font-bold text-white">
                              {stats.foodEaten}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Coins</p>
                            <p className="text-xl font-bold text-yellow-400">
                              {coins}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <PixelButton
                          onClick={startGame}
                          className="transform hover:scale-110 transition-transform duration-200"
                        >
                          Play Again
                        </PixelButton>
                      </div>
                    </div>
                  )}

                  {gameState === GameState.WIN && (
                    <div className="text-center">
                      <h2 className="font-pixel text-3xl text-green-500 mb-4 animate-pulse">
                        Victory! 🎉
                      </h2>
                      <div className="bg-gray-900/80 p-6 rounded-lg mb-6">
                        <p className="font-pixel text-lg text-white mb-2">
                          Final Score: {stats.score}
                        </p>
                        {stats.score === stats.highScore && (
                          <p className="font-pixel text-lg text-yellow-500 animate-bounce">
                            🏆 New High Score! 🏆
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-gray-400 text-sm">Food Eaten</p>
                            <p className="text-xl font-bold text-white">
                              {stats.foodEaten}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Coins</p>
                            <p className="text-xl font-bold text-yellow-400">
                              {coins}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <PixelButton
                          onClick={startGame}
                          className="transform hover:scale-110 transition-transform duration-200"
                        >
                          Play Again
                        </PixelButton>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </PixelatedContainer>

          <div className="mt-4">
            <PixelButton
              onClick={calculateHint}
              disabled={
                gameState !== GameState.PLAYING ||
                (food.length === 0 &&
                  collectibles.length === 0 &&
                  !hintActiveRef.current)
              }
              variant={hintActiveRef.current ? "primary" : "secondary"}
              className="w-full transform hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
            >
              <Lightbulb size={16} className="mr-2" />
              {hintActiveRef.current
                ? "Disable Path Optimization"
                : "Optimize Path (TSP)"}
            </PixelButton>
          </div>

          <div className="md:hidden mt-6">
            <div className="flex flex-col items-center gap-3">
              <PixelButton
                onClick={() => handleDirectionButton(Direction.UP)}
                className="w-14 h-14 flex items-center justify-center p-0 transform hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
                disabled={gameState !== GameState.PLAYING}
              >
                <ChevronUp size={24} />
              </PixelButton>

              <div className="flex gap-3">
                <PixelButton
                  onClick={() => handleDirectionButton(Direction.LEFT)}
                  className="w-14 h-14 flex items-center justify-center p-0 transform hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
                  disabled={gameState !== GameState.PLAYING}
                >
                  <ChevronLeft size={24} />
                </PixelButton>

                <PixelButton
                  onClick={() => handleDirectionButton(Direction.DOWN)}
                  className="w-14 h-14 flex items-center justify-center p-0 transform hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
                  disabled={gameState !== GameState.PLAYING}
                >
                  <ChevronDown size={24} />
                </PixelButton>

                <PixelButton
                  onClick={() => handleDirectionButton(Direction.RIGHT)}
                  className="w-14 h-14 flex items-center justify-center p-0 transform hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
                  disabled={gameState !== GameState.PLAYING}
                >
                  <ChevronRight size={24} />
                </PixelButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:col-span-1 flex flex-col gap-4">
        <PixelatedContainer className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-500" size={16} />
                <span className="font-pixel text-xs text-white">Score</span>
              </div>
              <span className="font-pixel text-lg text-white mt-1">
                {stats.score}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Trophy className="text-yellow-500" size={16} />
                <span className="font-pixel text-xs text-white">Best</span>
              </div>
              <span className="font-pixel text-lg text-white mt-1">
                {stats.highScore}
              </span>
            </div>
          </div>

          <div className="flex text-center justify-center mt-2 text-[8px] font-pixel text-muted-foreground">
            <p>
              Food eaten: {foodEatenSinceLastCollectible}/
              {COLLECTIBLE_THRESHOLD} until next collectible
            </p>
          </div>
        </PixelatedContainer>

        <Inventory
          items={useMemo(() => 
            inventory.filter((item) =>
              Object.values(CollectibleType).includes(item.type as CollectibleType)
            ), 
            [inventory] // Only recompute when inventory changes
          )}
          capacity={useGameStore.getState().capacity}
          currentWeight={stats.inventoryCurrentWeight}
          onDeleteItem={handleDeleteInventoryItem}
        />
      </div>
    </div>
  );
};

export default GameBoard;
