import type { ImgHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import styles from "./Logo.module.css";

export type LogoVariant = "header" | "footer" | "icon" | "hero";

export interface LogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  variant?: LogoVariant;
  className?: string;
  imgClassName?: string;
  src?: string;
}

export default function Logo({
  variant = "header",
  className,
  imgClassName,
  alt = "Colhe+ - Conectando alimentos e comunidades",
  src = "/logo.png",
  ...rest
}: LogoProps) {
  const variantClass = styles[variant] || styles.header;

  return (
    <span className={cn(styles.logoWrapper, variantClass, className)}>
      <img
        src={src}
        alt={alt}
        className={cn(styles.logoImage, imgClassName)}
        loading={variant === "header" ? "eager" : "lazy"}
        {...rest}
      />
    </span>
  );
}
