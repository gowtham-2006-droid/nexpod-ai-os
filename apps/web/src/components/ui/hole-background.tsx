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
  numberOfLines = 50,
  numberOfDiscs = 50,
  particleRGBColor = [16, 185, 129], // Emerald theme accent
  className,
  children,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let rotation = 0;

    // Particles moving towards or around the hole
    const particles = Array.from({ length: 80 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.1 + Math.random() * 0.9,
      speed: 0.002 + Math.random() * 0.004,
      size: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.8,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.55; // Slightly lower center for dramatic perspective
      const maxRadius = Math.hypot(width, height) * 0.6;

      rotation += 0.002;

      // 1. Draw radial lines into the hole
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = 0.25;

      for (let i = 0; i < numberOfLines; i++) {
        const angle = (i / numberOfLines) * Math.PI * 2 + rotation;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        ctx.beginPath();
        // Curve lines slightly into the vortex
        const startX = centerX + cos * maxRadius;
        const startY = centerY + sin * maxRadius * 0.6;
        const cpX = centerX + Math.cos(angle + 0.3) * (maxRadius * 0.4);
        const cpY = centerY + Math.sin(angle + 0.3) * (maxRadius * 0.25);
        
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, centerX, centerY);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw concentric perspective discs (rings)
      ctx.save();
      for (let i = 1; i <= numberOfDiscs; i++) {
        const progress = i / numberOfDiscs; // 0 to 1
        // Exponential scaling for depth compression near hole
        const scale = Math.pow(progress, 2.2); 
        const rx = maxRadius * scale;
        const ry = rx * 0.45; // Perspective tilt

        const alpha = Math.sin(progress * Math.PI) * 0.35;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.5 + progress * 0.8;
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
        centerX, centerY, voidRadius * 4
      );
      voidGradient.addColorStop(0, '#000000');
      voidGradient.addColorStop(0.3, 'rgba(9, 12, 16, 0.95)');
      voidGradient.addColorStop(1, 'rgba(9, 12, 16, 0)');

      ctx.fillStyle = voidGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, voidRadius * 4, 0, Math.PI * 2);
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
        const radiusY = radiusX * 0.45;

        p.angle += 0.003 * (1 / (p.dist + 0.1)); // Spiral faster near center

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
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [strokeColor, numberOfLines, numberOfDiscs, particleRGBColor]);

  return (
    <div className={cn('relative w-full overflow-hidden bg-[#090C10]', className)} {...props}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default HoleBackground;
