import { useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/ResourcePage";
import { Gauge, Fish, MapTrifold, MapPin, Shrimp, Anchor, Robot, Trophy } from "@phosphor-icons/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CARDS = [
  { key: "fish", label: "Poissons", icon: Fish, testid: "stat-fish" },
  { key: "baits", label: "Appâts", icon: Shrimp, testid: "stat-baits" },
  { key: "rigs", label: "Montages", icon: Anchor, testid: "stat-rigs" },
  { key: "maps", label: "Cartes", icon: MapTrifold, testid: "stat-maps" },
  { key: "spots", label: "Spots", icon: MapPin, testid: "stat-spots" },
  { key: "queries", label: "Requêtes bot", icon: Robot, testid: "stat-queries" },
  { key: "tournaments", label: "Tournois", icon: Trophy, testid: "stat-tournaments" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);

  useEffect(() => {
    api.get("/stats").then((r) => setStats(r.data)).catch((e) => toast.error(fmtErr(e)));
    api.get("/stats/queries-per-day").then((r) => setChart(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de la base Fishing Planet" icon={Gauge} testid="dashboard-page-title" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {CARDS.map(({ key, label, icon: Icon, testid }, i) => (
          <div key={key}
            className="rounded-md border border-border bg-card p-4 glow-hover fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
            data-testid={testid}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
              <Icon size={18} weight="duotone" className="text-primary" />
            </div>
            <p className="font-heading text-3xl font-bold tracking-tight" data-testid={`${testid}-value`}>
              {stats ? stats[key] : "—"}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-border bg-card p-4 fade-up" data-testid="queries-chart-card">
        <h2 className="font-heading text-lg font-semibold tracking-tight mb-4">Requêtes du bot — 14 derniers jours</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="qfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1a2740" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} stroke="#1a2740" />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} stroke="#1a2740" allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#0C1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6 }}
                labelStyle={{ color: "#94A3B8" }} itemStyle={{ color: "#00E5FF" }} />
              <Area type="monotone" dataKey="requêtes" stroke="#00E5FF" strokeWidth={2} fill="url(#qfill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
