"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  containerClassName?: string;
  className?: string;
  duration?: number;
  clockwise?: boolean;
}) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const mapDirectionRadialGradient: Record<Direction, string> = {
    TOP: "radial-gradient(30% 50% at 50% 0%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
    LEFT: "radial-gradient(30% 50% at 0% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
    BOTTOM: "radial-gradient(30% 50% at 50% 100%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
    RIGHT: "radial-gradient(30% 50% at 100% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)",
  };

  const mapDirectionLinearGradient: Record<Direction, string> = {
    TOP: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent)",
    LEFT: "linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent)",
    BOTTOM: "linear-gradient(270deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent)",
    RIGHT: "linear-gradient(0deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent)",
  };

  useEffect(() => {
    if (!hovered) return;
    const interval = setInterval(() => {
      setDirection((prevState) => rotateDirection(prevState));
    }, duration * 1000 * 0.2);

    return () => clearInterval(interval);
  }, [hovered, duration, clockwise]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex content-center bg-black/40 hover:bg-black/80 transition duration-500 items-center justify-center rounded-xl border border-white/10 p-[1px] focus:outline-none focus:ring-2 focus:ring-white/20",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-full text-white bg-black z-10 px-6 py-3 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ opacity: 0 }}
        animate={{
          background: hovered
            ? [mapDirectionRadialGradient[direction], mapDirectionLinearGradient[direction]]
            : "radial-gradient(30% 50% at 50% 0%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%)",
          opacity: hovered ? 1 : 0,
        }}
        transition={{ ease: "easeInOut", duration: 0.5 }}
      />
      <div className="absolute inset-[1px] bg-background rounded-[inherit] z-0" />
    </Tag>
  );
}
