'use client';

import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash, CheckCircle } from 'lucide-react';
import { EngagementColumn } from './columns';
import { AlertModal } from '@/components/modals/alert-modal';
import { useToast } from '@/hooks/use-toast';

interface CellActionProps {
  data: EngagementColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const onMarkAsRead = async () => {
    try {
      setLoading(true);
      const ref = doc(db, 'engagements', data.id);
      await updateDoc(ref, { status: 'read', read: true });
      toast({ title: 'Marked as Read' });
    } catch (error) {
      toast({ title: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'engagements', data.id));
      toast({ title: 'Engagement deleted.' });
    } catch (error) {
      toast({ title: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onMarkAsRead} disabled={loading || data.status === 'read'}>
            <CheckCircle className="mr-2 h-4 w-4" /> Mark as read
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
