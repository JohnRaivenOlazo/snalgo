'use client'
import React from "react";
import GameBoard from "@/components/game/GameBoard";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="flex-1 py-8 pt-20 px-2 sm:px-6 lg:px-8 relative z-10">
        <main className="max-w-7xl mx-auto w-full">
          <GameBoard />
        </main>
      </div>
    </div>
  );
};

export default Home;
