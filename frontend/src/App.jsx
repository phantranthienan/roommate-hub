import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import AppLayout from "@/components/shared/AppLayout";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import ChoresPage from "@/pages/ChoresPage";
import FeedbackPage from "@/pages/FeedbackPage";
import SuppliesPage from "@/pages/SuppliesPage";
import RulesPage from "@/pages/RulesPage";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/"
          element={isAuthenticated ? <AppLayout /> : <Navigate to="/auth" />}
        >
          <Route index element={<HomePage />} />
          <Route path="chores" element={<ChoresPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="supplies" element={<SuppliesPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
