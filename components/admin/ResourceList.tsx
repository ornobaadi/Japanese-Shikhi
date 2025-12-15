import { useEffect, useState } from 'react';

interface Attachment {
  url: string;
}
interface Resource {
  _id: string;
  title: string;
  attachments?: Attachment[];
}

export default function ResourceList({ courseId }: { courseId: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/resources?courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setResources(data.resources);
      });
  }, [courseId]);

  if (!resources.length) return <div>No resources found.</div>;
  return (
    <div>
      <h3>Resources</h3>
      <ul>
        {resources.map((r: Resource) => (
          <li key={r._id}>
            <b>{r.title}</b>{' '}
            {r.attachments && r.attachments.map((a: Attachment, i: number) => (
              <span key={i}>
                {a.url.endsWith('.pdf') ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer">[PDF]</a>
                ) : (
                  <a href={a.url} target="_blank" rel="noopener noreferrer">[File]</a>
                )}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
