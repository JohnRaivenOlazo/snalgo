'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coins, Trophy, ScrollText, Menu, X } from 'lucide-react';
import { useGameStore } from "@/stores/useGameStore";
import { useSessionStore } from "@/stores/session";
import { motion, AnimatePresence } from "framer-motion";
import PixelButton from "./PixelButton";

const Navbar = () => {
  const { coins } = useGameStore();
  const { guestName } = useSessionStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const newsItems = [
    "Searching",
    "Sorting",
    "Traveling Salesman Problem",
    "Knapsack Problem",
  ];

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-gradient-to-b from-gray-900/90 to-gray-900/50 border-b border-white/10 shadow-2xl shadow-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-1 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse-slow" />
              <Image src="/snalgo.png" alt="Snalgo Logo" width={32} height={32} />
            </div>
            <span className="font-pixel text-2xl bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Sn<span className="text-white/90">algo</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative overflow-hidden h-8 bg-black/30 rounded-lg border border-white/10">
              <div className="flex items-center px-4 h-full space-x-2 animate-marquee whitespace-nowrap">
                {newsItems.concat(newsItems).map((item, i) => (
                  <span key={i} className="text-xs font-pixel text-green-300 flex items-center">
                    <ScrollText className="h-3 w-3 mr-2 text-yellow-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-6">
              <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                <Coins className="h-5 w-5 text-yellow-400 animate-bounce-slow" />
                <span className="font-pixel text-yellow-300">{coins.toLocaleString()}</span>
              </div>
              
              <PixelButton
                variant="glow"
                className="group relative overflow-hidden"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Trophy className="h-4 w-4 mr-2 text-white" />
                <div className="absolute inset-0 bg-white/10 group-hover:opacity-100 opacity-0 transition-opacity" />
              </PixelButton>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-black/30 hover:bg-primary/20 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute w-full bg-gray-900/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  <span className="font-pixel text-yellow-300">{coins.toLocaleString()}</span>
                </div>
                <span className="font-pixel text-green-400">@{guestName}</span>
              </div>
              <div className="space-y-2">
                {newsItems.map((item, i) => (
                  <div key={i} className="p-2 bg-black/30 rounded-lg border border-white/10">
                    <p className="font-pixel text-xs text-green-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 