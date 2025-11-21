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

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Allow if admin OR editing own profile
        const isAdmin = currentUser.role === "ADMIN";
        const isOwnProfile = currentUser.id === id;

        if (!isAdmin && !isOwnProfile) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, role, maxMinutes } = body;

        // Non-admin can't change role or maxMinutes
        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        if (isAdmin) {
            if (role) updateData.role = role;
            if (maxMinutes !== undefined) updateData.maxMinutes = maxMinutes;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
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

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Don't allow deleting yourself
        if (session.user.id === id) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id: id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
