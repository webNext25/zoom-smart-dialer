"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Phone, Clock, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";

const mockCallData = [
    { name: "Mon", calls: 12, sentiment: 85 },
    { name: "Tue", calls: 19, sentiment: 75 },
    { name: "Wed", calls: 15, sentiment: 90 },
    { name: "Thu", calls: 22, sentiment: 65 },
    { name: "Fri", calls: 28, sentiment: 80 },
    { name: "Sat", calls: 10, sentiment: 95 },
    { name: "Sun", calls: 8, sentiment: 92 },
];

const mockSentimentData = [
    { time: "00:00", score: 0.8 },
    { time: "00:05", score: 0.6 },
    { time: "00:10", score: 0.4 },
    { time: "00:15", score: 0.7 },
    { time: "00:20", score: 0.9 },
];

export default function AnalyticsPage() {
    const { currentUser } = useStore();

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
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12m 30s</div>
                        <p className="text-xs text-muted-foreground">+4% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interventions</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">-2% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Call Volume & Sentiment</CardTitle>
                        <CardDescription>Daily call volume vs average sentiment score.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={mockCallData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Live Sentiment Tracking</CardTitle>
                        <CardDescription>Real-time sentiment analysis of current calls.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={mockSentimentData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="time" className="text-xs" />
                                <YAxis domain={[0, 1]} className="text-xs" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
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
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Zoom Meeting #{1000 + i}</p>
                                        <p className="text-sm text-muted-foreground">Duration: 14m • Agent: Sales Bot</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-green-500">Positive</p>
                                    <p className="text-sm text-muted-foreground">Today, 10:3{i} AM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
