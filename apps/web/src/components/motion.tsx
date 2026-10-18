import { useEffect, useRef, useState } from "react";
import { Card, type CardProps } from "@mui/material";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

/** Container that staggers the entrance of its children. */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** A single item that fades + slides up into place. */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

/**
 * A Card that animates in on scroll into view and lifts on hover.
 * Drop-in replacement for MUI <Card> in animated grids.
 *
 * Implemented as a motion.div wrapping a plain MUI Card to avoid the type
 * clash between MUI's DOM event handlers and Framer Motion's prop types.
 */
export function AnimatedCard({
  children,
  delay = 0,
  sx,
  ...props
}: CardProps & { children: ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      style={{ height: typeof sx === "object" && sx && "height" in sx ? "100%" : undefined }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <Card sx={sx} {...props}>
        {children}
      </Card>
    </motion.div>
  );
}

/** Wraps a route's content with an enter/exit transition. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animates a number from its previous value to the target. Useful for prices,
 * P&L, and index values so updates feel alive.
 */
export function CountUp({
  value,
  format,
  duration = 1,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState(format(0));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => setDisplay(format(latest)));
  }, [spring, format]);

  return <span ref={ref}>{display}</span>;
}
