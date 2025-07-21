import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";
  
  const variants = {
    primary: "bg-terracotta-500 text-white hover:bg-terracotta-600 hover:shadow-lg focus:ring-terracotta-500",
    secondary: "bg-saffron-500 text-white hover:bg-saffron-600 hover:shadow-lg focus:ring-saffron-500",
    outline: "border-2 border-terracotta-500 text-terracotta-500 hover:bg-terracotta-500 hover:text-white focus:ring-terracotta-500",
    ghost: "text-charcoal-500 hover:bg-cream-100 focus:ring-cream-200",
    link: "text-terracotta-500 underline-offset-4 hover:underline focus:ring-terracotta-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-12"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;