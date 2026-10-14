"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "@/config/site";
import { cn } from "@/lib/cn";

const COLOURS = ["#ece7dd", "#ece7dd", "#2c3b63", "#d6c48d", "#9f4a34"];
const INK = "28, 27, 34";

/** Same field every visit, so the piece is a design and not a slot machine. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A generative specimen for the lab. Particles follow a noise field; the further right
 * the pointer goes, the harder their headings are snapped to right angles, until the
 * drift becomes circuitry. "Order" is the only control, and it is real: it is the number
 * the simulation reads.
 *
 * Canvas 2D, paused when off screen or in a background tab, one still frame under
 * reduced motion, and it works by touch as well as mouse.
 */
export function FlowField({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [order, setOrder] = useState(0.35);
  const orderRef = useRef(0.35);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = host.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !box || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !motion.flowField;
    const random = mulberry32(13102026);
    let width = 1;
    let height = 1;
    let frame = 0;
    let running = false;
    let onScreen = false;
    let tick = 0;
    let particles: { x: number; y: number; colour: string }[] = [];

    const seed = () => {
      const count = Math.round(Math.min(1300, (width * height) / 900));
      particles = Array.from({ length: count }, (_, i) => ({
        x: random() * width,
        y: random() * height,
        colour: COLOURS[i % COLOURS.length],
      }));
      ctx.fillStyle = `rgb(${INK})`;
      ctx.fillRect(0, 0, width, height);
    };

    const resize = () => {
      const rect = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) for (let i = 0; i < 90; i++) step();
    };

    const step = () => {
      tick += 1;
      const amount = orderRef.current;
      ctx.fillStyle = `rgba(${INK}, 0.055)`;
      ctx.fillRect(0, 0, width, height);
      ctx.lineWidth = 1.25;
      for (const p of particles) {
        const noise = Math.sin(p.x * 0.0042 + tick * 0.0032) * Math.cos(p.y * 0.0051 - tick * 0.0024) * Math.PI * 2;
        const snapped = Math.round(noise / (Math.PI / 2)) * (Math.PI / 2);
        const heading = noise + (snapped - noise) * amount;
        const fromX = p.x;
        const fromY = p.y;
        p.x += Math.cos(heading) * 1.7;
        p.y += Math.sin(heading) * 1.7;
        ctx.strokeStyle = p.colour;
        ctx.globalAlpha = 0.62;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || random() < 0.004) {
          p.x = random() * width;
          p.y = random() * height;
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      step();
      frame = requestAnimationFrame(loop);
    };
    const sync = () => {
      const shouldRun = onScreen && !document.hidden && !reduced;
      if (shouldRun && !running) {
        running = true;
        frame = requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    };

    const onPointer = (event: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      const value = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      orderRef.current = value;
      setOrder(value);
      if (reduced) for (let i = 0; i < 30; i++) step();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(box);
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(box);
    box.addEventListener("pointermove", onPointer);
    document.addEventListener("visibilitychange", sync);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      box.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={host} className={cn("relative touch-pan-y overflow-hidden bg-ink", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <dl className="t-data absolute left-3 top-3 border border-paper/40 bg-ink/80 text-paper md:left-5 md:top-5">
        {[
          ["Specimen", "Flow field"],
          ["Input", "Pointer, left to right"],
          ["Order", order.toFixed(2)],
        ].map(([term, value]) => (
          <div key={term} className="flex justify-between gap-8 border-b border-paper/20 px-3 py-2 last:border-b-0">
            <dt className="text-paper/70">{term}</dt>
            <dd className={term === "Order" ? "text-yellow" : undefined}>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="sr-only">
        A generative drawing. Moving the pointer to the right snaps drifting lines onto a right-angled grid.
      </p>
    </div>
  );
}
