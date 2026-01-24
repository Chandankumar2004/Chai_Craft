import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Leaf, Heart, Users } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-6">About Chai Craft</h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
            Bringing the authentic taste of tradition to your modern lifestyle, one cup at a time.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-6">Our Journey</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded in 2024, Chai Craft started with a simple mission: to elevate the everyday tea experience. 
                We believe that tea is more than just a beverage; it's a ritual, a moment of peace, and a bridge 
                between cultures.
              </p>
              <p>
                From the misty hills of Darjeeling to the vibrant tea gardens of Assam, we source only the 
                finest whole-leaf teas. Every blend is crafted with precision, ensuring that the essence of 
                quality and tradition is preserved in every sip.
              </p>
            </div>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
             <img 
               src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=1000" 
               alt="Tea Preparation" 
               className="object-cover w-full h-full"
             />
          </div>
        </div>

        <h2 className="font-serif text-3xl font-bold text-center mb-12">Our Core Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl">Purity</h3>
              <p className="text-sm text-muted-foreground">
                100% natural ingredients, no artificial flavors or preservatives.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl">Quality</h3>
              <p className="text-sm text-muted-foreground">
                Sourced from the best gardens, ensuring premium taste every time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl">Community</h3>
              <p className="text-sm text-muted-foreground">
                Supporting local growers and sustainable farming practices.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl">Passion</h3>
              <p className="text-sm text-muted-foreground">
                Every cup is brewed with love and a commitment to excellence.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
