'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

interface MonthlyData {
  month: string;
  grossJobValue: number;
  commissionEarned: number;
  refundVolume: number;
}

// In a real app, this would come from your auth context/provider
const getAuthToken = () => {
    // This is a placeholder. Replace with your actual auth token retrieval logic.
    return localStorage.getItem('authToken');
};

export function RevenueGraph() {
    const [data, setData] = useState<MonthlyData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = getAuthToken();
                if (!token) {
                    throw new Error('Authentication token not found.');
                }

                const response = await fetch('/api/admin/revenue-graph', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                }

                const graphData: MonthlyData[] = await response.json();
                setData(graphData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Monthly Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center col-span-4">Error: {error}</div>;
    }

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Monthly Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data || []}>
                        <XAxis
                            dataKey="month"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `GHS ${value}`}
                        />
                        <Tooltip formatter={(value: number, name: string) => [`GHS ${value.toFixed(2)}`, name.replace(/([A-Z])/g, ' $1').trim()]} />
                        <Legend />
                        <Bar dataKey="grossJobValue" name="Gross Job Value" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="commissionEarned" name="Commission Earned" fill="#1d82fa" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="refundVolume" name="Refund Volume" fill="#fa4b1d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
