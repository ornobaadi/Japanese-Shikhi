'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import AssignStudentsModal from '@/components/admin/AssignStudentsModal';
import {
    IconBold,
    IconItalic,
    IconUnderline,
    IconList,
    IconTextSize,
    IconX,
    IconUsers,
    IconPlus
} from '@tabler/icons-react';

interface Attachment {
    type: 'drive' | 'youtube' | 'file' | 'link';
    url: string;
    name?: string;
}

interface QuizAssignmentFormProps {
    courseId: string;
    courseName: string;
    week: number;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function QuizAssignmentForm({ courseId, courseName, week, onClose, onSuccess }: QuizAssignmentFormProps) {
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [points, setPoints] = useState('100');
    const [dueDate, setDueDate] = useState('');
    const [topic, setTopic] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [saving, setSaving] = useState(false);

    // Google Form state
    const [googleFormUrl, setGoogleFormUrl] = useState('');
    const [googleFormName, setGoogleFormName] = useState('Blank Quiz');
    const [googleFormId, setGoogleFormId] = useState('');

    // Student assignment
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignedStudents, setAssignedStudents] = useState<string[]>([]);

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
            // If it's a Google Form, update the main form instead of adding to attachments
            setGoogleFormUrl(tempUrl);
            setGoogleFormName(tempName || 'Blank Quiz');
            setTempUrl('');
            setTempName('');
            setShowDriveDialog(false);
            toast.success('Google Form link added');
        } else {
            toast.error('Please enter a valid Google Form URL');
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

    // Handle adding Link
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
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            // Simulated upload - in real scenario, upload to cloud storage
            const fakeUrl = URL.createObjectURL(file);
            setAttachments([...attachments, { type: 'file', url: fakeUrl, name: file.name }]);
            toast.success(`File "${file.name}" added`);
        }
    };

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    // Handle creating/opening Google Form
    const handleCreateGoogleForm = () => {
        const formTitle = title.trim() || 'Blank Quiz';

        // Create new Google Form with template URL
        const googleFormCreateUrl = 'https://docs.google.com/forms/create';

        // Open in new window
        const newWindow = window.open(googleFormCreateUrl, '_blank', 'width=1200,height=800');

        if (newWindow) {
            toast.success('Opening Google Forms to create your quiz!');

            // Show instructions to user
            setTimeout(() => {
                toast.info('📝 Create your quiz in Google Forms, then copy the sharing link back here');
            }, 1000);
        } else {
            toast.error('Please allow popups to create Google Forms');
        }
    };

    // Handle when user pastes Google Form URL
    const handleGoogleFormUrlChange = (url: string) => {
        // Validate Google Form URL
        const isValidGoogleForm = url.includes('docs.google.com/forms') || url.includes('forms.gle');

        if (!isValidGoogleForm) {
            toast.error('Please enter a valid Google Forms URL');
            return;
        }

        setGoogleFormUrl(url);

        // Extract form ID from URL if possible
        const match = url.match(/forms\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
            setGoogleFormId(match[1]);
            setGoogleFormName(title.trim() || 'Quiz Assignment');
        }

        toast.success('✅ Google Form linked successfully! Students will access this quiz.');
    }; const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);

        try {
            // Prepare all attachments including Google Form if it exists
            const allAttachments = [...attachments];
            if (googleFormUrl) {
                allAttachments.unshift({
                    type: 'link' as const,
                    url: googleFormUrl,
                    name: googleFormName || 'Blank Quiz'
                });
            }

            // Create assignment via API
            const response = await fetch(`/api/courses/${courseId}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    week,
                    title: title.trim(),
                    instructions: instructions.trim() || '',
                    dueDate: dueDate ? new Date(dueDate) : null,
                    points: parseInt(points) || 100,
                    attachments: allAttachments
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create assignment');
            }

            const result = await response.json();
            console.log('✅ Assignment created:', result.data);

            toast.success('Quiz assignment created successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating quiz assignment:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create quiz assignment';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex gap-6 max-w-[1400px] mx-auto">
            {/* Main Form - Left Side */}
            <Card className="flex-1 max-w-[900px]">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Title"
                                    className="text-lg bg-gray-50 border-0 border-b-2 border-gray-200 focus:border-blue-500 rounded-none px-3 py-6"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">*Required</p>
                            </div>

                            {/* Instructions */}
                            <div>
                                <Label className="text-sm text-gray-600 mb-2 block">Instructions (optional)</Label>

                                {/* Rich Text Toolbar */}
                                <div className="flex gap-2 mb-2 p-2 border-b bg-gray-50">
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded">
                                        <IconBold size={20} />
                                    </button>
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded">
                                        <IconItalic size={20} />
                                    </button>
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded">
                                        <IconUnderline size={20} />
                                    </button>
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded">
                                        <IconList size={20} />
                                    </button>
                                    <button type="button" className="p-1 hover:bg-gray-200 rounded">
                                        <IconTextSize size={20} />
                                    </button>
                                </div>

                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="w-full min-h-[100px] p-3 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 bg-gray-50"
                                    placeholder="Add instructions..."
                                />
                            </div>

                            {/* GOOGLE FORM INTEGRATION */}
                            {!googleFormUrl ? (
                                /* CREATE NEW QUIZ CARD */
                                <div
                                    onClick={handleCreateGoogleForm}
                                    className="flex items-center gap-3 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                                >
                                    <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                            <rect x="6" y="4" width="12" height="16" rx="1" fill="#673AB7" />
                                            <rect x="9" y="7" width="6" height="1" fill="white" />
                                            <rect x="9" y="10" width="6" height="1" fill="white" />
                                            <rect x="9" y="13" width="4" height="1" fill="white" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-base text-gray-700">Blank Quiz</div>
                                        <div className="text-sm text-gray-500">Click to create in Google Forms</div>
                                    </div>
                                    <IconPlus className="w-5 h-5 text-gray-400" />
                                </div>
                            ) : (
                                /* EXISTING GOOGLE FORM CARD */
                                <div className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm">
                                    <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                            <rect x="6" y="4" width="12" height="16" rx="1" fill="#673AB7" />
                                            <rect x="9" y="7" width="6" height="1" fill="white" />
                                            <rect x="9" y="10" width="6" height="1" fill="white" />
                                            <rect x="9" y="13" width="4" height="1" fill="white" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <a
                                            href={googleFormUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-base text-blue-600 hover:underline"
                                        >
                                            {googleFormName}
                                        </a>
                                        <div className="text-sm text-gray-500">Google Forms • Linked</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGoogleFormUrl('');
                                            setGoogleFormName('Blank Quiz');
                                            setGoogleFormId('');
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                        title="Remove Google Form"
                                    >
                                        <IconX size={20} />
                                    </button>
                                </div>
                            )}

                            {/* GOOGLE FORM URL INPUT (when form is being linked) */}
                            {googleFormUrl === '' && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Label className="text-sm font-medium mb-2 block">
                                        📋 Link your Google Form
                                    </Label>
                                    <Input
                                        type="url"
                                        placeholder="Paste your Google Form sharing link here..."
                                        value={tempUrl}
                                        onChange={(e) => setTempUrl(e.target.value)}
                                        onBlur={(e) => {
                                            if (e.target.value.trim()) {
                                                handleGoogleFormUrlChange(e.target.value);
                                                setTempUrl('');
                                            }
                                        }}
                                        className="mb-2"
                                    />
                                    <p className="text-xs text-gray-600">
                                        💡 After creating your quiz in Google Forms, copy the sharing link and paste it here
                                    </p>
                                </div>
                            )}

                            {/* Additional Attachments Display */}
                            {attachments.length > 0 && (
                                <div className="space-y-2">
                                    {attachments.map((att, index) => (
                                        <div key={index} className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm">
                                            {/* Icon based on type */}
                                            <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                                {att.type === 'drive' && (
                                                    <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M7 2L3 8h18L17 2H7zm13 8H4l4 8h10l4-8z" />
                                                    </svg>
                                                )}
                                                {att.type === 'youtube' && <span className="text-red-600 font-bold text-xl">▶</span>}
                                                {att.type === 'file' && <span className="text-blue-600 text-xl">📎</span>}
                                                {att.type === 'link' && <span className="text-blue-600 text-xl">🔗</span>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-base">{att.name || 'Blank Quiz'}</div>
                                                {att.type === 'drive' && <div className="text-sm text-gray-500">Google Forms</div>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="p-2 hover:bg-gray-100 rounded-full"
                                            >
                                                <IconX size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Attach Section */}
                            <div className="border rounded-lg p-4">
                                <Label className="text-sm font-medium mb-3 block">Attach</Label>
                                <div className="flex gap-6 justify-center">
                                    {/* Drive */}
                                    <button
                                        type="button"
                                        onClick={() => setShowDriveDialog(true)}
                                        className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            <svg className="w-8 h-8" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M9 3L5 9h14L15 3H9z" />
                                                <path fill="#0F9D58" d="M5 9l4 7h10l-4-7H5z" />
                                                <path fill="#F4B400" d="M9 16l-4-7L1 16h8z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-gray-700">Drive</span>
                                    </button>

                                    {/* YouTube */}
                                    <button
                                        type="button"
                                        onClick={() => setShowYouTubeDialog(true)}
                                        className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            <svg className="w-8 h-8" viewBox="0 0 24 24">
                                                <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-gray-700">YouTube</span>
                                    </button>

                                    {/* Create */}
                                    <button
                                        type="button"
                                        className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                                                <IconPlus size={20} />
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-700">Create</span>
                                    </button>

                                    {/* Upload */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-gray-700">Upload</span>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />

                                    {/* Link */}
                                    <button
                                        type="button"
                                        onClick={() => setShowLinkDialog(true)}
                                        className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-gray-700">Link</span>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving || !title.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {saving ? 'Creating Assignment...' : (
                                        googleFormUrl ? '📝 Assign Quiz' : '📋 Create Assignment'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Right Sidebar */}
            <div className="w-80 space-y-4">
                {/* For */}
                <div>
                    <Label className="text-sm mb-2 block">For</Label>
                    <select className="w-full p-2 border rounded-md bg-white">
                        <option>{courseName}</option>
                    </select>
                </div>

                {/* Assign to */}
                <div>
                    <Label className="text-sm mb-2 block">Assign to</Label>
                    <button
                        type="button"
                        onClick={() => setShowAssignModal(true)}
                        className="w-full p-3 border rounded-md bg-white flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                        <IconUsers size={18} className="text-blue-600" />
                        <span className="text-blue-600 font-medium">
                            {assignedStudents.length === 0 ? 'All students' : `${assignedStudents.length} student(s)`}
                        </span>
                    </button>
                </div>



                {/* Google Forms Setup Guide */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <rect x="6" y="4" width="12" height="16" rx="1" fill="#673AB7" />
                            <rect x="9" y="7" width="6" height="1" fill="white" />
                            <rect x="9" y="10" width="6" height="1" fill="white" />
                            <rect x="9" y="13" width="4" height="1" fill="white" />
                        </svg>
                        <Label className="text-sm font-medium text-purple-800">Quiz Setup</Label>
                    </div>
                    <div className="text-xs text-purple-700 space-y-1">
                        <div>📝 <strong>Add questions</strong> with multiple choice, short answer, etc.</div>
                        <div>⭐ <strong>Set point values</strong> for each question</div>
                        <div>🎯 <strong>Make it a quiz</strong> in Settings → Quizzes → ON</div>
                        <div>📋 <strong>Set answer keys</strong> for each question (Answer Key tab)</div>
                        <div className="text-red-700 font-semibold">⚠️ <strong>IMPORTANT:</strong> Settings → Release score → "Immediately after each submission"</div>
                        <div className="text-red-700">✅ Check "Missed questions" + "Correct answers" + "Point values"</div>
                        <div>🔗 <strong>Get sharing link</strong> to paste back here</div>
                    </div>
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        <strong>🚨 Without these settings, students will only see "Your response has been recorded"</strong>
                    </div>
                    {googleFormUrl && (
                        <Button
                            type="button"
                            size="sm"
                            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => window.open(googleFormUrl, '_blank')}
                        >
                            📝 Edit Quiz in Google Forms
                        </Button>
                    )}
                </div>

                {/* Rubric */}
                {/* <div>
                    <Label className="text-sm mb-2 block">Rubric</Label>
                    <button className="w-full p-3 border rounded-md bg-white flex items-center justify-center gap-2 hover:bg-gray-50 text-blue-600">
                        <IconPlus size={18} />
                        <span className="font-medium">Rubric</span>
                    </button>
                </div> */}
            </div>

            {/* Dialogs */}
            {showDriveDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[500px]">
                        <h3 className="text-lg font-semibold mb-4">Add Google Form</h3>

                        {/* Info message */}
                        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                            <p className="text-sm text-purple-800">
                                <strong>🎯 Create a Scored Quiz in Google Forms:</strong>
                            </p>
                            <ol className="text-sm text-purple-700 mt-2 ml-4 list-decimal space-y-2">
                                <li>Click "Create New Google Form" button below</li>
                                <li><strong>Add questions</strong> with multiple choice, short answer, etc.</li>
                                <li><strong>Enable Quiz mode:</strong> Settings ⚙️ → "Make this a quiz" → ON</li>
                                <li><strong>Set points:</strong> Click each question → Set point value</li>
                                <li><strong>Add answer key:</strong> Click "Answer Key" for correct answers</li>
                                <li className="bg-red-50 p-2 rounded border border-red-200">
                                    <strong className="text-red-800">� CRITICAL - Show Results to Students:</strong><br />
                                    Settings ⚙️ → Release score → <strong>"Immediately after each submission"</strong><br />
                                    ✅ Check: "Missed questions", "Correct answers", "Point values"
                                </li>
                                <li><strong>Get link:</strong> Send → Link icon 🔗 → Copy link</li>
                                <li><strong>Paste link below</strong> to connect to this assignment</li>
                            </ol>
                        </div>

                        {/* Quick Create Button */}
                        <div className="mb-4">
                            <Button
                                type="button"
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                onClick={() => {
                                    window.open('https://docs.google.com/forms/u/0/create', '_blank');
                                    toast.info('Google Forms opened in new tab. Paste the link here after creating your form.');
                                }}
                            >
                                <IconPlus size={18} className="mr-2" />
                                Create New Google Form
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label className="text-sm mb-1 block">Google Form URL *</Label>
                                <Input
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder="https://docs.google.com/forms/d/..."
                                />
                            </div>
                            <div>
                                <Label className="text-sm mb-1 block">Display name (optional)</Label>
                                <Input
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    placeholder="e.g., Week 1 Vocabulary Quiz"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => {
                                setShowDriveDialog(false);
                                setTempUrl('');
                                setTempName('');
                            }}>Cancel</Button>
                            <Button onClick={handleAddDrive}>Add Form</Button>
                        </div>
                    </div>
                </div>
            )}

            {showYouTubeDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Add YouTube Link</h3>
                        <div className="space-y-3">
                            <Input
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                placeholder="Paste YouTube URL"
                            />
                            <Input
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                placeholder="Display name (optional)"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowYouTubeDialog(false)}>Cancel</Button>
                            <Button onClick={handleAddYouTube}>Add</Button>
                        </div>
                    </div>
                </div>
            )}

            {showLinkDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Add Link</h3>
                        <div className="space-y-3">
                            <Input
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                placeholder="Paste URL"
                            />
                            <Input
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                placeholder="Display name (optional)"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
                            <Button onClick={handleAddLink}>Add</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Students Modal */}
            <AssignStudentsModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                courseId={courseId}
                courseName={courseName}
                onAssignmentChange={(selected) => setAssignedStudents(selected)}
            />
        </div>
    );
}
