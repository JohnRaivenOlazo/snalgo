'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, HelpCircle, Home } from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Store', href: '/store', icon: Store },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-pixel text-white">
                Sn<span className="text-game-snake">algo</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg font-pixel text-sm transition-all duration-200
                      ${isActive 
                        ? 'bg-game-snake text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                        : 'text-muted-foreground hover:text-white hover:bg-muted/30'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 