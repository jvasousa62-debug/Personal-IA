"use client";

const whatsappUrl = "https://wa.me/5589994026771";

const socialLinks = [
  { icon: "📸", label: "Instagram", href: "https://instagram.com/ironfitia" },
  { icon: "💬", label: "WhatsApp", href: whatsappUrl },
  { icon: "▶", label: "Demonstração", href: "#prova" },
  { icon: "in", label: "Contato", href: "#cta" },
];

const productLinks = [
  { label: "Funcionalidades", href: "#como-funciona" },
  { label: "Demonstração", href: "#prova" },
  { label: "Preços", href: "#cta" },
  { label: "Integrações", href: "#premium" },
];

const companyLinks = [
  { label: "Sobre nós", href: "#hero" },
  { label: "Blog", href: "#cta" },
  { label: "Parceiros", href: whatsappUrl },
  { label: "Carreiras", href: "#cta" },
];

const contactLinks = [
  { label: "📧 contato@ironfit.ai", href: "mailto:contato@ironfit.ai" },
  { label: "📱 @ironfitia", href: "https://instagram.com/ironfitia" },
  { label: "💬 WhatsApp", href: whatsappUrl },
  { label: "Suporte 24h", href: whatsappUrl },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-[#020202] px-[8%] pt-[60px] pb-10"
      style={{ borderTop: "1px solid rgba(255,214,0,0.06)" }}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-12 max-w-[1240px] mx-auto">
        {/* BRAND */}
        <div>
          <div
            className="font-hero text-[32px] tracking-[3px]"
            style={{ color: "#FFD600", textShadow: "0 0 20px rgba(255,214,0,0.3)" }}
          >
            IRON<span className="text-[#FAFAFA]">FIT</span>
          </div>
          <p className="text-[13px] text-[#cccccc] leading-[1.7] mt-3 max-w-[260px]">
            A primeira plataforma de personal trainer com IA para academias do
            Brasil. Tecnologia que transforma resultados.
          </p>
          <div className="flex gap-[10px] mt-5">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                title={s.label}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-[16px] text-[#cccccc] no-underline transition-all duration-200 hover:text-[#FFD600]"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#FFD600";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,214,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* LINKS COLUMNS */}
        <FooterCol
          title="Produto"
          links={productLinks}
        />
        <FooterCol
          title="Empresa"
          links={companyLinks}
        />
        <div>
          <h4 className="font-cond text-[12px] font-semibold tracking-[2.5px] uppercase text-[#FFD600] mb-5">
            Contato
          </h4>
          <ul className="list-none flex flex-col gap-[10px]">
            {contactLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[#cccccc] no-underline text-[13px] hover:text-[#FAFAFA] transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* BOTTOM */}
      <div
        className="flex flex-col md:flex-row justify-between items-center gap-2 pt-6 text-[12px] text-[rgba(255,255,255,0.3)] max-w-[1240px] mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span>© {year} Iron Fit IA — Todos os direitos reservados</span>
        <span>
          Feito com ⚡ para academias do Brasil
        </span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-cond text-[12px] font-semibold tracking-[2.5px] uppercase text-[#FFD600] mb-5">
        {title}
      </h4>
      <ul className="list-none flex flex-col gap-[10px]">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-[#cccccc] no-underline text-[13px] hover:text-[#FAFAFA] transition-colors"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
