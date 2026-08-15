import ResourcePage from "@/components/ResourcePage";
import { Shrimp } from "@phosphor-icons/react";

export default function BaitsPage() {
  return (
    <ResourcePage
      title="Appâts"
      subtitle="Appâts naturels, leurres et vifs"
      icon={Shrimp}
      endpoint="/crud/baits"
      testidPrefix="baits"
      entityLabel="appât"
      searchPlaceholder="Rechercher un appât..."
      columns={[
        { key: "name", label: "Nom" },
        { key: "type", label: "Type" },
        { key: "note", label: "Note", render: (b) => b.note || <span className="text-muted-foreground">—</span> },
      ]}
      fields={[
        { name: "name", label: "Nom", type: "text", required: true },
        { name: "type", label: "Type", type: "select", options: ["Naturel", "Leurre", "Vif", "Artificiel", "Pâte", "Autre"] },
        { name: "note", label: "Note", type: "textarea" },
      ]}
    />
  );
}
