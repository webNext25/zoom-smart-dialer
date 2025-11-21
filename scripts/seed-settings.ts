import { PrismaClient } from "@prisma/client";
import { SettingsService } from "../lib/settings";

const prisma = new PrismaClient();

async function seedSettings() {
    console.log("🌱 Seeding system settings...");

    const settings = [
        // AI Providers
        { key: "openai.apiKey", value: process.env.OPENAI_API_KEY || "", category: "ai", isPublic: false },

        // Voice Services
        { key: "vapi.publicKey", value: process.env.NEXT_PUBLIC_VAPI_KEY || "", category: "voice", isPublic: true },
        { key: "vapi.privateKey", value: process.env.VAPI_PRIVATE_KEY || "", category: "voice", isPublic: false },
        { key: "elevenlabs.apiKey", value: process.env.ELEVENLABS_API_KEY || "", category: "voice", isPublic: false },
        { key: "elevenlabs.defaultVoiceId", value: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || "bIHbv24MWmeRgasZH58o", category: "voice", isPublic: true },

        // Zoom Integration
        { key: "zoom.clientId", value: process.env.ZOOM_CLIENT_ID || "", category: "zoom", isPublic: true },
        { key: "zoom.clientSecret", value: process.env.ZOOM_CLIENT_SECRET || "", category: "zoom", isPublic: false },
        { key: "zoom.sdkKey", value: process.env.ZOOM_SDK_KEY || "", category: "zoom", isPublic: true },
        { key: "zoom.sdkSecret", value: process.env.ZOOM_SDK_SECRET || "", category: "zoom", isPublic: false },

        // File Upload
        { key: "uploadthing.secret", value: process.env.UPLOADTHING_SECRET || "", category: "upload", isPublic: false },
        { key: "uploadthing.appId", value: process.env.UPLOADTHING_APP_ID || "", category: "upload", isPublic: false },
    ];

    // Get admin user (first user with ADMIN role)
    const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    });

    if (!adminUser) {
        console.warn("⚠️  No admin user found. Settings will be created without updatedBy.");
    }

    for (const setting of settings) {
        if (setting.value) {
            try {
                await SettingsService.set(
                    setting.key,
                    setting.value,
                    setting.category,
                    setting.isPublic ?? false,
                    adminUser?.id || "system"
                );
                console.log(`✓ Seeded ${setting.key}`);
            } catch (error) {
                console.error(`✗ Failed to seed ${setting.key}:`, error);
            }
        } else {
            console.log(`⊘ Skipped ${setting.key} (no value in env)`);
        }
    }

    console.log("✅ Settings seeding complete!");
}

seedSettings()
    .catch((e) => {
        console.error("Error seeding settings:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
