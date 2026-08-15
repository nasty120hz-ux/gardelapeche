import { useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/ResourcePage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Robot, CheckCircle, XCircle } from "@phosphor-icons/react";

const INTENT_LABELS = {
  full: "Setup complet", bait: "Appât", hook: "Hameçon", rig: "Montage",
  location: "Spot", map: "Carte", rod: "Canne", reel: "Moulinet", line: "Fil", float: "Flotteur",
};

export default function QueriesPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stats/logs", { params: { limit: 200 } })
      .then((r) => setLogs(r.data))
      .catch((e) => toast.error(fmtErr(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Requêtes du bot" subtitle="Historique des questions posées sur Discord" icon={Robot} testid="queries-page-title" />
      <div className="rounded-md border border-border bg-card overflow-hidden fade-up" data-testid="queries-table-container">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Question</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Intention</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Poisson trouvé</TableHead>
              <TableHead className="text-muted-foreground">Résultat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border"><TableCell colSpan={5} className="text-center text-muted-foreground py-10">Chargement...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow className="border-border"><TableCell colSpan={5} className="text-center text-muted-foreground py-10" data-testid="queries-empty-state">Aucune requête enregistrée pour le moment</TableCell></TableRow>
            ) : logs.map((log) => (
              <TableRow key={log.id} className="border-border hover:bg-secondary/50 transition-colors" data-testid={`query-row-${log.id}`}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                </TableCell>
                <TableCell className="text-sm max-w-xs truncate">{log.question}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{INTENT_LABELS[log.intent] || log.intent}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{log.fish_name || "—"}</TableCell>
                <TableCell>
                  {log.found
                    ? <CheckCircle size={18} weight="fill" className="text-emerald-400" />
                    : <XCircle size={18} weight="fill" className="text-destructive" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
