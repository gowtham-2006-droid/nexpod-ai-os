'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SparklesCoreProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
  speed?: number;
}

export function SparklesCore({
  id = 'sparkles',
  background = 'transparent',
  minSize = 0.6,
  maxSize = 1.8,
  particleDensity = 100,
  className = '',
  particleColor = '#ffffff',
  speed = 0.5,
}: SparklesCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      opacitySpeed: number;
    }> = [];

    // Helper to initialize particles
    const initParticles = (width: number, height: number) => {
      particles = Array.from({ length: particleDensity }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random(),
        speed: (Math.random() * 0.5 + 0.1) * speed,
        opacitySpeed: Math.random() * 0.02 + 0.005,
      }));
    };

    // Resize Observer to handle responsive size
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // set canvas resolution to match client sizing
        canvas.width = width;
        canvas.height = height;
        initParticles(width, height);
      }
    });

    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move upward
        p.y -= p.speed;
        
        // Flicker opacity
        p.opacity += p.opacitySpeed;
        if (p.opacity > 1 || p.opacity < 0.2) {
          p.opacitySpeed = -p.opacitySpeed;
        }

        // Reset if offscreen (top)
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        // Resolve CSS variables for canvas (e.g. "var(--foreground)")
        let resolvedColor = particleColor;
        if (particleColor.startsWith('var(')) {
          const varName = particleColor.slice(4, -1).trim();
          const computed = getComputedStyle(canvas).getPropertyValue(varName).trim();
          if (computed) resolvedColor = computed;
        }
        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [minSize, maxSize, particleDensity, particleColor, speed]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn('w-full h-full block pointer-events-none', className)}
      style={{ background }}
    />
  );
}
