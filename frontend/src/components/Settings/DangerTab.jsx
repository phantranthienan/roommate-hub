import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useDeleteRoom, useLeaveRoom } from "@/hooks/useRooms";

export function DangerTab({ isOwner }) {
  const navigate = useNavigate();
  const deleteRoom = useDeleteRoom();
  const leaveRoom = useLeaveRoom();

  return (
    <div className="space-y-6 max-w-lg">
      {!isOwner && (
        <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
          <div>
            <p className="font-medium text-sm">Leave Room</p>
            <p className="text-sm text-muted-foreground mt-1">
              You will lose access to all room data. You can rejoin with the invite code.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={leaveRoom.isPending}>
                {leaveRoom.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Leave Room
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave this room?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will lose access to all tasks, feedback, rules, and supplies.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => { await leaveRoom.mutateAsync(); navigate("/auth"); }}
                >
                  Leave Room
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isOwner && (
        <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
          <div>
            <p className="font-medium text-sm">Delete Room</p>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently deletes the room and all its data. Cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleteRoom.isPending}>
                {deleteRoom.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Room
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this room?</AlertDialogTitle>
                <AlertDialogDescription>
                  All tasks, feedback, rules, and supplies will be permanently deleted. Every member
                  will lose access immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => { await deleteRoom.mutateAsync(); navigate("/auth"); }}
                >
                  Delete Room
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
