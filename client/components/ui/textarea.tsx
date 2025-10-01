import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styling with 12px curved corners
          "min-h-[96px] w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-3 text-sm font-medium transition-all duration-200 placeholder:text-muted-foreground/60 resize-y",
          // Focus and hover states
          "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hover:border-border/80 hover:bg-background/90",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
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
Textarea.displayName = "Textarea";

export { Textarea };
