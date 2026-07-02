"use client";

import SectionReveal from "./SectionReveal";

const steps = [
  {
    num: "01",
    icon: "🧠",
    title: "IA analisa o perfil",
    desc: "Coleta dados de anamnese, biotipo, objetivos e histórico do aluno automaticamente.",
  },
  {
    num: "02",
    icon: "⚡",
    title: "Gera treinos personalizados",
    desc: "Plano único criado em segundos com periodização inteligente e progressão automática.",
  },
  {
    num: "03",
    icon: "🥗",
    title: "Dieta inteligente",
    desc: "Cardápio adaptado às preferências, intolerâncias e metas calóricas de cada aluno.",
  },
  {
    num: "04",
    icon: "📊",
    title: "Monitora a evolução",
    desc: "Dashboard em tempo real com métricas, fotos e relatórios de performance.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 md:py-[100px] px-[6%] md:px-[8%] bg-[#0a0a0a]">
      <div className="max-w-[1240px] mx-auto">
      <SectionReveal>
        <div className="flex items-center gap-2 mb-5 text-[#FFD600] font-cond text-[11px] font-semibold tracking-[4px] uppercase">
          <span className="w-[30px] h-px bg-[#FFD600]" />
          Como funciona
        </div>
      </SectionReveal>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-[60px] items-center mt-0">
        {/* LEFT */}
        <SectionReveal direction="left">
          <h2
            className="font-hero text-[clamp(48px,6vw,80px)] leading-[0.95] tracking-[1px] uppercase mb-5"
          >
            IA que<br />
            <span className="text-[#FFD600]">treina</span>
            <br />
            por você
          </h2>
          <p className="text-[17px] text-[#cccccc] font-light leading-[1.7] max-w-[520px] mb-10">
            A tecnologia mais avançada em fitness personalizado, agora na palma
            da mão dos seus alunos.
          </p>

          <div className="flex flex-col">
            {steps.map((s) => (
              <StepItem key={s.num} {...s} />
            ))}
          </div>
        </SectionReveal>

        {/* RIGHT — CHAT DEMO */}
        <SectionReveal direction="right" delay={0.2}>
          <div
            className="relative rounded-2xl md:rounded-3xl overflow-hidden p-4 sm:p-[30px] min-h-0 sm:min-h-[500px]"
            style={{
              background: "#161616",
              border: "1px solid rgba(255,214,0,0.08)",
            }}
          >
            {/* top glow */}
            <div
              className="absolute -top-[50px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,214,0,0.06) 0%, transparent 70%)" }}
            />

            <div className="font-cond text-[11px] font-semibold tracking-[3px] uppercase text-[rgba(255,214,0,0.5)] mb-5">
              ▶ Demo ao vivo — IA respondendo
            </div>

            <div className="flex flex-col gap-3">
              <ChatBubble role="user" text="Qual é o melhor exercício pra aumentar o peito?" />

              <ChatBubble role="ai">
                <p>
                  Com base no seu histórico, recomendo priorizar o{" "}
                  <strong>Supino Inclinado</strong> com halteres. Aqui está o
                  protocolo ideal:
                </p>
                <WorkoutCard
                  title="🔥 Protocolo Peitoral Premium"
                  exercises={[
                    ["Supino inclinado", "4 × 10"],
                    ["Crucifixo halteres", "3 × 12"],
                    ["Crossover polia", "3 × 15"],
                    ["Flexão diamante", "2 × falha"],
                  ]}
                  barLabel="Carga recomendada"
                  barNote="+8kg vs semana passada"
                  barW="68%"
                />
              </ChatBubble>

              <ChatBubble role="user" text="Me manda uma dieta pra hoje também" />

              <ChatBubble role="ai">
                <p>
                  Baseado nas suas 2.100 kcal diárias — plano de hoje com foco
                  em <strong>156g de proteína</strong>:
                </p>
                <WorkoutCard
                  title="🥗 Plano Alimentar — Hoje"
                  exercises={[
                    ["☀️ Café da manhã", "480 kcal"],
                    ["🏋️ Pré-treino", "320 kcal"],
                    ["🍗 Almoço", "640 kcal"],
                    ["🌙 Jantar", "560 kcal"],
                  ]}
                />
              </ChatBubble>

              <TypingDots />
            </div>
          </div>
        </SectionReveal>
      </div>
      </div>
    </section>
  );
}

/* ── SUB COMPONENTS ── */

function StepItem({
  num,
  icon,
  title,
  desc,
}: {
  num: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="group flex gap-5 items-start py-7 cursor-default transition-all"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="font-hero text-[11px] tracking-[2px] text-[rgba(255,214,0,0.3)] mt-1 min-w-[24px]">
        {num}
      </span>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(255,214,0,0.2)]"
        style={{
          border: "1px solid rgba(255,214,0,0.15)",
          background: "rgba(255,214,0,0.03)",
        }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-[16px] font-semibold mb-[6px]">{title}</h3>
        <p className="text-[13px] text-[#cccccc] leading-[1.6]">{desc}</p>
      </div>
    </div>
  );
}

function ChatBubble({
  role,
  text,
  children,
}: {
  role: "user" | "ai";
  text?: string;
  children?: React.ReactNode;
}) {
  if (role === "user") {
    return (
      <div
            className="self-end px-4 py-3 rounded-[12px_2px_12px_12px] text-[13px] leading-[1.5] max-w-[92%] sm:max-w-[75%]"
        style={{ background: "#2a2a2a", color: "#FAFAFA" }}
      >
        {text}
      </div>
    );
  }
  return (
    <div
      className="self-start px-4 py-3 rounded-[2px_12px_12px_12px] text-[13px] leading-[1.5] max-w-[96%] sm:max-w-[90%]"
      style={{
        background: "rgba(255,214,0,0.06)",
        border: "1px solid rgba(255,214,0,0.12)",
        color: "#FAFAFA",
      }}
    >
      <div className="text-[10px] text-[#FFD600] font-semibold uppercase tracking-[1px] mb-2">
        ⚡ Iron Fit IA
      </div>
      {children}
    </div>
  );
}

function WorkoutCard({
  title,
  exercises,
  barLabel,
  barNote,
  barW,
}: {
  title: string;
  exercises: [string, string][];
  barLabel?: string;
  barNote?: string;
  barW?: string;
}) {
  return (
    <div
      className="mt-3 p-3 rounded-xl"
      style={{ background: "#0a0a0a", border: "1px solid rgba(255,214,0,0.1)" }}
    >
      <div className="text-[10px] font-semibold text-[#FFD600] uppercase tracking-[1.5px] mb-2">
        {title}
      </div>
      {exercises.map(([name, val]) => (
        <div
          key={name}
          className="flex justify-between gap-3 py-[6px] text-[12px]"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span>{name}</span>
          <span className="text-[#FFD600] font-semibold font-cond">{val}</span>
        </div>
      ))}
      {barLabel && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-[#cccccc] mb-1">
            <span>{barLabel}</span>
            <span>{barNote}</span>
          </div>
          <div className="h-[3px] rounded-sm" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="fill-bar h-full rounded-sm"
              style={{ "--bar-w": barW, background: "#FFD600" } as React.CSSProperties}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div
      className="flex gap-[3px] items-center px-3 py-2 rounded-[4px_14px_14px_14px] w-fit"
      style={{ background: "rgba(255,214,0,0.05)" }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot w-[5px] h-[5px] rounded-full block"
          style={{ background: "#FFD600" }}
        />
      ))}
    </div>
  );
}
