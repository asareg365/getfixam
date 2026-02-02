'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Provider } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Copy, RefreshCw } from 'lucide-react';

interface ProvidersTableProps {
  providers: Provider[];
}

export function ProvidersTable({
  providers
}: ProvidersTableProps) {
    const router = useRouter();
    const [loadingIds, setLoadingIds] = useState<string[]>([]);
    const { toast } = useToast();
    const [showPinInfo, setShowPinInfo] = useState<{ providerName: string, pin: string } | null>(null);

    const handleAction = async (providerId: string, action: 'approve' | 'reject' | 'suspend') => {
        try {
            setLoadingIds(prev => [...prev, providerId]);

            const formData = new FormData();
            formData.set('providerId', providerId);

            const res = await fetch(`/admin/providers/${action}`, {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();

            if (result.success) {
                toast({ title: `Provider ${action}d successfully!`, variant: 'success' });
                if (action === 'approve' && result.pin) {
                    const provider = providers.find(p => p.id === providerId);
                    setShowPinInfo({ providerName: provider?.name || 'the provider', pin: result.pin });
                }
                router.refresh();
            } else {
                toast({ title: `Failed to ${action} provider`, description: result.error, variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Unexpected error', variant: 'destructive' });
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== providerId));
        }
    };
    
     const handleResetPin = async (providerId: string) => {
        try {
            setLoadingIds(prev => [...prev, providerId]);

            const formData = new FormData();
            formData.set('providerId', providerId);
            
            const res = await fetch(`/api/admin/providers/reset-pin`, {
                method: 'POST',
                body: formData,
            });
            
            const result = await res.json();

            if (result.success) {
                const provider = providers.find(p => p.id === providerId);
                setShowPinInfo({ providerName: provider?.name || 'the provider', pin: result.pin });
                toast({ title: "PIN has been reset!", variant: 'success' });
                router.refresh();
            } else {
                 toast({ title: `Failed to reset PIN`, description: result.error, variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Unexpected error', variant: 'destructive' });
        } finally {
             setLoadingIds(prev => prev.filter(id => id !== providerId));
        }
    };
    
    const copyPinToClipboard = () => {
        if (showPinInfo) {
            navigator.clipboard.writeText(showPinInfo.pin);
            toast({ title: "PIN Copied!", description: "The PIN has been copied to your clipboard." });
        }
    }


  if (!providers || providers.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        No providers found for this status.
      </p>
    );
  }

  return (
    <>
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Audit Info</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {providers.map((p) => {
            const createdAt = p.createdAt
              ? new Date(p.createdAt).toLocaleDateString()
              : '—';

            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <div>{p.name ?? 'Unnamed'}</div>
                  <div className="text-xs text-muted-foreground">{p.phone}</div>
                  <div className="text-xs text-muted-foreground font-mono">{p.digitalAddress}</div>
                </TableCell>

                <TableCell>{p.category ?? 'N/A'}</TableCell>

                <TableCell>
                  <Badge variant={
                    p.status === 'approved'
                      ? 'success'
                      : p.status === 'rejected'
                      ? 'destructive'
                      : p.status === 'suspended'
                      ? 'destructive'
                      : 'secondary'
                  }>
                    {p.status ?? 'pending'}
                  </Badge>
                </TableCell>

                <TableCell>{createdAt}</TableCell>

                <TableCell>
                  {p.status === 'approved' && p.approvedBy && p.approvedAt ? (
                    <div className="text-xs text-muted-foreground">
                      by {p.approvedBy}<br/>on {new Date(p.approvedAt).toLocaleDateString()}
                    </div>
                  ) : p.status === 'rejected' && p.rejectedBy && p.rejectedAt ? (
                    <div className="text-xs text-muted-foreground">
                      by {p.rejectedBy}<br/>on {new Date(p.rejectedAt).toLocaleDateString()}
                    </div>
                  ) :  p.status === 'suspended' && p.suspendedBy && p.suspendedAt ? (
                    <div className="text-xs text-muted-foreground">
                      by {p.suspendedBy}<br/>on {new Date(p.suspendedAt).toLocaleDateString()}
                    </div>
                  ): (
                    '—'
                  )}
                </TableCell>

                <TableCell className="text-right space-x-2">
                    {p.status === 'pending' && (
                        <>
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleAction(p.id, 'approve')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(p.id, 'reject')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            Reject
                        </Button>
                        </>
                    )}
                    {p.status === 'approved' && (
                        <>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="secondary" disabled={loadingIds.includes(p.id)}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Reset Provider PIN?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will generate a new one-time PIN for {p.name}. The provider's old PIN (if unused) will no longer work. Are you sure?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResetPin(p.id)}>Yes, Reset PIN</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(p.id, 'suspend')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            Suspend
                        </Button>
                        </>
                    )}
                     {(p.status === 'rejected' || p.status === 'suspended') && (
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleAction(p.id, 'approve')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            Re-Approve
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    
     <AlertDialog open={!!showPinInfo} onOpenChange={(open) => !open && setShowPinInfo(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Provider Action Complete!</AlertDialogTitle>
                <AlertDialogDescription>
                    Please share this new one-time login PIN with {showPinInfo?.providerName} securely.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 p-4 bg-muted rounded-lg flex items-center justify-between">
                <span className="text-2xl font-bold font-mono tracking-widest text-primary">{showPinInfo?.pin}</span>
                <Button variant="ghost" size="icon" onClick={copyPinToClipboard}>
                    <Copy className="h-5 w-5" />
                </Button>
            </div>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowPinInfo(null)}>Got it, close</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    
