'use client';
    
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type StandbyPrediction, type Provider } from "@/lib/types";
import { Flame, List, Pin, UserCheck, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useState, useTransition } from 'react';
import { useRouter } from "next/navigation";
import { getSwappableArtisans, swapStandbyArtisan, overrideStandbyPool } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";


function SwapArtisanDialog({ artisanToSwap, allStandbyArtisans, serviceType }: { artisanToSwap: Provider, allStandbyArtisans: Provider[], serviceType: string }) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const [swappableArtisans, setSwappableArtisans] = useState<Provider[]>([]);
    const [selectedArtisanId, setSelectedArtisanId] = useState<string | null>(null);

    async function onOpen() {
        setIsLoading(true);
        const excludedIds = allStandbyArtisans.map(a => a.id);
        const { success, artisans, message } = await getSwappableArtisans(serviceType, excludedIds);
        if (success && artisans) {
            setSwappableArtisans(artisans);
        } else {
            toast({ title: "Error", description: message, variant: "destructive" });
        }
        setIsLoading(false);
    }

    async function handleSwap() {
        if (!selectedArtisanId) {
            toast({ title: "Error", description: "Please select an artisan.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            const { success, message } = await swapStandbyArtisan(artisanToSwap.id, selectedArtisanId);
            if (success) {
                toast({ title: "Success", description: "Artisan has been swapped." });
                setOpen(false);
                router.refresh();
            } else {
                toast({ title: "Error", description: message, variant: "destructive" });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (isOpen) onOpen();
        }}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost">Swap</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Swap {artisanToSwap.name}</DialogTitle>
                    <DialogDescription>Select a new artisan to replace {artisanToSwap.name} on the standby list for {serviceType}.</DialogDescription>
                </DialogHeader>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                     <Select onValueChange={setSelectedArtisanId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select available artisan" />
                        </SelectTrigger>
                        <SelectContent>
                            {swappableArtisans.length > 0 ? (
                                swappableArtisans.map(artisan => (
                                    <SelectItem key={artisan.id} value={artisan.id}>{artisan.name}</SelectItem>
                                ))
                            ) : (
                                <div className="text-sm text-center text-muted-foreground p-4">No other artisans available for this service.</div>
                            )}
                        </SelectContent>
                    </Select>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSwap} disabled={isLoading || isPending || !selectedArtisanId}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Swap
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function OverrideDialog() {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    function handleOverride() {
        startTransition(async () => {
            const { success, message } = await overrideStandbyPool();
            if (success) {
                toast({ title: "Success", description: "Standby pool has been cleared. It will be regenerated on the next schedule." });
                router.refresh();
            } else {
                toast({ title: "Error", description: message, variant: "destructive" });
            }
        });
    }

    return (
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Override & Regenerate
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete the current standby pool. A new one will be generated based on the latest predictions on the next scheduled run. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleOverride} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, Override
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export function StandbyCard({ standby }: { standby: StandbyPrediction | null }) {

    if (!standby) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary"/>
                        Tomorrow’s Standby Pool
                    </CardTitle>
                    <CardDescription>AI-generated standby team for predicted demand.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                        <p>No standby team generated for tomorrow.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary"/>
                    Tomorrow’s Standby Pool
                </CardTitle>
                <CardDescription>Generated {formatDistanceToNow(new Date(standby.generatedAt), { addSuffix: true })}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-md">
                            <Flame className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Predicted Service</p>
                            <p className="font-bold text-lg capitalize">{standby.serviceType}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-accent/20 p-2 rounded-md">
                            <Pin className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Predicted Hotspot</p>
                            <p className="font-bold text-lg capitalize">{standby.area}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><List className="h-4 w-4"/> Standby Artisans</h4>
                     {standby.artisans.length > 0 ? (
                        <ul className="space-y-2">
                            {standby.artisans.map(artisan => (
                                <li key={artisan.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                    <div>
                                        <span className="font-medium">{artisan.name}</span>
                                        <p className="text-xs text-muted-foreground">{artisan.phone}</p>
                                    </div>
                                    <SwapArtisanDialog artisanToSwap={artisan} allStandbyArtisans={standby.artisans} serviceType={standby.serviceType} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No artisans were assigned to the standby pool.</p>
                    )}
                </div>
                 <div className="pt-2">
                    <OverrideDialog />
                </div>
            </CardContent>
        </Card>
    )
}
