import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, BarChart3, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Transactions", path: "/transactions" },
    { label: "Categories", path: "/categories" },
    { label: "Wallets", path: "/wallets" },
    { label: "Insights", path: "/insights" },
    { label: "Export", path: "/export" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline text-foreground">SpendWise</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Theme Toggle + Logout + Mobile Menu */}
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-foreground hover:bg-destructive/10 hover:text-destructive gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-lg"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
