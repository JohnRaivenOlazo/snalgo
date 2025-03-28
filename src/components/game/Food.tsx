import React from "react";
import { FoodProps } from "@/components/game/utils/types";
import { CELL_SIZE } from "@/components/game/utils/gameLogic";
import { Apple, Cherry, Banana, Grape, Diamond, Star, Zap } from "lucide-react";

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
      case "CRYSTAL":
        return <Diamond className="text-green-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
      case "GEM":
        return <Diamond className="text-blue-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
      case "POTION":
        return <Zap className="text-purple-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
      case "ARTIFACT":
        return <Star className="text-orange-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
      default:
        return <Diamond className="text-green-500 drop-shadow-lg" size={CELL_SIZE - 4} />;
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
          </div>
        </div>
      ))}
    </>
  );
};

export default Food;
