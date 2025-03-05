'use client'
import React from "react";
import GameBoard from "@/components/game/GameBoard";
import { Sparkles, Cpu } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-500 opacity-50 animate-pulse"></div>
        <div className="absolute top-3/4 left-1/2 w-1 h-1 bg-green-500 opacity-50 animate-pulse-glow"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-500 opacity-50 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-yellow-500 opacity-50 animate-bounce-subtle"></div>
      </div>
      
      <header className="flex flex-col items-center mb-12 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-pixel text-white pixel-text inline-block relative group">
          Sn<span className="text-game-snake group-hover:animate-snake-move">algo</span>
          <Sparkles 
            className="absolute -top-6 -right-8 text-yellow-400 opacity-70 animate-bounce-subtle" 
            size={20} 
          />
        </h1>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg backdrop-blur-xs animate-fade-in">
          <Cpu size={14} className="text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground font-pixel">
            The OG snake game with integrated algorithms
          </p>
        </div>
      </header>
      
      <main className="flex-1 max-w-6xl mx-auto w-full relative z-10">
        {/* Subtle glow effect around the game board */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-50 rounded-lg blur-xl"></div>
        <GameBoard />
      </main>

    </div>
  );
};

export default Home;
