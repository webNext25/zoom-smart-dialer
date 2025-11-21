import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { useSetting } from "@/hooks/use-settings";

interface Agent {
    id: string;
    name: string;
    provider: string;
    modelProvider: string;
    systemPrompt: string;
    firstMessage: string;
    voiceId: string;
}

interface CallRecordingData {
    phoneNumber: string;
    duration: number;
    transcript: string;
    sentiment?: string;
}

export function useAudioBridge() {
    const [isBridgeActive, setIsBridgeActive] = useState(false);
    const [transcript, setTranscript] = useState<{ role: "agent" | "user"; text: string; timestamp: Date }[]>([]);
    const [callDuration, setCallDuration] = useState(0);

    // Load Vapi key from database settings
    const { value: vapiKey } = useSetting("vapi.publicKey", process.env.NEXT_PUBLIC_VAPI_KEY || "");
    const { value: defaultVoiceId } = useSetting("elevenlabs.defaultVoiceId", process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || "bIHbv24MWmeRgasZH58o");

    const vapiRef = useRef<Vapi | null>(null);
    const callStartTimeRef = useRef<Date | null>(null);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Vapi client
    useEffect(() => {
        if (!vapiKey) {
            console.warn("Vapi key not configured");
            return;
        }

        vapiRef.current = new Vapi(vapiKey);

        // Set up event listeners
        vapiRef.current.on("call-start", () => {
            console.log("Vapi call started");
            setIsBridgeActive(true);
            callStartTimeRef.current = new Date();

            // Start duration timer
            durationIntervalRef.current = setInterval(() => {
                if (callStartTimeRef.current) {
                    const elapsed = Math.floor((Date.now() - callStartTimeRef.current.getTime()) / 1000);
                    setCallDuration(elapsed);
                }
            }, 1000);
        });

        vapiRef.current.on("call-end", async () => {
            console.log("Vapi call ended");
            setIsBridgeActive(false);

            // Stop duration timer
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
                durationIntervalRef.current = null;
            }

            // Save recording to database
            if (transcript.length > 0) {
                await saveCallRecording({
                    phoneNumber: "Unknown", // Will be populated from call context
                    duration: callDuration,
                    transcript: transcript.map(t => `${t.role}: ${t.text}`).join("\n"),
                    sentiment: "neutral",
                });
            }

            // Reset state
            setTranscript([]);
            setCallDuration(0);
            callStartTimeRef.current = null;
        });

        vapiRef.current.on("speech-start", () => {
            console.log("User started speaking");
        });

        vapiRef.current.on("speech-end", () => {
            console.log("User stopped speaking");
        });

        vapiRef.current.on("message", (message: any) => {
            console.log("Vapi message:", message);

            if (message.type === "transcript" && message.transcript) {
                setTranscript(prev => [...prev, {
                    role: message.role === "assistant" ? "agent" : "user",
                    text: message.transcript,
                    timestamp: new Date()
                }]);
            }
        });

        vapiRef.current.on("error", (error: any) => {
            console.error("Vapi error:", error);
        });

        return () => {
            if (vapiRef.current) {
                vapiRef.current.stop();
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, []);

    const saveCallRecording = async (data: CallRecordingData) => {
        try {
            const response = await fetch("/api/recordings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phoneNumber: data.phoneNumber,
                    duration: data.duration,
                    transcript: data.transcript,
                    sentiment: data.sentiment || "neutral",
                    audioUrl: null,
                    highlights: { /* Can be populated from Vapi analytics */ }
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save recording");
            }

            console.log("Call recording saved successfully");
        } catch (error) {
            console.error("Error saving call recording:", error);
        }
    };

    const startCall = useCallback(async (agent: Agent, phoneNumber: string) => {
        if (!vapiRef.current) {
            console.error("Vapi client not initialized");
            return;
        }

        try {
            // Start Vapi call with agent configuration
            await vapiRef.current.start({
                assistant: {
                    firstMessage: agent.firstMessage,
                    model: {
                        provider: agent.provider as any,
                        model: agent.modelProvider,
                        messages: [{
                            role: "system",
                            content: agent.systemPrompt
                        }]
                    },
                    voice: {
                        provider: "11labs",
                        voiceId: agent.voiceId || defaultVoiceId
                    }
                },
                // Optional: Add phone number for outbound calls
                // phoneNumberId: "your-vapi-phone-number-id"
            } as any);

            setIsBridgeActive(true);
        } catch (error) {
            console.error("Failed to start Vapi call:", error);
            throw error;
        }
    }, []);

    const stopCall = useCallback(() => {
        if (vapiRef.current) {
            vapiRef.current.stop();
        }
        setIsBridgeActive(false);
    }, []);

    const toggleMute = useCallback(() => {
        if (vapiRef.current) {
            const isMuted = vapiRef.current.isMuted();
            vapiRef.current.setMuted(!isMuted);
            return !isMuted;
        }
        return false;
    }, []);

    return {
        isBridgeActive,
        transcript,
        callDuration,
        startCall,
        stopCall,
        toggleMute,
    };
}
