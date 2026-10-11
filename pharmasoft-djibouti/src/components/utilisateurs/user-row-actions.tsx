"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, UserCheck, UserX, Key } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PinChangeDialog } from "@/components/utilisateurs/pin-change-dialog";

export function UserRowActions({
  user,
  currentUserId,
  currentRole,
}: {
  user: { id: string; name: string; role: string; isActive: boolean };
  currentUserId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isSelf = user.id === currentUserId;
  const canTogglePin = user.role === "TITULAIRE" && (isSelf || currentRole === "SUPER_ADMIN");

  async function toggleActive() {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Échec");
      }
      toast.success(user.isActive ? "Compte désactivé" : "Compte réactivé");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted">
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canTogglePin ? (
          <PinChangeDialog
            targetUserId={user.id}
            targetUserName={user.name}
            isReset={!isSelf}
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer"
              >
                <Key size={14} /> {isSelf ? "Changer mon PIN" : "Réinitialiser PIN"}
              </DropdownMenuItem>
            }
          />
        ) : null}
        {!isSelf ? (
          <DropdownMenuItem onClick={toggleActive} className="cursor-pointer">
            {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
            {user.isActive ? "Désactiver" : "Réactiver"}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
