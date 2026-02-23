import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, LogIn, Home, Loader2 } from "lucide-react";
import { useGetUserRooms, useCreateRoom, useJoinRoom } from "@/hooks/useRooms";
import { useRoomStore } from "@/stores/room.store";

export function RoomPicker({ onSuccess }) {
  const [view, setView] = useState("list");
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const setSelectedRoom = useRoomStore((s) => s.setSelectedRoom);

  const { data: rooms = [], isLoading, error } = useGetUserRooms();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  const handleCreate = async (e) => {
    e.preventDefault();
    const room = await createRoom.mutateAsync({ name: roomName, description: roomDescription || undefined });
    setSelectedRoom(room);
    onSuccess();
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const result = await joinRoom.mutateAsync(inviteCode);
    setSelectedRoom(result.room);
    onSuccess();
  };

  const renderList = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Rooms</CardTitle>
        <CardDescription>Select a room to enter or create a new one.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading rooms...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {!isLoading && rooms.map((room) => (
          <Button
            key={room.id}
            variant="outline"
            className="w-full justify-between h-14"
            onClick={() => { setSelectedRoom(room); onSuccess(); }}
          >
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <span className="font-semibold">{room.name}</span>
            </div>
            {room.description && (
              <span className="text-muted-foreground text-xs truncate max-w-[120px]">{room.description}</span>
            )}
          </Button>
        ))}
        {!isLoading && rooms.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            No rooms yet. Create or join one!
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1" onClick={() => setView("create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Room
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setView("join")}>
          <LogIn className="mr-2 h-4 w-4" /> Join Room
        </Button>
      </CardFooter>
    </Card>
  );

  const renderCreate = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a Room</CardTitle>
        <CardDescription>Set up a new shared space.</CardDescription>
      </CardHeader>
      <form onSubmit={handleCreate}>
        <CardContent className="space-y-4">
          {createRoom.error && (
            <Alert variant="destructive">
              <AlertDescription>{createRoom.error.message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Room Name</label>
            <Input
              placeholder="e.g. The Chill House"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              placeholder="Our awesome apartment..."
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => setView("list")} type="button">Back</Button>
          <Button type="submit" disabled={createRoom.isPending}>
            {createRoom.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  const renderJoin = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join a Room</CardTitle>
        <CardDescription>Enter an invite code to join.</CardDescription>
      </CardHeader>
      <form onSubmit={handleJoin}>
        <CardContent className="space-y-4">
          {joinRoom.error && (
            <Alert variant="destructive">
              <AlertDescription>{joinRoom.error.message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Invite Code</label>
            <Input
              placeholder="e.g. ADC-123"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => setView("list")} type="button">Back</Button>
          <Button type="submit" disabled={joinRoom.isPending}>
            {joinRoom.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  if (view === "create") return renderCreate();
  if (view === "join") return renderJoin();
  return renderList();
}
