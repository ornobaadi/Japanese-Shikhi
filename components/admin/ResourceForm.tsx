import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { toast } from 'sonner';

interface Attachment {
  url: string;
  name: string;
}

interface ResourceFormProps {
  courseId: string;
  onSuccess?: () => void;
}

export default function ResourceForm({ courseId, onSuccess }: ResourceFormProps) {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [resourceType, setResourceType] = useState<string>('PDF Document');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
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
      setAttachments([...attachments, { url: data.url, name: file.name }]);
      toast.success(`File "${file.name}" uploaded successfully`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title,
          description,
          date,
          time,
          resourceType,
          attachments,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save resource');
      toast.success('Resource saved!');
      setTitle(''); setDescription(''); setDate(''); setTime(''); setAttachments([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save resource');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      <select value={resourceType} onChange={e => setResourceType(e.target.value)}>
        <option>PDF Document</option>
        <option>Image</option>
        <option>Link</option>
      </select>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} />
      <ul>
        {attachments.map((a, i) => <li key={i}>{a.name}</li>)}
      </ul>
      <button type="submit">Add Resource</button>
    </form>
  );
}
