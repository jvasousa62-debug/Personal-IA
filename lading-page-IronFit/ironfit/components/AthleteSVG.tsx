export default function AthleteSVG() {
  return (
    <svg
      viewBox="0 0 380 580"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 0 30px rgba(255,214,0,0.2))" }}
    >
      <defs>
        <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFD600" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFD600" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#FFD600" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF9800" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Glow behind figure */}
      <ellipse cx="190" cy="340" rx="160" ry="200" fill="url(#bodyGlow)" />

      {/* Ground shadow */}
      <ellipse cx="190" cy="560" rx="120" ry="12" fill="#FFD600" opacity="0.06" />

      {/* Legs */}
      <rect x="150" y="390" width="36" height="170" rx="16" fill="url(#bodyGrad)" />
      <rect x="194" y="390" width="36" height="170" rx="16" fill="url(#bodyGrad)" />

      {/* Leg yellow accents */}
      <rect x="150" y="390" width="36" height="4" rx="2" fill="url(#accentGrad)" opacity="0.6" />
      <rect x="194" y="390" width="36" height="4" rx="2" fill="url(#accentGrad)" opacity="0.6" />

      {/* Torso */}
      <rect x="130" y="220" width="120" height="180" rx="20" fill="url(#bodyGrad)" />

      {/* Chest definition */}
      <line x1="190" y1="235" x2="190" y2="310" stroke="#FFD600" strokeWidth="0.8" opacity="0.2" />
      <path
        d="M140 270 Q165 280 190 270 Q215 280 240 270"
        stroke="#FFD600" strokeWidth="0.8" fill="none" opacity="0.2"
      />

      {/* Yellow chest accent */}
      <rect x="130" y="220" width="120" height="3" rx="1.5" fill="url(#accentGrad)" opacity="0.8" />

      {/* Left arm raised */}
      <rect
        x="75" y="140" width="38" height="130" rx="17"
        fill="url(#bodyGrad)"
        transform="rotate(-20 94 180)"
      />
      {/* Left forearm */}
      <rect
        x="48" y="80" width="34" height="90" rx="15"
        fill="url(#bodyGrad)"
        transform="rotate(-45 65 125)"
      />
      {/* Left fist */}
      <ellipse cx="72" cy="88" rx="22" ry="18" fill="#2a2a2a" />
      <ellipse cx="72" cy="88" rx="22" ry="18" fill="#FFD600" opacity="0.1" />

      {/* Right arm raised */}
      <rect
        x="267" y="140" width="38" height="130" rx="17"
        fill="url(#bodyGrad)"
        transform="rotate(20 286 180)"
      />
      {/* Right forearm */}
      <rect
        x="284" y="80" width="34" height="90" rx="15"
        fill="url(#bodyGrad)"
        transform="rotate(45 301 125)"
      />
      {/* Right fist */}
      <ellipse cx="308" cy="88" rx="22" ry="18" fill="#2a2a2a" />
      <ellipse cx="308" cy="88" rx="22" ry="18" fill="#FFD600" opacity="0.1" />

      {/* Neck */}
      <rect x="172" y="165" width="36" height="60" rx="14" fill="url(#bodyGrad)" />

      {/* Head */}
      <ellipse cx="190" cy="130" rx="52" ry="62" fill="url(#bodyGrad)" />
      <ellipse cx="184" cy="118" rx="16" ry="20" fill="#FFD600" opacity="0.04" />

      {/* Shoulders */}
      <ellipse cx="122" cy="225" rx="36" ry="24" fill="#2e2e2e" />
      <ellipse cx="258" cy="225" rx="36" ry="24" fill="#2e2e2e" />

      {/* Shoulder yellow lines */}
      <path d="M100 218 Q122 208 145 218" stroke="#FFD600" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M235 218 Q258 208 280 218" stroke="#FFD600" strokeWidth="1" fill="none" opacity="0.4" />

      {/* Energy / aura lines */}
      <path d="M20 300 Q60 280 80 240"  stroke="#FFD600" strokeWidth="1"   fill="none" opacity="0.15" strokeDasharray="4 6" />
      <path d="M360 300 Q320 280 300 240" stroke="#FFD600" strokeWidth="1" fill="none" opacity="0.15" strokeDasharray="4 6" />
      <path d="M30 180 Q55 150 80 160"  stroke="#FFD600" strokeWidth="0.8" fill="none" opacity="0.1"  strokeDasharray="3 5" />
      <path d="M350 180 Q325 150 300 160" stroke="#FFD600" strokeWidth="0.8" fill="none" opacity="0.1" strokeDasharray="3 5" />

      {/* Logo text on shirt */}
      <text
        x="190" y="300"
        textAnchor="middle"
        fill="#FFD600"
        opacity="0.25"
        fontFamily="'Bebas Neue', sans-serif"
        fontSize="16"
        letterSpacing="3"
      >
        IRON FIT
      </text>
    </svg>
  );
}
