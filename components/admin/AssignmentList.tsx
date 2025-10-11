"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Attachment {
    type: 'drive' | 'youtube' | 'file' | 'link';
    url: string;
    name?: string;
}

interface Assignment {
    _id: string;
    title: string;
    week: number;
    instructions?: string;
    dueDate?: string | null;
    points?: number;
    attachments: Attachment[];
    createdAt: string;
}

interface AssignmentListProps {
    courseId: string;
    week: number;
    refreshTrigger?: number;
}

export default function AssignmentList({ courseId, week, refreshTrigger }: AssignmentListProps) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const slugOrId = courseId;
            console.log('Fetching assignments for courseId:', slugOrId, 'week:', week);
            const res = await fetch(`/api/courses/${slugOrId}/assignments?week=${week}`);
            console.log('API Response status:', res.status);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'Failed to load assignments');
            }

            const json = await res.json();
            console.log('Assignments loaded:', json.data);
            setAssignments(json.data || []);
        } catch (err) {
            console.error('Error loading assignments', err);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchAssignments();
    }, [courseId, week, refreshTrigger]);

    if (!courseId) return null; return (
        <div className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Assignments — Week {week}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

                    {!loading && assignments.length === 0 && (
                        <p className="text-sm text-muted-foreground">No assignments for this week yet.</p>
                    )}

                    <div className="space-y-4 mt-4">
                        {assignments.map(a => (
                            <div key={a._id} className="p-4 border rounded-md bg-white shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{a.title}</h4>
                                    <div className="text-sm text-muted-foreground">{a.points ?? 100} pts</div>
                                </div>

                                {a.instructions && (
                                    <p className="mt-2 text-sm text-gray-600">{a.instructions}</p>
                                )}

                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div>Due: {a.dueDate ? format(new Date(a.dueDate), 'PP p') : 'No due date'}</div>
                                    <div>Created: {format(new Date(a.createdAt), 'PP')}</div>
                                </div>

                                {a.attachments && a.attachments.length > 0 && (
                                    <div className="mt-3">
                                        <div className="text-sm font-medium mb-2">Attachments</div>
                                        <div className="flex flex-wrap gap-2">
                                            {a.attachments.map((att, i) => (
                                                <Button key={i} variant="ghost" asChild>
                                                    <a href={att.url} target="_blank" rel="noreferrer" className="underline text-sm">{att.name || att.type}</a>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
