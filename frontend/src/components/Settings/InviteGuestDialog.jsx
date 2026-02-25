import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { useCreateGuestInvitation } from "@/hooks/useGuests";
import { CopyButton } from "./CopyButton";
import { formatDate } from "./settings.utils";

export function InviteGuestDialog({ open, onOpenChange }) {
  const [label, setLabel] = useState("");
  const [date, setDate] = useState(undefined);
  const [showCal, setShowCal] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState(null);

  const createInvitation = useCreateGuestInvitation();

  const reset = () => {
    setLabel("");
    setDate(undefined);
    setShowCal(false);
    setCreatedInvitation(null);
  };

  const handleClose = (v) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return;
    const until = new Date(date);
    until.setHours(23, 59, 59, 0);
    const result = await createInvitation.mutateAsync({
      label: label.trim() || undefined,
      validUntil: until.toISOString(),
    });
    setCreatedInvitation(result);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        {!createdInvitation ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite a Guest</DialogTitle>
              <DialogDescription>
                Generate a one-time code to share. Guests can view room data and update supply status/presence.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-label">
                    Label <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="guest-label"
                    placeholder="e.g. John visiting this weekend"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">A note for yourself — who is this invite for?</p>
                </div>

                <div className="space-y-2">
                  <Label>Access Valid Until</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 justify-start font-normal"
                      onClick={() => setShowCal((s) => !s)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className={date ? "" : "text-muted-foreground"}>
                        {date ? formatDate(date) : "Pick an expiry date"}
                      </span>
                    </Button>
                    {date && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setDate(undefined); setShowCal(false); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {showCal && (
                    <div className="rounded-md border flex justify-center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => { setDate(d); setShowCal(false); }}
                        disabled={{ before: tomorrow }}
                        initialFocus
                      />
                    </div>
                  )}
                </div>

                {createInvitation.error && (
                  <p className="text-sm text-destructive">{createInvitation.error.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => handleClose(false)}>Cancel</Button>
                <Button type="submit" disabled={createInvitation.isPending || !date}>
                  {createInvitation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Invite
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invite Created</DialogTitle>
              <DialogDescription>
                Share this code with your guest. They enter it in the "Join Room" dialog.
                Valid until {formatDate(new Date(createdInvitation.validUntil))}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-3 rounded-md bg-muted text-sm font-mono break-all">
                  {createdInvitation.invitationCode}
                </code>
                <CopyButton value={createdInvitation.invitationCode} />
              </div>
              <p className="text-xs text-muted-foreground">
                This code is single-use and expires automatically.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
