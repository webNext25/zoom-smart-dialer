"use client";

import { useStore } from "@/lib/store";
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
import { User } from "@/types";

export default function CustomersPage() {
    const { users, updateUser } = useStore();
    const customers = users.filter((u) => u.role === "customer");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [limitInput, setLimitInput] = useState<number>(0);

    const handleEditLimit = (user: User) => {
        setEditingId(user.id);
        setLimitInput(user.limits?.maxMinutes || 0);
    };

    const handleSaveLimit = (userId: string) => {
        updateUser(userId, {
            limits: {
                maxMinutes: limitInput,
                usedMinutes: users.find((u) => u.id === userId)?.limits?.usedMinutes || 0,
            },
        });
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <Button>Add Customer</Button>
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
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.limits?.usedMinutes || 0}</TableCell>
                                    <TableCell>
                                        {editingId === customer.id ? (
                                            <Input
                                                type="number"
                                                value={limitInput}
                                                onChange={(e) => setLimitInput(Number(e.target.value))}
                                                className="w-24 h-8"
                                            />
                                        ) : (
                                            customer.limits?.maxMinutes || 0
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
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
