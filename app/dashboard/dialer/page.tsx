"use client";

import { ZoomEmbed } from "@/components/dialer/zoom-embed";
import { CustomAIDialer } from "@/components/dialer/custom-ai-dialer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Bot, History } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function RecentCallsList() {
    const { data: response, error } = useSWR("/api/recordings", fetcher);

    if (error) {
        return (
            <div className="p-4 text-sm text-muted-foreground text-center">
                Error loading recent calls
            </div>
        );
    }

    if (!response) {
        return (
            <div className="p-4 text-sm text-muted-foreground text-center">
                Loading...
            </div>
        );
    }

    // Handle both old and new API response formats
    const recordings = response.recordings || response || [];
    const recentCalls = Array.isArray(recordings) ? recordings.slice(0, 5) : [];

    if (recentCalls.length === 0) {
        return (
            <div className="p-4 text-sm text-muted-foreground text-center">
                No recent calls yet. Start dialing!
            </div>
        );
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <ScrollArea className="h-[300px]">
            <div className="divide-y">
                {recentCalls.map((call: any) => (
                    <div key={call.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">{call.phoneNumber}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatTime(call.createdAt)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                                {Math.floor(call.duration / 60)}m {call.duration % 60}s
                            </span>
                            <span className={`text-xs font-medium ${call.sentiment === 'positive' ? 'text-green-600' :
                                call.sentiment === 'negative' ? 'text-red-600' :
                                    'text-yellow-600'
                                }`}>
                                {call.sentiment.charAt(0).toUpperCase() + call.sentiment.slice(1)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

export default function DialerPage() {
    return (
        <div className="h-[calc(100vh-4rem)] flex gap-4 p-4">
            {/* Left Side: Dialer Interface */}
            <div className="flex-1 flex flex-col">
                <Tabs defaultValue="standard" className="w-full h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold tracking-tight">Phone Dialer</h2>
                        <TabsList>
                            <TabsTrigger value="standard" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Standard (Zoom Phone)
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                AI Assisted (Vapi)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 border rounded-lg overflow-hidden bg-background relative">
                        <TabsContent value="standard" className="h-full m-0 p-0 data-[state=active]:flex flex-col">
                            <ZoomEmbed />
                        </TabsContent>
                        <TabsContent value="ai" className="h-full m-0 p-0 data-[state=active]:flex flex-col">
                            <CustomAIDialer />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Right Side: Context & History */}
            <div className="w-80 flex flex-col gap-4">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <History className="h-5 w-5" />
                            Recent Calls
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecentCallsList />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
