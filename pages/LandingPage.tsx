import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Award,
  Clock,
  Star,
  CheckCircle,
  Globe,
  Video,
  MessageCircle,
  ArrowRight,
  Play,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                  🔥 Most Popular Japanese Course
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Master Japanese
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    {" "}Language
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  From complete beginner to fluent speaker. Join over 50,000 students who've transformed their Japanese skills with our proven methodology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg px-8 py-6">
                  <Play className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Video className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-orange-400 border-2 border-white" />
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-gray-600">50,000+ students</span>
                </div>
                <div className="flex items-center">
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">4.9 rating</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Today's Lesson</h3>
                    <Badge variant="secondary">Beginner</Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">あ</span>
                      </div>
                      <div>
                        <p className="font-medium">Hiragana: あ (A)</p>
                        <p className="text-sm text-gray-500">Learn basic pronunciation</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full w-3/4"></div>
                    </div>

                    <p className="text-sm text-gray-500">75% Complete • 5 mins left</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Why Choose Japanese Shikhi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most effective way to learn Japanese with our comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Structured Curriculum",
                description: "Progressive lessons from basic hiragana to advanced kanji and grammar"
              },
              {
                icon: Video,
                title: "Interactive Videos",
                description: "HD video lessons with native speakers and cultural context"
              },
              {
                icon: MessageCircle,
                title: "AI Conversation",
                description: "Practice speaking with AI tutors available 24/7"
              },
              {
                icon: Users,
                title: "Live Classes",
                description: "Join live group sessions and 1-on-1 tutoring"
              },
              {
                icon: Award,
                title: "Certificates",
                description: "Earn recognized certificates as you complete levels"
              },
              {
                icon: Globe,
                title: "Cultural Immersion",
                description: "Learn about Japanese culture, traditions, and etiquette"
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-red-500 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Course Curriculum */}
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
            {[
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
            ].map((course, index) => (
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

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See what our students have achieved
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Software Engineer",
                content: "I went from zero Japanese to passing JLPT N3 in just 8 months! The structured approach really works.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Business Analyst",
                content: "The business Japanese module helped me land a job at a Japanese company. Highly recommended!",
                rating: 5
              },
              {
                name: "Emma Williams",
                role: "Student",
                content: "Love the interactive lessons and AI tutor. It's like having a personal teacher 24/7.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div className="flex">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Enrollment */}
      <section id="pricing" className="py-20 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Start Your Japanese Journey?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of successful learners. Start with our free trial today!
            </p>

            <div className="bg-white rounded-2xl p-8 text-gray-900 max-w-md mx-auto">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Premium Access</h3>
                <div className="text-4xl font-bold">
                  $29<span className="text-lg text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 text-left">
                  {[
                    "All course levels (Beginner to Advanced)",
                    "Live group classes & 1-on-1 tutoring",
                    "AI conversation practice",
                    "Progress tracking & certificates",
                    "Mobile app access",
                    "Community forum access"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg py-6">
                  Start 7-Day Free Trial
                </Button>
                <p className="text-xs text-gray-500">
                  Cancel anytime • No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">日</span>
                </div>
                <span className="text-xl font-bold">Japanese Shikhi</span>
              </div>
              <p className="text-gray-400 text-sm">
                Master Japanese language with our comprehensive online courses and expert guidance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Courses</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Beginner Japanese</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intermediate Japanese</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Advanced Japanese</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Japanese</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Youtube className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Japanese Shikhi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
