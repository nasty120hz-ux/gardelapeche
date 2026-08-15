import { useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "@phosphor-icons/react";

export const absUrl = (u) => (u && u.startsWith("/") ? `${process.env.REACT_APP_BACKEND_URL}${u}` : u);

export function StarRating({ value, onChange, testid }) {
  return (
    <div className="flex gap-1" data-testid={testid}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          data-testid={`${testid}-star-${n}`}
          onClick={() => onChange(n)}
          className="transition-transform duration-100 hover:scale-110"
        >
          <Star size={20} weight={n <= value ? "fill" : "regular"}
            className={n <= value ? "text-amber-400" : "text-muted-foreground"} />
        </button>
      ))}
    </div>
  );
}

export default function EntityDialog({ open, onOpenChange, title, fields, initial, onSubmit, testidPrefix, wide }) {
  const [form, setForm] = useState({});
  const [options, setOptions] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const base = {};
      fields.forEach((f) => {
        const v = initial?.[f.name];
        if (f.type === "csv") base[f.name] = Array.isArray(v) ? v.join(", ") : (v || "");
        else if (f.type === "multiselect") base[f.name] = Array.isArray(v) ? v : [];
        else if (f.type === "stars") base[f.name] = v ?? 3;
        else if (f.type === "checkbox") base[f.name] = !!v;
        else if (f.type === "select") base[f.name] = v || "none";
        else base[f.name] = v ?? "";
      });
      setForm(base);
      fields.forEach(async (f) => {
        if (f.optionsEndpoint && !options[f.name]) {
          try {
            const r = await api.get(f.optionsEndpoint);
            setOptions((o) => ({ ...o, [f.name]: r.data }));
          } catch (e) { /* ignore */ }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {};
      fields.forEach((f) => {
        let v = form[f.name];
        if (f.type === "csv") v = String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
        else if (f.type === "number") v = v === "" || v === null ? null : Number(v);
        else if (f.type === "select") v = v === "none" ? "" : v;
        payload[f.name] = v;
      });
      await onSubmit(payload);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const opts = (f) => {
    if (f.optionsEndpoint) return (options[f.name] || []).map((o) => ({ value: o.id, label: o[f.optionLabel || "name"] }));
    return (f.options || []).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-card border-border ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="font-heading tracking-tight">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {fields.map((f) => (
            <div key={f.name} className={f.type === "textarea" || f.type === "multiselect" || f.type === "csv" || f.wide ? "sm:col-span-2" : ""}>
              <Label className="text-xs text-muted-foreground mb-1.5 block">{f.label}{f.required ? " *" : ""}</Label>
              {f.type === "textarea" ? (
                <Textarea value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                  data-testid={`${testidPrefix}-${f.name}-input`} className="bg-secondary border-input min-h-[80px]" />
              ) : f.type === "select" ? (
                <Select value={form[f.name] || "none"} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger data-testid={`${testidPrefix}-${f.name}-select`} className="bg-secondary border-input">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {!f.required && <SelectItem value="none">— Aucun —</SelectItem>}
                    {opts(f).map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : f.type === "multiselect" ? (
                <div className="max-h-40 overflow-y-auto rounded-md border border-input bg-secondary p-2 space-y-1.5"
                  data-testid={`${testidPrefix}-${f.name}-multiselect`}>
                  {opts(f).length === 0 && <p className="text-xs text-muted-foreground px-1">Aucun élément disponible</p>}
                  {opts(f).map((o) => (
                    <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                      <Checkbox
                        checked={(form[f.name] || []).includes(o.value)}
                        onCheckedChange={(checked) => {
                          const cur = form[f.name] || [];
                          set(f.name, checked ? [...cur, o.value] : cur.filter((x) => x !== o.value));
                        }}
                        data-testid={`${testidPrefix}-${f.name}-option-${o.value}`}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              ) : f.type === "stars" ? (
                <StarRating value={form[f.name] ?? 3} onChange={(v) => set(f.name, v)} testid={`${testidPrefix}-${f.name}-stars`} />
              ) : f.type === "checkbox" ? (
                <div className="pt-1">
                  <Checkbox checked={!!form[f.name]} onCheckedChange={(v) => set(f.name, !!v)}
                    data-testid={`${testidPrefix}-${f.name}-checkbox`} />
                </div>
              ) : f.type === "file" ? (
                <div className="space-y-2">
                  <Input type="file" accept="image/*" data-testid={`${testidPrefix}-${f.name}-file`}
                    className="bg-secondary border-input"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const fd = new FormData();
                        fd.append("file", file);
                        const r = await api.post("/upload", fd);
                        set(f.name, r.data.url);
                      } catch (err) {
                        toast.error(fmtErr(err));
                      }
                    }} />
                  {form[f.name] && (
                    <img src={absUrl(form[f.name])} alt="" className="h-20 w-32 object-cover rounded border border-border" />
                  )}
                  {form[f.name] && <p className="text-xs text-muted-foreground break-all">{form[f.name]}</p>}
                </div>
              ) : f.type === "image" ? (
                <div className="space-y-2">
                  <Input value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                    placeholder="https://..." data-testid={`${testidPrefix}-${f.name}-input`}
                    className="bg-secondary border-input" />
                  {form[f.name] && (
                    <img src={absUrl(form[f.name])} alt="" className="h-20 w-32 object-cover rounded border border-border"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                </div>
              ) : (
                <Input type={f.type === "number" ? "number" : "text"} step={f.step || "any"}
                  value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder || ""} data-testid={`${testidPrefix}-${f.name}-input`}
                  className="bg-secondary border-input" />
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid={`${testidPrefix}-cancel-button`}
            className="border-primary/40 text-primary hover:bg-primary/10">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving} data-testid={`${testidPrefix}-save-button`}
            className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
