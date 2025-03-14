'use client'
import React from "react";
import GameBoard from "@/components/game/GameBoard";
import Navbar from "@/components/Navbar";
import { Sparkles, Cpu } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navbar />
      <div className="flex-1 py-8 pt-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <header className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-pixel text-white pixel-text inline-block relative group">
            Sn<span className="text-game-snake group-hover:animate-snake-move">algo</span>
            <Sparkles 
              className="absolute -top-4 -right-8 text-yellow-400 opacity-70 animate-bounce-subtle" 
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
        
        <main className="max-w-6xl mx-auto w-full">
          <GameBoard />
        </main>
      </div>
    </div>
  );
};

export default Home;
