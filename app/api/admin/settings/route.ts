import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SettingsService } from "@/lib/settings";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await SettingsService.getAll();

        // Mask sensitive values for display
        const masked = JSON.parse(JSON.stringify(settings));
        for (const category in masked) {
            for (const key in masked[category]) {
                const value = masked[category][key].value;
                if (value && !masked[category][key].isPublic) {
                    // Mask private values
                    masked[category][key].displayValue = value.length > 8
                        ? value.substring(0, 4) + '***' + value.substring(value.length - 4)
                        : '***';
                } else {
                    masked[category][key].displayValue = value;
                }
                // Don't send actual value to client
                delete masked[category][key].value;
            }
        }

        return NextResponse.json(masked);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { settings } = body;

        if (!settings || !Array.isArray(settings)) {
            return NextResponse.json(
                { error: "Invalid request format" },
                { status: 400 }
            );
        }

        // Get admin user
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update each setting
        for (const setting of settings) {
            const { key, value, category, isPublic } = setting;

            if (!key || value === undefined || !category) {
                continue;
            }

            await SettingsService.set(key, value, category, isPublic || false, user.id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
