import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const imageVariants = cva("block object-contain", {
  variants: {
    variant: {
      default: "",
      rounded: "rounded-lg",
      circle: "rounded-full",
    },
    fit: {
      contain: "object-contain",
      cover: "object-cover",
      fill: "object-fill",
    },
  },
  defaultVariants: {
    variant: "default",
    fit: "contain",
  },
});

export interface ImageProps
  extends
    React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof imageVariants> {
  className?: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, variant, fit, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn(imageVariants({ variant, fit, className }))}
        {...props}
      />
    );
  },
);
Image.displayName = "Image";
