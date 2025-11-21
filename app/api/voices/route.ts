import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user to check role
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return public voices + voices assigned to this user
        const voices = await prisma.voice.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    { assignedTo: { has: user.id } },
                ],
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(voices);
    } catch (error) {
        console.error("Error fetching voices:", error);
        return NextResponse.json(
            { error: "Failed to fetch voices" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, provider, providerVoiceId, isPublic } = body;

        if (!name || !provider || !providerVoiceId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const voice = await prisma.voice.create({
            data: {
                name,
                provider,
                providerVoiceId,
                isPublic: isPublic || false,
                assignedTo: [],
            },
        });

        return NextResponse.json(voice, { status: 201 });
    } catch (error) {
        console.error("Error creating voice:", error);
        return NextResponse.json(
            { error: "Failed to create voice" },
            { status: 500 }
        );
    }
}
