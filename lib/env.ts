import { z } from "zod";

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),

    // Authentication
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),

    // Node Environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Vapi (Server-side)
    VAPI_PRIVATE_KEY: z.string().optional(),

    // Vapi (Client-side)
    NEXT_PUBLIC_VAPI_KEY: z.string().optional(),

    // ElevenLabs (Server-side)
    ELEVENLABS_API_KEY: z.string().optional(),

    // ElevenLabs (Client-side)
    NEXT_PUBLIC_ELEVENLABS_VOICE_ID: z.string().optional(),

    // Zoom
    ZOOM_CLIENT_ID: z.string().optional(),
    ZOOM_CLIENT_SECRET: z.string().optional(),
    ZOOM_SDK_KEY: z.string().optional(),
    ZOOM_SDK_SECRET: z.string().optional(),

    // OpenAI
    OPENAI_API_KEY: z.string().optional(),

    // UploadThing
    UPLOADTHING_SECRET: z.string().optional(),
    UPLOADTHING_APP_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("❌ Environment validation failed:");
            console.error(JSON.stringify(error.issues, null, 2));
            throw new Error(
                `Environment validation failed. Missing or invalid variables: ${error.issues
                    .map((e: any) => e.path.join("."))
                    .join(", ")}`
            );
        }
        throw error;
    }
}

// Validate on module import (runs on server startup)
export const env = validateEnv();

// Re-export for convenience
export default env;
