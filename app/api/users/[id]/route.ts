import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        // Users can update themselves, admins can update anyone
        if (session.user.id !== id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { name, maxMinutes, usedMinutes } = body;

        const updateData: any = {};
        if (name) updateData.name = name;

        // Only admins can update limits
        if (session.user.role === "ADMIN") {
            if (maxMinutes !== undefined) updateData.maxMinutes = maxMinutes;
            if (usedMinutes !== undefined) updateData.usedMinutes = usedMinutes;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                maxMinutes: true,
                usedMinutes: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
