import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            স্বাগতম, {user?.firstName || 'শিক্ষার্থী'}!
          </h1>
          <p className="text-gray-600 mb-6">
            আপনার জাপানিজ শেখার যাত্রায় স্বাগতম। এখানে আপনি আপনার কোর্স এবং অগ্রগতি দেখতে পাবেন।
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">হিরাগানা</h3>
              <p className="text-blue-700 text-sm">জাপানিজ বর্ণমালার মূল ভিত্তি</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">কাতাকানা</h3>
              <p className="text-green-700 text-sm">বিদেশি শব্দের জন্য ব্যবহৃত</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">কানজি</h3>
              <p className="text-purple-700 text-sm">চীনা অক্ষরের জাপানিজ রূপ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}