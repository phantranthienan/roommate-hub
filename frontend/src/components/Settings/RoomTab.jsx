import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lock } from "lucide-react";
import { useRoomStore } from "@/stores/room.store";
import { useUpdateRoom } from "@/hooks/useRooms";
import { CopyButton } from "./CopyButton";

export function RoomTab({ isOwnerOrAdmin }) {
  const room = useRoomStore((s) => s.selectedRoom);
  const [name, setName] = useState(room?.name ?? "");
  const [description, setDescription] = useState(room?.description ?? "");
  const updateRoom = useUpdateRoom();

  useEffect(() => {
    if (room) {
      setName(room.name);
      setDescription(room.description ?? "");
    }
  }, [room?.name, room?.description]);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateRoom.mutateAsync({ name, description: description || undefined });
  };

  if (!room) return null;

  return (
    <div className="space-y-8 max-w-lg">
      <div className="space-y-2">
        <Label>Member Invite Code</Label>
        {isOwnerOrAdmin ? (
          <>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-md bg-muted text-sm font-mono tracking-widest">
                {room.inviteCode}
              </code>
              <CopyButton value={room.inviteCode} />
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this code joins as an official <strong>member</strong>. Only share with trusted roommates.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0" />
            Only the room owner and admins can view and share the invite code.
          </div>
        )}
      </div>

      {isOwnerOrAdmin && (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-desc">Description</Label>
            <Textarea
              id="room-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              rows={3}
            />
          </div>
          <Button type="submit" disabled={updateRoom.isPending}>
            {updateRoom.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          {updateRoom.isSuccess && <p className="text-sm text-green-600">Room updated.</p>}
        </form>
      )}
    </div>
  );
}
