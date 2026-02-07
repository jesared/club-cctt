"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

type SidebarProviderProps = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function SidebarProvider({
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
}: SidebarProviderProps) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (openProp === undefined) {
        setOpenState(value);
      }
      onOpenChange?.(value);
    },
    [onOpenChange, openProp]
  );

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
    }),
    [open, setOpen]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentPropsWithoutRef<"div"> & {
  side?: "left" | "right";
};

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ side = "left", className, children, ...props }, ref) => {
    const { open, setOpen } = useSidebar();
    const translateClass =
      side === "right"
        ? open
          ? "translate-x-0"
          : "translate-x-full"
        : open
          ? "translate-x-0"
          : "-translate-x-full";

    return (
      <div
        className={cn(
          "fixed inset-0 z-50 transition md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-slate-900/40 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          data-state={open ? "open" : "closed"}
          className={cn(
            "absolute top-0 h-full w-80 max-w-[85%] bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300",
            side === "right" ? "right-0" : "left-0",
            translateClass,
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

type SidebarTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
};

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ asChild, onClick, ...props }, ref) => {
    const { open, setOpen } = useSidebar();
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          setOpen(!open);
        }}
        {...props}
      />
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-4",
      className
    )}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-[calc(100%-4rem)] flex-col", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-1 flex-col gap-1 px-4 py-6", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("w-full", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

type SidebarMenuButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
};

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ asChild, isActive, className, ...props }, ref) => {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      ref={ref}
      data-active={isActive}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-sidebar-foreground transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
