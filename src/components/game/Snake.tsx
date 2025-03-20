import React from "react";
import { SnakeProps } from "@/components/game/utils/types";
import { CELL_SIZE } from "@/components/game/utils/gameLogic";

const Snake: React.FC<SnakeProps> = ({ segments }) => {
  if (!segments.length) return null;

  return (
    <>
      {segments.map((segment, index) => {
        const isHead = index === 0;
        const isNeck = index === 1;
        const isTail = index === segments.length - 1;

        const segmentOpacity = isHead ? 1 : Math.max(0.6, 1 - index * 0.025);

        const segmentSize = isHead
          ? 1.2
          : isNeck
          ? 1.05
          : isTail
          ? 0.85
          : 1 - index * 0.005;

        return (
          <div
            key={segment.id}
            className={`absolute rounded-md transition-all
              ${isHead ? "bg-game-snake-head z-20" : "bg-game-snake z-10"}
              ${isHead ? "animate-snake-move" : ""}
              ${isTail ? "animate-bounce-subtle" : ""}
            `}
            style={{
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              left: `${segment.x * CELL_SIZE}px`,
              top: `${segment.y * CELL_SIZE}px`,
              transform: `scale(${segmentSize})`,
              opacity: segmentOpacity,
              transition: "all 0.1s linear",
              boxShadow: "inset 0 0 4px rgba(255, 255, 255, 0.3)"
            }}
          ></div>
        );
      })}
    </>
  );
};

export default Snake;
