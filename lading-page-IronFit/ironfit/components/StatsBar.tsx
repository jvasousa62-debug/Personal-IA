"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const stats = [
  { num: "+2.4K", label: "Alunos Ativos" },
  { num: "24/7",  label: "Disponibilidade" },
  { num: "98%",   label: "Satisfação" },
  { num: "+120",  label: "Academias Parceiras" },
  { num: "3.2M",  label: "Treinos Gerados" },
];

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 items-center gap-6 px-[6%] md:px-[8%] py-6"
      style={{
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,214,0,0.1)",
        borderBottom: "1px solid rgba(255,214,0,0.05)",
      }}
    >
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center justify-center gap-5 min-w-0">
          <div
            className="text-center transition-all duration-700"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            <div
              className="font-hero text-[40px] leading-none"
              style={{
                color: "#FFD600",
                textShadow: "0 0 20px rgba(255,214,0,0.3)",
              }}
            >
              {s.num}
            </div>
            <div className="text-[11px] text-[#cccccc] tracking-[2px] uppercase mt-1">
              {s.label}
            </div>
          </div>
          {i < stats.length - 1 && (
            <div className="hidden lg:block w-px h-10 bg-[rgba(255,214,0,0.1)]" />
          )}
        </div>
      ))}
    </div>
  );
}
