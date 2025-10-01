import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styling with 12px curved corners
          "h-12 w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60",
          // Focus and hover states
          "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Autofill styling
          "autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] autofill:[-webkit-text-fill-color:hsl(var(--foreground))]",
          "dark:autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] dark:autofill:[-webkit-text-fill-color:hsl(var(--foreground))]",
          // Error state (can be added via className)
          "data-[invalid]:border-destructive data-[invalid]:ring-destructive/20",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
