'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

interface MonthlyData {
  month: string;
  grossJobValue: number;
  commissionEarned: number;
  refundVolume: number;
}

const getAuthToken = () => localStorage.getItem('authToken');

export function RevenueGraph() {
    const [data, setData] = useState<MonthlyData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = getAuthToken();
                if (!token) throw new Error('Authentication token not found.');

                const response = await fetch('/api/admin/revenue-graph', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

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
            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <div className="p-12 border-2 border-dashed rounded-[32px] text-center text-destructive bg-destructive/5">
                <p className="font-bold">Revenue Data Unavailable</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl">Financial Overview</CardTitle>
                <CardDescription>Volume, commissions, and refunds over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <div className="h-[300px] md:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data || []} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                padding={{ left: 20, right: 20 }}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₵${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                formatter={(value: number, name: string) => [`GHS ${value.toFixed(2)}`, name.replace(/([A-Z])/g, ' $1').trim()]} 
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="grossJobValue" name="Gross Volume" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                            <Bar dataKey="commissionEarned" name="Net Revenue" fill="#1d82fa" radius={[6, 6, 0, 0]} barSize={40} />
                            <Bar dataKey="refundVolume" name="Refunds" fill="#fa4b1d" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
