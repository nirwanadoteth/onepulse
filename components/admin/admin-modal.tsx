"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
};

export function AdminModal({ open, onOpenChangeAction }: AdminModalProps) {
  return (
    <Dialog onOpenChange={onOpenChangeAction} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>DailyRewards Admin</DialogTitle>
          <DialogDescription>
            Manage contract settings and operations
          </DialogDescription>
        </DialogHeader>
        <AdminDashboard />
      </DialogContent>
    </Dialog>
  );
}
