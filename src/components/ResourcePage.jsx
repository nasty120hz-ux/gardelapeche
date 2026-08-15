import { useCallback, useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import EntityDialog from "@/components/EntityDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Plus, MagnifyingGlass, PencilSimple, Trash } from "@phosphor-icons/react";

export const RARITY_COLORS = {
  "commun": "#94A3B8",
  "peu commun": "#22C55E",
  "rare": "#3B82F6",
  "épique": "#A855F7",
  "légendaire": "#F59E0B",
};

export function PageHeader({ title, subtitle, icon: Icon, children, testid }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-up">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={28} weight="duotone" className="text-primary" />}
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight" data-testid={testid}>{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export default function ResourcePage({
  title, subtitle, icon, endpoint, columns, fields, testidPrefix,
  searchPlaceholder = "Rechercher...", entityLabel = "élément", defaultItem = {},
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const r = await api.get(endpoint, { params: q ? { q } : {} });
      setItems(r.data);
    } catch (e) {
      toast.error(fmtErr(e));
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, payload);
        toast.success(`${entityLabel} modifié avec succès`);
      } else {
        await api.post(endpoint, payload);
        toast.success(`${entityLabel} ajouté avec succès`);
      }
      load(search);
    } catch (e) {
      toast.error(fmtErr(e));
      throw e;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${endpoint}/${deleteTarget.id}`);
      toast.success(`${entityLabel} supprimé`);
      setDeleteTarget(null);
      load(search);
    } catch (e) {
      toast.error(fmtErr(e));
    }
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} icon={icon} testid={`${testidPrefix}-page-title`}>
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            data-testid={`${testidPrefix}-search-input`}
            className="pl-8 bg-secondary border-input w-48 md:w-64"
          />
        </div>
        <Button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          data-testid={`${testidPrefix}-add-button`}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} className="mr-1" /> Ajouter
        </Button>
      </PageHeader>

      <div className="rounded-md border border-border bg-card overflow-hidden fade-up" data-testid={`${testidPrefix}-table-container`}>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((c) => <TableHead key={c.key} className="text-muted-foreground">{c.label}</TableHead>)}
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border"><TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-10">Chargement...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow className="border-border"><TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-10" data-testid={`${testidPrefix}-empty-state`}>Aucun {entityLabel} enregistré</TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-secondary/50 transition-colors" data-testid={`${testidPrefix}-row-${item.id}`}>
                {columns.map((c) => (
                  <TableCell key={c.key} className="py-2.5">
                    {c.render ? c.render(item) : (item[c.key] ?? <span className="text-muted-foreground">—</span>)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" data-testid={`${testidPrefix}-edit-${item.id}`}
                      onClick={() => { setEditing(item); setDialogOpen(true); }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <PencilSimple size={15} />
                    </Button>
                    <Button variant="ghost" size="icon" data-testid={`${testidPrefix}-delete-${item.id}`}
                      onClick={() => setDeleteTarget(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? `Modifier : ${editing.name || editing.size || ""}` : `Ajouter — ${entityLabel}`}
        fields={fields}
        initial={editing || defaultItem}
        onSubmit={handleSubmit}
        testidPrefix={`${testidPrefix}-form`}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Supprimer définitivement « {deleteTarget?.name || deleteTarget?.size} » ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`${testidPrefix}-delete-cancel`} className="border-border">Annuler</AlertDialogCancel>
            <AlertDialogAction data-testid={`${testidPrefix}-delete-confirm`} onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
