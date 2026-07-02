# ⚡ Iron Fit — Landing Page

Landing page cinematográfica para o Iron Fit, construída com **Next.js 14**, **Framer Motion** e **Tailwind CSS**.

---

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 3. Build para produção

```bash
npm run build
npm start
```

---

## 📁 Estrutura de arquivos

```
ironfit/
├── app/
│   ├── globals.css          # Estilos globais, variáveis CSS, animações
│   ├── layout.tsx           # Root layout com metadata SEO
│   └── page.tsx             # Página principal (monta todas as seções)
│
├── components/
│   ├── Navbar.tsx           # Navbar fixa com glassmorphism + menu mobile
│   ├── Hero.tsx             # Hero cinematográfico (raios, partículas, atleta)
│   ├── AthleteSVG.tsx       # Silhueta SVG do atleta musculoso
│   ├── PhoneMockup.tsx      # Mockup flutuante do app
│   ├── StatsBar.tsx         # Barra de estatísticas animada
│   ├── SectionReveal.tsx    # Wrapper reutilizável de scroll animation
│   ├── HowItWorks.tsx       # Como funciona + chat demo ao vivo da IA
│   ├── Benefits.tsx         # Grid de benefícios com glassmorphism
│   ├── PremiumVisual.tsx    # Seção premium com métricas e glass cards
│   ├── ProofSection.tsx     # Provas visuais (antes/depois, dashboard, fluxo)
│   ├── CtaFinal.tsx         # CTA final com glow e grid
│   └── Footer.tsx           # Rodapé completo
│
├── public/                  # Assets estáticos (imagens, ícones)
├── tailwind.config.ts       # Configuração Tailwind com tokens Iron Fit
├── postcss.config.js
├── next.config.js
└── tsconfig.json
```

---

## 🎨 Identidade visual

| Token       | Valor     |
|-------------|-----------|
| Preto       | `#020202` |
| Dark        | `#0a0a0a` |
| Dark 2      | `#111111` |
| Dark 3      | `#161616` |
| Amarelo     | `#FFD600` |
| Amarelo 2   | `#FFC107` |
| Amarelo 3   | `#FF9800` |
| Branco      | `#FAFAFA` |
| Branco 2    | `#cccccc` |

**Fontes:**
- `Bebas Neue` — títulos hero
- `Barlow Condensed` — botões, badges, labels
- `Barlow` — corpo de texto

---

## ✅ Checklist implementado

- [x] Navbar com logo, links, botão "Começar"
- [x] Hero com fundo cinematográfico, raios animados, atleta SVG, mockup do app
- [x] Badge pulsante, título gigante, subtítulo, botões
- [x] Partículas animadas no hero
- [x] Barra de stats com números de impacto
- [x] Seção "Como funciona" com chat da IA ao vivo
- [x] Benefícios em grid com glassmorphism e hover effects
- [x] Seção premium com glass cards, gráfico de barras e métricas
- [x] Prova visual (antes/depois, dashboard, fluxo do usuário)
- [x] CTA final com glow pulsante e grid cinematográfico
- [x] Footer com logo, redes sociais, email, direitos reservados
- [x] Scroll animations com Framer Motion
- [x] Glow amarelo neon em toda a página
- [x] Design responsivo (mobile-friendly)
- [x] SEO metadata configurado

---

## 🌐 Deploy no Vercel

```bash
npm install -g vercel
vercel --prod
```

Ou conecte o repositório diretamente no [vercel.com](https://vercel.com).

---

## 📦 Tecnologias

- **Next.js 14** — App Router
- **React 18**
- **TypeScript**
- **Tailwind CSS 3**
- **Framer Motion 11**
- **Google Fonts** (Bebas Neue + Barlow)
