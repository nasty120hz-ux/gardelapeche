import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ResourcePage from "@/components/ResourcePage";
import { MapPin } from "@phosphor-icons/react";

export default function SpotsPage() {
  const [maps, setMaps] = useState({});

  useEffect(() => {
    api.get("/crud/maps").then((r) => {
      setMaps(Object.fromEntries(r.data.map((m) => [m.id, m.name])));
    }).catch(() => {});
  }, []);

  return (
    <ResourcePage
      title="Spots"
      subtitle="Spots de pêche liés aux cartes et aux poissons"
      icon={MapPin}
      endpoint="/crud/spots"
      testidPrefix="spots"
      entityLabel="spot"
      searchPlaceholder="Rechercher un spot..."
      columns={[
        { key: "name", label: "Spot" },
        { key: "map_id", label: "Carte", render: (s) => maps[s.map_id] || <span className="text-muted-foreground">—</span> },
        { key: "depth", label: "Profondeur", render: (s) => s.depth || <span className="text-muted-foreground">—</span> },
        { key: "time", label: "Heure", render: (s) => s.time || <span className="text-muted-foreground">—</span> },
        { key: "fish_ids", label: "Poissons", render: (s) => `${(s.fish_ids || []).length} poisson(s)` },
      ]}
      fields={[
        { name: "name", label: "Nom du spot", type: "text", required: true },
        { name: "map_id", label: "Carte", type: "select", optionsEndpoint: "/crud/maps", required: true },
        { name: "coordinates", label: "Position / coordonnées", type: "text", placeholder: "N 47°12'..." },
        { name: "depth", label: "Profondeur", type: "text", placeholder: "1,5 m" },
        { name: "time", label: "Heure recommandée", type: "text", placeholder: "Matin / Soir / Nuit" },
        { name: "weather", label: "Météo / conditions", type: "text", placeholder: "Couvert, ensoleillé..." },
        { name: "image", label: "Image (URL)", type: "image", wide: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "fish_ids", label: "Poissons présents", type: "multiselect", optionsEndpoint: "/crud/fish" },
        { name: "bait_ids", label: "Appâts recommandés", type: "multiselect", optionsEndpoint: "/crud/baits" },
        { name: "techniques", label: "Techniques (séparées par des virgules)", type: "csv", placeholder: "Pêche au flotteur, Lancer-ramener" },
      ]}
    />
  );
}
