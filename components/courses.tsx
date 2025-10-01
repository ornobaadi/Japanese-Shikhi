"use client";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
interface Course {
  _id?: string;
  title: string;
  description?: string;
  level: string;
  estimatedDuration?: number;
  lessons?: Array<any>;
  learningObjectives?: string[];
  price?: number;
  rating?: number;
  enrolledStudents?: number;
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Sparkles,
  Zap,
  Award,
  Play
} from "lucide-react";

export default function Courses() {
  const { t } = useLanguage();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application/json')) {
          throw new Error('API did not return JSON');
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCourses(json.data);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section id="courses" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header Section */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-200/50 shadow-sm">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সম্পূর্ণ শেখার পথ' : 'Complete Learning Path'}
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'জাপানি ভাষা আয়ত্ত করুন' : 'Master Japanese'}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mx-3">
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ধাপে ধাপে' : 'Step by Step'}
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
              ? 'জাপানি ভাষা বিশেষজ্ঞদের দ্বারা ডিজাইন করা আমাদের সযত্নে তৈরি, প্রগতিশীল পাঠ্যক্রমের সাথে সম্পূর্ণ নতুন থেকে দক্ষ বক্তা হয়ে উঠুন'
              : 'From complete beginner to fluent speaker with our carefully crafted, progressive curriculum designed by Japanese language experts'
            }
          </p>
        </div>

        {/* Course Grid */}
        <div className="space-y-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <Card className="text-center py-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent>
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এখনো কোনো কোর্স উপলব্ধ নেই' : 'No courses available yet'}
                </h3>
                <p className="text-gray-600">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? 'আমরা আপনার জন্য অসাধারণ কোর্স প্রস্তুত করছি। শীঘ্রই ফিরে দেখুন!'
                    : 'We\'re preparing amazing courses for you. Check back soon!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-1 gap-8">
              {courses.map((course, index) => {
                const levelColors = {
                  'Beginner': { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700', accent: 'from-green-500 to-emerald-500' },
                  'Intermediate': { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'from-blue-500 to-indigo-500' },
                  'Advanced': { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'from-purple-500 to-pink-500' }
                } as const;

                const levelStyle = levelColors[course.level as keyof typeof levelColors] || levelColors['Beginner'];

                return (
                  <Card key={course._id || index} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                    {/* Enhanced header gradient */}
                    <div className={`h-3 bg-gradient-to-r ${levelStyle.accent} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-8 p-8">
                      {/* Course Info Section */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className={`${levelStyle.border} ${levelStyle.text} bg-gradient-to-r ${levelStyle.bg} font-semibold`}>
                              {course.level}
                            </Badge>
                            {course.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                            {course.title}
                          </h3>

                          {course.description && (
                            <p className="text-gray-600 leading-relaxed">
                              {course.description}
                            </p>
                          )}
                        </div>

                        {/* Course Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {course.estimatedDuration ?
                                `${Math.floor(course.estimatedDuration / 60)}h ${course.estimatedDuration % 60}m` :
                                (t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'নিজস্ব গতিতে' : 'Self-paced')
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm">
                              {course.lessons ?
                                (t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? `${course.lessons.length} পাঠ` : `${course.lessons.length} lessons`) :
                                (t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'একাধিক পাঠ' : 'Multiple lessons')
                              }
                            </span>
                          </div>
                          {course.enrolledStudents && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">
                                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? `${course.enrolledStudents}+ শিক্ষার্থী` : `${course.enrolledStudents}+ students`}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Award className="w-4 h-4" />
                            <span className="text-sm">
                              {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সার্টিফিকেট অন্তর্ভুক্ত' : 'Certificate included'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Learning Objectives */}
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold text-lg mb-6 text-gray-900 flex items-center">
                          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                          What you'll master:
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {course.learningObjectives?.slice(0, 6).map((objective, objectiveIndex) => (
                            <div key={objectiveIndex} className="flex items-start space-x-3 group/item">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                              <span className="text-sm text-gray-700 leading-relaxed">{objective}</span>
                            </div>
                          ))}
                          {course.learningObjectives && course.learningObjectives.length > 6 && (
                            <div className="text-sm text-gray-500 italic">
                              +{course.learningObjectives.length - 6} more topics...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Section */}
                      <div className="lg:col-span-1 flex flex-col justify-center space-y-4">
                        <div className="text-center space-y-2">
                          {course.price ? (
                            <div>
                              <div className="text-3xl font-bold text-gray-900">৳{course.price}</div>
                              <div className="text-sm text-gray-500">
                                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এক-সময় পেমেন্ট' : 'One-time payment'}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-3xl font-bold text-green-600">
                                {t('pricing.free')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সীমিত সময়' : 'Limited time'}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Button className={`w-full bg-gradient-to-r ${levelStyle.accent} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn`}>
                            <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'শিক্ষা শুরু করুন' : 'Start Learning'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                          <Button variant="outline" size="sm" className="w-full hover:bg-gray-50 transition-colors">
                            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কোর্স পূর্বদর্শন' : 'Preview Course'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA Section */}
        {courses.length > 0 && (
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-2xl text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? 'আপনার জাপানি যাত্রা শুরু করতে প্রস্তুত?'
                    : 'Ready to Start Your Japanese Journey?'}
                </h3>
                <p className="text-blue-100 mb-6 text-lg">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? 'হাজার হাজার শিক্ষার্থীর সাথে যোগ দিন যারা ইতিমধ্যে আত্মবিশ্বাসের সাথে জাপানি ভাষায় কথা বলছেন'
                    : 'Join thousands of learners who are already speaking Japanese confidently'}
                </p>
                <Button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সব কোর্স দেখুন' : 'Browse All Courses'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}