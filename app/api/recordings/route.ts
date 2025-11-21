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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const cursor = searchParams.get('cursor');
        const search = searchParams.get('search') || '';
        const sentiment = searchParams.get('sentiment') || 'all';

        // Build where clause
        const where: any = {
            userId: user.id,
        };

        // Add search filter
        if (search) {
            where.OR = [
                { phoneNumber: { contains: search } },
                { transcript: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Add sentiment filter
        if (sentiment && sentiment !== 'all') {
            where.sentiment = sentiment;
        }

        // Fetch recordings with pagination
        const recordings = await prisma.callRecording.findMany({
            where,
            take: limit + 1, // Get one extra to check if there's more
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: { createdAt: "desc" },
        });

        // Check if there are more results
        const hasMore = recordings.length > limit;
        const results = hasMore ? recordings.slice(0, limit) : recordings;

        return NextResponse.json({
            recordings: results,
            hasMore,
            nextCursor: hasMore ? results[results.length - 1].id : null,
        });
    } catch (error) {
        console.error("Error fetching recordings:", error);
        return NextResponse.json(
            { error: "Failed to fetch recordings" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await req.json();
        const { phoneNumber, duration, transcript, sentiment, audioUrl, highlights } = body;

        const recording = await prisma.callRecording.create({
            data: {
                userId: user.id,
                phoneNumber: phoneNumber || "Unknown",
                duration: duration || 0,
                transcript: transcript || "",
                sentiment: sentiment || "neutral",
                audioUrl: audioUrl || null,
                highlights: highlights || {},
            },
        });

        return NextResponse.json(recording, { status: 201 });
    } catch (error) {
        console.error("Error creating recording:", error);
        return NextResponse.json(
            { error: "Failed to create recording" },
            { status: 500 }
        );
    }
}
