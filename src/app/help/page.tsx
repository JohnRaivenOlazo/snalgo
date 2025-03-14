'use client'
import React from 'react';
import { ArrowRight, Keyboard, Trophy, Lightbulb, Star } from 'lucide-react';

const HelpPage = () => {
  const sections = [
    {
      title: 'How to Play',
      icon: Keyboard,
      content: [
        'Use arrow keys to control the snake',
        'Collect food to grow longer and earn points',
        'Collect special items to store in your inventory',
        'Press Space to pause/resume the game',
        'Press H to get a hint for the optimal path',
      ],
    },
    {
      title: 'Game Mechanics',
      icon: Star,
      content: [
        'Snake grows longer with each food collected',
        'Game speed increases as your snake grows',
        'Special collectibles appear after collecting enough food',
        'Inventory has a weight limit for collectibles',
        'Sell collectibles to earn coins',
      ],
    },
    {
      title: 'Scoring & Stats',
      icon: Trophy,
      content: [
        'Track your score and high score',
        'Monitor your snake length',
        'Collect coins from selling items',
        'Keep track of food eaten',
        'Manage your inventory weight',
      ],
    },
    {
      title: 'Tips & Tricks',
      icon: Lightbulb,
      content: [
        'Use the hint system (H key) to find optimal paths',
        'Plan your route to collect both food and items',
        'Watch your inventory weight to avoid losing collectibles',
        'Use walls strategically to navigate the board',
        'Practice controlling your snake at higher speeds',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-pixel text-white mb-4">Game Help</h1>
          <p className="text-muted-foreground font-pixel">
            Everything you need to know about Sn<span className="text-game-snake">algo</span>
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-muted/20 backdrop-blur-sm rounded-xl p-6 border border-border/40 hover:border-game-snake/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-game-snake">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-2xl font-pixel text-white">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <ArrowRight className="text-game-snake mt-1" size={16} />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 