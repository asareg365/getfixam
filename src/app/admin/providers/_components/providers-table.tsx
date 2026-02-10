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
import { Copy, RefreshCw, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
        setLoadingIds(prev => [...prev, providerId]);
        try {
            // In a prototype environment where the Admin SDK (firebase-admin) might not be fully initialized
            // due to missing service account environment variables, we perform the update directly 
            // via the Client SDK. This adheres to the "Generate Client Side Only Firebase Code" directive.
            
            const providerRef = doc(db, 'providers', providerId);
            const updateData: any = {
                status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended',
                updatedAt: serverTimestamp(),
            };

            let generatedPin = '';
            if (action === 'approve') {
                updateData.verified = true;
                updateData.approvedAt = serverTimestamp();
                // Generate a one-time 6-digit PIN
                generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
                // For the prototype, we store the PIN directly to ensure the login flow works without bcrypt initialization issues
                updateData.loginPin = generatedPin;
                updateData.loginPinCreatedAt = serverTimestamp();
            }

            await updateDoc(providerRef, updateData);

            toast({ title: `Provider ${action}d successfully!`, variant: 'default' });
            
            if (action === 'approve' && generatedPin) {
                const provider = providers.find(p => p.id === providerId);
                setShowPinInfo({ providerName: provider?.name || 'the provider', pin: generatedPin });
            }
            
            router.refresh();
        } catch (error: any) {
            console.error(`Error performing ${action}:`, error);
            toast({ 
                title: `Failed to ${action} provider`, 
                description: error.message || 'Unexpected database error.', 
                variant: 'destructive' 
            });
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== providerId));
        }
    };
    
     const handleResetPin = async (providerId: string) => {
        setLoadingIds(prev => [...prev, providerId]);
        try {
            const pin = Math.floor(100000 + Math.random() * 900000).toString();
            const providerRef = doc(db, 'providers', providerId);
            
            await updateDoc(providerRef, {
                loginPin: pin,
                loginPinCreatedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            const provider = providers.find(p => p.id === providerId);
            setShowPinInfo({ providerName: provider?.name || 'the provider', pin: pin });
            toast({ title: "PIN has been reset!", variant: 'default' });
            router.refresh();

        } catch (error: any) {
            toast({ title: 'Failed to reset PIN', description: error.message, variant: 'destructive' });
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
    <div className="border rounded-lg bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
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
                  <div className="font-bold text-primary">{p.name ?? 'Unnamed'}</div>
                  <div className="text-xs text-muted-foreground">{p.phone}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{p.digitalAddress}</div>
                </TableCell>

                <TableCell>{p.category ?? 'N/A'}</TableCell>

                <TableCell>
                  <Badge variant={
                    p.status === 'approved'
                      ? 'default'
                      : p.status === 'rejected'
                      ? 'destructive'
                      : p.status === 'suspended'
                      ? 'destructive'
                      : 'secondary'
                  }>
                    {p.status ?? 'pending'}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs">{createdAt}</TableCell>

                <TableCell className="text-right space-x-2">
                    {p.status === 'pending' && (
                        <>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAction(p.id, 'approve')}
                            disabled={loadingIds.includes(p.id)}
                        >
                            {loadingIds.includes(p.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
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
                            variant="default"
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
    
     <AlertDialog open={!!showPinInfo} onOpenChange={(open: any) => !open && setShowPinInfo(null)}>
        <AlertDialogContent className="rounded-[32px]">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-headline">Provider Action Complete!</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                    Please share this new one-time login PIN with <span className="font-bold text-primary">{showPinInfo?.providerName}</span> securely.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-6 p-6 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 flex items-center justify-between">
                <span className="text-4xl font-black font-mono tracking-[0.2em] text-primary">{showPinInfo?.pin}</span>
                <Button variant="ghost" size="icon" onClick={copyPinToClipboard} className="hover:bg-primary/10">
                    <Copy className="h-6 w-6 text-primary" />
                </Button>
            </div>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowPinInfo(null)} className="rounded-xl px-8 h-12 font-bold">Got it, close</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
