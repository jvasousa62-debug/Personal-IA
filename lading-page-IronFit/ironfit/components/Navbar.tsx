"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "Funcionalidades", href: "#como-funciona" },
  { label: "Demonstração",    href: "#prova" },
  { label: "Benefícios",      href: "#beneficios" },
  { label: "Contato",         href: "#cta" },
];

const whatsappUrl = "https://wa.me/5589994026771";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-[72px] transition-all duration-300"
      style={{
        background: scrolled ? "rgba(2,2,2,0.97)" : "rgba(2,2,2,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,214,0,0.12)"
          : "1px solid rgba(255,214,0,0.08)",
      }}
    >
      {/* LOGO */}
      <div
        className="font-hero text-[28px] tracking-[3px] cursor-pointer select-none"
        style={{ color: "#FFD600", textShadow: "0 0 20px rgba(255,214,0,0.4)" }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        IRON<span className="text-[#FAFAFA]">FIT</span>
      </div>

      {/* DESKTOP LINKS */}
      <ul className="hidden md:flex gap-9 list-none">
        {links.map((l) => (
          <li key={l.href}>
            <button
              onClick={() => scrollTo(l.href)}
              className="text-[#cccccc] text-[13px] font-medium tracking-[1.5px] uppercase transition-colors hover:text-[#FFD600] bg-transparent border-none cursor-pointer"
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>

      {/* CTA BUTTON */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:block clip-btn-sm bg-[#FFD600] text-black font-cond text-[14px] font-bold tracking-[2px] uppercase px-6 py-[10px] border-none cursor-pointer no-underline transition-all duration-200 hover:bg-white hover:shadow-[0_0_20px_rgba(255,214,0,0.5)]"
      >
        Começar
      </a>

      {/* MOBILE HAMBURGER */}
      <button
        className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        <span
          className="block w-6 h-[2px] bg-[#FFD600] transition-all duration-300"
          style={{ transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none" }}
        />
        <span
          className="block w-6 h-[2px] bg-[#FFD600] transition-all duration-300"
          style={{ opacity: menuOpen ? 0 : 1 }}
        />
        <span
          className="block w-6 h-[2px] bg-[#FFD600] transition-all duration-300"
          style={{ transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }}
        />
      </button>

      {/* MOBILE MENU */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-[72px] left-0 right-0 bg-[#0a0a0a] border-b border-[rgba(255,214,0,0.1)] flex flex-col p-6 gap-4 md:hidden"
        >
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-[#cccccc] text-[14px] font-medium tracking-[2px] uppercase text-left bg-transparent border-none cursor-pointer hover:text-[#FFD600] transition-colors"
            >
              {l.label}
            </button>
          ))}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="clip-btn-sm bg-[#FFD600] text-black font-cond text-[14px] font-bold tracking-[2px] uppercase px-6 py-3 mt-2 border-none cursor-pointer no-underline text-center"
          >
            Começar
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
}
