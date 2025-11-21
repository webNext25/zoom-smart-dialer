"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Play, Download } from "lucide-react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RecordingsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sentiment, setSentiment] = useState("all");

    // Build query string
    const queryParams = new URLSearchParams({
        search: searchQuery,
        sentiment,
        limit: "50",
    });

    const { data, error, isLoading } = useSWR(
        `/api/recordings?${queryParams}`,
        fetcher
    );

    const recordings = data?.recordings || data || [];

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-4 w-96 mt-2" />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-10 w-full max-w-md" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-6 flex-1" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) return <div className="text-center py-12">Error loading recordings</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Call Recordings</h2>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search recordings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    <Select value={sentiment} onValueChange={setSentiment}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {recordings.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            <p className="mb-2">No recordings yet</p>
                            <p className="text-sm">Start making calls using the Smart Dialer to see your recordings here!</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Recordings</CardTitle>
                        <CardDescription>{recordings.length} recording{recordings.length !== 1 ? 's' : ''} found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Sentiment</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recordings.map((recording: any) => (
                                    <TableRow key={recording.id}>
                                        <TableCell className="font-medium">{recording.phoneNumber}</TableCell>
                                        <TableCell>{formatDuration(recording.duration)}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                recording.sentiment === 'positive' ? 'default' :
                                                    recording.sentiment === 'negative' ? 'destructive' :
                                                        'secondary'
                                            }>
                                                {recording.sentiment}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(recording.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon">
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
