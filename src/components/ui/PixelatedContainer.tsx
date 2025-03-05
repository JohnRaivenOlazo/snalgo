
import React from "react";
import { cn } from "@/lib/utils";

interface PixelatedContainerProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  ref?: React.Ref<HTMLDivElement>; // Add ref prop
  tabIndex?: number; // Add tabIndex prop
  glowEffect?: boolean;
  variant?: 'default' | 'elevated' | 'inset';
}

const PixelatedContainer = React.forwardRef<
  HTMLDivElement,
  PixelatedContainerProps
>(({
  children,
  className,
  borderColor = "border-game-border",
  tabIndex,
  glowEffect = false,
  variant = 'default',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative bg-game-board p-4 border-2 pixel-borders",
        borderColor,
        {
          "neon-border": glowEffect,
          "shadow-lg": variant === 'elevated',
          "shadow-inner": variant === 'inset',
          "before:absolute before:inset-0 before:bg-white/[0.01] before:pointer-events-none": true,
        },
        className
      )}
      tabIndex={tabIndex}
      {...props}
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent animate-pulse" style={{ animationDuration: '2s' }}></div>
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/10"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/10"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/10"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/10"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

PixelatedContainer.displayName = "PixelatedContainer";

export default PixelatedContainer;
