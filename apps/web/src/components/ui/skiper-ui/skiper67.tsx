"use client";

import { AnimatePresence, motion, useSpring } from "framer-motion";
import { Play, X } from "lucide-react";
import {
  MediaControlBar,
  MediaController,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import type { ComponentProps } from "react";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type VideoPlayerProps = ComponentProps<typeof MediaController>;

export const VideoPlayer = ({ style, ...props }: VideoPlayerProps) => (
  <MediaController
    style={{
      ...style,
    }}
    {...props}
  />
);

export const VideoPlayerControlBar = (props: ComponentProps<typeof MediaControlBar>) => (
  <MediaControlBar {...props} />
);

export const VideoPlayerTimeRange = ({
  className,
  ...props
}: ComponentProps<typeof MediaTimeRange>) => (
  <MediaTimeRange
    className={cn(
      "[--media-range-thumb-opacity:0] [--media-range-track-height:2px] [--media-control-hover-background:transparent] [--media-control-background:transparent]",
      className
    )}
    {...props}
  />
);

export const VideoPlayerTimeDisplay = ({
  className,
  ...props
}: ComponentProps<typeof MediaTimeDisplay>) => (
  <MediaTimeDisplay className={cn("p-2.5 text-xs text-white/80 font-mono", className)} {...props} />
);

export const VideoPlayerVolumeRange = ({
  className,
  ...props
}: ComponentProps<typeof MediaVolumeRange>) => (
  <MediaVolumeRange className={cn("p-2.5", className)} {...props} />
);

export const VideoPlayerPlayButton = ({
  className,
  ...props
}: ComponentProps<typeof MediaPlayButton>) => (
  <MediaPlayButton className={cn("text-white hover:text-white/80", className)} {...props} />
);

export const VideoPlayerSeekBackwardButton = ({
  className,
  ...props
}: ComponentProps<typeof MediaSeekBackwardButton>) => (
  <MediaSeekBackwardButton className={cn("p-2.5 text-white hover:text-white/80", className)} {...props} />
);

export const VideoPlayerSeekForwardButton = ({
  className,
  ...props
}: ComponentProps<typeof MediaSeekForwardButton>) => (
  <MediaSeekForwardButton className={cn("p-2.5 text-white hover:text-white/80", className)} {...props} />
);

export const VideoPlayerMuteButton = ({
  className,
  ...props
}: ComponentProps<typeof MediaMuteButton>) => (
  <MediaMuteButton className={cn("text-white hover:text-white/80", className)} {...props} />
);

export const VideoPlayerContent = ({
  className,
  ...props
}: ComponentProps<"video">) => (
  <video className={cn("mb-0 mt-0", className)} {...props} />
);

export const Skiper67 = ({
  videoSrc = "https://res.cloudinary.com/dkt9vrlf0/video/upload/v1784297599/lv_0_20260717193936_drvv6q.mp4",
  thumbnailVideoSrc = "https://res.cloudinary.com/dkt9vrlf0/video/upload/v1784297599/lv_0_20260717193936_drvv6q.mp4",
  className,
}: {
  videoSrc?: string;
  thumbnailVideoSrc?: string;
  className?: string;
}) => {
  const [showVideoPopOver, setShowVideoPopOver] = useState(false);

  const SPRING = {
    mass: 0.1,
  };

  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const opacity = useSpring(0, SPRING);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    opacity.set(1);
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - bounds.left);
    y.set(e.clientY - bounds.top);
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      <VideoPopOverPortal show={showVideoPopOver} videoSrc={videoSrc} setShowVideoPopOver={setShowVideoPopOver} />

      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          opacity.set(0);
        }}
        onClick={() => setShowVideoPopOver(true)}
        className="relative cursor-pointer w-full aspect-video rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-boxdark shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-black/20 dark:hover:border-white/20 select-none group"
      >
        {/* Play Button Cursor Follower */}
        <motion.div
          style={{ x, y, opacity, translateX: "-50%", translateY: "-50%" }}
          className="absolute pointer-events-none z-30 flex items-center justify-center gap-2 p-3 text-xs font-mono font-bold bg-white text-black rounded-full shadow-lg"
        >
          <Play className="size-3 fill-black text-black" /> PLAY
        </motion.div>

        {/* Thumbnail autoloop video */}
        <video
          autoPlay
          muted
          playsInline
          loop
          className="h-full w-full object-cover opacity-80 animate-fade-in"
        >
          <source src={thumbnailVideoSrc} type="video/mp4" />
        </video>

        {/* Outer overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-10" />

        {/* Tech Video Player Bar layout */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 font-mono text-[9px] text-bodydark2">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            NEXPOD_SYSTEM_OS: ACTIVE
          </span>
          <span>DEMO VIDEO</span>
        </div>

        {/* Pulsing Play Button Overlay in center */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-16 h-16 rounded-full bg-black/45 border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Play className="w-6 h-6 text-white translate-x-0.5 fill-current" />
          </div>
        </div>

        {/* Small live telemetry bars inside video player to give it life */}
        <div className="absolute bottom-4 right-4 z-10 flex items-end gap-1 h-8">
          {[20, 60, 45, 80, 50, 95, 30, 70].map((h, i) => (
            <div 
              key={i} 
              className="w-0.5 bg-white/30 rounded-full"
              style={{ 
                height: `${h}%`,
                animation: `pulse 1.5s infinite ease-in-out alternate`,
                animationDelay: `${i * 0.15}s`
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const VideoPopOverPortal = ({
  show,
  videoSrc,
  setShowVideoPopOver,
}: {
  show: boolean;
  videoSrc: string;
  setShowVideoPopOver: (v: boolean) => void;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <VideoPopOver videoSrc={videoSrc} setShowVideoPopOver={setShowVideoPopOver} />
      )}
    </AnimatePresence>,
    document.body
  );
};

const VideoPopOver = ({
  videoSrc,
  setShowVideoPopOver,
}: {
  videoSrc: string;
  setShowVideoPopOver: (showVideoPopOver: boolean) => void;
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowVideoPopOver(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setShowVideoPopOver]);

  return (
    <div className="fixed left-0 top-0 z-[999999] flex h-screen w-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-black/90 absolute left-0 top-0 h-full w-full backdrop-blur-md"
        onClick={() => setShowVideoPopOver(false)}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 120,
          damping: 20,
        }}
        className="relative aspect-video w-full max-w-5xl rounded-3xl overflow-hidden border border-white/10 bg-boxdark shadow-2xl z-10"
      >
        <VideoPlayer style={{ width: "100%", height: "100%" }}>
          <VideoPlayerContent
            src={videoSrc}
            autoPlay
            slot="media"
            className="w-full h-full object-cover"
            style={{ width: "100%", height: "100%" }}
          />

          <span
            onClick={() => setShowVideoPopOver(false)}
            className="absolute right-4 top-4 z-20 cursor-pointer rounded-full p-2 bg-black/50 border border-white/10 text-white hover:bg-black/80 hover:scale-105 transition-all"
          >
            <X className="size-5" />
          </span>
          
          <VideoPlayerControlBar className="absolute bottom-0 left-0 right-0 flex w-full items-center justify-center bg-gradient-to-t from-black/80 to-transparent p-4 gap-4 z-20">
            <VideoPlayerPlayButton className="h-6 w-6 bg-transparent border-0 text-white cursor-pointer" />
            <VideoPlayerTimeRange className="bg-transparent flex-1 cursor-pointer" />
            <VideoPlayerTimeDisplay className="bg-transparent text-white" />
            <VideoPlayerMuteButton className="size-6 bg-transparent border-0 text-white cursor-pointer" />
          </VideoPlayerControlBar>
        </VideoPlayer>
      </motion.div>
    </div>
  );
};

