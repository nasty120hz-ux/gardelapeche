import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fmtErr } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Anchor } from "@phosphor-icons/react";

const BG = "https://images.unsplash.com/photo-1613753598214-119055b017f7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxuaWdodCUyMGZpc2hpbmclMjBsYWtlJTIwbGFuZHNjYXBlfGVufDB8fHx8MTc4NjY2MTY0N3ww&ixlib=rb-4.1.0&q=85";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(fmtErr(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${BG})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-background/85" />
      <div className="relative w-full max-w-sm rounded-md border border-border bg-card p-8 fade-up"
        data-testid="login-card">
        <div className="flex items-center gap-2 mb-2">
          <Anchor size={28} weight="duotone" className="text-primary" />
          <h1 className="font-heading text-2xl font-bold tracking-tight">GardeLaPeche</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Dashboard administrateur — Fishing Planet</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="admin@gardelapeche.fr" data-testid="login-email-input"
              className="bg-secondary border-input" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Mot de passe</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="••••••••" data-testid="login-password-input"
              className="bg-secondary border-input" />
          </div>
          {error && (
            <p className="text-sm text-destructive" data-testid="login-error-message">{error}</p>
          )}
          <Button type="submit" disabled={loading} data-testid="login-submit-button"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}
