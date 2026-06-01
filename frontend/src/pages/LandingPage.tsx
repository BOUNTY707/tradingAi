import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import StatsSection from '@/components/landing/StatsSection'
import PricingSection from '@/components/landing/PricingSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FAQSection from '@/components/landing/FAQSection'
import Footer from '@/components/layout/Footer'
import TradingBackground from '@/components/landing/TradingBackground'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020206] relative">
      <TradingBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <Footer />
      </div>
    </div>
  )
}
