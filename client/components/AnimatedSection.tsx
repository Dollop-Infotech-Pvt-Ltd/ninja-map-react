import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  margin?: string;
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  threshold = 0.1,
  margin = "-50px",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const inView = useInView(ref, {
    once: true, // This ensures animation only happens once
    // margin,
    amount: threshold,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          delay: delay * 0.3,
          ease: "easeOut",
        }
      } : {}}
      className={`${className} gpu-accelerated`}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
