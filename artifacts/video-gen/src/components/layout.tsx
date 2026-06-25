import React from "react";
import { Link, useLocation } from "wouter";
import { Film, LayoutDashboard, ListVideo, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Job Queue", href: "/jobs", icon: ListVideo },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/30 dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2 group outline-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <Film className="w-4 h-4" />
            </div>
            <span className="font-serif font-semibold text-lg tracking-wide text-foreground">RENDER<span className="text-primary">SYNC</span></span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 outline-none",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors duration-200">
            <Settings className="w-4 h-4" />
            Preferences
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle background noise/glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50" />
        <div className="relative flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
