'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

interface Props {
  open: boolean;
  onAddNow: () => void;
  onSkip: () => void;
}

export default function AlternateEmailNagModal({ open, onAddNow, onSkip }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onSkip(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Add a recovery email</DialogTitle>
          </div>
          <DialogDescription>
            If you ever get locked out, a verified recovery email is the fastest way back in.
            Takes less than a minute.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onSkip}>Skip for now</Button>
          <Button onClick={onAddNow}>Add now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
