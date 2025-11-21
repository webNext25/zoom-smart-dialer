"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, Mic, MicOff, Volume2, User, Bot, PhoneOff } from "lucide-react";
import { useAudioBridge } from "@/hooks/use-audio-bridge";

// Mock Zoom Video SDK Client
const mockZoomClient = {
    join: async () => new Promise(resolve => setTimeout(resolve, 1000)),
    leave: async () => { },
    getMediaStream: () => ({
        startAudio: async () => { },
        stopAudio: async () => { },
    }),
};

export function CustomAIDialer() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [callStatus, setCallStatus] = useState<"idle" | "dialing" | "connected" | "ended">("idle");
    const [isMuted, setIsMuted] = useState(false);
    const [aiActive, setAiActive] = useState(true);
    const [whisperMode, setWhisperMode] = useState(false);
    const [aiConfidence, setAiConfidence] = useState(0.85);
    const [suggestedResponse, setSuggestedResponse] = useState<string | null>(null);

    const { startBridge, stopBridge, isBridgeActive } = useAudioBridge();

    const handleCall = async () => {
        if (!phoneNumber) return;
        setCallStatus("dialing");

        // Simulate Zoom Video SDK Join & PSTN Dial out
        await mockZoomClient.join();

        // Simulate connection delay
        setTimeout(() => {
            setCallStatus("connected");
            // Auto-start AI bridge on connect
            if (aiActive) {
                const mockStream = new MediaStream();
                startBridge(mockStream, mockStream);
            }
        }, 2000);
    };

    const handleHangup = async () => {
        await mockZoomClient.leave();
        stopBridge();
        setCallStatus("ended");
        setTimeout(() => setCallStatus("idle"), 1500);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // In real SDK: client.getMediaStream().muteAudio()
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md shadow-lg border-2 border-primary/20">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Bot className="w-6 h-6 text-primary" />
                        AI Smart Dialer
                    </CardTitle>
                    <CardDescription>
                        Powered by Zoom Video SDK & Vapi
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
                                <p>Dialing {phoneNumber}...</p>
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
                                        <Bot className={`w-8 h-8 rounded-full p-1 ${aiActive ? "bg-primary text-white" : "bg-gray-200"}`} />
                                        <span className="text-xs mt-1">AI Agent</span>
                                    </div>
                                    <div className="h-1 w-10 bg-green-500 animate-pulse" />
                                    <div className="flex flex-col items-center">
                                        <Phone className="w-8 h-8 bg-gray-200 rounded-full p-1" />
                                        <span className="text-xs mt-1">Customer</span>
                                    </div>
                                </div>
                                <p className="text-green-600 font-medium">Connected</p>
                                <p className="text-xs text-muted-foreground">00:42</p>
                            </div>
                        )}
                        {callStatus === "ended" && (
                            <p className="text-destructive font-medium">Call Ended</p>
                        )}
                    </div>

                    {/* Keypad / Input */}
                    {callStatus === "idle" && (
                        <div className="space-y-4">
                            <Input
                                type="tel"
                                placeholder="Enter phone number (+1...)"
                                className="text-center text-lg"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
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

                    {/* Smart Handoff Section */}
                    {callStatus === "connected" && (
                        <Card className="bg-muted/50">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${aiConfidence > 0.7 ? 'bg-green-500' : aiConfidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                        <span className="text-sm font-medium">AI Confidence: {Math.round(aiConfidence * 100)}%</span>
                                    </div>
                                    <Button
                                        variant={whisperMode ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setWhisperMode(!whisperMode)}
                                    >
                                        {whisperMode ? "Whisper: ON" : "Whisper: OFF"}
                                    </Button>
                                </div>

                                {whisperMode && (
                                    <div className="bg-background rounded-md p-3 border-l-4 border-primary">
                                        <p className="text-xs text-muted-foreground mb-1">AI Suggestion (Only you can see this):</p>
                                        <p className="text-sm italic">
                                            {suggestedResponse || "Ask them about their budget and timeline for implementation."}
                                        </p>
                                    </div>
                                )}

                                {aiConfidence < 0.5 && !whisperMode && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-2 border border-yellow-200 dark:border-yellow-800">
                                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                            ⚠️ AI uncertainty detected. Consider enabling Whisper Mode or taking over.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                        {callStatus === "idle" ? (
                            <Button
                                size="lg"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleCall}
                                disabled={!phoneNumber}
                            >
                                <Phone className="mr-2 h-5 w-5" />
                                Start AI Call
                            </Button>
                        ) : (
                            <div className="grid grid-cols-3 gap-4 w-full">
                                <Button
                                    variant={isMuted ? "destructive" : "secondary"}
                                    onClick={toggleMute}
                                >
                                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </Button>
                                <Button
                                    variant={aiActive ? "default" : "outline"}
                                    onClick={() => setAiActive(!aiActive)}
                                    className={aiActive ? "bg-primary" : ""}
                                >
                                    <Bot className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleHangup}
                                >
                                    <PhoneOff className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {callStatus === "connected" && (
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-2">AI Status</p>
                            {aiActive ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Listening & Responding
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Paused (Human Only)
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
