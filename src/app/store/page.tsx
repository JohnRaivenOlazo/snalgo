'use client'
import React from 'react';
import { Coins, Zap, Shield, Star } from 'lucide-react';

const StorePage = () => {
  const upgrades = [
    {
      name: 'Speed Boost',
      description: 'Increase snake movement speed',
      price: 100,
      icon: Zap,
      color: 'text-yellow-400',
    },
    {
      name: 'Shield',
      description: 'Protection against one collision',
      price: 200,
      icon: Shield,
      color: 'text-blue-400',
    },
    {
      name: 'Double Points',
      description: '2x points multiplier',
      price: 300,
      icon: Star,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-pixel text-white mb-4">Game Store</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg backdrop-blur-xs">
            <Coins className="text-yellow-400" size={20} />
            <span className="text-muted-foreground font-pixel">1000 Coins</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upgrades.map((upgrade) => {
            const Icon = upgrade.icon;
            return (
              <div
                key={upgrade.name}
                className="group relative bg-muted/20 backdrop-blur-sm rounded-xl p-6 border border-border/40 hover:border-game-snake/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-game-snake/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative">
                  <div className={`${upgrade.color} mb-4`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-pixel text-white mb-2">{upgrade.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{upgrade.description}</p>
                  <button className="w-full px-4 py-2 bg-game-snake text-white font-pixel rounded-lg hover:bg-game-snake/90 transition-colors duration-200">
                    {upgrade.price} Coins
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StorePage; 