import React, { useState, useEffect, useCallback, useRef } from "react";
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
  FoodType,
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
  MAX_STOMACH_CAPACITY,
  MAX_FOOD_ITEMS,
  MAX_COLLECTIBLES,
  COLLECTIBLE_THRESHOLD,
} from "@/components/game/utils/gameLogic";
import {
  knapsackAlgorithm,
  tspNearestNeighbor,
} from "@/components/game/utils/algorithms";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  HeartPulse,
  Trophy,
  Lightbulb,
  Coins,
} from "lucide-react";

const GameBoard: React.FC = () => {
  const [snake, setSnake] = useState<SnakeSegment[]>([]);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [nextDirection, setNextDirection] = useState<Direction>(
    Direction.RIGHT
  );
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
    inventoryCapacity: MAX_STOMACH_CAPACITY,
    inventoryCurrentWeight: 0,
    level: 1,
  });

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const hintActiveRef = useRef<boolean>(false);

  const initGame = useCallback(() => {
    const initialSnake = createInitialSnake();
    setSnake(initialSnake);
    setDirection(Direction.RIGHT);
    setNextDirection(Direction.RIGHT);

    const initialFood: FoodItem[] = [];
    for (let i = 0; i < MAX_FOOD_ITEMS; i++) {
      initialFood.push(generateFood(initialSnake, initialFood, []));
    }
    setFood(initialFood);

    // Add initial collectible
    const initialCollectible = generateCollectible(
      initialSnake,
      initialFood,
      []
    );
    setCollectibles([initialCollectible]);
    setFoodEatenSinceLastCollectible(0);
    setGameState(GameState.READY);
    setInventory([]);
    setHint([]);
    setStats({
      score: 0,
      highScore: localStorage.getItem("snakeHighScore")
        ? parseInt(localStorage.getItem("snakeHighScore") || "0")
        : 0,
      foodEaten: 0,
      coinsCollected: 0,
      inventoryCapacity: MAX_STOMACH_CAPACITY,
      inventoryCurrentWeight: 0,
      level: 1,
    });

    hintActiveRef.current = false;
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

  const pauseGame = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.PLAYING);

      if (boardRef.current) {
        boardRef.current.focus();
      }
    }
  }, [gameState]);

  const resetGame = useCallback(() => {
    initGame();
  }, [initGame]);

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
    setInventory((prevInventory) => {
      const item = prevInventory.find((i) => i.id === itemId);
      if (!item) return prevInventory;

      if (item.sellValue) {
        setStats((prev) => ({
          ...prev,
          coinsCollected: prev.coinsCollected + item.sellValue!,
          inventoryCurrentWeight: prev.inventoryCurrentWeight - item.weight,
        }));
        toast.success(`Sold for ${item.sellValue} coins!`);
      }

      return prevInventory.filter((i) => i.id !== itemId);
    });
  }, []);

  const handleCapacityChange = useCallback(
    (newCapacity: number) => {
      const costPerUpgrade = 10;
      const capacityChange = newCapacity - stats.inventoryCapacity;

      if (capacityChange > 0) {
        const upgradeCost = costPerUpgrade * (capacityChange / 10);

        if (stats.coinsCollected >= upgradeCost) {
          setStats((prev) => ({
            ...prev,
            inventoryCapacity: newCapacity,
            coinsCollected: prev.coinsCollected - upgradeCost,
          }));
          toast.success(`Inventory upgraded! Cost: ${upgradeCost} coins`);
        } else {
          toast.error(`Not enough coins! Need ${upgradeCost} coins`);
          return;
        }
      }

      if (stats.inventoryCurrentWeight > newCapacity && inventory.length > 0) {
        const inventoryCollectibles = inventory.filter((item) =>
          Object.values(CollectibleType).includes(item.type as CollectibleType)
        );

        const collectibleItems: FoodItem[] = inventoryCollectibles.map(
          (item) => ({
            id: item.id,
            position: { x: 0, y: 0 },
            type: "APPLE" as FoodType,
            value: item.value,
            weight: item.weight,
            color: "",
          })
        );

        const keepItems = knapsackAlgorithm(collectibleItems, 0, newCapacity);

        const updatedInventory = inventory.filter((item) =>
          keepItems.some((keepItem) => keepItem.id === item.id)
        );

        const totalWeight = updatedInventory.reduce(
          (sum, item) => sum + item.weight,
          0
        );

        toast.info("Capacity changed! Optimizing inventory...");

        setInventory(updatedInventory);
        setStats((prev) => ({
          ...prev,
          inventoryCurrentWeight: totalWeight,
        }));
      }
    },
    [
      inventory,
      stats.inventoryCurrentWeight,
      stats.inventoryCapacity,
      stats.coinsCollected,
    ]
  );

  const updateHintPath = useCallback(
    (head: Position) => {
      if (
        (food.length === 0 && collectibles.length === 0) ||
        gameState !== GameState.PLAYING
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

    setDirection(nextDirection);
    const head = snake[0];

    const newHead: SnakeSegment = {
      ...getNewHeadPosition(head, nextDirection),
      id: crypto.randomUUID(),
    };

    if (willHitWall(head, nextDirection) || willHitSelf(newHead, snake)) {
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

      setHint([]);
      hintActiveRef.current = false;

      checkWinCondition();
    }

    if (eatenCollectible) {
      const newCollectibles = collectibles.filter(
        (c) => c.id !== eatenCollectible.id
      );

      const inventoryItem = collectibleToInventoryItem(eatenCollectible);
      const newInventoryWeight =
        stats.inventoryCurrentWeight + eatenCollectible.weight;

      // Don't add score for collectibles, only add them to inventory
      if (newInventoryWeight <= stats.inventoryCapacity) {
        setInventory((prev) => [...prev, inventoryItem]);
        setStats((prev) => ({
          ...prev,
          inventoryCurrentWeight: newInventoryWeight,
        }));
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

      setHint([]);
      hintActiveRef.current = false;

      checkWinCondition();
    }

    if (hintActiveRef.current && (food.length > 0 || collectibles.length > 0)) {
      updateHintPath(newSnake[0]);
    }
  }, [
    gameState,
    nextDirection,
    snake,
    food,
    collectibles,
    stats.inventoryCapacity,
    stats.inventoryCurrentWeight,
    foodEatenSinceLastCollectible,
    gameOver,
    checkWinCondition,
    updateHintPath,
  ]);

  const calculateHint = useCallback(() => {
    if (
      (food.length === 0 && collectibles.length === 0) ||
      gameState !== GameState.PLAYING
    )
      return;

    const head = snake[0];

    const allPositions = [
      ...food.map((f) => f.position),
      ...collectibles.map((c) => c.position),
    ];

    const route = tspNearestNeighbor(head, allPositions);

    setHint(route);
    hintActiveRef.current = true;

    toast("Hint: Optimal path calculated!");
  }, [food, collectibles, snake, gameState]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;

      e.preventDefault();

      switch (e.key) {
        case "ArrowUp":
          if (direction !== Direction.DOWN) {
            setNextDirection(Direction.UP);
          }
          break;
        case "ArrowDown":
          if (direction !== Direction.UP) {
            setNextDirection(Direction.DOWN);
          }
          break;
        case "ArrowLeft":
          if (direction !== Direction.RIGHT) {
            setNextDirection(Direction.LEFT);
          }
          break;
        case "ArrowRight":
          if (direction !== Direction.LEFT) {
            setNextDirection(Direction.RIGHT);
          }
          break;
        case " ":
          pauseGame();
          break;
        case "h":
          calculateHint();
          break;
      }
    },
    [direction, gameState, pauseGame, calculateHint]
  );

  const handleDirectionButton = (newDirection: Direction) => {
    if (gameState !== GameState.PLAYING) return;

    const oppositeDir = getOppositeDirection(direction);
    if (newDirection !== oppositeDir) {
      setNextDirection(newDirection);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 flex flex-col gap-4">
        <PixelatedContainer className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-4 mt-2">
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

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Coins className="text-yellow-500" size={16} />
                <span className="font-pixel text-xs text-white">Coins</span>
              </div>
              <span className="font-pixel text-lg text-white mt-1">
                {stats.coinsCollected}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <HeartPulse className="text-red-500" size={16} />
                <span className="font-pixel text-xs text-white">Length</span>
              </div>
              <span className="font-pixel text-lg text-white mt-1">
                {snake.length - 3}
              </span>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            {gameState === GameState.PLAYING ? (
              <PixelButton onClick={pauseGame}>
                <Pause size={16} className="mr-2" />
                Pause
              </PixelButton>
            ) : (
              <PixelButton onClick={startGame}>
                <Play size={16} className="mr-2" />
                {gameState === GameState.READY ||
                gameState === GameState.GAME_OVER ||
                gameState === GameState.WIN
                  ? "Start"
                  : "Resume"}
              </PixelButton>
            )}

            <PixelButton
              variant="secondary"
              onClick={resetGame}
              disabled={gameState === GameState.PLAYING}
            >
              <RotateCcw size={16} className="mr-2" />
              Reset
            </PixelButton>
          </div>

          <div className="flex text-center justify-center mt-2 text-[8px] font-pixel text-muted-foreground">
            <p>
              Food eaten: {foodEatenSinceLastCollectible}/
              {COLLECTIBLE_THRESHOLD} until next collectible
            </p>
          </div>
        </PixelatedContainer>

        <Inventory
          items={inventory.filter((item) =>
            Object.values(CollectibleType).includes(
              item.type as CollectibleType
            )
          )}
          capacity={stats.inventoryCapacity}
          currentWeight={stats.inventoryCurrentWeight}
          onDeleteItem={handleDeleteInventoryItem}
          onCapacityChange={handleCapacityChange}
        />
      </div>

      <div className="md:col-span-2">
        <div className="relative">
          <PixelatedContainer className="overflow-hidden relative" tabIndex={0}>
            <div
              className="relative"
              style={{
                width: `${GRID_SIZE * CELL_SIZE}px`,
                height: `${GRID_SIZE * CELL_SIZE}px`,
                margin: "0 auto",
              }}
              ref={boardRef}
            >
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
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

              <Snake segments={snake} />
              <Food food={food} collectibles={collectibles} />

              {gameState !== GameState.PLAYING && (
                <div className="absolute top-0 left-0 w-[101%] h-[101%] bg-black/80 bg-opacity-60 z-50 flex flex-col items-center justify-center transition-all duration-300 animate-fade-in">
                  {gameState === GameState.READY && (
                    <div className="flex flex-col items-center text-center">
                      <p className="font-pixel text-sm text-white mb-6">
                        Use &apos;arrow keys&apos; to control the snake!
                      </p>
                      <PixelButton onClick={startGame} size="lg">
                        Start Game
                      </PixelButton>
                    </div>
                  )}

                  {gameState === GameState.PAUSED && (
                    <div className="text-center">
                      <h2 className="font-pixel text-xl text-white mb-4 pixel-text">
                        Game Paused
                      </h2>
                      <PixelButton onClick={pauseGame} size="lg">
                        Resume
                      </PixelButton>
                    </div>
                  )}

                  {gameState === GameState.GAME_OVER && (
                    <div className="text-center animate-pixel-shake">
                      <h2 className="font-pixel text-xl text-red-500 mb-4 pixel-text">
                        Game Over
                      </h2>
                      <p className="font-pixel text-sm text-white mb-2">
                        Score: {stats.score}
                      </p>
                      {stats.score === stats.highScore && stats.score > 0 && (
                        <p className="font-pixel text-sm text-yellow-500 mb-6">
                          New High Score!
                        </p>
                      )}
                      <div className="flex gap-4 justify-center">
                        <PixelButton onClick={startGame}>
                          Play Again
                        </PixelButton>
                      </div>
                    </div>
                  )}

                  {gameState === GameState.WIN && (
                    <div className="text-center">
                      <h2 className="font-pixel text-xl text-green-500 mb-4 pixel-text">
                        You Won!
                      </h2>
                      <p className="font-pixel text-sm text-white mb-2">
                        Score: {stats.score}
                      </p>
                      {stats.score === stats.highScore && (
                        <p className="font-pixel text-sm text-yellow-500 mb-6">
                          New High Score!
                        </p>
                      )}
                      <div className="flex gap-4 justify-center">
                        <PixelButton onClick={startGame}>
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
                (food.length === 0 && collectibles.length === 0)
              }
              variant="secondary"
              className="w-full"
            >
              <Lightbulb size={16} className="mr-2" />
              Optimize Path (TSP)
            </PixelButton>
          </div>

          <div className="md:hidden mt-4">
            <div className="flex flex-col items-center gap-2">
              <PixelButton
                onClick={() => handleDirectionButton(Direction.UP)}
                className="w-12 h-12 flex items-center justify-center p-0"
                disabled={gameState !== GameState.PLAYING}
              >
                <ChevronUp size={20} />
              </PixelButton>

              <div className="flex gap-2">
                <PixelButton
                  onClick={() => handleDirectionButton(Direction.LEFT)}
                  className="w-12 h-12 flex items-center justify-center p-0"
                  disabled={gameState !== GameState.PLAYING}
                >
                  <ChevronLeft size={20} />
                </PixelButton>

                <PixelButton
                  onClick={() => handleDirectionButton(Direction.DOWN)}
                  className="w-12 h-12 flex items-center justify-center p-0"
                  disabled={gameState !== GameState.PLAYING}
                >
                  <ChevronDown size={20} />
                </PixelButton>

                <PixelButton
                  onClick={() => handleDirectionButton(Direction.RIGHT)}
                  className="w-12 h-12 flex items-center justify-center p-0"
                  disabled={gameState !== GameState.PLAYING}
                >
                  <ChevronRight size={20} />
                </PixelButton>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="font-pixel text-xs text-muted-foreground">
              Use arrow keys to control the snake. Press &apos;H&apos; for
              hints.
            </p>
            <p className="font-pixel text-[10px] text-muted-foreground/50 mt-1">
              Collect items and sell them for coins or to upgrade your
              inventory!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
