import React from "react";

import cn from "@/app/util/cn";

type Size = "1xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeClasses: Record<Size, [string, string]> = {
  "1xs": ["w-4 h-4", "h-3/5"],
  xs: ["w-6 h-6", "h-4"],
  sm: ["w-8 h-8", "h-4"],
  md: ["w-10 h-10", "h-5"],
  lg: ["w-12 h-12", "h-6"],
  xl: ["w-14 h-14", "h-7"],
  "2xl": ["w-16 h-16", "h-8"],
};

type IconWithBGProps = React.ComponentProps<"div"> & {
  icon: React.ReactElement;
  size?: Size;
  color?: string;
};

const IconWithBG = React.forwardRef<HTMLDivElement, IconWithBGProps>(
  function IconWithBG({ icon, size, color, className, ...restProps }, ref) {
    const [containerClass, iconClass] = sizeClasses[size ?? "md"];
    return (
      <div
        ref={ref}
        className={cn(
          containerClass,
          "flex shrink-0 items-center justify-center rounded-sm",
          className
        )}
        style={{
          backgroundColor: color,
        }}
        {...restProps}
      >
        {React.isValidElement<{ className?: string }>(icon) &&
          React.cloneElement(icon, {
            className: cn(iconClass, icon.props.className),
          })}
      </div>
    );
  }
);

export default IconWithBG;
