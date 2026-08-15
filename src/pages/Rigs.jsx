import ResourcePage from "@/components/ResourcePage";
import { Anchor } from "@phosphor-icons/react";

export default function RigsPage() {
  return (
    <ResourcePage
      title="Montages"
      subtitle="Montages complets : canne, moulinet, fil, flotteur, hameçon, appât"
      icon={Anchor}
      endpoint="/crud/rigs"
      testidPrefix="rigs"
      entityLabel="montage"
      searchPlaceholder="Rechercher un montage..."
      columns={[
        { key: "name", label: "Nom" },
        { key: "technique", label: "Technique" },
        { key: "description", label: "Description", render: (r) => r.description ? r.description.slice(0, 60) + (r.description.length > 60 ? "…" : "") : <span className="text-muted-foreground">—</span> },
      ]}
      fields={[
        { name: "name", label: "Nom du montage", type: "text", required: true },
        { name: "technique", label: "Technique", type: "select", options: ["Pêche au flotteur", "Lancer-ramener", "Pêche au fond", "Pêche au vif", "Drop shot", "Autre"] },
        { name: "rod_id", label: "🎣 Canne", type: "select", optionsEndpoint: "/crud/rods" },
        { name: "reel_id", label: "⚙️ Moulinet", type: "select", optionsEndpoint: "/crud/reels" },
        { name: "line_id", label: "🧵 Fil", type: "select", optionsEndpoint: "/crud/lines" },
        { name: "float_id", label: "🟠 Flotteur", type: "select", optionsEndpoint: "/crud/floats" },
        { name: "hook_id", label: "🪝 Hameçon", type: "select", optionsEndpoint: "/crud/hooks", optionLabel: "size" },
        { name: "bait_id", label: "🪱 Appât", type: "select", optionsEndpoint: "/crud/baits" },
        { name: "sinker", label: "⚖️ Plomb / lest", type: "text", placeholder: "Plombée 15 g" },
        { name: "accessories", label: "🔩 Accessoires", type: "text", placeholder: "Émerillon, perle..." },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
