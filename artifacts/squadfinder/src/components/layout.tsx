import { Link, useLocation } from "wouter";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { Users, Search, LayoutDashboard, Compass } from "lucide-react";
import { ResetDemoDataDialog } from "@/components/reset-data-dialog";
import { useEffect, useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: ROUTES.search, label: "Search", icon: Search },
    { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
    { href: ROUTES.available, label: "Available", icon: Compass },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "glass" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={ROUTES.home} className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
              SquadFinder
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-muted text-foreground" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href={ROUTES.about} 
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground",
              location === ROUTES.about ? "text-foreground" : "text-muted-foreground"
            )}
          >
            About
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/20 mt-auto py-8">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} SquadFinder. For GLS University capstone students.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ResetDemoDataDialog />
          <Link href={ROUTES.about} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About Project
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}