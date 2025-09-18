'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { courseStorage, createEmptyCourse, Course } from '@/lib/courseStorage';

export default function AddCourse() {
  const router = useRouter();
  const [course, setCourse] = useState(createEmptyCourse());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof course, value: any) => {
    setCourse(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!course.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!course.description.trim()) {
      newErrors.description = 'Course description is required';
    }

    if (!course.duration.trim()) {
      newErrors.duration = 'Course duration is required';
    }

    if (course.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const savedCourse = courseStorage.saveCourse(course);
      console.log('Course saved:', savedCourse);
      
      // Redirect to courses list or show success message
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      setErrors({ submit: 'Failed to save course. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCourse(createEmptyCourse());
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Add New Course</h1>
        <p className="text-sm text-muted-foreground">Create a new Japanese language course</p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>
            Fill in the details for your new Japanese language course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Course Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={course.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Japanese for Beginners"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">JLPT Level</Label>
                <select
                  id="level"
                  value={course.level}
                  onChange={(e) => handleInputChange('level', e.target.value as Course['level'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="N5">N5 (Beginner)</option>
                  <option value="N4">N4 (Elementary)</option>
                  <option value="N3">N3 (Intermediate)</option>
                  <option value="N2">N2 (Upper Intermediate)</option>
                  <option value="N1">N1 (Advanced)</option>
                  <option value="Beginner">Beginner (General)</option>
                  <option value="Intermediate">Intermediate (General)</option>
                  <option value="Advanced">Advanced (General)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description *</Label>
              <textarea
                id="description"
                value={course.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what students will learn in this course..."
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  type="text"
                  value={course.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 3 months, 12 weeks"
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={course.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={course.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrolledStudents">Initial Enrolled Students</Label>
                <Input
                  id="enrolledStudents"
                  type="number"
                  value={course.enrolledStudents}
                  onChange={(e) => handleInputChange('enrolledStudents', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Course Status</Label>
                <select
                  id="isActive"
                  value={course.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            After saving the course, you'll be able to add lessons and curriculum content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• After creating the course, you can add lessons with vocabulary and grammar points</p>
            <p>• Each lesson can include exercises and practical examples</p>
            <p>• You can manage the course curriculum from the course details page</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}