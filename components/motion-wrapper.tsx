"use client";

import { motion, MotionProps } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ReactNode } from "react";

interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function MotionWrapper({
  children,
  fallback,
  ...motionProps
}: MotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{fallback || children}</>;
  }

  return <motion.div {...motionProps}>{children}</motion.div>;
}

// Optimized animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: "easeOut" },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};
