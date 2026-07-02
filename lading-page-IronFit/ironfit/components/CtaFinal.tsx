"use client";

import SectionReveal from "./SectionReveal";

const whatsappUrl = "https://wa.me/5589994026771";

export default function CtaFinal() {
  return (
    <section
      id="cta"
      className="relative py-20 md:py-[120px] px-[6%] md:px-[8%] overflow-hidden bg-[#0a0a0a] text-center"
    >
      {/* GRID */}
      <div className="absolute inset-0 grid-bg-sm pointer-events-none" />

      {/* GLOW */}
      <div
        className="glow-pulse absolute top-1/2 left-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(255,214,0,0.07) 0%, transparent 70%)",
          marginTop: "-200px",
          marginLeft: "-300px",
        }}
      />

      <SectionReveal>
        <div className="relative z-10 max-w-[900px] mx-auto">
          <div className="font-cond text-[12px] font-semibold tracking-[5px] uppercase text-[#FFD600] mb-6">
            O futuro do fitness é agora
          </div>

          <h2 className="font-hero text-[clamp(44px,14vw,96px)] leading-[0.95] uppercase mb-6">
            Transforme sua
            <br />
            academia com{" "}
            <span
              className="text-[#FFD600]"
              style={{ textShadow: "0 0 60px rgba(255,214,0,0.4)" }}
            >
              IA
            </span>
          </h2>

          <p className="text-[17px] text-[#cccccc] font-light leading-[1.6] max-w-[500px] mx-auto mb-12">
            Junte-se às academias que já estão usando inteligência artificial
            para reter mais alunos, gerar mais receita e liderar o mercado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center flex-wrap">
            <a
              href="../../login.html"
              className="clip-btn shimmer relative inline-block overflow-hidden bg-[#FFD600] text-black font-cond text-[15px] sm:text-[16px] font-bold tracking-[2px] sm:tracking-[3px] uppercase px-8 sm:px-12 py-[18px] border-none cursor-pointer no-underline transition-all duration-250 hover:bg-white hover:shadow-[0_0_60px_rgba(255,214,0,0.5),0_0_120px_rgba(255,214,0,0.2)] hover:-translate-y-[3px]"
            >
              ⚡ Começar agora
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent text-[#cccccc] font-cond text-[14px] font-semibold tracking-[2px] uppercase px-9 py-[18px] cursor-pointer no-underline transition-all duration-250 hover:border-[#FFD600] hover:text-[#FFD600]"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Falar com especialista
            </a>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
