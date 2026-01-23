import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User as UserIcon, LogOut, Package, Youtube, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoImg from "@assets/ChatGPT_Image_Jan_17__2026__12_39_49_PM-removebg-preview_1769163582832.png";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [location] = useLocation();
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

      <main className="flex-1 page-transition">
        {children}
      </main>

      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                 <span className="font-serif text-xl font-bold text-primary">Chai Craft</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Brewing moments of joy, one cup at a time. Authentic flavors, premium ingredients.
              </p>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/menu" className="hover:text-primary transition-colors">Our Menu</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4">Hours</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Mon - Fri: 8am - 9pm</li>
                <li>Sat - Sun: 9am - 10pm</li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>+91 93043 35185</li>
                <li>hello@chaicraft.com</li>
                <li>123 Tea Garden Road</li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-bold mb-4">Contact Us</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/chandan123456kumar" className="text-muted-foreground hover:text-primary transition-colors" title="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com/chandan123456kumar" className="text-muted-foreground hover:text-primary transition-colors" title="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com/chandan123456kumar" className="text-muted-foreground hover:text-primary transition-colors" title="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com/chandan123456kumar" className="text-muted-foreground hover:text-primary transition-colors" title="WhatsApp Channel">
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
