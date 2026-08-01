'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface HoleBackgroundProps extends React.ComponentProps<'div'> {
  strokeColor?: string;
  numberOfLines?: number;
  numberOfDiscs?: number;
  particleRGBColor?: [number, number, number];
}

export const HoleBackground: React.FC<HoleBackgroundProps> = ({
  strokeColor = '#30363D',
  numberOfLines = 65,
  numberOfDiscs = 60,
  particleRGBColor = [16, 185, 129], // Emerald theme accent
  className,
  children,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let rotation = 0;

    // Particles moving towards or around the hole
    const particles = Array.from({ length: 90 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.1 + Math.random() * 0.9,
      speed: 0.002 + Math.random() * 0.004,
      size: 1 + Math.random() * 2.5,
      alpha: 0.25 + Math.random() * 0.75,
    }));

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance on mobile Retina screens
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.5; // Perfectly centered on screen
      // Calculate maxRadius so the outer disc fits screen bounds on mobile, tablet, and desktop
      const maxRadius = Math.max(width, height) * 0.85;

      rotation += 0.0018;

      // 1. Draw radial lines into the hole
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.7;
      ctx.globalAlpha = 0.25;

      for (let i = 0; i < numberOfLines; i++) {
        const angle = (i / numberOfLines) * Math.PI * 2 + rotation;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        ctx.beginPath();
        // Curve lines smoothly into the vortex center
        const startX = centerX + cos * maxRadius;
        const startY = centerY + sin * maxRadius * 0.55;
        const cpX = centerX + Math.cos(angle + 0.25) * (maxRadius * 0.45);
        const cpY = centerY + Math.sin(angle + 0.25) * (maxRadius * 0.3);
        
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, centerX, centerY);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw concentric perspective discs (rings)
      ctx.save();
      for (let i = 1; i <= numberOfDiscs; i++) {
        const progress = i / numberOfDiscs; // 0 to 1
        // Exponential depth scaling
        const scale = Math.pow(progress, 2.1); 
        const rx = maxRadius * scale;
        const ry = rx * 0.55; // Aspect ratio tilt fitting mobile & desktop

        const alpha = Math.sin(progress * Math.PI) * 0.4;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.5 + progress * 1.0;
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Central Hole Dark Void Gradient
      const voidRadius = maxRadius * 0.08;
      const voidGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, voidRadius * 4.5
      );
      voidGradient.addColorStop(0, '#000000');
      voidGradient.addColorStop(0.35, 'rgba(9, 12, 16, 0.98)');
      voidGradient.addColorStop(1, 'rgba(9, 12, 16, 0)');

      ctx.fillStyle = voidGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, voidRadius * 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw Animated Particles
      ctx.save();
      const [r, g, b] = particleRGBColor;
      particles.forEach((p) => {
        p.dist -= p.speed;
        if (p.dist <= 0.02) {
          p.dist = 0.95 + Math.random() * 0.05;
          p.angle = Math.random() * Math.PI * 2;
        }

        const scale = Math.pow(p.dist, 2);
        const radiusX = maxRadius * scale;
        const radiusY = radiusX * 0.55;

        p.angle += 0.0025 * (1 / (p.dist + 0.1));

        const px = centerX + Math.cos(p.angle) * radiusX;
        const py = centerY + Math.sin(p.angle) * radiusY;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * p.dist})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.5 + p.dist * 0.8), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [strokeColor, numberOfLines, numberOfDiscs, particleRGBColor]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full min-h-screen overflow-hidden bg-[#090C10]', className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default HoleBackground;
