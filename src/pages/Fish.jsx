import { useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader, RARITY_COLORS } from "@/components/ResourcePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { StarRating } from "@/components/EntityDialog";
import { Fish, Plus, MagnifyingGlass, PencilSimple, Trash, X } from "@phosphor-icons/react";

const RARITIES = ["commun", "peu commun", "rare", "épique", "légendaire"];
const PLACEHOLDER = "https://images.unsplash.com/photo-1775145885673-13e41d212875?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxiYXNzJTIwZmlzaCUyMHVuZGVyd2F0ZXJ8ZW58MHx8fHwxNzg2NjYxNjQ3fDA&ixlib=rb-4.1.0&q=85";

const EMPTY = {
  name: "", name_en: "", image: "", description: "", level: "", weight_min: "", weight_max: "",
  rarity: "commun", notes: "", aliases: "", tags: "", baits: [], hooks: [], rig_ids: [], tips: "",
};

function FishDialog({ open, onOpenChange, initial, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [baits, setBaits] = useState([]);
  const [hooks, setHooks] = useState([]);
  const [rigs, setRigs] = useState([]);
  const [saving, setSaving] = useState(false);
  const editing = initial?.id;

  useEffect(() => {
    if (!open) return;
    if (initial?.id) {
      setForm({
        ...EMPTY, ...initial,
        level: initial.level ?? "", weight_min: initial.weight_min ?? "", weight_max: initial.weight_max ?? "",
        aliases: (initial.aliases || []).join(", "), tags: (initial.tags || []).join(", "),
        baits: initial.baits || [], hooks: initial.hooks || [], rig_ids: initial.rig_ids || [],
      });
    } else {
      setForm(EMPTY);
    }
    Promise.all([api.get("/crud/baits"), api.get("/crud/hooks"), api.get("/crud/rigs")])
      .then(([b, h, r]) => { setBaits(b.data); setHooks(h.data); setRigs(r.data); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setBait = (i, k, v) => setForm((f) => {
    const baits = f.baits.map((b, j) => (j === i ? { ...b, [k]: v } : b));
    if (k === "is_preferred" && v) return { ...f, baits: baits.map((b, j) => ({ ...b, is_preferred: j === i })) };
    return { ...f, baits };
  });

  const setHook = (i, k, v) => setForm((f) => ({
    ...f, hooks: f.hooks.map((h, j) => (j === i ? { ...h, [k]: v } : h)),
  }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        level: form.level === "" ? null : Number(form.level),
        weight_min: form.weight_min === "" ? null : Number(form.weight_min),
        weight_max: form.weight_max === "" ? null : Number(form.weight_max),
        aliases: String(form.aliases || "").split(",").map((s) => s.trim()).filter(Boolean),
        tags: String(form.tags || "").split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editing) await api.put(`/crud/fish/${editing}`, payload);
      else await api.post("/crud/fish", payload);
      toast.success(editing ? "Poisson modifié avec succès" : "Poisson ajouté avec succès");
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(fmtErr(e));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "bg-secondary border-input";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading tracking-tight">
            {editing ? `Modifier : ${initial.name}` : "Ajouter un poisson"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="bg-secondary">
            <TabsTrigger value="general" data-testid="fish-tab-general">Général</TabsTrigger>
            <TabsTrigger value="baits" data-testid="fish-tab-baits">Appâts ({form.baits.length})</TabsTrigger>
            <TabsTrigger value="hooks" data-testid="fish-tab-hooks">Hameçons ({form.hooks.length})</TabsTrigger>
            <TabsTrigger value="rigs" data-testid="fish-tab-rigs">Montages ({form.rig_ids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Nom du poisson *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="fish-form-name-input" className={inputCls} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Nom anglais</Label>
                <Input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} data-testid="fish-form-name-en-input" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Image (URL)</Label>
                <div className="flex gap-3 items-start">
                  <Input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." data-testid="fish-form-image-input" className={inputCls} />
                  <img src={form.image || PLACEHOLDER} alt="" className="h-14 w-20 object-cover rounded border border-border"
                    onError={(e) => { e.target.src = PLACEHOLDER; }} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Description</Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="fish-form-description-input" className={`${inputCls} min-h-[70px]`} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Niveau recommandé</Label>
                <Input type="number" value={form.level} onChange={(e) => set("level", e.target.value)} data-testid="fish-form-level-input" className={inputCls} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Rareté</Label>
                <Select value={form.rarity} onValueChange={(v) => set("rarity", v)}>
                  <SelectTrigger data-testid="fish-form-rarity-select" className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {RARITIES.map((r) => (
                      <SelectItem key={r} value={r}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: RARITY_COLORS[r] }} />{r}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Poids min (kg)</Label>
                <Input type="number" step="0.1" value={form.weight_min} onChange={(e) => set("weight_min", e.target.value)} data-testid="fish-form-weight-min-input" className={inputCls} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Poids max (kg)</Label>
                <Input type="number" step="0.1" value={form.weight_max} onChange={(e) => set("weight_max", e.target.value)} data-testid="fish-form-weight-max-input" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Alias (séparés par des virgules)</Label>
                <Input value={form.aliases} onChange={(e) => set("aliases", e.target.value)} placeholder="bison, smallmouth buffalo..." data-testid="fish-form-aliases-input" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Tags (séparés par des virgules)</Label>
                <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="carnassier, fond..." data-testid="fish-form-tags-input" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Conseils (affichés par le bot)</Label>
                <Textarea value={form.tips} onChange={(e) => set("tips", e.target.value)} data-testid="fish-form-tips-input" className={`${inputCls} min-h-[60px]`} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Notes internes</Label>
                <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} data-testid="fish-form-notes-input" className={`${inputCls} min-h-[60px]`} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="baits" className="pt-4 space-y-3">
            {form.baits.map((b, i) => (
              <div key={i} className="rounded-md border border-border bg-secondary/40 p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end" data-testid={`fish-bait-row-${i}`}>
                <div className="sm:col-span-4">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Appât</Label>
                  <Select value={b.bait_id || "none"} onValueChange={(v) => setBait(i, "bait_id", v === "none" ? "" : v)}>
                    <SelectTrigger data-testid={`fish-bait-select-${i}`} className={inputCls}><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="none">— Choisir —</SelectItem>
                      {baits.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Efficacité</Label>
                  <StarRating value={b.preference} onChange={(v) => setBait(i, "preference", v)} testid={`fish-bait-stars-${i}`} />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={!!b.is_preferred} onCheckedChange={(v) => setBait(i, "is_preferred", !!v)} data-testid={`fish-bait-preferred-${i}`} />
                    ⭐ Préféré
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Conditions</Label>
                  <Input value={b.conditions || ""} onChange={(e) => setBait(i, "conditions", e.target.value)} data-testid={`fish-bait-conditions-${i}`} className={inputCls} />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" data-testid={`fish-bait-remove-${i}`}
                    onClick={() => set("baits", form.baits.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-destructive"><X size={16} /></Button>
                </div>
                <div className="sm:col-span-12">
                  <Input value={b.note || ""} onChange={(e) => setBait(i, "note", e.target.value)} placeholder="Note (optionnel)" data-testid={`fish-bait-note-${i}`} className={inputCls} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" data-testid="fish-add-bait-button"
              onClick={() => set("baits", [...form.baits, { bait_id: "", preference: 3, is_preferred: form.baits.length === 0, note: "", conditions: "" }])}
              className="border-primary/40 text-primary hover:bg-primary/10">
              <Plus size={14} className="mr-1" /> Ajouter un appât
            </Button>
          </TabsContent>

          <TabsContent value="hooks" className="pt-4 space-y-3">
            {form.hooks.map((h, i) => (
              <div key={i} className="rounded-md border border-border bg-secondary/40 p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end" data-testid={`fish-hook-row-${i}`}>
                <div className="sm:col-span-4">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Hameçon</Label>
                  <Select value={h.hook_id || "none"} onValueChange={(v) => setHook(i, "hook_id", v === "none" ? "" : v)}>
                    <SelectTrigger data-testid={`fish-hook-select-${i}`} className={inputCls}><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="none">— Choisir —</SelectItem>
                      {hooks.map((x) => <SelectItem key={x.id} value={x.id}>{x.size} {x.type ? `(${x.type})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Recommandation</Label>
                  <Select value={h.recommendation} onValueChange={(v) => setHook(i, "recommendation", v)}>
                    <SelectTrigger data-testid={`fish-hook-reco-${i}`} className={inputCls}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="recommandé">Recommandé</SelectItem>
                      <SelectItem value="alternatif">Alternatif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-4">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Note</Label>
                  <Input value={h.note || ""} onChange={(e) => setHook(i, "note", e.target.value)} data-testid={`fish-hook-note-${i}`} className={inputCls} />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" data-testid={`fish-hook-remove-${i}`}
                    onClick={() => set("hooks", form.hooks.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-destructive"><X size={16} /></Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" data-testid="fish-add-hook-button"
              onClick={() => set("hooks", [...form.hooks, { hook_id: "", recommendation: "alternatif", note: "" }])}
              className="border-primary/40 text-primary hover:bg-primary/10">
              <Plus size={14} className="mr-1" /> Ajouter un hameçon
            </Button>
          </TabsContent>

          <TabsContent value="rigs" className="pt-4">
            <div className="rounded-md border border-input bg-secondary p-3 space-y-2 max-h-64 overflow-y-auto" data-testid="fish-rigs-multiselect">
              {rigs.length === 0 && <p className="text-sm text-muted-foreground">Aucun montage créé. Créez-en un dans la page Montages.</p>}
              {rigs.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <Checkbox
                    checked={form.rig_ids.includes(r.id)}
                    onCheckedChange={(c) => set("rig_ids", c ? [...form.rig_ids, r.id] : form.rig_ids.filter((x) => x !== r.id))}
                    data-testid={`fish-rig-option-${r.id}`}
                  />
                  {r.name}{r.technique ? ` — ${r.technique}` : ""}
                </label>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="fish-form-cancel-button"
            className="border-primary/40 text-primary hover:bg-primary/10">Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.name} data-testid="fish-form-save-button"
            className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FishPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const r = await api.get("/crud/fish", { params: q ? { q } : {} });
      setItems(r.data);
    } catch (e) {
      toast.error(fmtErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    try {
      await api.delete(`/crud/fish/${deleteTarget.id}`);
      toast.success("Poisson supprimé");
      setDeleteTarget(null);
      load(search);
    } catch (e) {
      toast.error(fmtErr(e));
    }
  };

  return (
    <div>
      <PageHeader title="Poissons" subtitle="Fiches poissons, appâts, hameçons et montages associés" icon={Fish} testid="fish-page-title">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un poisson..."
            data-testid="fish-search-input" className="pl-8 bg-secondary border-input w-48 md:w-64" />
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} data-testid="fish-add-button"
          className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={16} className="mr-1" /> Ajouter
        </Button>
      </PageHeader>

      <div className="rounded-md border border-border bg-card overflow-hidden fade-up" data-testid="fish-table-container">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Poisson</TableHead>
              <TableHead className="text-muted-foreground">Rareté</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Niveau</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Poids</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Appâts</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border"><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Chargement...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow className="border-border"><TableCell colSpan={6} className="text-center text-muted-foreground py-10" data-testid="fish-empty-state">Aucun poisson enregistré</TableCell></TableRow>
            ) : items.map((f) => (
              <TableRow key={f.id} className="border-border hover:bg-secondary/50 transition-colors" data-testid={`fish-row-${f.id}`}>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-3">
                    <img src={f.image || PLACEHOLDER} alt="" className="h-9 w-12 object-cover rounded border border-border"
                      onError={(e) => { e.target.src = PLACEHOLDER; }} />
                    <div>
                      <p className="font-medium text-sm">{f.name}</p>
                      {f.name_en && <p className="text-xs text-muted-foreground italic">{f.name_en}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: RARITY_COLORS[f.rarity] || "#94A3B8" }} />
                    {f.rarity}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">{f.level ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {f.weight_min != null && f.weight_max != null ? `${f.weight_min}–${f.weight_max} kg` : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{(f.baits || []).length} appât(s) • {(f.rig_ids || []).length} montage(s)</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" data-testid={`fish-edit-${f.id}`}
                      onClick={() => { setEditing(f); setDialogOpen(true); }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"><PencilSimple size={15} /></Button>
                    <Button variant="ghost" size="icon" data-testid={`fish-delete-${f.id}`}
                      onClick={() => setDeleteTarget(f)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash size={15} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FishDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing} onSaved={() => load(search)} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Supprimer définitivement « {deleteTarget?.name} » ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="fish-delete-cancel" className="border-border">Annuler</AlertDialogCancel>
            <AlertDialogAction data-testid="fish-delete-confirm" onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
