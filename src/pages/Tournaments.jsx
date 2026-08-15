import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ResourcePage from "@/components/ResourcePage";
import { absUrl } from "@/components/EntityDialog";
import { Trophy } from "@phosphor-icons/react";

function formatRange(t) {
  if (!t.time) return null;
  if (!t.duration) return t.time;
  try {
    const [h, m] = String(t.time).split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")} - ${String((h + Number(t.duration)) % 24).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
  } catch {
    return t.time;
  }
}

export default function TournamentsPage() {
  const [maps, setMaps] = useState({});

  useEffect(() => {
    api.get("/crud/maps").then((r) => {
      setMaps(Object.fromEntries(r.data.map((m) => [m.id, m.name])));
    }).catch(() => {});
  }, []);

  return (
    <ResourcePage
      title="Tournois"
      subtitle="Compétitions Fishing Planet — affichées par le bot avec !competition ou /competition"
      icon={Trophy}
      endpoint="/crud/tournaments"
      testidPrefix="tournaments"
      entityLabel="tournoi"
      searchPlaceholder="Rechercher un tournoi..."
      columns={[
        {
          key: "name", label: "Tournoi",
          render: (t) => (
            <div className="flex items-center gap-3">
              {t.logo
                ? <img src={absUrl(t.logo)} alt="" className="h-9 w-12 object-cover rounded border border-border" onError={(e) => { e.target.style.display = "none"; }} />
                : <div className="h-9 w-12 rounded border border-border bg-secondary grid place-items-center"><Trophy size={16} className="text-primary" /></div>}
              <span className="font-medium text-sm">{t.name}</span>
            </div>
          ),
        },
        { key: "date", label: "Date", render: (t) => t.date || <span className="text-muted-foreground">—</span> },
        { key: "time", label: "Inscription", render: (t) => formatRange(t) || <span className="text-muted-foreground">—</span> },
        { key: "location", label: "Lieu", render: (t) => t.location || maps[t.map_id] || <span className="text-muted-foreground">—</span> },
        { key: "spot_ids", label: "Spots", render: (t) => `${(t.spot_ids || []).length}/3` },
      ]}
      fields={[
        { name: "name", label: "Nom du tournoi", type: "text", required: true },
        { name: "date", label: "Date (AAAA-MM-JJ)", type: "text", placeholder: "2026-08-15" },
        { name: "time", label: "Heure de début", type: "text", placeholder: "18:00" },
        { name: "duration", label: "Durée (heures)", type: "number", placeholder: "12" },
        { name: "location", label: "Lieu (texte libre)", type: "text", placeholder: "Clearwater Lake" },
        { name: "logo", label: "Logo du tournoi (upload image)", type: "file", wide: true },
        { name: "map_id", label: "Carte associée", type: "select", optionsEndpoint: "/crud/maps" },
        { name: "rig_id", label: "Montage conseillé", type: "select", optionsEndpoint: "/crud/rigs" },
        { name: "spot_ids", label: "Spots (1 à 3)", type: "multiselect", optionsEndpoint: "/crud/spots" },
        { name: "description", label: "Description / règles", type: "textarea" },
      ]}
    />
  );
}
