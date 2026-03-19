'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface Payout {
    engagementId: string;
    providerName: string;
    receivable: number;
    payoutDetails: { type?: 'MoMo' | 'Bank'; number?: string; name?: string };
}

// In a real app, this would come from your auth context/provider
const getAuthToken = () => {
    // This is a placeholder. Replace with your actual auth token retrieval logic.
    return localStorage.getItem('authToken');
};

export function PayoutApprovalPanel() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [releasing, setReleasing] = useState<string | null>(null); // Holds the ID of the payout being released

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch('/api/admin/pending-payouts', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`Failed to fetch payouts: ${response.statusText}`);

            const data: Payout[] = await response.json();
            setPayouts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleReleasePayment = async (engagementId: string) => {
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

            // Refresh the list after successful release
            fetchPayouts();

        } catch (err: any) {
            alert(`Error: ${err.message}`); // Simple alert for error feedback
        } finally {
            setReleasing(null);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-6">
                    {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
            );
        }

        if (error) {
            return <p className="text-red-500 text-center py-4">Error: {error}</p>;
        }

        if (payouts.length === 0) {
            return <p className="text-center text-muted-foreground py-4">No pending payouts.</p>;
        }

        return (
            <div className="space-y-6">
                {payouts.map((payout) => (
                    <div key={payout.engagementId} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-semibold">{payout.providerName}</p>
                                <p className="text-sm text-muted-foreground">Job ID: {payout.engagementId.substring(0,10)}...</p>
                            </div>
                            <p className="text-xl font-bold">{`GHS ${payout.receivable.toFixed(2)}`}</p>
                        </div>
                        <Separator className="my-2" />
                        <div>
                            <p className="text-sm font-medium">Payout Details:</p>
                            {payout.payoutDetails.type === 'MoMo' ? (
                                <p className="text-sm">MoMo Number: {payout.payoutDetails.number}</p>
                            ) : payout.payoutDetails.type === 'Bank' ? (
                                <p className="text-sm">Bank: {payout.payoutDetails.name} - {payout.payoutDetails.number}</p>
                            ) : (
                                <p className="text-sm text-red-500">No payout details on file.</p>
                            )}
                        </div>
                        <CardFooter className="p-0 pt-4">
                            <Button 
                                className="w-full" 
                                onClick={() => handleReleasePayment(payout.engagementId)}
                                disabled={releasing === payout.engagementId || !payout.payoutDetails.type}
                            >
                                {releasing === payout.engagementId ? 'Releasing...' : 'Release Payment'}
                            </Button>
                        </CardFooter>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
                <CardTitle>Payout Approval Panel</CardTitle>
                <CardDescription>Review and release payments to providers.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
