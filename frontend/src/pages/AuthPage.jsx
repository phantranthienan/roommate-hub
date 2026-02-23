import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/Auth/LoginForm";
import { RegisterForm } from "@/components/Auth/RegisterForm";
import { RoomPicker } from "@/components/Auth/RoomPicker";
import { useAuthStore } from "@/stores";

export default function AuthPage() {
  const [step, setStep] = useState("login");
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleRoomSelected = () => {
    navigate("/");
  };

  const renderContent = () => {
    switch (step) {
      case "login":
        return <LoginForm onToggle={() => setStep("register")} onSuccess={() => setStep("rooms")} />;
      case "register":
        return <RegisterForm onToggle={() => setStep("login")} onSuccess={() => setStep("rooms")} />;
      case "rooms":
        return <RoomPicker onSuccess={handleRoomSelected} />;
    }
  };

  if (isAuthenticated && step === "login") {
    return (
      <div className="min-h-screen grid lg:grid-cols-2 bg-background">
        <div className="hidden lg:flex flex-col justify-center items-center bg-primary/5 p-12">
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary">RoomMate Hub</h1>
            <p className="text-lg text-muted-foreground">
              Make shared living easy. Manage chores, supplies, and feedback with your roommates in one place.
            </p>
            <div className="w-64 h-64 bg-secondary/30 rounded-full mx-auto flex items-center justify-center text-8xl mt-8">
              🏠
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-6 sm:p-12">
          <RoomPicker onSuccess={handleRoomSelected} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-center items-center bg-primary/5 p-12">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">RoomMate Hub</h1>
          <p className="text-lg text-muted-foreground">
            Make shared living easy. Manage chores, supplies, and feedback with your roommates in one place.
          </p>
          <div className="w-64 h-64 bg-secondary/30 rounded-full mx-auto flex items-center justify-center text-8xl mt-8">
            🏠
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="lg:hidden text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🏠</span>
            <h1 className="text-2xl font-bold tracking-tight text-primary">RoomMate Hub</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage shared living with ease
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
