"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import * as Icons from "lucide-react";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface LandingSettings {
  features: Feature[];
}

export default function Features() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<LandingSettings | null>(null);

  useEffect(() => {
    fetch('/api/landing-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.data);
        }
      })
      .catch(err => console.error('Failed to load landing settings:', err));
  }, []);

  // Default features as fallback
  const defaultFeatures = [
    {
      icon: "BookOpen",
      title: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কাঠামোবদ্ধ পাঠ্যক্রম' : 'Structured Curriculum',
      description: t('nav.features') === 'বৈশিষ্ট্যসমূহ'
        ? 'মৌলিক হিরাগানা থেকে উন্নত কাঞ্জি এবং ব্যাকরণ পর্যন্ত ক্রমিক পাঠ'
        : 'Progressive lessons from basic hiragana to advanced kanji and grammar',
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      highlight: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? '৫০০+ পাঠ' : '500+ Lessons',
      category: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'শিক্ষা' : 'Learning'
    },
    {
      icon: "Video",
      title: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ইন্টারঅ্যাক্টিভ ভিডিও' : 'Interactive Videos',
      description: t('nav.features') === 'বৈশিষ্ট্যসমূহ'
        ? 'স্থানীয় বক্তা এবং সাংস্কৃতিক প্রসঙ্গ সহ HD ভিডিও পাঠ'
        : 'HD video lessons with native speakers and cultural context',
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      highlight: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'HD গুণমান' : 'HD Quality',
      category: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'বিষয়বস্তু' : 'Content'
    },
    {
      icon: "MessageCircle",
      title: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'AI কথোপকথন' : 'AI Conversation',
      description: t('nav.features') === 'বৈশিষ্ট্যসমূহ'
        ? '২৪/৭ উপলব্ধ AI শিক্ষকদের সাথে কথা বলার অনুশীলন করুন'
        : 'Practice speaking with AI tutors available 24/7',
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      highlight: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? '২৪/৭ উপলব্ধ' : '24/7 Available',
      category: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'AI-চালিত' : 'AI-Powered'
    },
    {
      icon: "Users",
      title: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'লাইভ ক্লাস' : 'Live Classes',
      description: t('nav.features') === 'বৈশিষ্ট্যসমূহ'
        ? 'লাইভ গ্রুপ সেশন এবং ১-অন-১ টিউটরিং এ যোগ দিন'
        : 'Join live group sessions and 1-on-1 tutoring',
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      highlight: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'বিশেষজ্ঞ শিক্ষক' : 'Expert Tutors',
      category: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'লাইভ শিক্ষা' : 'Live Learning'
    },
    {
      icon: "Award",
      title: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সার্টিফিকেট' : 'Certificates',
      description: t('nav.features') === 'বৈশিষ্ট্যসমূহ'
        ? 'স্তর সম্পূর্ণ করার সাথে সাথে স্বীকৃত সার্টিফিকেট অর্জন করুন'
        : 'Earn recognized certificates as you complete levels',
      gradient: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      highlight: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'স্বীকৃত' : 'Recognized',
      category: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'অর্জন' : 'Achievement'
    },
    {
      icon: "Globe",
      title: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সাংস্কৃতিক নিমজ্জন' : 'Cultural Immersion',
      description: t('nav.features') === 'বৈশিষ্ট্যসমূহ'
        ? 'জাপানি সংস্কৃতি, ঐতিহ্য এবং শিষ্টাচার সম্পর্কে শিখুন'
        : 'Learn about Japanese culture, traditions, and etiquette',
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      highlight: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'খাঁটি' : 'Authentic',
      category: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সংস্কৃতি' : 'Culture'
    }
  ];

  const stats = [
    {
      icon: "Users",
      label: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সক্রিয় শিক্ষার্থী' : 'Active Learners',
      value: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? '১০,০০০+' : '10,000+',
      color: "text-blue-600"
    },
    {
      icon: "BookOpen",
      label: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সম্পূর্ণ পাঠ' : 'Lessons Completed',
      value: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? '৫০,০০০+' : '50,000+',
      color: "text-emerald-600"
    },
    {
      icon: "Award",
      label: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'প্রদত্ত সার্টিফিকেট' : 'Certificates Issued',
      value: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? '২,৫০০+' : '2,500+',
      color: "text-purple-600"
    },
    {
      icon: "Clock",
      label: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'শেখার ঘন্টা' : 'Learning Hours',
      value: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? '১,০০,০০০+' : '100,000+',
      color: "text-orange-600"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-200/50 shadow-sm">
            {Icons.Sparkles && <Icons.Sparkles className="h-4 w-4 text-blue-500" />}
            <span className="text-sm font-medium text-gray-700">{t('features.title')}</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কেন বেছে নিবেন' : 'Why Choose'}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mx-3">
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'জাপানিজ শিখি' : 'Japanese Shikhi'}
            </span>
            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? '?' : '?'}
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const StatIcon = (Icons as any)[stat.icon] || Icons.Users;
            return (
              <Card key={index} className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  {StatIcon && <StatIcon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />}
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(settings?.features || defaultFeatures).map((feature, index) => {
            const IconComponent = (Icons as any)[feature.icon || 'BookOpen'];
            
            return (
              <Card
                key={index}
                className="group relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700">
                      Feature
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative">
                  <CardDescription className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-red-500 to-orange-500 border-0 shadow-2xl text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
              <p className="text-red-100 mb-6 text-lg">
                Join thousands of learners already mastering Japanese with our platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Start Free Trial
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  View Pricing
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}