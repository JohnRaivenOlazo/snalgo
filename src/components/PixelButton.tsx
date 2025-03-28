import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Update the variant type definition
type PixelButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'default' | 'glow';

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: PixelButtonVariant;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  title?: string;
}

export const buttonVariants = cva(
  "font-pixel inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/40",
        secondary: "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 hover:shadow-secondary/30",
        danger: "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-destructive/30",
        success: "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 hover:shadow-emerald/30",
        default: "bg-background text-foreground border-2 border-gray-600 hover:bg-muted hover:border-primary",
        glow: "bg-gradient-to-br from-primary to-purple-500 text-white shadow-xl hover:shadow-primary/30 animate-pulse-glow"
      },
      size: {
        sm: "h-8 px-3 text-xs md:text-sm",
        md: "h-10 px-4 py-2 text-sm md:text-base",
        lg: "h-12 px-8 text-base md:text-lg"
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

// Forward ref for compatibility with UI components
const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(({
  children,
  onClick,
  className,
  disabled,
  variant,
  size,
  type = "button",
  title,
  ...props
}, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={onClick}
      disabled={disabled}
      type={type}
      title={title}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

PixelButton.displayName = "PixelButton";

// Add alias for Button for compatibility
export const Button = PixelButton;

// Add ComponentProps for compatibility
export type ComponentProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>;

export default PixelButton;
