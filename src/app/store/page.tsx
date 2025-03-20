'use client'
import React, { useState } from 'react';
import { Coins, Package, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import PixelatedContainer from '@/components/ui/PixelatedContainer';
import PixelButton from '@/components/ui/PixelButton';
import { toast } from 'sonner';

const StorePage = () => {
  const { coins, upgradeCapacity, capacity, reset } = useGameStore();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = () => {
    reset();
    toast.success("All progress reset!");
  };

  const upgrades = [
    {
      name: 'Upgrade Capacity',
      description: 'Increase inventory capacity by 10',
      price: 10,
      icon: Package,
      color: 'text-yellow-400',
      action: upgradeCapacity
    }
  ];

  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-pixel text-white mb-4">Game Store</h1>
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg backdrop-blur-xs">
              <Coins className="text-yellow-400" size={20} />
              <span className="text-muted-foreground font-pixel">{coins} Coins</span>
            </div>
            <PixelatedContainer className="p-2 px-4 flex items-center gap-2">
              <span className="font-pixel text-sm text-white">
                Capacity: {capacity}
              </span>
            </PixelatedContainer>
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          <PixelButton
            variant="danger"
            onClick={() => setShowConfirmation(true)}
            className="group hover:animate-pixel-shake"
          >
            <RotateCcw className="mr-2 group-hover:animate-spin" size={18} />
            Reset Progress
          </PixelButton>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <PixelatedContainer className="p-6 max-w-md text-center">
              <h3 className="font-pixel text-xl text-white mb-4">
                Confirm Reset?
              </h3>
              <p className="text-muted-foreground mb-6">
                This will reset all coins, inventory, and upgrades!
              </p>
              <div className="flex justify-center gap-4">
                <PixelButton
                  variant="danger"
                  onClick={() => {
                    handleReset();
                    setShowConfirmation(false);
                  }}
                >
                  Yes, Reset
                </PixelButton>
                <PixelButton
                  variant="secondary"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </PixelButton>
              </div>
            </PixelatedContainer>
          </div>
        )}

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
                  <button 
                    onClick={upgrade.action}
                    className={`w-full px-4 py-2 text-white font-pixel rounded-lg transition-colors duration-200 ${
                      coins >= upgrade.price 
                        ? 'bg-game-snake hover:bg-game-snake/90' 
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                    disabled={coins < upgrade.price}
                  >
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