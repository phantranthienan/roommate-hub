import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth.store";
import { useMembers } from "@/hooks/useMembers";
import { RoomTab } from "@/components/Settings/RoomTab";
import { MembersTab } from "@/components/Settings/MembersTab";
import { ProfileTab } from "@/components/Settings/ProfileTab";
import { DangerTab } from "@/components/Settings/DangerTab";

export default function SettingsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: members = [] } = useMembers();

  const myMember = members.find((m) => m.userId === currentUser?.id);
  const myRole = myMember?.roleName ?? "member";
  const isOwner = myRole === "owner";
  const isOwnerOrAdmin = isOwner || myRole === "admin";
  const canInviteGuests = myRole !== "guest";

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-4xl">
          <span className="font-light">Room</span>{" "}
          <span className="font-semibold italic">settings.</span>
        </h1>
        <p className="text-muted-foreground">Manage your room, members, and profile.</p>
      </div>

      <Tabs defaultValue="room">
        <TabsList className="mb-6">
          <TabsTrigger value="room">Room</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="room">
          <RoomTab isOwnerOrAdmin={isOwnerOrAdmin} />
        </TabsContent>

        <TabsContent value="members">
          <MembersTab
            isOwner={isOwner}
            canInviteGuests={canInviteGuests}
            currentUserId={currentUser?.id ?? ""}
          />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="danger">
          <DangerTab isOwner={isOwner} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
