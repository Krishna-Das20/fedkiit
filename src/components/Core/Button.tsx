"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import styles from "./styles/Core.module.scss";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  variant?: "primary" | "secondary";
  children: ReactNode;
  isLoading?: boolean;
  style?: CSSProperties;
};

const Button = ({
  variant = "primary",
  children,
  isLoading = false,
  onClick,
  style,
  disabled = false,
  ...rest
}: ButtonProps) => {
  const combinedStyle: CSSProperties = {
    color: variant === "primary" ? "#FF8A00" : "#fff",
    backgroundColor: variant === "primary" ? "#2D2D2D" : "transparent",
    borderColor: variant === "primary" ? "#2D2D2D" : "#fff",
    opacity: disabled || isLoading ? 0.5 : 1,
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    ...style,
  };

  return (
    <button
      className={styles.main_Button}
      style={combinedStyle}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;
