'use client';

import { useState, useTransition } from 'react';
import { approveProvider, rejectProvider, suspendProvider } from '@/app/admin/actions';
import { ProvidersTable } from './providers-table';
import type { Provider } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ActionType = 'approve' | 'reject' | 'suspend';

interface DialogState {
  open: boolean;
  providerId: string | null;
  action: ActionType | null;
  title: string;
  description: string;
}

export default function ProviderList({ providers }: { providers: Provider[] }) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    providerId: null,
    action: null,
    title: '',
    description: '',
  });

  const [isPending, startTransition] = useTransition();

  const handleActionClick = (providerId: string, action: ActionType) => {
    let title = '';
    let description = '';
    switch (action) {
      case 'approve':
        title = 'Are you sure you want to approve this provider?';
        description = 'This will make their profile public and searchable.';
        break;
      case 'reject':
        title = 'Are you sure you want to reject this provider?';
        description = 'This action cannot be easily undone.';
        break;
      case 'suspend':
        title = 'Are you sure you want to suspend this provider?';
        description = 'This will hide their profile from the public.';
        break;
    }
    setDialogState({ open: true, providerId, action, title, description });
  };

  const onConfirmAction = () => {
    if (!dialogState.providerId || !dialogState.action) return;

    const formData = new FormData();
    formData.append('providerId', dialogState.providerId);
    setLoadingId(dialogState.providerId);

    let actionFn: (prevState: any, formData: FormData) => Promise<{success: boolean, message?: string, error?: string}>;
    
    switch (dialogState.action) {
        case 'approve': actionFn = approveProvider; break;
        case 'reject': actionFn = rejectProvider; break;
        case 'suspend': actionFn = suspendProvider; break;
    }

    startTransition(async () => {
        const result = await actionFn(null, formData);
        if (result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
        setDialogState({ open: false, providerId: null, action: null, title: '', description: '' });
        setLoadingId(null);
    });
  };


  return (
    <>
      <ProvidersTable
        providers={providers}
        loadingId={loadingId}
        onApprove={(id) => handleActionClick(id, 'approve')}
        onReject={(id) => handleActionClick(id, 'reject')}
        onSuspend={(id) => handleActionClick(id, 'suspend')}
      />

      <AlertDialog open={dialogState.open} onOpenChange={(open) => setDialogState(s => ({ ...s, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogState.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogState.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogState({ ...dialogState, open: false })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmAction} disabled={isPending}>
              {isPending ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
