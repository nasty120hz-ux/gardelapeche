import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import FishPage from "@/pages/Fish";
import BaitsPage from "@/pages/Baits";
import GearPage from "@/pages/Gear";
import RigsPage from "@/pages/Rigs";
import MapsPage from "@/pages/Maps";
import SpotsPage from "@/pages/Spots";
import TournamentsPage from "@/pages/Tournaments";
import QueriesPage from "@/pages/Queries";
import UsersPage from "@/pages/Users";
import BotSettingsPage from "@/pages/BotSettings";

function Protected({ children, roles }) {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <p className="text-muted-foreground text-sm" data-testid="auth-loading">Chargement...</p>
      </div>
    );
  }
  if (user === false) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Protected><Layout /></Protected>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/poissons" element={<FishPage />} />
            <Route path="/appats" element={<BaitsPage />} />
            <Route path="/materiel" element={<GearPage />} />
            <Route path="/montages" element={<RigsPage />} />
            <Route path="/cartes" element={<MapsPage />} />
            <Route path="/spots" element={<SpotsPage />} />
            <Route path="/tournois" element={<TournamentsPage />} />
            <Route path="/requetes" element={<QueriesPage />} />
            <Route path="/parametres-bot" element={<BotSettingsPage />} />
            <Route path="/utilisateurs" element={<Protected roles={["admin"]}><UsersPage /></Protected>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
