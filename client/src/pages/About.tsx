import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import founder1 from "@/assets/founder1.png";
import founder2 from "@/assets/founder2.png";
import founder3 from "@/assets/founder3.png";

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#7d3c15]">Our Full Story</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            What began as a personal quest for the perfect cup of tea during a Chhath Puja celebration in Bihar has grown into a mission to bring the authentic, pure, and hygienic taste of traditional Indian beverages to every home.
          </p>
        </section>

        {/* Detailed Founder Stories */}
        <section className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
              <img src={founder1} alt="Founder" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-bold text-[#7d3c15]">The Visionary: Founder</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  At just 16, while searching for a hygienic snack during festive times, our founder realized that traditional tastes were being lost to mass production and poor quality control. He envisioned a brand that stood for purity above all else.
                </p>
                <p>
                  Today, he leads the vision and growth of Chai Craft, ensuring that every strategic move stays true to our roots while embracing modern distribution to reach tea lovers worldwide.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:order-2">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                <img src={founder2} alt="Co-Founder" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-6 md:order-1">
              <h2 className="font-serif text-4xl font-bold text-[#7d3c15]">The Perfectionist: Co-Founder</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  With a background in operations and an obsessive eye for detail, our Co-Founder turned the kitchen-table dream into a structured reality. He believes that quality isn't an accident; it's the result of high intention and sincere effort.
                </p>
                <p>
                  He oversees the daily operations and quality assurance, personally visiting our sourcing gardens and ensuring that every batch meets the "Chai Craft Standard."
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
              <img src={founder3} alt="Master Blender" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-bold text-[#7d3c15]">The Soul: Master Blender</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Our Master Blender brings decades of ancestral wisdom to the table. He doesn't just blend tea; he composes symphonies of flavor. His deep understanding of seasonal variations and traditional spices is what gives Chai Craft its unique soul.
                </p>
                <p>
                  He leads our blending workshops, passing down the art of traditional brewing to the next generation and ensuring that the heritage of Indian tea is preserved in every sip.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Mission */}
        <section className="bg-muted/30 p-12 rounded-[3rem] text-center space-y-8">
          <h2 className="font-serif text-4xl font-bold text-[#7d3c15]">Our Mission</h2>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground italic leading-relaxed">
            "To provide a pure, hygienic, and traditional tea experience that respects our heritage while caring for our customers' health and the planet's future."
          </p>
        </section>
      </div>
    </Layout>
  );
}
