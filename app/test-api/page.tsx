"use client";

import React, { useEffect, useState } from 'react';

export default function TestPage() {
  const [apiData, setApiData] = useState<any>(null);
  const [curriculumData, setCurriculumData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const testAPIs = async () => {
      console.log('Starting API tests...');
      
      // Test courses API
      try {
        console.log('Testing /api/courses...');
        const coursesRes = await fetch('/api/courses');
        console.log('Courses API status:', coursesRes.status);
        
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          console.log('Courses API data:', coursesData);
          setApiData(coursesData);
        } else {
          const errorText = await coursesRes.text();
          console.error('Courses API error:', errorText);
          setErrors(prev => [...prev, `Courses API error: ${coursesRes.status} - ${errorText}`]);
        }
      } catch (error) {
        console.error('Courses API fetch error:', error);
        setErrors(prev => [...prev, `Courses API fetch error: ${error}`]);
      }

      // Test curriculum API
      try {
        const courseId = '6907359f04e2fbae0192d025';
        console.log('Testing curriculum API for course:', courseId);
        const curriculumRes = await fetch(`/api/courses/${courseId}/curriculum`);
        console.log('Curriculum API status:', curriculumRes.status);
        
        if (curriculumRes.ok) {
          const curriculumData = await curriculumRes.json();
          console.log('Curriculum API data:', curriculumData);
          setCurriculumData(curriculumData);
        } else {
          const errorText = await curriculumRes.text();
          console.error('Curriculum API error:', errorText);
          setErrors(prev => [...prev, `Curriculum API error: ${curriculumRes.status} - ${errorText}`]);
        }
      } catch (error) {
        console.error('Curriculum API fetch error:', error);
        setErrors(prev => [...prev, `Curriculum API fetch error: ${error}`]);
      }

      setLoading(false);
    };

    testAPIs();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      {loading ? (
        <div>Loading tests...</div>
      ) : (
        <div className="space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-red-800 font-medium mb-2">Errors:</h3>
              <ul className="text-red-700">
                {errors.map((error, index) => (
                  <li key={index} className="mb-1">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-green-800 font-medium mb-2">Courses API Response:</h3>
            <pre className="text-green-700 text-sm overflow-auto">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-blue-800 font-medium mb-2">Curriculum API Response:</h3>
            <pre className="text-blue-700 text-sm overflow-auto">
              {JSON.stringify(curriculumData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}