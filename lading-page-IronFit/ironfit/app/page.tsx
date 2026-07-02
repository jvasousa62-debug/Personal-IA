import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import PremiumVisual from "@/components/PremiumVisual";
import ProofSection from "@/components/ProofSection";
import CtaFinal from "@/components/CtaFinal";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-[#020202] text-[#FAFAFA] overflow-x-hidden">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Benefits />
      <PremiumVisual />
      <ProofSection />
      <CtaFinal />
      <Footer />
    </main>
  );
}
