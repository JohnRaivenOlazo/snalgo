
import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "./separator";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const Sidebar = ({ className, children, ...props }: SidebarProps) => {
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full max-w-xs border-r border-border bg-card p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const SidebarSection = ({ title, className, children, ...props }: SidebarSectionProps) => {
  return (
    <div className={cn("py-2", className)} {...props}>
      {title && (
        <h3 className="mb-2 px-4 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
      )}
      {children}
      <Separator className="mt-4" />
    </div>
  );
};

const SidebarItem = ({ 
  icon, 
  title, 
  active, 
  onClick, 
  className, 
  children, 
  ...props 
}: SidebarItemProps) => {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground hover:bg-accent/80"
          : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="shrink-0 text-foreground/50">{icon}</span>}
      {title && <span>{title}</span>}
      {children}
    </div>
  );
};

export { Sidebar, SidebarSection, SidebarItem };
