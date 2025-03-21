'use client'
import React from 'react';
import { Keyboard, List, Target, Gem, Zap, Sparkles } from 'lucide-react';

const HelpPage = () => {
  const sections = [
    {
      title: 'Objectives & Rules',
      icon: Target,
      content: [
        '★ Collect food to grow your snake',
        '★ Gather collectibles without exceeding weight limit',
        '★ Reach 60%+ of level\'s optimal value to progress',
        '★ Manage inventory to maximize score',
        '★ Avoid walls and self-collisions'
      ],
    },
    {
      title: 'Key Controls',
      icon: Keyboard,
      content: [
        '←↑→↓ - Directional movement',
        'H - Toggle path optimization',
        'Space - Pause/Resume',
        'Click - Select inventory items',
        'Enter - Start/Restart game'
      ],
    },
    {
      title: 'Game Elements',
      icon: Sparkles,
      content: [
        {
          icon: <Gem className="text-green-500" />,
          text: 'Crystal: Low weight, basic value'
        },
        {
          icon: <Zap className="text-blue-500" />,
          text: 'Gem: Balanced value/weight'
        },
        {
          icon: <Sparkles className="text-purple-500" />,
          text: 'Potion: High value, heavy'
        },
        {
          icon: <List className="text-red-500" />,
          text: 'Artifact: Rare, maximum value'
        }
      ],
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center my-12">
          <h1 className="text-4xl font-pixel text-white mb-4">Snalgo Guide</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="font-pixel">Survive</span>
            <span>•</span>
            <span className="font-pixel">Collect</span>
            <span>•</span>
            <span className="font-pixel">Optimize</span>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-muted/20 rounded-xl p-6 border border-game-border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-game-snake">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-xl font-pixel text-white">{section.title}</h2>
                </div>
                
                <div className="space-y-3">
                  {section.content.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {section.title === 'Game Elements' ? (
                        <>
                          <span className="shrink-0">{(item as { icon: React.JSX.Element, text: string }).icon}</span>
                          <span className="text-muted-foreground">{(item as { icon: React.JSX.Element, text: string }).text}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-game-snake mt-1">▹</span>
                          <span className="text-muted-foreground">{item as string}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-muted-foreground font-pixel">
          <p>Tip: Efficiency matters! Plan your collection route carefully.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 