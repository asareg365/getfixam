'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type EscrowStatus = 'funded' | 'locked' | 'released' | 'disputed' | 'awaiting_release';

interface Engagement {
    id: string;
    provider: string;
    jobAmount: number;
    escrowStatus: EscrowStatus;
    providerName?: string;
    daysLocked?: number;
}

const getAuthToken = () => localStorage.getItem('authToken');

const statusColors: Record<EscrowStatus, string> = {
    funded: 'bg-blue-500',
    locked: 'bg-yellow-500',
    released: 'bg-green-500',
    disputed: 'bg-red-500',
    awaiting_release: 'bg-orange-500',
};

export function EscrowMonitorTable() {
    const [status, setStatus] = useState<EscrowStatus>('funded');
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [releasing, setReleasing] = useState<string | null>(null);

    const fetchEngagements = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/admin/engagements?status=${status}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`Failed to fetch engagements: ${response.statusText}`);
            
            const data: Engagement[] = await response.json();
            setEngagements(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEngagements();
    }, [status]);

    const handleRelease = async (engagementId: string) => {
        setReleasing(engagementId);
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch('/api/payouts/release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ engagementId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to release payment.');
            }

            alert('Funds released successfully!');
            fetchEngagements();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setReleasing(null);
        }
    };

    const renderTableContent = () => {
        if (loading) {
            return <div className="space-y-2 mt-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
        }
        if (error) {
            return <p className="text-red-500 text-center py-4">Error: {error}</p>;
        }
        if (engagements.length === 0) {
            return <p className="text-center text-muted-foreground py-12 italic">No engagements found for "{status}"</p>;
        }

        return (
            <div className="overflow-x-auto rounded-xl border mt-4">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[100px]">Job ID</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Amount</TableHead>
                            {status === 'awaiting_release' && <TableHead>Days Locked</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {engagements.map((engagement) => (
                            <TableRow key={engagement.id} className="hover:bg-muted/30">
                                <TableCell className="font-mono text-xs">{engagement.id.substring(0, 8)}</TableCell>
                                <TableCell className="font-medium">{engagement.providerName || 'N/A'}</TableCell>
                                <TableCell className="font-bold">{`GHS ${engagement.jobAmount.toFixed(2)}`}</TableCell>
                                {status === 'awaiting_release' && <TableCell className="text-orange-600 font-bold">{engagement.daysLocked ?? 'N/A'} d</TableCell>}
                                <TableCell>
                                    <Badge className={`${statusColors[engagement.escrowStatus]} text-white text-[10px] uppercase font-black`}>
                                        {engagement.escrowStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {status === 'awaiting_release' ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" className="h-8 rounded-lg" disabled={releasing === engagement.id}>
                                                    {releasing === engagement.id ? '...' : 'Release'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-[24px]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Release Funds Immediately?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will bypass any remaining lock period and pay <b>{engagement.providerName}</b> now.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleRelease(engagement.id)} className="rounded-xl bg-destructive hover:bg-destructive/90">Confirm Release</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <Button variant="ghost" size="sm" className="h-8 rounded-lg">View</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl">Escrow Monitor</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <Tabs defaultValue="funded" onValueChange={(value) => setStatus(value as EscrowStatus)}>
                    <div className="overflow-x-auto">
                        <TabsList className="flex w-fit md:grid md:w-full grid-cols-5 h-12 p-1 rounded-xl bg-muted/50 border">
                            <TabsTrigger value="funded" className="rounded-lg px-4 text-xs font-bold">Funded</TabsTrigger>
                            <TabsTrigger value="locked" className="rounded-lg px-4 text-xs font-bold">Locked</TabsTrigger>
                            <TabsTrigger value="awaiting_release" className="rounded-lg px-4 text-xs font-bold">Awaiting</TabsTrigger>
                            <TabsTrigger value="released" className="rounded-lg px-4 text-xs font-bold">Released</TabsTrigger>
                            <TabsTrigger value="disputed" className="rounded-lg px-4 text-xs font-bold">Disputed</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value={status}>
                        {renderTableContent()}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
