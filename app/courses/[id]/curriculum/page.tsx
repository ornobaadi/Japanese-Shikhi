"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Navbar5 } from '@/components/navbar-5';
import CurriculumViewer from '@/components/CurriculumViewer';

export default function CourseCurriculumPage() {
  const params = useParams();
  const courseId = params?.id as string;

  if (!courseId) {
    return <div className="min-h-screen bg-background">
      <Navbar5 />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Course not found</div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar5 />
      <CurriculumViewer courseId={courseId} />
    </div>
  );
}
