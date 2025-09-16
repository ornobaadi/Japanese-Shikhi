import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Courses() {
  const courses = [
    {
      level: "Beginner",
      title: "Foundation Course",
      duration: "8 weeks",
      lessons: 32,
      topics: ["Hiragana & Katakana", "Basic Grammar", "Numbers & Time", "Daily Conversations"],
      color: "from-green-500 to-teal-500"
    },
    {
      level: "Intermediate",
      title: "Building Fluency",
      duration: "12 weeks",
      lessons: 48,
      topics: ["Kanji Basics", "Verb Conjugations", "Complex Sentences", "Business Japanese"],
      color: "from-blue-500 to-indigo-500"
    },
    {
      level: "Advanced",
      title: "Native Proficiency",
      duration: "16 weeks",
      lessons: 64,
      topics: ["Advanced Kanji", "Keigo (Honorifics)", "Literature", "JLPT Preparation"],
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Complete Learning Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master Japanese step by step with our carefully crafted curriculum
          </p>
        </div>

        <div className="space-y-8">
          {courses.map((course, index) => (
            <Card key={index} className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${course.color}`}></div>
              <div className="grid md:grid-cols-4 gap-6 p-8">
                <div className="space-y-4">
                  <Badge variant="outline">{course.level}</Badge>
                  <h3 className="text-2xl font-bold">{course.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {course.lessons} lessons
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-4">What you'll learn:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {course.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-3">
                  <Button className={`bg-gradient-to-r ${course.color} hover:opacity-90`}>
                    Start Course
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    View Curriculum
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}