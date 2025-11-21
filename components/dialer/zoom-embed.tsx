"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function ZoomEmbed() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            const data = e.data;
            if (data) {
                switch (data.type) {
                    case "zp-call-ringing-event":
                        console.log("Call Ringing:", data.data);
                        break;
                    case "zp-call-connected-event":
                        console.log("Call Connected:", data.data);
                        break;
                    case "zp-call-ended-event":
                        console.log("Call Ended:", data.data);
                        break;
                }
            }
        };

        window.addEventListener("message", handleMessage);

        // Initialize widget when iframe loads
        const iframe = iframeRef.current;
        if (iframe) {
            iframe.onload = () => {
                setIsReady(true);
                // Initialize configuration
                iframe.contentWindow?.postMessage(
                    {
                        type: "zp-init-config",
                        data: {
                            enableSavingLog: true,
                            enableAutoLog: true,
                            enableContactSearching: true,
                            enableContactMatching: true,
                            enableAISummary: true,
                        },
                    },
                    "https://applications.zoom.us"
                );
            };
        }

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    return (
        <Card className="w-full h-[600px] overflow-hidden bg-black relative border-0 shadow-2xl rounded-xl">
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    Loading Zoom Phone...
                </div>
            )}
            <iframe
                ref={iframeRef}
                src="https://applications.zoom.us/integration/phone/embeddablephone/home"
                id="zoom-embeddable-phone-iframe"
                allow="clipboard-read; clipboard-write https://applications.zoom.us; microphone; camera; autoplay"
                className="w-full h-full border-0"
                title="Zoom Phone Smart Embed"
            />
        </Card>
    );
}
