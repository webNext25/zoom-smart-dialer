import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { agentSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const agent = await prisma.agent.findUnique({
            where: { id },
            include: {
                knowledgeBase: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Check authorization
        if (agent.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(agent);
    } catch (error) {
        console.error("Error fetching agent:", error);
        return NextResponse.json(
            { error: "Failed to fetch agent" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const existingAgent = await prisma.agent.findUnique({
            where: { id },
        });

        if (!existingAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        if (existingAgent.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const validatedData = agentSchema.partial().parse(body);

        const agent = await prisma.agent.update({
            where: { id },
            data: validatedData,
            include: {
                knowledgeBase: true,
            },
        });

        return NextResponse.json(agent);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Error updating agent:", error);
        return NextResponse.json(
            { error: "Failed to update agent" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const agent = await prisma.agent.findUnique({
            where: { id },
        });

        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        if (agent.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.agent.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting agent:", error);
        return NextResponse.json(
            { error: "Failed to delete agent" },
            { status: 500 }
        );
    }
}
