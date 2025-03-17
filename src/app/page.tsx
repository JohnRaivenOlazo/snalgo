'use client'
import React from "react";
import GameBoard from "@/components/game/GameBoard";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navbar />
      <div className="flex-1 py-8 pt-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <main className="max-w-6xl mx-auto w-full">
          <GameBoard />
        </main>
      </div>
    </div>
  );
};

export default Home;
