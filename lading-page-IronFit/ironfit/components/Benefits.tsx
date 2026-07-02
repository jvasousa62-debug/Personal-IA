"use client";

import { useState } from "react";
import SectionReveal from "./SectionReveal";

const benefits = [
  {
    icon: "🤖",
    title: "IA disponível 24 horas",
    desc: "Seus alunos têm um personal trainer inteligente a qualquer hora — fins de semana, feriados, madrugada.",
    tag: "Atendimento infinito",
  },
  {
    icon: "🎯",
    title: "Treinos 100% personalizados",
    desc: "Cada aluno recebe um plano único, adaptado ao seu biotipo, nível e objetivo — sem planilhas genéricas.",
    tag: "Personalização real",
  },
  {
    icon: "🥗",
    title: "Dieta inteligente inclusa",
    desc: "Cardápio calculado automaticamente com base nas metas, preferências alimentares e metabolismo individual.",
    tag: "Nutrição integrada",
  },
  {
    icon: "📈",
    title: "Acompanhamento em tempo real",
    desc: "Dashboard completo para o profissional monitorar a evolução de todos os alunos em um só lugar.",
    tag: "Visão 360°",
  },
  {
    icon: "🏆",
    title: "Evolução do aluno visível",
    desc: "Relatórios, fotos, recordes e conquistas que motivam o aluno a continuar — e a renovar a matrícula.",
    tag: "Retenção aumentada",
  },
  {
    icon: "⚡",
    title: "Diferencial competitivo total",
    desc: "Seja a primeira academia da sua cidade com IA integrada. Atraia novos alunos pelo posicionamento premium.",
    tag: "Liderança de mercado",
  },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="py-16 md:py-[100px] px-[6%] md:px-[8%] bg-[#020202]">
      <div className="max-w-[1240px] mx-auto">
      <SectionReveal>
        <div className="text-center mb-[60px]">
          <div className="flex items-center justify-center gap-2 mb-5 text-[#FFD600] font-cond text-[11px] font-semibold tracking-[4px] uppercase">
            <span className="w-[30px] h-px bg-[#FFD600]" />
            Benefícios
            <span className="w-[30px] h-px bg-[#FFD600]" />
          </div>
          <h2 className="font-hero text-[clamp(48px,6vw,80px)] leading-[0.95] uppercase mb-5">
            Por que as academias
            <br />
            estão{" "}
            <span className="text-[#FFD600]">escolhendo</span> o Iron Fit
          </h2>
          <p className="text-[17px] text-[#cccccc] font-light leading-[1.7] max-w-[520px] mx-auto">
            Tecnologia que aumenta a retenção, fideliza alunos e diferencia sua
            academia da concorrência.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.2}>
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-[20px] overflow-hidden"
          style={{ background: "rgba(255,214,0,0.06)", border: "1px solid rgba(255,214,0,0.06)" }}
        >
          {benefits.map((b, i) => (
            <BenefitCard key={b.title} {...b} delay={i * 0.05} />
          ))}
        </div>
      </SectionReveal>
      </div>
    </section>
  );
}

function BenefitCard({
  icon,
  title,
  desc,
  tag,
  delay,
}: {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative p-6 md:p-10 cursor-default overflow-hidden transition-all duration-300"
      style={{
        background: hovered ? "#111" : "#0a0a0a",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* corner glow on hover */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle at 0 0, rgba(255,214,0,0.04) 0%, transparent 60%)",
          opacity: hovered ? 1 : 0,
        }}
      />

      <div
        className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[24px] mb-5 transition-all duration-300"
        style={{
          background: hovered ? "rgba(255,214,0,0.12)" : "rgba(255,214,0,0.07)",
          border: "1px solid rgba(255,214,0,0.15)",
          boxShadow: hovered ? "0 0 20px rgba(255,214,0,0.15)" : "none",
        }}
      >
        {icon}
      </div>

      <h3 className="text-[17px] font-semibold mb-[10px]">{title}</h3>
      <p className="text-[13px] text-[#cccccc] leading-[1.7]">{desc}</p>

      <div
        className="inline-block mt-[14px] text-[10px] font-semibold tracking-[1.5px] uppercase text-[#FFD600]"
        style={{ borderBottom: "1px solid rgba(255,214,0,0.3)", paddingBottom: "2px" }}
      >
        {tag} →
      </div>
    </div>
  );
}
