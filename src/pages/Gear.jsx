import ResourcePage from "@/components/ResourcePage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Backpack } from "@phosphor-icons/react";

const TABS = [
  {
    value: "rods", label: "Cannes", endpoint: "/crud/rods", prefix: "rods", entity: "canne",
    columns: [
      { key: "name", label: "Nom" }, { key: "type", label: "Type" },
      { key: "power", label: "Puissance" }, { key: "length", label: "Longueur" },
    ],
    fields: [
      { name: "name", label: "Nom", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["Canne à flotteur", "Canne spinning", "Canne casting", "Canne au coup", "Canne feeder", "Autre"] },
      { name: "power", label: "Puissance", type: "text", placeholder: "Moyenne, Lourde..." },
      { name: "length", label: "Longueur", type: "text", placeholder: "4,20 m" },
      { name: "note", label: "Note", type: "textarea" },
    ],
  },
  {
    value: "reels", label: "Moulinets", endpoint: "/crud/reels", prefix: "reels", entity: "moulinet",
    columns: [
      { key: "name", label: "Nom" }, { key: "type", label: "Type" }, { key: "ratio", label: "Ratio" },
    ],
    fields: [
      { name: "name", label: "Nom", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["Moulinet spinning", "Moulinet casting", "Moulinet au coup", "Autre"] },
      { name: "ratio", label: "Ratio", type: "text", placeholder: "5.2:1" },
      { name: "note", label: "Note", type: "textarea" },
    ],
  },
  {
    value: "lines", label: "Fils", endpoint: "/crud/lines", prefix: "lines", entity: "fil",
    columns: [
      { key: "name", label: "Nom" }, { key: "type", label: "Type" },
      { key: "diameter", label: "Diamètre" }, { key: "strength", label: "Résistance" },
    ],
    fields: [
      { name: "name", label: "Nom", type: "text", required: true, placeholder: "Nylon 0,25 mm" },
      { name: "type", label: "Type", type: "select", options: ["Nylon", "Tresse", "Fluorocarbone"] },
      { name: "diameter", label: "Diamètre", type: "text", placeholder: "0,25 mm" },
      { name: "strength", label: "Résistance", type: "text", placeholder: "5,5 kg" },
      { name: "note", label: "Note", type: "textarea" },
    ],
  },
  {
    value: "floats", label: "Flotteurs", endpoint: "/crud/floats", prefix: "floats", entity: "flotteur",
    columns: [
      { key: "name", label: "Nom" }, { key: "type", label: "Type" }, { key: "weight", label: "Poids" },
    ],
    fields: [
      { name: "name", label: "Nom", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["Flotteur fixe", "Flotteur coulissant", "Waggler", "Autre"] },
      { name: "weight", label: "Poids", type: "text", placeholder: "20 g" },
      { name: "note", label: "Note", type: "textarea" },
    ],
  },
  {
    value: "hooks", label: "Hameçons", endpoint: "/crud/hooks", prefix: "hooks", entity: "hameçon",
    columns: [
      { key: "size", label: "Taille" }, { key: "type", label: "Type" },
      { key: "note", label: "Note", render: (h) => h.note || <span className="text-muted-foreground">—</span> },
    ],
    fields: [
      { name: "size", label: "Taille", type: "text", required: true, placeholder: "#6, #2/0..." },
      { name: "type", label: "Type", type: "select", options: ["Simple", "Double", "Triple", "Circle", "Autre"] },
      { name: "note", label: "Note", type: "textarea" },
    ],
  },
];

export default function GearPage() {
  return (
    <Tabs defaultValue="rods">
      <TabsList className="bg-secondary mb-6 flex-wrap h-auto" data-testid="gear-tabs">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value} data-testid={`gear-tab-${t.value}`}>{t.label}</TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          <ResourcePage
            title={t.label}
            subtitle="Gestion du matériel de pêche"
            icon={Backpack}
            endpoint={t.endpoint}
            testidPrefix={t.prefix}
            entityLabel={t.entity}
            searchPlaceholder={`Rechercher...`}
            columns={t.columns}
            fields={t.fields}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
