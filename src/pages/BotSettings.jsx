import { useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/ResourcePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Robot } from "@phosphor-icons/react";

export default function BotSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [channels, setChannels] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings/bot")
      .then((r) => {
        setEnabled(r.data.enabled);
        setChannels((r.data.channel_ids || []).join(", "));
      })
      .catch((e) => toast.error(fmtErr(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings/bot", {
        enabled,
        channel_ids: channels.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("Paramètres du bot enregistrés");
    } catch (e) {
      toast.error(fmtErr(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Paramètres du bot" subtitle="Configuration du comportement de GardeLaPeche sur Discord" icon={Robot} testid="bot-settings-page-title" />
      <div className="max-w-2xl space-y-6">
        <div className="rounded-md border border-border bg-card p-6 space-y-5 fade-up" data-testid="bot-settings-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Réponses aux messages naturels</p>
              <p className="text-xs text-muted-foreground mt-1">
                Le bot répond aux questions posées dans les salons configurés (ou quand il est mentionné).
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} data-testid="bot-enabled-switch" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              IDs des salons autorisés (séparés par des virgules — vide = uniquement sur mention @GardeLaPeche)
            </Label>
            <Input value={channels} onChange={(e) => setChannels(e.target.value)}
              placeholder="123456789012345678, 234567890123456789"
              data-testid="bot-channels-input" className="bg-secondary border-input" />
            <p className="text-xs text-muted-foreground mt-2">
              Pour obtenir l'ID d'un salon : Discord → Paramètres → Avancés → Mode développeur, puis clic droit sur le salon → « Copier l'identifiant ».
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || loading} data-testid="bot-settings-save-button"
            className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>

        <div className="rounded-md border border-border bg-card p-6 fade-up" data-testid="bot-info-card">
          <h2 className="font-heading text-lg font-semibold tracking-tight mb-3">Rappels Discord Developer Portal</h2>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>Active l'intent <strong className="text-foreground">Message Content</strong> (Bot → Privileged Gateway Intents), sinon le bot ne peut pas lire les questions.</li>
            <li>Les commandes slash se synchronisent globalement (jusqu'à 1 h). Pour une synchro instantanée, ajoute <code className="text-primary">DISCORD_GUILD_ID</code> dans le fichier .env du backend.</li>
            <li>Commandes disponibles : /peche, /poisson, /appat, /hamecon, /montage, /spot, /carte, /aide.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
