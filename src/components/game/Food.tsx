
import React from "react";
import { FoodProps } from "@/components/game/utils/types";
import { CELL_SIZE } from "@/components/game/utils/gameLogic";
import { Apple, Cherry, Banana, Grape, Coins, Diamond, Star, Zap, Sparkles } from "lucide-react";

const Food: React.FC<FoodProps> = ({ food, collectibles }) => {
  const getFoodIcon = (type: string) => {
    switch (type) {
      case "APPLE":
        return <Apple className="text-red-500 drop-shadow-md" size={CELL_SIZE - 4} />;
      case "CHERRY":
        return <Cherry className="text-pink-500 drop-shadow-md" size={CELL_SIZE - 4} />;
      case "BANANA":
        return <Banana className="text-yellow-500 drop-shadow-md" size={CELL_SIZE - 4} />;
      case "BERRY":
        return <Grape className="text-purple-500 drop-shadow-md" size={CELL_SIZE - 4} />;
      default:
        return <Apple className="text-red-500 drop-shadow-md" size={CELL_SIZE - 4} />;
    }
  };

  const getCollectibleIcon = (type: string) => {
    switch (type) {
      case "COIN":
        return <Coins className="text-yellow-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
      case "GEM":
        return <Diamond className="text-blue-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
      case "POTION":
        return <Zap className="text-purple-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
      case "ARTIFACT":
        return <Star className="text-orange-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
      default:
        return <Coins className="text-yellow-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
    }
  };

  return (
    <>
      {food.map((item) => (
        <div
          key={item.id}
          className="absolute flex items-center justify-center z-5"
          style={{
            width: `${CELL_SIZE}px`,
            height: `${CELL_SIZE}px`,
            left: `${item.position.x * CELL_SIZE}px`,
            top: `${item.position.y * CELL_SIZE}px`,
            animation: 'food-pulse 2s infinite ease-in-out',
            filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3))',
          }}
        >
          <div className="relative">
            {getFoodIcon(item.type)}
            <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-white/30 animate-pulse"></div>
          </div>
        </div>
      ))}
      
      {collectibles.map((item) => (
        <div
          key={item.id}
          className="absolute flex items-center justify-center z-5"
          style={{
            width: `${CELL_SIZE}px`,
            height: `${CELL_SIZE}px`,
            left: `${item.position.x * CELL_SIZE}px`,
            top: `${item.position.y * CELL_SIZE}px`,
            animation: 'float 3s infinite ease-in-out',
            filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.4))',
          }}
        >
          <div className="relative">
            {getCollectibleIcon(item.type)}
            <Sparkles 
              className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" 
              size={12} 
            />
          </div>
          {/* Modified glow indicator position to avoid overlapping with route numbers */}
          <div className="absolute -top-1 -left-1 bg-yellow-500 rounded-full w-3 h-3 flex items-center justify-center animate-pulse-glow">
            <Coins size={2} className="text-white" />
          </div>
        </div>
      ))}
    </>
  );
};

export default Food;
