"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

type ClickableChildProps = {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must be used within <Dialog>");
  }

  return context;
}

function getFocusableElements(container: HTMLElement) {
  const elements = container.querySelectorAll<HTMLElement>(
    [
      "a[href]",
      "area[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "iframe",
      "object",
      "embed",
      "[contenteditable]",
      "[tabindex]:not([tabindex='-1'])",
    ].join(","),
  );

  return Array.from(elements).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0,
  );
}

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : uncontrolledOpen;
  const titleId = React.useId();
  const descriptionId = React.useId();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext.Provider
      value={{
        open: currentOpen,
        setOpen,
        titleId,
        descriptionId,
        contentRef,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement<ClickableChildProps>;
}) {
  const { setOpen } = useDialogContext();

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        children.props.onClick?.(event);

        if (!event.defaultPrevented) {
          setOpen(true);
        }
      },
    });
  }

  return <button type="button" onClick={() => setOpen(true)}>{children}</button>;
}

function DialogClose({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement<ClickableChildProps>;
}) {
  const { setOpen } = useDialogContext();

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        children.props.onClick?.(event);

        if (!event.defaultPrevented) {
          setOpen(false);
        }
      },
    });
  }

  return <button type="button" onClick={() => setOpen(false)}>{children}</button>;
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen, titleId, descriptionId, contentRef } =
    useDialogContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const content = contentRef.current;
    if (!content) {
      return;
    }

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const animationFrame = window.requestAnimationFrame(() => {
      const [firstFocusableElement] = getFocusableElements(content);
      (firstFocusableElement ?? content).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(content);
      if (focusableElements.length === 0) {
        event.preventDefault();
        content.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (event.shiftKey) {
        if (!activeElement || activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (!activeElement || activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [contentRef, open, setOpen]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div
        className="absolute inset-0 bg-background/75 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
      >
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            "relative w-full max-w-lg rounded-2xl border border-border/70 bg-card shadow-xl outline-none",
            className,
          )}
          onMouseDown={(event) => event.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  const { titleId } = useDialogContext();

  return (
    <h2 id={titleId} className={cn("font-semibold", className)} {...props} />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const { descriptionId } = useDialogContext();

  return (
    <p
      id={descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
