import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, UserMinus, UserPlus, X, Clock, Crown } from "lucide-react";
import { useMembers, useChangeMemberRole, useRemoveMember, useTransferOwnership } from "@/hooks/useMembers";
import { useGuestInvitations, useRevokeGuestInvitation } from "@/hooks/useGuests";
import { InviteGuestDialog } from "./InviteGuestDialog";
import { ROLE_IDS, ASSIGNABLE_ROLES, roleBadgeVariant, getExpiryLabel } from "./settings.utils";
import { cn } from "@/lib/cn";

export function MembersTab({ isOwner, canInviteGuests, currentUserId }) {
  const { data: members = [], isLoading } = useMembers();
  const { data: guestInvitations = [] } = useGuestInvitations();
  const changeMemberRole = useChangeMemberRole();
  const removeMember = useRemoveMember();
  const transferOwnership = useTransferOwnership();
  const revokeInvitation = useRevokeGuestInvitation();
  const [inviteOpen, setInviteOpen] = useState(false);

  const activeInvitations = guestInvitations.filter((i) => i.isActive);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading members…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Members</h3>
        </div>
        <div className="space-y-1">
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;
            const isOwnerMember = member.roleId === ROLE_IDS.owner;
            const isGuestMember = member.roleId === ROLE_IDS.guest;
            const canChangeRole = isOwner && !isSelf && !isOwnerMember && !isGuestMember;
            const canRemove = isOwner && !isSelf && !isOwnerMember;
            const canTransfer = isOwner && !isSelf && !isOwnerMember && !isGuestMember;
            const firstName = member.firstName ?? "?";
            const lastName = member.lastName ?? "";
            const username = member.username ?? "";

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {firstName[0]}{lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {firstName} {lastName}
                    {isSelf && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                  </p>
                  {username && <p className="text-xs text-muted-foreground truncate">@{username}</p>}
                </div>

                {canChangeRole ? (
                  <Select
                    value={String(member.roleId ?? ROLE_IDS.member)}
                    onValueChange={(v) => changeMemberRole.mutate({ memberId: member.id, roleId: Number(v) })}
                    disabled={changeMemberRole.isPending}
                  >
                    <SelectTrigger className="w-[100px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNABLE_ROLES.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={roleBadgeVariant(member.roleName ?? "member")} className="text-xs">
                    {member.roleName ?? "member"}
                  </Badge>
                )}

                {canTransfer && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-amber-500" title="Transfer ownership" disabled={transferOwnership.isPending}>
                        <Crown className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Transfer ownership to {firstName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {firstName} will become the owner of this room. You will be demoted to admin. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => transferOwnership.mutate(member.userId)}
                        >
                          Transfer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {canRemove && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" disabled={removeMember.isPending}>
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {firstName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          They will lose access to this room immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => removeMember.mutate(member.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {canInviteGuests && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Guest Invitations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Guests can view room data and update supply status/presence. Access expires automatically.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-2 h-3.5 w-3.5" />
              Invite Guest
            </Button>
          </div>

          {activeInvitations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No active guest invitations.</p>
          ) : (
            <div className="space-y-1">
              {activeInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0"
                >
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground text-xs font-semibold">
                    {inv.guestUsername ? inv.guestUsername[0].toUpperCase() : "G"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inv.guestUsername ?? "Guest invitation"}</p>
                    <p className={cn(
                      "text-xs flex items-center gap-1 mt-0.5",
                      new Date(inv.validUntil) < new Date() ? "text-destructive" : "text-muted-foreground"
                    )}>
                      <Clock className="h-3 w-3" />
                      {getExpiryLabel(inv.validUntil)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">pending</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => revokeInvitation.mutate(inv.id)}
                    disabled={revokeInvitation.isPending}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <InviteGuestDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
