"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Phone, Clock, ThumbsUp, AlertTriangle } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnalyticsPage() {
    const { data: analytics, error } = useSWR("/api/analytics", fetcher);

    if (error) return <div>Error loading analytics</div>;
    if (!analytics) return <div>Loading...</div>;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalCalls}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(analytics.averageDuration)}</div>
                        <p className="text-xs text-muted-foreground">Per call</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalMinutes}</div>
                        <p className="text-xs text-muted-foreground">Minutes used</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Positive Calls</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics.sentimentCounts?.positive || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.totalCalls > 0
                                ? Math.round((analytics.sentimentCounts?.positive || 0) / analytics.totalCalls * 100)
                                : 0}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Call Logs</CardTitle>
                    <CardDescription>Detailed logs of recent AI interactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.recentCalls?.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No calls yet. Start using the Smart Dialer to see your call history here!
                            </p>
                        ) : (
                            analytics.recentCalls?.map((call: any, i: number) => (
                                <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{call.phoneNumber}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Duration: {formatDuration(call.duration)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-medium ${call.sentiment === 'positive' ? 'text-green-500' :
                                                call.sentiment === 'negative' ? 'text-red-500' :
                                                    'text-yellow-500'
                                            }`}>
                                            {call.sentiment.charAt(0).toUpperCase() + call.sentiment.slice(1)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(call.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
