import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Gauge, Fish, Shrimp, Backpack, Anchor, MapTrifold, MapPin,
  Robot, Users, SignOut, List, Trophy, Anchor as AnchorIcon
} from "@phosphor-icons/react";

const NAV = [
  { to: "/", label: "Tableau de bord", icon: Gauge, testid: "nav-dashboard" },
  { to: "/poissons", label: "Poissons", icon: Fish, testid: "nav-fish" },
  { to: "/appats", label: "Appâts", icon: Shrimp, testid: "nav-baits" },
  { to: "/materiel", label: "Matériel", icon: Backpack, testid: "nav-gear" },
  { to: "/montages", label: "Montages", icon: Anchor, testid: "nav-rigs" },
  { to: "/cartes", label: "Cartes", icon: MapTrifold, testid: "nav-maps" },
  { to: "/spots", label: "Spots", icon: MapPin, testid: "nav-spots" },
  { to: "/tournois", label: "Tournois", icon: Trophy, testid: "nav-tournaments" },
  { to: "/requetes", label: "Requêtes bot", icon: Robot, testid: "nav-queries" },
  { to: "/parametres-bot", label: "Paramètres bot", icon: Robot, testid: "nav-bot-settings" },
];

function NavItems({ onNavigate }) {
  const { user } = useAuth();
  const items = user?.role === "admin"
    ? [...NAV, { to: "/utilisateurs", label: "Utilisateurs", icon: Users, testid: "nav-users" }]
    : NAV;
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map(({ to, label, icon: Icon, testid }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          data-testid={testid}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
              isActive
                ? "bg-secondary text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`
          }
        >
          <Icon size={18} weight="duotone" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <AnchorIcon size={26} weight="duotone" className="text-primary" />
        <div>
          <p className="font-heading font-bold text-lg leading-none tracking-tight">GardeLaPeche</p>
          <p className="text-xs text-muted-foreground mt-1">Fishing Planet • Admin</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavItems onNavigate={onNavigate} />
      </div>
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" data-testid="sidebar-user-name">{user?.name}</p>
            <span
              data-testid="sidebar-user-role"
              className={`inline-block mt-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                user?.role === "admin" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              {user?.role === "admin" ? "Administrateur" : "Modérateur"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            data-testid="logout-button"
            onClick={async () => { await logout(); navigate("/login"); }}
            className="text-muted-foreground hover:text-destructive"
          >
            <SignOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:block md:w-60">
        <SidebarContent />
      </aside>
      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="mobile-menu-button">
                <List size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-card border-border">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <p className="font-heading font-bold tracking-tight">GardeLaPeche</p>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
