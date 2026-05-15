
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
import { Copy, RefreshCw, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Switch } from '@/components/ui/switch';

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
        
        const providerRef = doc(db, 'providers', providerId);
        const updateData: any = {
            status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended',
            updatedAt: serverTimestamp(),
        };

        let generatedPin = '';
        if (action === 'approve') {
            updateData.verified = true;
            updateData.approvedAt = serverTimestamp();
            generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
            updateData.loginPin = generatedPin;
            updateData.loginPinCreatedAt = serverTimestamp();
            updateData.subscriptionActive = false; // Subscription inactive by default on approval
        }

        updateDoc(providerRef, updateData)
            .then(() => {
                toast({ title: `Provider ${action}d successfully!`, variant: 'default' });
                if (action === 'approve' && generatedPin) {
                    const provider = providers.find(p => p.id === providerId);
                    setShowPinInfo({ providerName: provider?.name || 'the provider', pin: generatedPin });
                }
                router.refresh();
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: providerRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setLoadingIds(prev => prev.filter(id => id !== providerId));
            });
    };
    
    const toggleSubscription = async (providerId: string, currentStatus: boolean) => {
        setLoadingIds(prev => [...prev, providerId]);
        const providerRef = doc(db, 'providers', providerId);
        const updateData = {
            subscriptionActive: !currentStatus,
            updatedAt: serverTimestamp(),
        };

        updateDoc(providerRef, updateData)
            .then(() => {
                toast({ 
                    title: updateData.subscriptionActive ? 'Subscription Activated' : 'Subscription Deactivated', 
                    description: updateData.subscriptionActive ? 'The artisan is now visible to clients.' : 'The artisan is hidden from clients.'
                });
                router.refresh();
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: providerRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setLoadingIds(prev => prev.filter(id => id !== providerId));
            });
    };

     const handleResetPin = async (providerId: string) => {
        setLoadingIds(prev => [...prev, providerId]);
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const providerRef = doc(db, 'providers', providerId);
        const updateData = {
            loginPin: pin,
            loginPinCreatedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        
        updateDoc(providerRef, updateData)
            .then(() => {
                const provider = providers.find(p => p.id === providerId);
                setShowPinInfo({ providerName: provider?.name || 'the provider', pin: pin });
                toast({ title: "PIN has been reset!", variant: 'default' });
                router.refresh();
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: providerRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setLoadingIds(prev => prev.filter(id => id !== providerId));
            });
    };
    
    const copyPinToClipboard = () => {
        if (showPinInfo) {
            navigator.clipboard.writeText(showPinInfo.pin);
            toast({ title: "PIN Copied!", description: "The PIN has been copied to your clipboard." });
        }
    }


  if (!providers || providers.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground font-medium">
        No providers found for this status.
      </p>
    );
  }

  return (
    <>
    <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/5">
            <TableHead className="font-bold py-4">Artisan Details</TableHead>
            <TableHead className="font-bold">Category</TableHead>
            <TableHead className="font-bold text-center">Subscription</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {providers.map((p) => {
            const isLoading = loadingIds.includes(p.id);

            return (
              <TableRow key={p.id} className="hover:bg-muted/5 transition-colors">
                <TableCell className="py-4">
                  <div className="font-bold text-primary">{p.name ?? 'Unnamed'}</div>
                  <div className="text-xs text-muted-foreground font-medium">{p.phone}</div>
                  <div className="text-[10px] text-muted-foreground/60 font-mono mt-1">{p.id.slice(0, 8)} • {p.location.zone}</div>
                </TableCell>

                <TableCell>
                    <Badge variant="outline" className="font-bold">{p.category ?? 'N/A'}</Badge>
                </TableCell>

                <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1.5">
                        <Switch 
                            checked={!!p.subscriptionActive}
                            onCheckedChange={() => toggleSubscription(p.id, !!p.subscriptionActive)}
                            disabled={isLoading || p.status !== 'approved'}
                        />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${p.subscriptionActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {p.subscriptionActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </TableCell>

                <TableCell>
                  <Badge variant={
                    p.status === 'approved'
                      ? 'success'
                      : p.status === 'rejected' || p.status === 'suspended'
                      ? 'destructive'
                      : 'secondary'
                  } className="uppercase text-[10px] font-black tracking-widest">
                    {p.status ?? 'pending'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right space-x-2 pr-6">
                    {p.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAction(p.id, 'approve')}
                                disabled={isLoading}
                                className="h-8 rounded-lg font-bold"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAction(p.id, 'reject')}
                                disabled={isLoading}
                                className="h-8 rounded-lg font-bold"
                            >
                                Reject
                            </Button>
                        </div>
                    )}
                    {p.status === 'approved' && (
                        <div className="flex justify-end gap-2">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" disabled={isLoading} className="h-8 w-8 p-0 rounded-lg">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl">
                                <AlertDialogHeader>
                                <AlertDialogTitle className="font-headline">Reset Provider PIN?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will generate a new one-time PIN for {p.name}. The provider's old PIN will no longer work.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResetPin(p.id)} className="rounded-xl">Yes, Reset PIN</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(p.id, 'suspend')}
                            disabled={isLoading}
                            className="h-8 rounded-lg font-bold"
                        >
                            Suspend
                        </Button>
                        </div>
                    )}
                     {(p.status === 'rejected' || p.status === 'suspended') && (
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAction(p.id, 'approve')}
                            disabled={isLoading}
                            className="h-8 rounded-lg font-bold"
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
                <AlertDialogTitle className="text-2xl font-headline">Action Successful!</AlertDialogTitle>
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
