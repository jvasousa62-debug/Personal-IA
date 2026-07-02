"use client";

export default function PhoneMockup() {
  return (
    <div
      className="w-[180px] rounded-[32px] overflow-hidden p-[14px]"
      style={{
        background: "#161616",
        border: "1px solid rgba(255,214,0,0.15)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,214,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="bg-[#0a0a0a] rounded-[20px] overflow-hidden min-h-[300px]">
        {/* Notch */}
        <div className="w-[60px] h-[14px] bg-[#161616] rounded-b-xl mx-auto mb-2" />

        {/* Status bar */}
        <div className="flex justify-between items-center px-3 pb-1 text-[10px] text-[#cccccc]">
          <span>Iron Fit IA</span>
          <span>⚡</span>
        </div>

        {/* AI LABEL */}
        <div className="text-[8px] font-semibold tracking-[1px] uppercase text-[#FFD600] mx-[10px] mt-2 mb-1">
          IA Personal
        </div>

        {/* User bubble */}
        <div
          className="mx-[10px] mb-2 px-3 py-2 text-[10px] leading-[1.4] text-right ml-[30px] rounded-[14px_4px_14px_14px]"
          style={{ background: "#2a2a2a", color: "#cccccc" }}
        >
          Quero perder 5kg em 2 meses
        </div>

        {/* AI bubble */}
        <div
          className="mx-[10px] mb-2 px-3 py-2 text-[10px] leading-[1.4] rounded-[4px_14px_14px_14px]"
          style={{
            background: "rgba(255,214,0,0.1)",
            border: "1px solid rgba(255,214,0,0.15)",
            color: "#FAFAFA",
          }}
        >
          <div className="text-[8px] font-semibold text-[#FFD600] uppercase tracking-[1px] mb-1">
            Iron Fit IA
          </div>
          Perfeito! Criei seu plano personalizado:

          {/* Workout card inside bubble */}
          <div
            className="mt-2 p-2 rounded-xl"
            style={{ background: "#0a0a0a", border: "1px solid rgba(255,214,0,0.1)" }}
          >
            <div className="text-[8px] font-semibold text-[#FFD600] uppercase tracking-[1px] mb-2">
              Treino A — Hipertrofia
            </div>
            {[
              ["Supino reto",     "4×12"],
              ["Remada curvada",  "4×10"],
              ["Agachamento",     "5×8"],
            ].map(([name, sets]) => (
              <div
                key={name}
                className="flex justify-between py-1 text-[9px]"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span className="text-[#FAFAFA]">{name}</span>
                <span className="text-[#FFD600] font-semibold font-cond">{sets}</span>
              </div>
            ))}

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex justify-between text-[8px] text-[#cccccc] mb-1">
                <span>Progresso</span>
                <span>73%</span>
              </div>
              <div className="h-[3px] rounded-sm" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="fill-bar h-full rounded-sm"
                  style={{ "--bar-w": "73%", background: "#FFD600" } as React.CSSProperties}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typing dots */}
        <div
          className="mx-[10px] mb-2 px-3 py-2 flex gap-[3px] items-center rounded-[4px_14px_14px_14px] w-fit"
          style={{ background: "rgba(255,214,0,0.05)" }}
        >
          <span className="typing-dot w-[5px] h-[5px] rounded-full" style={{ background: "#FFD600", display: "block" }} />
          <span className="typing-dot w-[5px] h-[5px] rounded-full" style={{ background: "#FFD600", display: "block" }} />
          <span className="typing-dot w-[5px] h-[5px] rounded-full" style={{ background: "#FFD600", display: "block" }} />
        </div>

        {/* Metrics row */}
        <div className="flex gap-[6px] px-[10px] pb-3">
          {[
            ["2.1k", "Cal/dia"],
            ["156g", "Prot"],
            ["5/7",  "Dias"],
          ].map(([val, label]) => (
            <div
              key={label}
              className="flex-1 text-center rounded-lg p-[6px]"
              style={{
                background: "rgba(255,214,0,0.05)",
                border: "1px solid rgba(255,214,0,0.1)",
              }}
            >
              <div className="text-[13px] font-bold text-[#FFD600] font-cond">{val}</div>
              <div className="text-[8px] text-[#cccccc] mt-[1px]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
