'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface Dispute {
    disputeId: string;
    engagementId: string;
    jobTitle: string;
    customerMessage: string;
    providerMessage: string;
    evidence: { from: 'customer' | 'provider'; url: string }[];
}

// In a real app, this would come from your auth context/provider
const getAuthToken = () => {
    // This is a placeholder. Replace with your actual auth token retrieval logic.
    return localStorage.getItem('authToken');
};

export function DisputeReviewPanel() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<string | null>(null); // Holds the ID of the dispute being processed

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch('/api/admin/disputes', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`Failed to fetch disputes: ${response.statusText}`);

            const data: Dispute[] = await response.json();
            setDisputes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleAction = async (action: 'refund' | 'release', dispute: Dispute) => {
        setProcessing(dispute.disputeId);
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            const endpoint = action === 'refund' ? '/api/admin/refund' : '/api/payouts/release';
            const body = action === 'refund' 
                ? { engagementId: dispute.engagementId, disputeId: dispute.disputeId }
                : { engagementId: dispute.engagementId };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${action}.`);
            }

            alert(`Success! The dispute has been resolved. Action: ${action}.`);
            fetchDisputes(); // Refresh the list

        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setProcessing(null);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <Skeleton className="h-40 w-full" />;
        }

        if (error) {
            return <p className="text-red-500 text-center py-4">Error: {error}</p>;
        }

        if (disputes.length === 0) {
            return <p className="text-center text-muted-foreground py-4">No active disputes.</p>;
        }

        return (
            <Accordion type="single" collapsible className="w-full">
                {disputes.map((dispute) => (
                    <AccordionItem value={dispute.disputeId} key={dispute.disputeId}>
                        <AccordionTrigger>{dispute.jobTitle} (Job: {dispute.engagementId.substring(0,10)}...)</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            <div className="bg-gray-100 p-3 rounded-md">
                                <p className="font-semibold text-sm">Customer's Complaint:</p>
                                <p className="text-sm">{dispute.customerMessage}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-md">
                                <p className="font-semibold text-sm">Provider's Response:</p>
                                <p className="text-sm">{dispute.providerMessage}</p>
                            </div>
                            {dispute.evidence.length > 0 && (
                                <div>
                                    <p className="font-semibold text-sm">Evidence:</p>
                                    {dispute.evidence.map(e => 
                                        <Button key={e.url} variant="link" size="sm" asChild>
                                            <a href={e.url} target="_blank" rel="noopener noreferrer">View evidence from {e.from}</a>
                                        </Button>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button 
                                    variant="destructive" 
                                    onClick={() => handleAction('refund', dispute)}
                                    disabled={!!processing}
                                >
                                    {processing === dispute.disputeId ? 'Refunding...' : 'Approve Refund'}
                                </Button>
                                <Button 
                                    variant="default" 
                                    onClick={() => handleAction('release', dispute)}
                                    disabled={!!processing}
                                >
                                    {processing === dispute.disputeId ? 'Releasing...' : 'Approve Release'}
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        );
    }

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Dispute Review Panel</CardTitle>
                <CardDescription>Review and resolve active disputes.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
