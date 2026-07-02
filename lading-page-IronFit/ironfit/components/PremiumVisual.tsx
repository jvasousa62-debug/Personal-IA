"use client";

import { useState } from "react";
import SectionReveal from "./SectionReveal";

const glassCards = [
  {
    icon: "⚡",
    title: "Performance semanal",
    badge: "AO VIVO",
    desc: "Cargas, repetições e volume semanal analisados automaticamente com sugestões de progressão.",
    showGraph: true,
  },
  {
    icon: "🥗",
    title: "Aderência nutricional",
    badge: "94%",
    desc: "Taxa de seguimento do plano alimentar com alertas automáticos e ajustes dinâmicos.",
    showGraph: false,
  },
  {
    icon: "📊",
    title: "Relatório para academia",
    badge: "NOVO",
    desc: "Visão consolidada de todos os alunos ativos, inativos e em risco de cancelamento.",
    showGraph: false,
  },
];

const metricBoxes = [
  { num: "87", unit: "%",  label: "Taxa de retenção",   barW: "87%" },
  { num: "4.8", unit: "★", label: "Nota média do app",  barW: "96%" },
  { num: "12x", unit: "",  label: "Mais interações",     barW: "100%" },
  { num: "2s",  unit: "",  label: "Resposta da IA",      barW: "30%" },
];

const graphBars = [40, 55, 48, 72, 65, 88, 80];

export default function PremiumVisual() {
  return (
    <section
      id="premium"
      className="py-16 md:py-[100px] px-[6%] md:px-[8%] relative overflow-hidden bg-[#0a0a0a]"
    >
      {/* BG GLOWS */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 20% 50%, rgba(255,214,0,0.04) 0%, transparent 60%)," +
            "radial-gradient(ellipse 40% 60% at 80% 30%, rgba(255,152,0,0.03) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-[1240px] mx-auto">
        <SectionReveal>
          <div className="flex items-center gap-2 mb-5 text-[#FFD600] font-cond text-[11px] font-semibold tracking-[4px] uppercase">
            <span className="w-[30px] h-px bg-[#FFD600]" />
            Tecnologia premium
          </div>
        </SectionReveal>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-[60px] items-start">
          {/* LEFT */}
          <SectionReveal direction="left">
            <h2 className="font-hero text-[clamp(48px,6vw,80px)] leading-[0.95] uppercase mb-5">
              Dados que
              <br />
              <span className="text-[#FFD600]">vendem</span>
              <br />
              por você
            </h2>
            <p className="text-[17px] text-[#cccccc] font-light leading-[1.7] max-w-[520px] mb-9">
              Métricas em tempo real que provam o valor do Iron Fit para seus
              alunos e gestores.
            </p>

            <div className="flex flex-col gap-4">
              {glassCards.map((c) => (
                <GlassCard key={c.title} {...c} graphBars={graphBars} />
              ))}
            </div>
          </SectionReveal>

          {/* RIGHT */}
          <SectionReveal direction="right" delay={0.2}>
            {/* BIG METRIC */}
            <div
              className="rounded-[20px] p-6 md:p-8 text-center mb-5 relative overflow-hidden"
              style={{
                background: "#161616",
                border: "1px solid rgba(255,214,0,0.1)",
              }}
            >
              <div className="text-[12px] font-semibold tracking-[3px] uppercase text-[rgba(255,214,0,0.5)] mb-3">
                Alunos retidos este mês
              </div>
              <div
                className="font-hero text-[72px] leading-none"
                style={{
                  color: "#FFD600",
                  textShadow: "0 0 40px rgba(255,214,0,0.4)",
                }}
              >
                +340
              </div>
              <div className="text-[13px] text-[#cccccc] mt-2 tracking-[1px]">
                ↑ 28% acima da média do setor
              </div>
            </div>

            {/* METRIC BOXES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metricBoxes.map((m) => (
                <MetricBox key={m.label} {...m} />
              ))}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}

function GlassCard({
  icon,
  title,
  badge,
  desc,
  showGraph,
  graphBars,
}: {
  icon: string;
  title: string;
  badge: string;
  desc: string;
  showGraph: boolean;
  graphBars: number[];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-5 md:p-6 cursor-default transition-all duration-300"
      style={{
        background: hovered ? "rgba(255,214,0,0.03)" : "rgba(255,255,255,0.02)",
        backdropFilter: "blur(20px)",
        border: hovered
          ? "1px solid rgba(255,214,0,0.2)"
          : "1px solid rgba(255,255,255,0.06)",
        transform: hovered ? "translateX(6px)" : "translateX(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[20px]">{icon}</span>
        <span className="text-[14px] font-semibold">{title}</span>
        <span
          className="ml-auto text-[10px] font-semibold tracking-[1px] px-[10px] py-[3px] rounded-full font-cond"
          style={{
            background: "rgba(255,214,0,0.1)",
            border: "1px solid rgba(255,214,0,0.2)",
            color: "#FFD600",
          }}
        >
          {badge}
        </span>
      </div>
      <p className="text-[13px] text-[#cccccc] leading-[1.6]">{desc}</p>

      {showGraph && (
        <div className="flex items-end gap-1 h-10 mt-3">
          {graphBars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-300"
              style={{
                height: `${h}%`,
                background:
                  i === 5 || i === 3
                    ? "#FFD600"
                    : "rgba(255,214,0,0.15)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MetricBox({
  num,
  unit,
  label,
  barW,
}: {
  num: string;
  unit: string;
  label: string;
  barW: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-[14px] p-5 transition-all duration-300"
      style={{
        background: "#161616",
        border: hovered
          ? "1px solid rgba(255,214,0,0.2)"
          : "1px solid rgba(255,255,255,0.05)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <span className="font-cond text-[32px] font-bold text-[#FAFAFA]">{num}</span>
        {unit && (
          <span className="text-[14px] text-[#FFD600] ml-[2px]">{unit}</span>
        )}
      </div>
      <div className="text-[11px] text-[#cccccc] mt-1">{label}</div>
      <div
        className="h-[2px] rounded-sm mt-[10px]"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="fill-bar h-full rounded-sm"
          style={{
            "--bar-w": barW,
            background: "linear-gradient(90deg, #FFD600, #FF9800)",
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
