import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User as UserIcon, LogOut, Package, Youtube, Facebook, Instagram, MessageCircle, Shield, FileText, Leaf, Languages } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoImg from "@assets/ChatGPT_Image_Jan_17__2026__12_39_49_PM-removebg-preview_1769163582832.png";
import founder1 from "@/assets/founder1.png";
import founder2 from "@/assets/founder2.png";
import founder3 from "@/assets/founder3.png";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

import { useLanguage } from "@/hooks/use-language";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();

  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  useEffect(() => {
    if (showSecurityPopup) {
      const timer = setTimeout(() => setShowSecurityPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSecurityPopup]);

  useEffect(() => {
    if (showTermsPopup) {
      const timer = setTimeout(() => setShowTermsPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTermsPopup]);

  const form = useForm({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: { name: "", email: "", message: "" }
  });

  const messageMutation = useMutation({
    mutationFn: async (data: any) => {
      // Use Formspree endpoint for message submission
      const response = await fetch("https://formspree.io/f/mvzajvpq", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error("Failed to send message via Formspree");
      }
    },
    onSuccess: () => {
      toast({ title: t("contact.title"), description: "We'll get back to you soon!" });
      setShowContactDialog(false);
      form.reset();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to send message. Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleLinkClick = (href: string) => {
    setLocation(href);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const cartItems = useCart((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20 group-hover:border-primary transition-colors">
                 <img src={logoImg} alt="Chai Craft" className="object-cover h-full w-full" />
              </div>
              <span className="font-serif text-2xl font-bold text-primary tracking-tight">Chai Craft</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
              {t("nav.home")}
            </Link>
            <Link href="/menu" className={`text-sm font-medium hover:text-primary transition-colors ${location === '/menu' ? 'text-primary' : 'text-muted-foreground'}`}>
              {t("nav.menu")}
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className={`text-sm font-medium hover:text-primary transition-colors ${location.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>
                {t("nav.dashboard")}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-2 hover:bg-primary/10"
              data-testid="button-language-switch"
            >
              <Languages className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary group transition-all duration-300 hover:scale-110 active:scale-95" data-testid="button-cart">
                <ShoppingCart className="h-5 w-5 group-hover:animate-bounce" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm group-hover:bg-accent transition-colors">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border" data-testid="button-user">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.username}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" /> {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full flex items-center">
                      <Package className="mr-2 h-4 w-4" /> {t("nav.orders")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="font-semibold shadow-md shadow-primary/20" data-testid="button-login">{t("nav.login")}</Button>
              </Link>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-10">
                  <Link href="/" className="text-lg font-medium">{t("nav.home")}</Link>
                  <Link href="/menu" className="text-lg font-medium">{t("nav.menu")}</Link>
                  <Link href="/cart" className="text-lg font-medium">{t("nav.cart")} ({cartCount})</Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="text-lg font-medium text-primary">{t("nav.dashboard")}</Link>
                  )}
                  {user ? (
                    <Button variant="outline" onClick={() => logout()} className="justify-start">
                      {t("nav.logout")}
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button className="w-full">{t("nav.login")}</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("contact.title")}</DialogTitle>
            <DialogDescription>{t("contact.desc")}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => messageMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contact.name")}</FormLabel>
                    <FormControl><Input {...field} data-testid="input-contact-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contact.email")}</FormLabel>
                    <FormControl><Input type="email" {...field} data-testid="input-contact-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contact.message")}</FormLabel>
                    <FormControl><Textarea {...field} data-testid="input-contact-message" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={messageMutation.isPending} data-testid="button-contact-submit">
                {messageMutation.isPending ? t("contact.sending") : t("contact.send")}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showSecurityPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <Card className="w-80 p-6 shadow-2xl border-primary border-2 bg-background pointer-events-auto animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Shield className="h-6 w-6" />
              <h3 className="font-bold text-lg">{t("security.title")}</h3>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Encrypted UPI transactions</li>
              <li>• Secure user data storage</li>
              <li>• Role-based access control</li>
              <li>• Regular security audits</li>
            </ul>
          </Card>
        </div>
      )}

      {showTermsPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <Card className="w-80 p-6 shadow-2xl border-primary border-2 bg-background pointer-events-auto animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <FileText className="h-6 w-6" />
              <h3 className="font-bold text-lg">{t("terms.title")}</h3>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• All orders are final</li>
              <li>• Delivery within 30-45 mins</li>
              <li>• Data used only for orders</li>
              <li>• Manual UPI verification</li>
            </ul>
          </Card>
        </div>
      )}

      <main className="flex-1 page-transition">
        {children}
      </main>

      {/* Our Story Section */}
      <section className="py-24 bg-[#fffdfa] border-t">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-accent font-bold tracking-widest text-xs uppercase">Our Story</span>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-[#7d3c15] leading-tight">From Craving to Purpose</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The journey of <span className="text-[#7d3c15] font-bold">Chai Craft</span> began with a simple craving. What started as a search for authentic taste became a mission for purity and heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { img: founder1, name: "Founder", desc: "Vision & Growth" },
              { img: founder2, name: "Co-Founder", desc: "Ops & Quality" },
              { img: founder3, name: "Master Blender", desc: "Tradition & Taste" }
            ].map((person, idx) => (
              <div key={idx} className="group flex flex-col items-center">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-3xl mb-6 shadow-xl shadow-black/5 group-hover:shadow-2xl group-hover:shadow-black/10 transition-all duration-500">
                  <img src={person.img} alt={person.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="bg-white px-10 py-6 rounded-2xl shadow-lg shadow-black/5 border border-accent/5 -mt-12 relative z-10 w-[85%] text-center">
                  <h3 className="font-serif text-xl font-bold text-[#7d3c15]">{person.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">{person.desc}</p>
                  <div className="flex justify-center">
                    <a href="#" className="p-2 bg-[#0077b5] text-white rounded-md hover:opacity-90 transition-opacity">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { num: "01", title: "The Beginning", text: "A personal experience sparked the vision of hygienic traditional tea for a modern lifestyle." },
              { num: "02", title: "The First Step", text: "Started from a home kitchen, crafting unique blends with discipline and absolute purity." },
              { num: "03", title: "Today & Beyond", text: "Growing steadily as a trusted name in traditional snacks and teas for health-conscious lovers." }
            ].map((step, idx) => (
              <Card key={idx} className="p-8 border-none bg-white shadow-sm hover:shadow-md transition-shadow">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-bold rounded-lg mb-4">{step.num}</span>
                <h4 className="font-serif text-xl font-bold mb-3">{step.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
              <Button className="bg-[#7d3c15] text-white px-10 py-7 rounded-2xl text-lg font-bold shadow-lg shadow-[#7d3c15]/20 hover-elevate">
                Read Our Full Story
              </Button>
            </Link>
            <Link href="/menu" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
              <Button variant="outline" className="border-[#7d3c15] text-[#7d3c15] px-10 py-7 rounded-2xl text-lg font-bold hover:bg-[#7d3c15]/5">
                Experience the Taste
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section className="py-20 bg-muted/20 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg">
              At Chai Craft, our commitment to quality goes beyond the cup. We believe in transparency, sustainability, and the art of traditional brewing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center space-y-4 hover-elevate border-accent/10 group transition-all duration-300 hover:bg-accent/5">
              <div className="w-16 h-16 bg-accent/10 group-hover:bg-accent rounded-full flex items-center justify-center mx-auto text-accent group-hover:text-white transition-colors duration-300">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold">100% Organic</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We source only the finest organic tea leaves, free from pesticides and artificial additives, directly from the lush gardens of India.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover-elevate border-accent/10 group transition-all duration-300 hover:bg-accent/5">
              <div className="w-16 h-16 bg-accent/10 group-hover:bg-accent rounded-full flex items-center justify-center mx-auto text-accent group-hover:text-white transition-colors duration-300">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold">Quality Assured</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every batch undergoes rigorous quality checks and manual tasting by our tea masters to ensure a consistent, premium experience.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover-elevate border-accent/10 group transition-all duration-300 hover:bg-accent/5">
              <div className="w-16 h-16 bg-accent/10 group-hover:bg-accent rounded-full flex items-center justify-center mx-auto text-accent group-hover:text-white transition-colors duration-300">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold">Sustainable Packaging</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We are committed to the planet. Our packaging is eco-friendly and biodegradable, ensuring that our tea leaves no footprint behind.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center md:text-left">
            <div className="space-y-4 md:col-span-1 lg:col-span-1">
              <span className="font-serif text-xl font-bold text-primary">
                Chai Craft
              </span>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto md:mx-0">
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">{t("footer.quicklinks")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => handleLinkClick("/")}
                    className="hover:text-primary transition-colors cursor-pointer"
                    data-testid="link-footer-home"
                  >
                    {t("nav.home")}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleLinkClick("/menu")}
                    className="hover:text-primary transition-colors cursor-pointer"
                    data-testid="link-footer-menu"
                  >
                    {t("nav.menu")}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">{t("footer.about")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => handleLinkClick("/about")}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                    data-testid="link-footer-about"
                  >
                    {t("footer.about")}
                  </button>
                </li>
                <li><button onClick={() => setShowContactDialog(true)} className="hover:text-primary transition-colors cursor-pointer text-left" data-testid="link-footer-contact">{t("footer.contact")}</button></li>
                <li><button onClick={() => handleLinkClick("/careers")} className="hover:text-primary transition-colors cursor-pointer text-left" data-testid="link-footer-careers">{t("footer.careers")}</button></li>
                <li><button onClick={() => setShowSecurityPopup(true)} className="hover:text-primary transition-colors cursor-pointer text-left" data-testid="link-footer-security">{t("footer.security")}</button></li>
                <li><button onClick={() => setShowTermsPopup(true)} className="hover:text-primary transition-colors cursor-pointer text-left text-nowrap" data-testid="link-footer-terms">{t("footer.terms")}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">{t("footer.hours")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Mon - Fri: 8am - 9pm</li>
                <li>Sat - Sun: 9am - 10pm</li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">{t("footer.support")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="tel:+919304335185" className="hover:text-primary transition-colors">
                    +91 93043 35185
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@chaicraft.com" className="hover:text-primary transition-colors">
                    hello@chaicraft.com
                  </a>
                </li>
                <li>123 Tea Garden Road.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">{t("footer.social")}</h4>
              <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground">
                <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-transform hover:scale-110" data-testid="link-social-youtube">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-transform hover:scale-110" data-testid="link-social-facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-transform hover:scale-110" data-testid="link-social-instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://wa.me/919304335185" target="_blank" rel="noreferrer" className="hover:text-primary transition-transform hover:scale-110" data-testid="link-social-whatsapp">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Chai Craft. {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}