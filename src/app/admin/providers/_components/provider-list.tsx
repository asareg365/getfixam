'use client';

import { useState } from 'react';
import { useActionState } from 'react-dom';
import {
  approveProvider,
  rejectProvider,
  suspendProvider,
} from '@/app/admin/actions';
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
import type { Provider } from '@/lib/types';
import { ProvidersTable } from './providers-table';

type ActionType = 'approve' | 'reject' | 'suspend';

interface ProviderListProps {
  providers: Provider[];
}

export default function ProviderList({ providers }: ProviderListProps) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<{ id: string; name: string } | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOpen = (provider: { id: string; name: string }, action: ActionType) => {
    setSelectedProvider(provider);
    setActionType(action);
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedProvider || !actionType) return;

    setLoadingId(selectedProvider.id);
    setOpen(false);

    const formData = new FormData();
    formData.append('providerId', selectedProvider.id);

    let result;
    if (actionType === 'approve') {
      result = await approveProvider(null, formData);
    } else if (actionType === 'reject') {
      result = await rejectProvider(null, formData);
    } else {
        // Here we handle both suspend and re-approve based on current status.
        // The server action will determine what to do.
      result = await suspendProvider(null, formData);
    }

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    setLoadingId(null);
    setSelectedProvider(null);
    setActionType(null);
  };
  
  const getDialogContent = () => {
      if (!actionType || !selectedProvider) return null;
      
      let title, description, actionText;
      switch(actionType) {
          case 'approve':
            title = 'Approve Provider?';
            description = `This will make ${selectedProvider.name} visible to the public.`;
            actionText = 'Approve';
            break;
        case 'reject':
            title = 'Reject Provider?';
            description = `This will mark the provider as rejected. They will not be visible.`;
            actionText = 'Reject';
            break;
        case 'suspend':
            const isSuspended = providers.find(p => p.id === selectedProvider.id)?.status === 'suspended';
            title = isSuspended ? 'Re-Approve Provider?' : 'Suspend Provider?';
            description = isSuspended 
                ? `This will make ${selectedProvider.name} visible to the public again.`
                : `This will suspend ${selectedProvider.name} and hide them from the public.`;
            actionText = isSuspended ? 'Re-Approve' : 'Suspend';
            break;
      }

      return { title, description, actionText };
  }
  
  const dialogContent = getDialogContent();

  return (
    <div>
      <ProvidersTable
        providers={providers}
        onApprove={(providerId) => handleOpen(providers.find(p=>p.id===providerId)!, 'approve')}
        onReject={(providerId) => handleOpen(providers.find(p=>p.id===providerId)!, 'reject')}
        onSuspend={(providerId) => handleOpen(providers.find(p=>p.id===providerId)!, 'suspend')}
        loadingId={loadingId}
      />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent?.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogContent?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={actionType === 'reject' || (actionType === 'suspend' && providers.find(p => p.id === selectedProvider?.id)?.status !== 'suspended') ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {dialogContent?.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
