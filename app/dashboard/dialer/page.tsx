"use client";

import { useState, useEffect } from "react";
import { ZoomEmbed } from "@/components/dialer/zoom-embed";
import { CustomAIDialer } from "@/components/dialer/custom-ai-dialer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Bot, History } from "lucide-react";

export default function DialerPage() {
    const [mode, setMode] = useState<"standard" | "ai">("standard");
    const [transcript, setTranscript] = useState<{ role: "agent" | "customer"; text: string; time: string }[]>([]);
    const [isCallActive, setIsCallActive] = useState(false);

    // Mock transcript generation for AI mode
    useEffect(() => {
        if (mode !== "ai" || !isCallActive) {
            setTranscript([]);
            return;
        }

        const messages = [
            { role: "agent" as const, text: "Hello! This is your AI assistant. How can I help you today?" },
            { role: "customer" as const, text: "Hi, I'm interested in learning more about your product." },
            { role: "agent" as const, text: "Great! I'd be happy to help. What specific features are you most interested in?" },
            { role: "customer" as const, text: "I need something that integrates well with Zoom." },
            { role: "agent" as const, text: "Perfect! Our platform offers seamless Zoom integration. Can I ask about your use case?" },
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < messages.length) {
                const now = new Date();
                setTranscript(prev => [...prev, { ...messages[index], time: now.toLocaleTimeString() }]);
                index++;
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [mode, isCallActive]);

    // Simulate call start/end
    useEffect(() => {
        if (mode === "ai") {
            const timeout = setTimeout(() => setIsCallActive(true), 2000);
            return () => clearTimeout(timeout);
        }
    }, [mode]);

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-4 p-4">
            {/* Left Side: Dialer Interface */}
            <div className="flex-1 flex flex-col">
                <Tabs defaultValue="standard" className="w-full h-full flex flex-col" onValueChange={(v) => setMode(v as any)}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold tracking-tight">Phone Dialer</h2>
                        <TabsList>
                            <TabsTrigger value="standard" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Standard (Zoom Phone)
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                AI Assisted (Video SDK)
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
                        <ScrollArea className="h-[300px]">
                            <div className="divide-y">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium">+1 (555) 000-000{i}</span>
                                            <span className="text-xs text-muted-foreground">10:3{i} AM</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                                                {i % 2 === 0 ? "Sales Bot" : "Support Bot"}
                                            </span>
                                            <span className="text-xs text-green-600 font-medium">
                                                {i % 2 === 0 ? "Qualified" : "Resolved"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Live Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-[300px] px-4">
                            {mode === "standard" ? (
                                <div className="text-sm text-muted-foreground italic text-center mt-8">
                                    Not available in Standard Mode
                                </div>
                            ) : transcript.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic text-center mt-8">
                                    Waiting for call to start...
                                </div>
                            ) : (
                                <div className="space-y-3 py-4">
                                    {transcript.map((msg, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-medium ${msg.role === "agent" ? "text-primary" : "text-foreground"}`}>
                                                    {msg.role === "agent" ? "AI Agent" : "Customer"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{msg.time}</span>
                                            </div>
                                            <p className="text-sm bg-muted p-2 rounded-md">{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>            </div>
        </div>
    );
}
