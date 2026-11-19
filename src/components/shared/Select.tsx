import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const selectTriggerStyles = cva(
  "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border-light-grayish-blue bg-white px-3 text-sm text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand",
  {
    variants: {
      size: {
        default: "h-10",
        sm: "h-9 text-sm",
        lg: "h-11 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const selectContentStyles = cva(
  "overflow-hidden rounded-xl border border-border-default bg-white shadow-2xl z-50",
  {
    variants: {
      width: {
        default: "w-[var(--radix-select-trigger-width)]",
        fit: "w-auto",
      },
    },
    defaultVariants: {
      width: "default",
    },
  },
);

const selectItemStyles = cva(
  "relative flex cursor-pointer select-none items-center rounded-[6px] px-3 py-2 text-sm text-gray-900 outline-none transition-colors data-[highlighted]:bg-brand/10 data-[highlighted]:text-gray-900 data-[state=checked]:bg-brand data-[state=checked]:text-white data-[state=checked]:font-medium",
  {
    variants: {
      variant: {
        default: "",
        ghost: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface SelectProps
  extends
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>,
    VariantProps<typeof selectTriggerStyles> {
  className?: string;
  contentClassName?: string;
  width?: "default" | "fit";
}

export const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectProps
>(({ className, size, width, contentClassName, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(selectTriggerStyles({ size, className }))}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            selectContentStyles({ width, className: contentClassName }),
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});
Select.displayName = SelectPrimitive.Root.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(selectItemStyles(), className)}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-3 inline-flex items-center">
      <Check className="h-4 w-4" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
