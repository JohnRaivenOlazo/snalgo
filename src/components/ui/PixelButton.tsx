
import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  title?: string;
}

export const buttonVariants = cva(
  "font-pixel inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        danger: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        success: "bg-emerald-500 text-white shadow-xs hover:bg-emerald-600",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
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
