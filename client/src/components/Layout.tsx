import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User as UserIcon, LogOut, Package, Youtube, Facebook, Instagram, MessageCircle, Shield, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoImg from "@assets/ChatGPT_Image_Jan_17__2026__12_39_49_PM-removebg-preview_1769163582832.png";
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

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

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
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      toast({ title: "Message Sent", description: "We'll get back to you soon!" });
      setShowContactDialog(false);
      form.reset();
    }
  });

  const handleLinkClick = (href: string) => {
    setLocation(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={`text-sm font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
              Home
            </Link>
            <Link href="/menu" className={`text-sm font-medium hover:text-primary transition-colors ${location === '/menu' ? 'text-primary' : 'text-muted-foreground'}`}>
              Menu
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className={`text-sm font-medium hover:text-primary transition-colors ${location.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border">
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
                      <UserIcon className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full flex items-center">
                      <Package className="mr-2 h-4 w-4" /> Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="font-semibold shadow-md shadow-primary/20">Login</Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-10">
                  <Link href="/" className="text-lg font-medium">Home</Link>
                  <Link href="/menu" className="text-lg font-medium">Menu</Link>
                  <Link href="/cart" className="text-lg font-medium">Cart ({cartCount})</Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="text-lg font-medium text-primary">Admin Dashboard</Link>
                  )}
                  {user ? (
                    <Button variant="outline" onClick={() => logout()} className="justify-start">
                      Log Out
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button className="w-full">Login / Register</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>Send us a message and we'll respond shortly.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => messageMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={messageMutation.isPending}>
                {messageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Security Popup */}
      {showSecurityPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <Card className="w-80 p-6 shadow-2xl border-primary border-2 bg-background pointer-events-auto animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Shield className="h-6 w-6" />
              <h3 className="font-bold text-lg">Security First</h3>
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

      {/* Terms Popup */}
      {showTermsPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <Card className="w-80 p-6 shadow-2xl border-primary border-2 bg-background pointer-events-auto animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <FileText className="h-6 w-6" />
              <h3 className="font-bold text-lg">Terms & Conditions</h3>
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

      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center md:text-left">

            {/* Brand */}
            <div className="space-y-4 md:col-span-1 lg:col-span-1">
              <span className="font-serif text-xl font-bold text-primary">
                Chai Craft
              </span>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto md:mx-0">
                Brewing moments of joy, one cup at a time. Authentic flavors, premium ingredients.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => handleLinkClick("/")}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleLinkClick("/menu")}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    Our Menu
                  </button>
                </li>
              </ul>
            </div>

            {/* About Section */}
            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={() => handleLinkClick("/about")}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    About Us
                  </button>
                </li>
                <li><button onClick={() => setShowContactDialog(true)} className="hover:text-primary transition-colors cursor-pointer text-left">Contact Us</button></li>
                <li><button onClick={() => handleLinkClick("/careers")} className="hover:text-primary transition-colors cursor-pointer text-left">Careers</button></li>
                <li><button onClick={() => setShowSecurityPopup(true)} className="hover:text-primary transition-colors cursor-pointer text-left">Security</button></li>
                <li><button onClick={() => setShowTermsPopup(true)} className="hover:text-primary transition-colors cursor-pointer text-left text-nowrap">Terms & Conditions</button></li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">Hours</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Mon - Fri: 8am - 9pm</li>
                <li>Sat - Sun: 9am - 10pm</li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">Support</h4>
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

            {/* Contact Us (Social) */}
            <div>
              <h4 className="font-serif font-bold mb-4 text-foreground">Social</h4>
              <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground">
                <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-transform hover:scale-110">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-transform hover:scale-110">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-transform hover:scale-110">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://wa.me/919304335185" target="_blank" rel="noreferrer" className="hover:text-primary transition-transform hover:scale-110">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>

          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Chai Craft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}