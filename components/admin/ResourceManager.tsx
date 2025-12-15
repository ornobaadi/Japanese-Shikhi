import ResourceForm from './ResourceForm';
import ResourceList from './ResourceList';

export default function ResourceManager({ courseId }: { courseId: string }) {
  return (
    <div>
      <ResourceForm courseId={courseId} onSuccess={() => {}} />
      <ResourceList courseId={courseId} />
    </div>
  );
}
