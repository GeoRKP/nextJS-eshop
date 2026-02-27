"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, LucideIcon } from "lucide-react";

interface FormInputProps extends React.ComponentProps<"input"> {
  icon?: LucideIcon;
  error?: string;
  isValid?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ icon: Icon, error, isValid, className, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        )}
        <Input
          ref={ref}
          className={cn(
            Icon && "pl-10",
            (error || isValid) && "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            isValid && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          {...props}
        />
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive pointer-events-none" />
        )}
        {isValid && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

export { FormInput };
