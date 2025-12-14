'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Attachment {
    type: 'drive' | 'youtube' | 'file' | 'link';
    url: string;
    name?: string;
}

interface AssignmentFormProps {
    courseId: string;
    week: number;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AssignmentForm({ courseId, week, onClose, onSuccess }: AssignmentFormProps) {
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [points, setPoints] = useState('100');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [saving, setSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Dialog states for adding attachments
    const [showDriveDialog, setShowDriveDialog] = useState(false);
    const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [tempUrl, setTempUrl] = useState('');
    const [tempName, setTempName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle adding Drive link
    const handleAddDrive = () => {
        if (tempUrl.trim()) {
            setAttachments([...attachments, { type: 'drive', url: tempUrl, name: tempName || 'Drive File' }]);
            setTempUrl('');
            setTempName('');
            setShowDriveDialog(false);
            toast.success('Drive link added');
        }
    };

    // Handle adding YouTube link
    const handleAddYouTube = () => {
        if (tempUrl.trim()) {
            setAttachments([...attachments, { type: 'youtube', url: tempUrl, name: tempName || 'YouTube Video' }]);
            setTempUrl('');
            setTempName('');
            setShowYouTubeDialog(false);
            toast.success('YouTube link added');
        }
    };

    // Handle adding custom link
    const handleAddLink = () => {
        if (tempUrl.trim()) {
            setAttachments([...attachments, { type: 'link', url: tempUrl, name: tempName || 'Link' }]);
            setTempUrl('');
            setTempName('');
            setShowLinkDialog(false);
            toast.success('Link added');
        }
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast.info('Uploading file...');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'document');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Upload failed');
            }

            const newAttachment = { type: 'file' as const, url: data.url, name: file.name };
            const newAttachments = [...attachments, newAttachment];
            setAttachments(newAttachments);
            toast.success(`File "${file.name}" uploaded successfully`);

            // Auto-save draft with new attachment
            await fetch(`/api/courses/${courseId}/assignments/draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    week,
                    title,
                    instructions,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    points: parseInt(points) || 100,
                    attachments: newAttachments.map(a => ({ type: a.type, url: a.url, name: a.name })),
                    isDraft: true
                }),
            });

            // Auto-save main assignment as well
            await fetch(`/api/courses/${courseId}/assignments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    week,
                    title,
                    instructions,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    points: parseInt(points) || 100,
                    attachments: newAttachments.map(a => ({ type: a.type, url: a.url, name: a.name })),
                }),
            });

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload file');
        }
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            toast.info('Uploading file...');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'document');

            fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        throw new Error(data.error || 'Upload failed');
                    }
                    setAttachments([...attachments, { type: 'file', url: data.url, name: file.name }]);
                    toast.success(`File "${file.name}" uploaded successfully`);
                })
                .catch(error => {
                    console.error('Upload error:', error);
                    toast.error(error instanceof Error ? error.message : 'Failed to upload file');
                });
        }
    };

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
        toast.success('Attachment removed');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);

        try {
            console.log('Creating assignment with courseId:', courseId);
            const response = await fetch(`/api/courses/${courseId}/assignments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    week,
                    title,
                    instructions,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    points: parseInt(points) || 100,
                    attachments: attachments.map(a => ({ type: a.type, url: a.url, name: a.name })),
                }),
            });

            const data = await response.json();
            console.log('API Response:', { status: response.status, data });

            if (!response.ok) {
                const errorMessage = data.error || data.details?.join(', ') || 'Failed to create assignment';
                throw new Error(errorMessage);
            }

            toast.success('Assignment created successfully!');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error creating assignment:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create assignment';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Assignment Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Assignment</h2>
                            <Button type="button" variant="ghost" onClick={onClose}>
                                ✕
                            </Button>
                        </div>

                        {/* Title Field */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-blue-600">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter assignment title"
                                required
                                className="border-0 border-b-2 border-blue-500 rounded-none focus:ring-0 focus:border-blue-600 px-0"
                            />
                            <p className="text-xs text-gray-500">*Required</p>
                        </div>

                        {/* Instructions Field */}
                        <div className="space-y-2">
                            <Label htmlFor="instructions">Instructions (optional)</Label>
                            <div className="border rounded-md p-3 bg-gray-50">
                                <textarea
                                    id="instructions"
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Add instructions for students..."
                                    rows={6}
                                    className="w-full bg-transparent border-none focus:outline-none resize-none"
                                />
                                {/* Formatting toolbar */}
                                <div className="flex gap-2 mt-2 pt-2 border-t">
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Bold">
                                        <strong>B</strong>
                                    </button>
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Italic">
                                        <em>I</em>
                                    </button>
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Underline">
                                        <u>U</u>
                                    </button>
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded" title="List">
                                        ≡
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Attach Section */}
                        <div className="space-y-3">
                            <Label>Attach</Label>
                            <div className="flex gap-4 items-center">
                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded"
                                    onClick={() => setShowDriveDialog(true)}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M12 2L2 17h7l3 5 10-17h-7z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs">Drive</span>
                                </button>

                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded"
                                    onClick={() => setShowYouTubeDialog(true)}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                                            <path fill="#FF0000" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs">YouTube</span>
                                </button>

                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <span className="text-xs">Upload</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,image/*"
                                />

                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded"
                                    onClick={() => setShowLinkDialog(true)}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                    <span className="text-xs">Link</span>
                                </button>
                            </div>

                            {/* Drag and Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                    isDragOver
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-700">Drag and drop files here</p>
                                    <p className="text-xs text-gray-500">or click the Upload button above</p>
                                </div>
                            </div>

                            {/* Display attached files */}
                            {attachments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {attachments.map((attachment, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                            <div className="flex items-center gap-2">
                                                {attachment.type === 'drive' && (
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M12 2L2 17h7l3 5 10-17h-7z" />
                                                    </svg>
                                                )}
                                                {attachment.type === 'youtube' && (
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                        <path fill="#FF0000" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                    </svg>
                                                )}
                                                {attachment.type === 'file' && (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                                {attachment.type === 'link' && (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{attachment.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">{attachment.url}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Drive Link Dialog */}
                        {showDriveDialog && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <h3 className="text-lg font-semibold mb-4">Add Google Drive Link</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="drive-url">Drive URL</Label>
                                            <Input
                                                id="drive-url"
                                                value={tempUrl}
                                                onChange={(e) => setTempUrl(e.target.value)}
                                                placeholder="https://drive.google.com/..."
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="drive-name">Name (optional)</Label>
                                            <Input
                                                id="drive-name"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                placeholder="My Drive File"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => { setShowDriveDialog(false); setTempUrl(''); setTempName(''); }}>
                                                Cancel
                                            </Button>
                                            <Button type="button" onClick={handleAddDrive}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* YouTube Link Dialog */}
                        {showYouTubeDialog && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <h3 className="text-lg font-semibold mb-4">Add YouTube Video</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="youtube-url">YouTube URL</Label>
                                            <Input
                                                id="youtube-url"
                                                value={tempUrl}
                                                onChange={(e) => setTempUrl(e.target.value)}
                                                placeholder="https://youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="youtube-name">Name (optional)</Label>
                                            <Input
                                                id="youtube-name"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                placeholder="Lecture Video"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => { setShowYouTubeDialog(false); setTempUrl(''); setTempName(''); }}>
                                                Cancel
                                            </Button>
                                            <Button type="button" onClick={handleAddYouTube}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Link Dialog */}
                        {showLinkDialog && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <h3 className="text-lg font-semibold mb-4">Add Link</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="link-url">URL</Label>
                                            <Input
                                                id="link-url"
                                                value={tempUrl}
                                                onChange={(e) => setTempUrl(e.target.value)}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="link-name">Name (optional)</Label>
                                            <Input
                                                id="link-name"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                placeholder="Resource Link"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => { setShowLinkDialog(false); setTempUrl(''); setTempName(''); }}>
                                                Cancel
                                            </Button>
                                            <Button type="button" onClick={handleAddLink}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Points and Due Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="points">Points</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    value={points}
                                    onChange={(e) => setPoints(e.target.value)}
                                    min="0"
                                    max="1000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date (optional)</Label>
                                <Input
                                    id="dueDate"
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Creating...' : 'Assign'}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
