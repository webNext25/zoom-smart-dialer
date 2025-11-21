import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";

export function useAudioBridge() {
    const [isBridgeActive, setIsBridgeActive] = useState(false);
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [transcript, setTranscript] = useState<{ role: "agent" | "user"; text: string }[]>([]);

    const vapiRef = useRef<Vapi | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize Vapi client
    useEffect(() => {
        // Replace with your actual Vapi public key
        const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_KEY || "your-vapi-public-key-here";

        vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);

        // Set up event listeners
        vapiRef.current.on("call-start", () => {
            console.log("Vapi call started");
            setIsBridgeActive(true);
        });

        vapiRef.current.on("call-end", () => {
            console.log("Vapi call ended");
            setIsBridgeActive(false);
            setTranscript([]);
        });

        vapiRef.current.on("speech-start", () => {
            console.log("User started speaking");
        });

        vapiRef.current.on("speech-end", () => {
            console.log("User stopped speaking");
        });

        vapiRef.current.on("message", (message: any) => {
            if (message.type === "transcript") {
                setTranscript(prev => [...prev, {
                    role: message.role === "assistant" ? "agent" : "user",
                    text: message.transcript
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
        };
    }, []);

    const startBridge = async (zoomStream?: MediaStream, aiStream?: MediaStream) => {
        if (!vapiRef.current) {
            console.error("Vapi client not initialized");
            return;
        }

        try {
            // Start Vapi call with inline assistant configuration
            // Type assertion for Vapi configuration
            await vapiRef.current.start({
                assistant: {
                    firstMessage: "Hello! How can I help you today?",
                    model: {
                        provider: "openai",
                        model: "gpt-4",
                        messages: [{
                            role: "system",
                            content: "You are a helpful assistant."
                        }]
                    },
                    voice: {
                        provider: "11labs",
                        voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || "bIHbv24MWmeRgasZH58o"
                    }
                }
            } as any);

            setIsBridgeActive(true);
            setIsMonitoring(true);
            setIsMicEnabled(false); // AI starts with control
        } catch (error) {
            console.error("Failed to start Vapi call:", error);
        }
    };

    const stopBridge = () => {
        if (vapiRef.current) {
            vapiRef.current.stop();
        }
        setIsBridgeActive(false);
        setIsMonitoring(false);
        setTranscript([]);
    };

    const toggleMic = () => {
        if (!vapiRef.current) return;

        const newMicState = !isMicEnabled;
        setIsMicEnabled(newMicState);

        // Mute/unmute Vapi
        vapiRef.current.setMuted(!newMicState);
    };

    return {
        isBridgeActive,
        isMicEnabled,
        isMonitoring,
        transcript,
        startBridge,
        stopBridge,
        toggleMic,
    };
}
