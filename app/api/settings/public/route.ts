import { NextResponse } from "next/server";
import { SettingsService } from "@/lib/settings";

export async function GET(req: Request) {
    try {
        const publicSettings = await SettingsService.getPublicSettings();
        return NextResponse.json(publicSettings);
    } catch (error) {
        console.error("Error fetching public settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}
