"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mic, MicOff, PhoneOff, Bot, User } from "lucide-react";
import { useAudioBridge } from "@/hooks/use-audio-bridge";
import useSWR from "swr";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CustomAIDialer() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");
    const [callStatus, setCallStatus] = useState<"idle" | "dialing" | "connected" | "ended">("idle");
    const [isMuted, setIsMuted] = useState(false);

    const { data: agents, error: agentsError } = useSWR("/api/agents", fetcher);
    const { isBridgeActive, transcript, callDuration, startCall, stopCall, toggleMute } = useAudioBridge();

    // Sync call status with bridge
    useEffect(() => {
        if (isBridgeActive && callStatus !== "connected") {
            setCallStatus("connected");
        } else if (!isBridgeActive && callStatus === "connected") {
            setCallStatus("ended");
            setTimeout(() => {
                setCallStatus("idle");
                setPhoneNumber("");
            }, 2000);
        }
    }, [isBridgeActive, callStatus]);

    const selectedAgent = agents?.find((a: any) => a.id === selectedAgentId);

    const handleCall = async () => {
        if (!phoneNumber || !selectedAgent) {
            toast.error("Please select an agent and enter a phone number");
            return;
        }

        setCallStatus("dialing");

        try {
            // Start Vapi call with selected agent
            await startCall(selectedAgent, phoneNumber);
            toast.success("Call initiated");
        } catch (error) {
            console.error("Call failed:", error);
            toast.error("Failed to start call");
            setCallStatus("idle");
        }
    };

    const handleHangup = () => {
        stopCall();
        setCallStatus("ended");
        toast.info("Call ended");
    };

    const handleToggleMute = () => {
        const newMutedState = toggleMute();
        setIsMuted(newMutedState);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (agentsError) {
        return (
            <div className="h-full flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <p className="text-destructive">Error loading agents</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!agents) {
        return (
            <div className="h-full flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <p>Loading agents...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 p-6 bg-background">
            {/* Main Dialer Card */}
            <Card className="flex-1 shadow-lg border-2 border-primary/20">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Bot className="w-6 h-6 text-primary" />
                        Live AI Dialer
                    </CardTitle>
                    <CardDescription>
                        Powered by Vapi AI Voice Agents
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Status Display */}
                    <div className="h-32 bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                        {callStatus === "idle" && (
                            <p className="text-muted-foreground">Ready to call</p>
                        )}
                        {callStatus === "dialing" && (
                            <div className="flex flex-col items-center animate-pulse">
                                <Phone className="w-8 h-8 mb-2 text-yellow-500" />
                                <p>Connecting...</p>
                            </div>
                        )}
                        {callStatus === "connected" && (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex flex-col items-center">
                                        <User className="w-8 h-8 bg-gray-200 rounded-full p-1" />
                                        <span className="text-xs mt-1">You</span>
                                    </div>
                                    <div className="h-1 w-10 bg-green-500 animate-pulse" />
                                    <div className="flex flex-col items-center">
                                        <Bot className="w-8 h-8 bg-primary text-white rounded-full p-1" />
                                        <span className="text-xs mt-1">AI Agent</span>
                                    </div>
                                    <div className="h-1 w-10 bg-green-500 animate-pulse" />
                                    <div className="flex flex-col items-center">
                                        <Phone className="w-8 h-8 bg-gray-200 rounded-full p-1" />
                                        <span className="text-xs mt-1">Caller</span>
                                    </div>
                                </div>
                                <p className="text-green-600 font-medium">Connected</p>
                                <p className="text-xs text-muted-foreground">{formatDuration(callDuration)}</p>
                            </div>
                        )}
                        {callStatus === "ended" && (
                            <p className="text-destructive font-medium">Call Ended</p>
                        )}
                    </div>

                    {/* Agent Selection & Phone Input */}
                    {callStatus === "idle" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select AI Agent</label>
                                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents?.map((agent: any) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name} ({agent.provider})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {agents?.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No agents found. Create one in Agent Settings.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input
                                    type="tel"
                                    placeholder="Enter phone number (+1...)"
                                    className="text-center text-lg"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((key) => (
                                    <Button
                                        key={key}
                                        variant="outline"
                                        className="h-12 text-lg font-medium"
                                        onClick={() => setPhoneNumber(prev => prev + key)}
                                    >
                                        {key}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                        {callStatus === "idle" ? (
                            <Button
                                size="lg"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleCall}
                                disabled={!phoneNumber || !selectedAgentId}
                            >
                                <Phone className="mr-2 h-5 w-5" />
                                Start AI Call
                            </Button>
                        ) : callStatus === "connected" ? (
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <Button
                                    variant={isMuted ? "destructive" : "secondary"}
                                    onClick={handleToggleMute}
                                >
                                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleHangup}
                                >
                                    <PhoneOff className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : null}
                    </div>

                    {callStatus === "connected" && selectedAgent && (
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Active Agent</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {selectedAgent.name}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Live Transcript Card */}
            {callStatus === "connected" && (
                <Card className="flex-1 shadow-lg">
                    <CardHeader>
                        <CardTitle>Live Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {transcript.map((entry, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${entry.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                                }`}
                                        >
                                            <p className="text-xs font-medium mb-1">
                                                {entry.role === "user" ? "You" : "AI Agent"}
                                            </p>
                                            <p className="text-sm">{entry.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {transcript.length === 0 && (
                                    <p className="text-center text-muted-foreground">
                                        Waiting for conversation...
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
