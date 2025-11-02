"use client";

import React from 'react';
import { Navbar5 } from '@/components/navbar-5';
import CurriculumViewer from '@/components/CurriculumViewer';

export default function CourseCurriculumPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar5 />
      <CurriculumViewer />
    </div>
  );
}
