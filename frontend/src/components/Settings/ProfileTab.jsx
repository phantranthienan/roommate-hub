import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/api/auth.api";
import { useMutation } from "@tanstack/react-query";

export function ProfileTab() {
  const currentUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
  const [lastName, setLastName] = useState(currentUser?.lastName ?? "");

  const updateProfile = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser({ firstName: updatedUser.firstName, lastName: updatedUser.lastName });
    },
  });

  if (!currentUser) return null;

  return (
    <form onSubmit={async (e) => { e.preventDefault(); await updateProfile.mutateAsync({ firstName, lastName }); }} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input value={currentUser.username} disabled className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Username cannot be changed.</p>
      </div>
      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Profile
      </Button>
      {updateProfile.isSuccess && <p className="text-sm text-green-600">Profile updated.</p>}
    </form>
  );
}
