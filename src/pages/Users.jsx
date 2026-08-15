import { useCallback, useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/ResourcePage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import EntityDialog from "@/components/EntityDialog";
import { Users, Plus, PencilSimple, Trash } from "@phosphor-icons/react";

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/users");
      setUsers(r.data);
    } catch (e) {
      toast.error(fmtErr(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editing.id}`, payload);
        toast.success("Utilisateur modifié");
      } else {
        await api.post("/users", payload);
        toast.success("Utilisateur créé");
      }
      load();
    } catch (e) {
      toast.error(fmtErr(e));
      throw e;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      toast.success("Utilisateur supprimé");
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(fmtErr(e));
    }
  };

  const fields = [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "text", required: true },
    { name: "role", label: "Rôle", type: "select", required: true, options: [
      { value: "admin", label: "Administrateur" }, { value: "moderator", label: "Modérateur" },
    ]},
    { name: "password", label: editing ? "Nouveau mot de passe (vide = inchangé)" : "Mot de passe", type: "text", required: !editing },
  ];

  return (
    <div>
      <PageHeader title="Utilisateurs" subtitle="Comptes administrateurs et modérateurs" icon={Users} testid="users-page-title">
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} data-testid="users-add-button"
          className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={16} className="mr-1" /> Ajouter
        </Button>
      </PageHeader>

      <div className="rounded-md border border-border bg-card overflow-hidden fade-up" data-testid="users-table-container">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nom</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Rôle</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border"><TableCell colSpan={4} className="text-center text-muted-foreground py-10">Chargement...</TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id} className="border-border hover:bg-secondary/50 transition-colors" data-testid={`user-row-${u.id}`}>
                <TableCell className="font-medium text-sm">{u.name}{u.id === me?.id ? " (vous)" : ""}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <span className={`text-[11px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    u.role === "admin" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {u.role === "admin" ? "Administrateur" : "Modérateur"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" data-testid={`user-edit-${u.id}`}
                      onClick={() => { setEditing(u); setDialogOpen(true); }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"><PencilSimple size={15} /></Button>
                    {u.id !== me?.id && (
                      <Button variant="ghost" size="icon" data-testid={`user-delete-${u.id}`}
                        onClick={() => setDeleteTarget(u)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash size={15} /></Button>
                    )}
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
        title={editing ? `Modifier : ${editing.name}` : "Ajouter un utilisateur"}
        fields={editing ? fields.filter((f) => f.name !== "email") : fields}
        initial={editing || { role: "moderator" }}
        onSubmit={handleSubmit}
        testidPrefix="users-form"
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Supprimer le compte de « {deleteTarget?.name} » ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="user-delete-cancel" className="border-border">Annuler</AlertDialogCancel>
            <AlertDialogAction data-testid="user-delete-confirm" onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
