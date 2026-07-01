"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = Layout;
const react_1 = __importDefault(require("react"));
const wouter_1 = require("wouter");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
function Layout({ children }) {
    const [location] = (0, wouter_1.useLocation)();
    const navigation = [
        { name: "Dashboard", href: "/", icon: lucide_react_1.LayoutDashboard },
        { name: "Job Queue", href: "/jobs", icon: lucide_react_1.ListVideo },
        { name: "Webhooks", href: "/webhooks", icon: lucide_react_1.Webhook },
        { name: "System", href: "/system", icon: lucide_react_1.MonitorDot },
    ];
    return (<div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/30 dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <wouter_1.Link href="/" className="flex items-center gap-2 group outline-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <lucide_react_1.Film className="w-4 h-4"/>
            </div>
            <span className="font-serif font-semibold text-lg tracking-wide text-foreground">RENDER<span className="text-primary">SYNC</span></span>
          </wouter_1.Link>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (<wouter_1.Link key={item.name} href={item.href} className={(0, utils_1.cn)("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 outline-none", isActive
                    ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                <item.icon className={(0, utils_1.cn)("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")}/>
                {item.name}
              </wouter_1.Link>);
        })}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle background noise/glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50"/>
        <div className="relative flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>);
}
