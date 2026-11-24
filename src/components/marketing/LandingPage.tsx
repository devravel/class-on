import { FeaturesGrid } from './FeaturesGrid'
import { FinalCta } from './FinalCta'
import { Footer } from './Footer'
import { Hero } from './Hero'
import { Navbar } from './Navbar'
import { ProductShowcase } from './ProductShowcase'
import { TechStack } from './TechStack'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <main>
        <Hero />
        <ProductShowcase />
        <FeaturesGrid />
        <TechStack />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
