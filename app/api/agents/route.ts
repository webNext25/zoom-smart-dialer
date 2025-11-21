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

        const agents = await prisma.agent.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(agents);
    } catch (error) {
        console.error("Error fetching agents:", error);
        return NextResponse.json(
            { error: "Failed to fetch agents" },
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
        const { name, provider, modelProvider, systemPrompt, firstMessage, voiceId } = body;

        if (!name || !provider || !modelProvider || !systemPrompt || !firstMessage) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const agent = await prisma.agent.create({
            data: {
                userId: user.id,
                name,
                provider,
                modelProvider,
                systemPrompt,
                firstMessage,
                voiceId: voiceId || "", // Allow empty string
            },
        });

        return NextResponse.json(agent, { status: 201 });
    } catch (error) {
        console.error("Error creating agent:", error);
        return NextResponse.json(
            { error: "Failed to create agent" },
            { status: 500 }
        );
    }
}
