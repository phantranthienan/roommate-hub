import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, Plus, LogIn, Loader2 } from "lucide-react";
import { useRoomStore } from "@/stores/room.store";
import { useGetUserRooms, useCreateRoom, useJoinRoom } from "@/hooks/useRooms";
import { useAcceptGuestInvitation } from "@/hooks/useGuests";

function roomInitials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function CreateRoomDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createRoom = useCreateRoom();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const room = await createRoom.mutateAsync({ name, description: description || undefined });
    setName("");
    setDescription("");
    onCreated(room);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create a Room</DialogTitle>
          <DialogDescription>Set up a new shared space for your roommates.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Room Name</Label>
              <Input
                id="create-name"
                placeholder="e.g. The Chill House"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="create-desc"
                placeholder="Our awesome apartment…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createRoom.isPending}>
              {createRoom.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function JoinRoomDialog({ open, onOpenChange, onJoined }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const joinRoom = useJoinRoom();
  const acceptGuestInvitation = useAcceptGuestInvitation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    const trimmed = code.trim();
    try {
      try {
        const result = await joinRoom.mutateAsync(trimmed);
        setCode("");
        onJoined(result.room);
        onOpenChange(false);
        return;
      } catch {
        // Fall through
      }
      const result = await acceptGuestInvitation.mutateAsync(trimmed);
      setCode("");
      onJoined(result.room);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code. Check with whoever sent it.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setCode(""); setError(null); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Join with a Code</DialogTitle>
          <DialogDescription>
            Enter a room invite code (to join as a member) or a guest invitation code.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="join-code">Invite Code</Label>
              <Input
                id="join-code"
                placeholder="Paste code here…"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(null); }}
                className="font-mono"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RoomSwitcher({ collapsed = false, onSwitch }) {
  const selectedRoom = useRoomStore((s) => s.selectedRoom);
  const setSelectedRoom = useRoomStore((s) => s.setSelectedRoom);
  const { data: rooms = [] } = useGetUserRooms();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const handleSwitch = (room) => {
    setSelectedRoom(room);
    onSwitch?.();
  };

  const initials = selectedRoom ? roomInitials(selectedRoom.name) : "?";

  const trigger = collapsed ? (
    <button
      title={selectedRoom?.name ?? "Select room"}
      className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm",
        "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      )}
    >
      {initials}
    </button>
  ) : (
    <button className="flex items-center gap-2 w-full rounded-lg px-1 py-1 hover:bg-muted transition-colors text-left">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
        {initials}
      </div>
      <span className="flex-1 font-semibold text-sm truncate text-foreground">
        {selectedRoom?.name ?? "Select room"}
      </span>
      <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          side={collapsed ? "right" : "bottom"}
          align={collapsed ? "start" : "start"}
          className="w-56"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Your rooms
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {rooms.map((room) => (
            <DropdownMenuItem
              key={room.id}
              onClick={() => handleSwitch(room)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                {roomInitials(room.name)}
              </div>
              <span className="flex-1 truncate">{room.name}</span>
              {room.id === selectedRoom?.id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create new room
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => setJoinOpen(true)}
          >
            <LogIn className="h-4 w-4" />
            Join with code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateRoomDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleSwitch}
      />
      <JoinRoomDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        onJoined={handleSwitch}
      />
    </>
  );
}
