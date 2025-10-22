'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { IconX, IconUserPlus, IconCheck } from '@tabler/icons-react';

interface Student {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
}

interface AssignStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseName: string;
    onAssignmentChange?: (selectedStudents: string[]) => void;
}

export default function AssignStudentsModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    onAssignmentChange
}: AssignStudentsModalProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(true);
    const [sendingInvites, setSendingInvites] = useState(false);

    // Fetch enrolled students
    useEffect(() => {
        if (isOpen && courseId) {
            fetchEnrolledStudents();
        }
    }, [isOpen, courseId]);

    const fetchEnrolledStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/courses/${courseId}/students`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        setAllStudentsSelected(true);
        setSelectedStudents([]);
    };

    const handleToggleStudent = (studentId: string) => {
        setAllStudentsSelected(false);
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    }; const handleSendToSelectedStudents = async () => {
        if (allStudentsSelected) {
            // Send to all students
            const allEmails = students.map(student => student.email);

            if (allEmails.length === 0) {
                toast.error('No students found to send invitations to');
                return;
            }

            console.log('📧 Sending to all students:', allEmails);
            await sendEmailsToStudents(allEmails);
        } else {
            // Send to selected students only
            const selectedStudentEmails = students
                .filter(student => selectedStudents.includes(student._id))
                .map(student => student.email);

            if (selectedStudentEmails.length === 0) {
                toast.error('Please select students to send invitations to');
                return;
            }

            console.log('📧 Sending to selected students:', selectedStudentEmails);
            await sendEmailsToStudents(selectedStudentEmails);
        }
    };

    const sendEmailsToStudents = async (emails: string[]) => {
        setSendingInvites(true);
        try {
            // Generate invite link
            const baseUrl = window.location.origin;
            const inviteLink = `${baseUrl}/courses/${courseId}/enroll`;

            const response = await fetch(`/api/courses/${courseId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emails,
                    courseName,
                    inviteLink
                })
            });

            if (response.ok) {
                toast.success(`Invitations sent to ${emails.length} student(s)!`);
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to send invitations');
            }
        } catch (error) {
            console.error('Error sending invites:', error);
            toast.error('Failed to send invitations');
        } finally {
            setSendingInvites(false);
        }
    };

    const handleDone = () => {
        if (onAssignmentChange) {
            onAssignmentChange(allStudentsSelected ? [] : selectedStudents);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Assign to</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                            <IconX size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading students...</p>
                        </div>
                    ) : students.length === 0 ? (
                        /* No Students - Show Invite */
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <svg className="w-48 h-48 mx-auto opacity-50" viewBox="0 0 200 200">
                                    {/* Cat on book illustration */}
                                    <ellipse cx="100" cy="140" rx="40" ry="8" fill="#E0E0E0" />
                                    <rect x="60" y="110" width="80" height="30" rx="2" fill="#9E9E9E" />
                                    <rect x="65" y="100" width="70" height="30" rx="2" fill="#BDBDBD" />
                                    <ellipse cx="100" cy="85" rx="25" ry="20" fill="#F5F5F5" />
                                    <circle cx="100" cy="75" r="18" fill="#F5F5F5" />
                                    <circle cx="92" cy="73" r="3" fill="#424242" />
                                    <circle cx="108" cy="73" r="3" fill="#424242" />
                                    <path d="M 85 65 Q 80 60 78 55" stroke="#424242" strokeWidth="2" fill="none" />
                                    <path d="M 115 65 Q 120 60 122 55" stroke="#424242" strokeWidth="2" fill="none" />
                                    <line x1="90" y1="120" x2="85" y2="135" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
                                    <line x1="110" y1="120" x2="115" y2="135" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
                                    <path d="M 95 80 Q 100 82 105 80" stroke="#424242" strokeWidth="1.5" fill="none" />
                                </svg>
                            </div>
                            <p className="text-lg text-gray-700 mb-6">There are no students in this class</p>


                        </div>
                    ) : (
                        /* Students List */
                        <div className="space-y-4">
                            {/* All Students Option */}
                            <div
                                onClick={handleSelectAll}
                                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${allStudentsSelected ? 'border-blue-500 bg-blue-50' : ''
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${allStudentsSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                    }`}>
                                    {allStudentsSelected && <IconCheck size={16} className="text-white" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <IconUserPlus size={18} className="text-blue-600" />
                                    <span className="font-medium text-blue-600">All students</span>
                                </div>
                                <span className="text-sm text-gray-500 ml-auto">
                                    ({students.length} {students.length === 1 ? 'student' : 'students'})
                                </span>
                            </div>

                            {/* Individual Students */}
                            <div className="space-y-2">
                                {students.map((student) => (
                                    <div
                                        key={student._id}
                                        onClick={() => handleToggleStudent(student._id)}
                                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedStudents.includes(student._id) ? 'border-blue-500 bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedStudents.includes(student._id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                            }`}>
                                            {selectedStudents.includes(student._id) && <IconCheck size={16} className="text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {student.firstName && student.lastName
                                                    ? `${student.firstName} ${student.lastName}`
                                                    : student.username || 'Student'}
                                            </div>
                                            <div className="text-sm text-gray-500">{student.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-between items-center">
                    <div className="flex gap-3">
                        {/* Send to Selected/All Students Button */}
                        {students.length > 0 && (
                            <Button
                                onClick={handleSendToSelectedStudents}
                                disabled={sendingInvites || (!allStudentsSelected && selectedStudents.length === 0)}
                                className="bg-green-600 hover:bg-green-700 px-6"
                            >
                                {sendingInvites ? 'Sending...' : allStudentsSelected
                                    ? `📧 Send to All Students (${students.length})`
                                    : `📧 Send to Selected (${selectedStudents.length})`
                                }
                            </Button>
                        )}
                    </div>

                    <Button
                        onClick={handleDone}
                        className="bg-blue-600 hover:bg-blue-700 px-8"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
}
