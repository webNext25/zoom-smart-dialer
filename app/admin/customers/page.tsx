"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminCustomersPage() {
    const { data: users, error, isLoading } = useSWR("/api/users", fetcher);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [limitInput, setLimitInput] = useState<number>(0);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        maxMinutes: 100,
    });

    const customers = Array.isArray(users) ? users.filter((u: any) => u.role === "CUSTOMER") : [];

    const handleEditLimit = (user: any) => {
        setEditingId(user.id);
        setLimitInput(user.maxMinutes || 0);
    };

    const handleSaveLimit = async (userId: string) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ maxMinutes: limitInput }),
            });

            if (!res.ok) throw new Error("Failed to update limit");

            toast.success("Limit updated successfully");
            setEditingId(null);
            mutate("/api/users");
        } catch (error) {
            toast.error("Failed to update limit");
        }
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords match
        if (newUser.password !== newUser.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password,
                    maxMinutes: newUser.maxMinutes,
                    role: "CUSTOMER",
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create customer");
            }

            toast.success("Customer created successfully");
            setIsAddOpen(false);
            setNewUser({ name: "", email: "", password: "", confirmPassword: "", maxMinutes: 100 });
            mutate("/api/users");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteCustomer = async (userId: string, name: string) => {
        if (confirm(`Delete customer ${name}?`)) {
            try {
                const res = await fetch(`/api/users/${userId}`, {
                    method: "DELETE",
                });
                if (!res.ok) throw new Error("Failed to delete");
                toast.success("Customer deleted");
                mutate("/api/users");
            } catch (error) {
                toast.error("Failed to delete customer");
            }
        }
    };

    if (error) return <div>Error loading users</div>;

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-6 flex-1" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Customer</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Customer</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCustomer} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={newUser.confirmPassword}
                                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minutes">Monthly Minute Limit</Label>
                                <Input
                                    id="minutes"
                                    type="number"
                                    value={newUser.maxMinutes}
                                    onChange={(e) => setNewUser({ ...newUser, maxMinutes: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Create Customer</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Limit (mins)</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-secondary h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-primary h-full"
                                                    style={{
                                                        width: `${Math.min((customer.usedMinutes / customer.maxMinutes) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {customer.usedMinutes}/{customer.maxMinutes}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {editingId === customer.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={limitInput}
                                                    onChange={(e) => setLimitInput(Number(e.target.value))}
                                                    className="w-20"
                                                />
                                                <Button size="sm" onClick={() => handleSaveLimit(customer.id)}>
                                                    Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditLimit(customer)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
