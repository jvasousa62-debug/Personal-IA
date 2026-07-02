"use client";

import { useState } from "react";
import SectionReveal from "./SectionReveal";

export default function ProofSection() {
  return (
    <section id="prova" className="py-16 md:py-[100px] px-[6%] md:px-[8%] bg-[#020202]">
      <div className="max-w-[1240px] mx-auto">
      <SectionReveal>
        <div className="text-center mb-[60px]">
          <div className="flex items-center justify-center gap-2 mb-5 text-[#FFD600] font-cond text-[11px] font-semibold tracking-[4px] uppercase">
            <span className="w-[30px] h-px bg-[#FFD600]" />
            Prova visual
            <span className="w-[30px] h-px bg-[#FFD600]" />
          </div>
          <h2 className="font-hero text-[clamp(48px,6vw,80px)] leading-[0.95] uppercase mb-5">
            Resultados <span className="text-[#FFD600]">reais</span>
          </h2>
          <p className="text-[17px] text-[#cccccc] font-light leading-[1.7] max-w-[500px] mx-auto">
            Veja o que acontece quando tecnologia encontra dedicação.
          </p>
        </div>
      </SectionReveal>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* BEFORE / AFTER */}
        <SectionReveal delay={0.1}>
          <ProofCard label="⚡ Transformação física">
            <p className="text-[12px] text-[rgba(255,255,255,0.4)] mb-3">
              Resultado em 60 dias com Iron Fit IA
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div
                className="flex-1 text-center px-3 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="font-cond text-[28px] font-bold text-[#cccccc]">89kg</div>
                <div className="text-[10px] text-[#cccccc] mt-1">Antes</div>
              </div>
              <span className="text-[20px] text-[#FFD600]">→</span>
              <div
                className="flex-1 text-center px-3 py-3 rounded-xl"
                style={{
                  background: "rgba(255,214,0,0.06)",
                  border: "1px solid rgba(255,214,0,0.1)",
                }}
              >
                <div className="font-cond text-[28px] font-bold text-[#FFD600]">74kg</div>
                <div className="text-[10px] text-[#cccccc] mt-1">Depois</div>
              </div>
            </div>
            <div
              className="mt-3 pt-3 text-[12px] text-[#cccccc]"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              Gordura corporal:{" "}
              <span className="text-[#FAFAFA] font-semibold">22% → 13%</span> em 8 semanas
            </div>
            <div className="mt-2 text-[12px] text-[#cccccc]">
              Massa muscular: <span className="text-[#FAFAFA] font-semibold">+4.2kg</span> no mesmo período
            </div>
          </ProofCard>
        </SectionReveal>

        {/* DASHBOARD */}
        <SectionReveal delay={0.2}>
          <ProofCard label="📊 Dashboard do aluno">
            <div
              className="rounded-lg p-3"
              style={{ background: "#0a0a0a" }}
            >
              <div className="flex gap-2 mb-3">
                {[
                  ["156", "Proteína (g)"],
                  ["2.1k", "Calorias"],
                  ["94%", "Aderência"],
                ].map(([val, lbl]) => (
                  <div
                    key={lbl}
                    className="flex-1 text-center rounded-xl p-2"
                    style={{
                      background: "rgba(255,214,0,0.05)",
                      border: "1px solid rgba(255,214,0,0.08)",
                    }}
                  >
                    <div className="text-[16px] font-bold text-[#FFD600] font-cond">{val}</div>
                    <div className="text-[9px] text-[#cccccc]">{lbl}</div>
                  </div>
                ))}
              </div>

              {[
                ["Treino A concluído", "08:32"],
                ["Pré-treino registrado", "08:10"],
                ["Meta de água atingida", "Ontem"],
                ["Novo recorde: Supino +5kg", "Seg"],
              ].map(([text, time]) => (
                <div
                  key={text}
                  className="flex items-center gap-2 py-[5px] text-[11px]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                >
                  <span
                    className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                    style={{ background: "#FFD600" }}
                  />
                  <span className="text-[#cccccc]">{text}</span>
                  <span className="ml-auto text-[9px] text-[rgba(255,255,255,0.3)]">{time}</span>
                </div>
              ))}
            </div>
          </ProofCard>
        </SectionReveal>

        {/* USER FLOW */}
        <SectionReveal delay={0.3}>
          <ProofCard label="🔄 Fluxo do usuário">
            <div className="flex flex-col gap-2">
              {[
                ["📱", "Aluno abre o app"],
                ["🤖", "IA analisa e responde"],
                ["💪", "Treino personalizado gerado"],
                ["📊", "Academia recebe relatório"],
                ["🏆", "Aluno atinge resultado"],
              ].map(([icon, text], i) => (
                <FlowStep key={text} icon={icon} text={text} last={i === 4} />
              ))}
            </div>
          </ProofCard>
        </SectionReveal>
      </div>
      </div>
    </section>
  );
}

function ProofCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 h-full"
      style={{
        background: "#161616",
        border: hovered
          ? "1px solid rgba(255,214,0,0.15)"
          : "1px solid rgba(255,255,255,0.05)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="px-4 py-4"
        style={{
          background: "#0a0a0a",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="text-[10px] font-semibold tracking-[2px] uppercase text-[#FFD600] font-cond">
          {label}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function FlowStep({
  icon,
  text,
  last,
}: {
  icon: string;
  text: string;
  last: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-3 px-3 py-[10px] rounded-lg text-[12px] cursor-default transition-all duration-300"
      style={{
        background: hovered ? "rgba(255,214,0,0.04)" : "rgba(255,255,255,0.02)",
        border: hovered
          ? "1px solid rgba(255,214,0,0.1)"
          : "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] flex-shrink-0"
        style={{ background: "rgba(255,214,0,0.08)" }}
      >
        {icon}
      </div>
      <span className="text-[#FAFAFA]">{text}</span>
      <span className="ml-auto text-[#FFD600] text-[14px]">
        {last ? "✓" : "→"}
      </span>
    </div>
  );
}
