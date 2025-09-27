"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Quote, Award, MapPin, Sparkles } from "lucide-react";

export default function Testimonials() {
  const { t } = useLanguage();
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      location: "San Francisco, USA",
      content: "I went from zero Japanese to passing JLPT N3 in just 8 months! The structured approach and AI conversation practice made all the difference. Now I'm confident speaking with my Japanese colleagues.",
      rating: 5,
      achievement: "JLPT N3 Passed",
      avatar: "SJ",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      name: "Mike Chen",
      role: "Business Analyst",
      location: "Tokyo, Japan",
      content: "The business Japanese module helped me land my dream job at a Japanese company. The cultural insights and formal language training were invaluable for my career growth.",
      rating: 5,
      achievement: "Career Advancement",
      avatar: "MC",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      name: "Emma Williams",
      role: "University Student",
      location: "London, UK",
      content: "Love the interactive lessons and AI tutor! It's like having a personal teacher available 24/7. The progress tracking keeps me motivated and the community is so supportive.",
      rating: 5,
      achievement: "Daily Practice Streak: 200+",
      avatar: "EW",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Carlos Rodriguez",
      role: "Travel Blogger",
      location: "Barcelona, Spain",
      content: "This platform transformed my Japan travels! I can now navigate conversations, read menus, and connect with locals. The cultural context in lessons made my experiences so much richer.",
      rating: 5,
      achievement: "Travel Fluency",
      avatar: "CR",
      gradient: "from-orange-500 to-red-500"
    },
    {
      name: "Yuki Tanaka",
      role: "Language Exchange Coordinator",
      location: "Osaka, Japan",
      content: "As someone who teaches English to Japanese speakers, I recommend this platform to anyone serious about learning Japanese. The methodology is excellent and results speak for themselves.",
      rating: 5,
      achievement: "Educator Endorsed",
      avatar: "YT",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      name: "Jennifer Park",
      role: "Anime Translator",
      location: "Seoul, South Korea",
      content: "The advanced courses helped me transition from anime fan to professional translator. The nuanced explanations of context and cultural references are unmatched anywhere else.",
      rating: 5,
      achievement: "Professional Certification",
      avatar: "JP",
      gradient: "from-rose-500 to-pink-500"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-200/50 shadow-sm">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">{t('testimonials.title')}</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'প্রকৃত ফলাফল' : 'Real Results from'}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mx-3">
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'প্রকৃত শিক্ষার্থীদের' : 'Real Students'}
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden"
            >
              {/* Gradient top border */}
              <div className={`h-1 bg-gradient-to-r ${testimonial.gradient}`}></div>

              {/* Quote icon */}
              <div className="absolute top-4 right-4">
                <Quote className="h-6 w-6 text-gray-300 group-hover:text-gray-400 transition-colors" />
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform`}>
                    {testimonial.avatar}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {testimonial.role}
                      </CardDescription>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{testimonial.location}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Achievement Badge */}
                <Badge variant="outline" className={`bg-gradient-to-r ${testimonial.gradient} text-white border-0 font-medium`}>
                  <Award className="h-3 w-3 mr-1" />
                  {testimonial.achievement}
                </Badge>

                {/* Testimonial Content */}
                <p className="text-gray-700 leading-relaxed text-sm italic">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 text-yellow-400 fill-current group-hover:scale-110 transition-transform"
                        style={{ transitionDelay: `${star * 50}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'যাচাইকৃত শিক্ষার্থী' : 'Verified Student'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-sm text-gray-600">Happy Students</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-emerald-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">2.5M+</div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-2xl text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h3>
              <p className="text-blue-100 mb-6 text-lg">
                Join our community of successful Japanese learners today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Start Your Journey
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Read More Stories
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}