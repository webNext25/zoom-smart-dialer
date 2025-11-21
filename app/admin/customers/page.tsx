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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CustomersPage() {
    const { data: users, error, isLoading } = useSWR("/api/users", fetcher);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [limitInput, setLimitInput] = useState<number>(0);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
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
                method: "PUT",
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
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newUser,
                    role: "CUSTOMER",
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create customer");
            }

            toast.success("Customer created successfully");
            setIsAddOpen(false);
            setNewUser({ name: "", email: "", password: "", maxMinutes: 100 });
            mutate("/api/users");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading users</div>;

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
                                <TableHead>Usage (Min)</TableHead>
                                <TableHead>Limit (Min)</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.usedMinutes || 0}</TableCell>
                                    <TableCell>
                                        {editingId === customer.id ? (
                                            <Input
                                                type="number"
                                                value={limitInput}
                                                onChange={(e) => setLimitInput(Number(e.target.value))}
                                                className="w-24 h-8"
                                            />
                                        ) : (
                                            customer.maxMinutes || 0
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === customer.id ? (
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleSaveLimit(customer.id)}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="outline" onClick={() => handleEditLimit(customer)}>
                                                Edit Limit
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
