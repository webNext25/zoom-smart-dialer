import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        // Verify the agent belongs to the user
        const existingAgent = await prisma.agent.findFirst({
            where: {
                id: id,
                userId: user.id,
            },
        });

        if (!existingAgent) {
            return NextResponse.json(
                { error: "Agent not found or unauthorized" },
                { status: 404 }
            );
        }

        const agent = await prisma.agent.update({
            where: { id: id },
            data: {
                ...(name && { name }),
                ...(provider && { provider }),
                ...(modelProvider && { modelProvider }),
                ...(systemPrompt && { systemPrompt }),
                ...(firstMessage && { firstMessage }),
                ...(voiceId !== undefined && { voiceId }),
            },
        });

        return NextResponse.json(agent);
    } catch (error) {
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
    const { id } = await params;
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

        // Verify the agent belongs to the user
        const existingAgent = await prisma.agent.findFirst({
            where: {
                id: id,
                userId: user.id,
            },
        });

        if (!existingAgent) {
            return NextResponse.json(
                { error: "Agent not found or unauthorized" },
                { status: 404 }
            );
        }

        await prisma.agent.delete({
            where: { id: id },
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
