import ResourcePage from "@/components/ResourcePage";
import { MapTrifold } from "@phosphor-icons/react";

export default function MapsPage() {
  return (
    <ResourcePage
      title="Cartes"
      subtitle="Les différents plans d'eau de Fishing Planet"
      icon={MapTrifold}
      endpoint="/crud/maps"
      testidPrefix="maps"
      entityLabel="carte"
      searchPlaceholder="Rechercher une carte..."
      columns={[
        {
          key: "name", label: "Carte",
          render: (m) => (
            <div className="flex items-center gap-3">
              {m.image
                ? <img src={m.image} alt="" className="h-9 w-12 object-cover rounded border border-border" onError={(e) => { e.target.style.display = "none"; }} />
                : <div className="h-9 w-12 rounded border border-border bg-secondary grid place-items-center text-muted-foreground text-[10px]">N/A</div>}
              <span className="font-medium text-sm">{m.name}</span>
            </div>
          ),
        },
        { key: "country", label: "Pays / Région" },
        { key: "level_required", label: "Niveau requis", render: (m) => m.level_required ?? <span className="text-muted-foreground">—</span> },
      ]}
      fields={[
        { name: "name", label: "Nom de la carte", type: "text", required: true },
        { name: "country", label: "Pays / Région", type: "text" },
        { name: "level_required", label: "Niveau requis", type: "number" },
        { name: "image", label: "Image (URL)", type: "image", wide: true },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
