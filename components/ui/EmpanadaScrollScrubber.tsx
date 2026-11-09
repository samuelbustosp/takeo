'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Store,
  Utensils,
} from 'lucide-react';

const TOTAL_FRAMES = 87;

interface StoryBeat {
  id: string;
  range: [number, number];
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
}

const STORY_BEATS: StoryBeat[] = [
  {
    id: 'hero',
    range: [0, 0.25],
    tag: '01 / MENÚ WEB',
    title: 'Pedí. Listo.',
    highlight: 'Sin fricción.',
    subtitle: 'Tu carta digital ultra rápida, lista para recibir pedidos.',
  },
  {
    id: 'velocidad',
    range: [0.25, 0.52],
    tag: '02 // EXPERIENCIA',
    title: 'Vuela de la mesa.',
    highlight: 'En 3 toques.',
    subtitle: 'Tus clientes piden en la web en segundos, sin bajar ninguna app.',
  },
  {
    id: 'control',
    range: [0.52, 0.78],
    tag: '03 /// GESTIÓN',
    title: 'Vos cocinás.',
    highlight: 'TAKEO ordena.',
    subtitle: 'Comandas en vivo y notificaciones automáticas.',
  },
  {
    id: 'rentabilidad',
    range: [0.78, 1.01],
    tag: '04 //// MARGEN TOTAL',
    title: 'Ni las migas',
    highlight: 'en comisiones.',
    subtitle: 'El 100% de cada venta queda en tu negocio.',
  },
];

export function EmpanadaScrollScrubber() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array(TOTAL_FRAMES).fill(null)
  );
  const currentFrameRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const smoothProgressRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = imagesRef.current[frameIndex - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
        const next = imagesRef.current[frameIndex + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const targetW = isMobile ? 800 : 1280;
    const targetH = isMobile ? 1350 : 720;
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    ctx.clearRect(0, 0, cw, ch);

    if (isMobile) {
      // Reduced zoom on mobile so the full empanada is visible, positioned in the upper portion
      const dw = cw * 1.48;
      const dh = dw * (ih / iw) * 1.1;
      const dx = (cw - dw) * 0.5;
      const dy = ch * 0.05;

      // Fill lower region with darkened continuation of the wooden table before drawing main frame
      const bottomEdgeY = dy + dh;
      if (bottomEdgeY < ch) {
        ctx.save();
        ctx.translate(0, bottomEdgeY * 2);
        ctx.scale(1, -1);
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }

      ctx.drawImage(img, dx, dy, dw, dh);

      // Subtle dark shadow over the lower portion so text over the animation reads crisply
      const shadowGrad = ctx.createLinearGradient(0, ch * 0.38, 0, ch);
      shadowGrad.addColorStop(0, 'rgba(10, 11, 15, 0)');
      shadowGrad.addColorStop(0.32, 'rgba(10, 11, 15, 0.52)');
      shadowGrad.addColorStop(0.58, 'rgba(10, 11, 15, 0.82)');
      shadowGrad.addColorStop(1, 'rgba(10, 11, 15, 0.94)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, ch * 0.38, cw, ch * 0.62);
    } else {
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) * 0.55;
      const dy = (ch - dh) * 0.5;
      ctx.drawImage(img, dx, dy, dw, dh);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let loaded = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const padded = String(i).padStart(2, '0');
      img.src = `/frames/empanada/frame_${padded}.jpg`;
      img.onload = () => {
        if (!mounted) return;
        imagesRef.current[i] = img;
        loaded += 1;
        if (i === 0 || loaded === 1) {
          setIsReady(true);
          drawFrame(currentFrameRef.current);
        } else if (i === currentFrameRef.current) {
          drawFrame(currentFrameRef.current);
        }
      };
    }

    return () => {
      mounted = false;
    };
  }, [drawFrame]);

  useEffect(() => {
    const updateScrollTarget = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = rect.height - viewportHeight;

      if (scrollableDistance <= 0) {
        targetProgressRef.current = 0;
        return;
      }

      const scrolled = -rect.top;
      const clamped = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      targetProgressRef.current = clamped;
    };

    const tick = () => {
      const diff = targetProgressRef.current - smoothProgressRef.current;
      if (Math.abs(diff) > 0.0002) {
        smoothProgressRef.current += diff * 0.18;
      } else {
        smoothProgressRef.current = targetProgressRef.current;
      }

      const nextFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(smoothProgressRef.current * (TOTAL_FRAMES - 1)))
      );

      if (nextFrame !== currentFrameRef.current) {
        currentFrameRef.current = nextFrame;
        drawFrame(nextFrame);
      }

      setProgress((prev) =>
        Math.abs(prev - smoothProgressRef.current) > 0.004
          ? smoothProgressRef.current
          : prev
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    const handleResize = () => {
      updateScrollTarget();
      drawFrame(currentFrameRef.current);
    };

    updateScrollTarget();
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('resize', handleResize);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame]);

  const activeBeatIndex = STORY_BEATS.findIndex(
    (b) => progress >= b.range[0] && progress < b.range[1]
  );
  const currentBeatIdx =
    activeBeatIndex === -1 ? STORY_BEATS.length - 1 : activeBeatIndex;

  // Subtle steam intensity that peaks gently while the empanada opens during scroll
  const steamIntensity = isReady
    ? 0.35 + Math.sin(Math.min(1, Math.max(0, progress)) * Math.PI) * 0.65
    : 0;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[320vh] -mt-16"
      aria-label="Presentación interactiva TAKEO"
    >
      <div className="sticky top-0 h-screen pt-16 w-full overflow-hidden bg-[#faf9f6] dark:bg-[#0d0e12] flex items-center">
        {/* Background Animation: full-bleed on mobile (with image shifted up & un-zoomed), right side on desktop */}
        <div className="pointer-events-none absolute inset-0 lg:left-auto lg:w-[68%] xl:w-[65%]">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isReady ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Ultra-subtle Rising Steam / Smoke ("Humo") Overlay */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500"
            style={{ opacity: steamIntensity }}
          >
            {/* Wisp 1 */}
            <div
              className="animate-steam-1 absolute left-[42%] top-[20%] lg:top-[38%] w-40 sm:w-56 h-56 sm:h-72 rounded-full bg-gradient-to-t from-transparent via-white/[0.09] to-orange-100/[0.04] dark:via-white/[0.07] dark:to-orange-200/[0.03] blur-2xl"
              style={{ transformOrigin: 'center bottom' }}
            />
            {/* Wisp 2 */}
            <div
              className="animate-steam-2 absolute left-[52%] top-[24%] lg:top-[42%] w-48 sm:w-64 h-60 sm:h-80 rounded-full bg-gradient-to-t from-transparent via-amber-50/[0.08] to-white/[0.05] dark:via-orange-100/[0.06] dark:to-white/[0.03] blur-3xl"
              style={{ transformOrigin: 'center bottom' }}
            />
            {/* Wisp 3 */}
            <div
              className="animate-steam-3 absolute left-[36%] top-[26%] lg:top-[45%] w-36 sm:w-48 h-48 sm:h-64 rounded-full bg-gradient-to-t from-transparent via-white/[0.07] to-transparent dark:via-white/[0.05] blur-2xl"
              style={{ transformOrigin: 'center bottom' }}
            />
          </div>

          {/* Desktop left edge gradient */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-48 xl:w-64 bg-gradient-to-r from-[#faf9f6] via-[#faf9f6]/45 to-transparent dark:from-[#0d0e12] dark:via-[#0d0e12]/45 dark:to-transparent" />
          {/* Top edge gradient */}
          <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-[#faf9f6] to-transparent dark:from-[#0d0e12] dark:to-transparent" />
          {/* Mobile soft dark shadow over the lower portion of the animation behind text */}
          <div className="lg:hidden absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
          {/* Bottom edge gradient */}
          <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-[#faf9f6] to-transparent dark:from-[#0d0e12] dark:to-transparent" />
          {/* Ultra-wide right edge gradient */}
          <div className="hidden xl:block absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#faf9f6] to-transparent dark:from-[#0d0e12] dark:to-transparent" />
        </div>

        {/* Content: Overlaid on lower animation on Mobile, Left Vertically Centered on Desktop */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex flex-col justify-end lg:justify-center pb-12 sm:pb-16 lg:pb-0">
          <div className="relative max-w-lg space-y-5 sm:space-y-7">
            {/* Soft Blurred Orange Ambient Glow Behind Text */}
            <div className="pointer-events-none absolute -left-16 -top-10 w-72 sm:w-96 h-64 sm:h-80 rounded-full bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-transparent dark:from-orange-500/20 dark:via-amber-500/12 blur-[90px] sm:blur-[120px] -z-10" />
            {/* Stacked Animated Text Beats */}
            <div className="grid grid-cols-1">
              {STORY_BEATS.map((beat, idx) => {
                const isActive = idx === currentBeatIdx;
                const isPast = idx < currentBeatIdx;

                return (
                  <div
                    key={beat.id}
                    aria-hidden={!isActive}
                    className={`col-start-1 row-start-1 space-y-2.5 sm:space-y-3.5 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? 'opacity-100 translate-y-0 scale-100 blur-none pointer-events-auto'
                        : isPast
                          ? 'opacity-0 -translate-y-8 scale-[0.98] blur-xs pointer-events-none'
                          : 'opacity-0 translate-y-8 scale-[0.98] blur-xs pointer-events-none'
                    }`}
                  >
                    <span className="inline-block font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-orange-400 lg:text-orange-600 dark:text-orange-400 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] lg:drop-shadow-none">
                      {beat.tag}
                    </span>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white lg:text-zinc-900 dark:text-white tracking-tight leading-[1.06] drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] lg:drop-shadow-none">
                      {beat.title}{' '}
                      <span className="block font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 lg:from-orange-600 lg:via-orange-500 lg:to-amber-500 bg-clip-text text-transparent pb-0.5">
                        {beat.highlight}
                      </span>
                    </h1>

                    <p className="text-sm sm:text-lg lg:text-xl text-zinc-200 lg:text-zinc-600 dark:text-zinc-300 font-medium leading-snug max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] lg:drop-shadow-none">
                      {beat.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                href="/register"
                className="group relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 animate-gradient-flow text-white font-extrabold text-xs sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-orange-500/45 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Store className="w-4 h-4 relative z-10 shrink-0" />
                <span className="relative z-10">Crear mi Tienda</span>
                <ArrowRight className="w-4 h-4 relative z-10 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/takeo-express"
                className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-base px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Utensils className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Ver Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
