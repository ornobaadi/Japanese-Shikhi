import { useEffect, useState } from 'react';

export default function ResourceList({ courseId }) {
  const [resources, setResources] = useState([]);
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
        {resources.map(r => (
          <li key={r._id}>
            <b>{r.title}</b> {r.attachments && r.attachments.map((a, i) => (
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
