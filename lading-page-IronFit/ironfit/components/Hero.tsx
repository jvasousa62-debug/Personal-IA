"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PhoneMockup from "./PhoneMockup";
import AthleteSVG from "./AthleteSVG";

export default function Hero() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = 1 + Math.random() * 3;
      p.style.cssText = `
        left:${Math.random() * 100}%;
        width:${size}px;
        height:${size}px;
        animation-duration:${8 + Math.random() * 12}s;
        animation-delay:${Math.random() * 10}s;
      `;
      container.appendChild(p);
    }
  }, []);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] md:min-h-screen flex items-center overflow-hidden bg-[#020202] pt-[72px]"
    >
      {/* RADIAL GLOW BG */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(255,214,0,0.07) 0%, transparent 70%)," +
            "radial-gradient(ellipse 40% 60% at 20% 80%, rgba(255,152,0,0.04) 0%, transparent 60%)",
        }}
      />

      {/* GRID */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      {/* PARTICLES */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />

      {/* LIGHTNING BOLTS */}
      <LightningBolt
        className="absolute top-[15%] left-[55%]"
        style={{ animationDelay: "0s" }}
        width={60} height={120}
        d="M40 0L10 55H30L8 120L55 45H32L40 0Z"
        opacity={0.9}
      />
      <LightningBolt
        className="absolute top-[25%] right-[5%]"
        style={{ animationDelay: "1.5s" }}
        width={40} height={90}
        d="M28 0L6 42H20L4 90L38 35H22L28 0Z"
        opacity={0.7}
      />
      <LightningBolt
        className="absolute top-[40%] left-[45%]"
        style={{ animationDelay: "2.8s" }}
        width={30} height={70}
        d="M20 0L4 32H14L2 70L28 26H16L20 0Z"
        opacity={0.6}
        color="#FFC107"
      />

      {/* LEFT CONTENT */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full md:w-[55%] max-w-[760px] px-[6%] md:pl-[8%] md:pr-0 py-14 md:py-0"
      >
        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-[6px] rounded-sm border"
          style={{
            background: "rgba(255,214,0,0.08)",
            borderColor: "rgba(255,214,0,0.2)",
          }}
        >
          <span
            className="badge-dot w-[6px] h-[6px] rounded-full"
            style={{ background: "#FFD600" }}
          />
          <span className="font-cond text-[11px] font-semibold tracking-[3px] uppercase text-[#FFD600]">
            IA de Última Geração
          </span>
        </motion.div>

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <span className="font-cond text-[clamp(16px,2vw,22px)] font-light tracking-[8px] text-[#cccccc] block mb-1 uppercase">
            Apresentando
          </span>
          <h1 className="font-hero text-[clamp(64px,18vw,140px)] leading-[0.9] tracking-[2px] text-[#FAFAFA] uppercase">
            PERSONAL
            <br />
            <span
              className="text-[#FFD600] glow-yellow block"
            >
              IA
            </span>
          </h1>
        </motion.div>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-[16px] sm:text-[18px] text-[#cccccc] font-light leading-[1.6] mb-10 max-w-[440px]"
        >
          Seu treinador pessoal disponível{" "}
          <strong className="text-[#FAFAFA] font-semibold">24 horas</strong>.<br />
          Treinos personalizados, dieta inteligente e acompanhamento em tempo real
          — tudo movido por inteligência artificial.
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex w-full gap-4 items-stretch sm:items-center flex-col sm:flex-row sm:flex-wrap"
        >
          <button
            onClick={() => scrollTo("#prova")}
            className="clip-btn shimmer relative overflow-hidden bg-[#FFD600] text-black font-cond text-[15px] font-bold tracking-[2.5px] uppercase px-7 sm:px-9 py-4 border-none cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-[0_0_40px_rgba(255,214,0,0.6)] hover:-translate-y-0.5"
          >
            ▶ Assistir demonstração
          </button>
          <button
            onClick={() => scrollTo("#como-funciona")}
            className="flex items-center justify-center gap-3 bg-transparent text-[#FAFAFA] font-cond text-[15px] font-semibold tracking-[2px] uppercase px-7 py-4 border border-[rgba(255,255,255,0.2)] cursor-pointer transition-all duration-200 hover:border-[#FFD600] hover:text-[#FFD600]"
          >
            <span className="w-9 h-9 rounded-full border border-current flex items-center justify-center text-xs">
              ▷
            </span>
            Como funciona
          </button>
        </motion.div>
      </motion.div>

      {/* RIGHT VISUAL */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        className="absolute right-0 top-0 bottom-0 w-[50%] hidden md:flex items-end justify-center"
      >
        {/* GROUND GLOW */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,214,0,0.15) 0%, transparent 70%)" }}
        />

        {/* ATHLETE */}
        <div className="relative z-10 w-[380px] h-[580px] flex items-end justify-center">
          <AthleteSVG />
        </div>

        {/* PHONE MOCKUP */}
        <div className="absolute right-[2%] top-1/2 float-anim" style={{ transform: "translateY(-50%)" }}>
          <PhoneMockup />
        </div>
      </motion.div>
    </section>
  );
}

/* ── LIGHTNING BOLT ── */
function LightningBolt({
  className,
  style,
  width,
  height,
  d,
  opacity,
  color = "#FFD600",
}: {
  className?: string;
  style?: React.CSSProperties;
  width: number;
  height: number;
  d: string;
  opacity: number;
  color?: string;
}) {
  return (
    <svg
      className={className}
      style={{ ...style, animation: `lightning-flash 4s ease infinite`, pointerEvents: "none" }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path d={d} fill={color} opacity={opacity} />
    </svg>
  );
}
