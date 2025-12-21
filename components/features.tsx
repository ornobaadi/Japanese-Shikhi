"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<LandingSettings | null>(null);
  const isBn = language === 'bn';

  const isEnglishText = (value?: string) => !!value && /[A-Za-z]/.test(value);
  const renderMaybeEnglish = (value: string) =>
    isBn && isEnglishText(value) ? (
      <span lang="en" className="font-inter-tight">
        {value}
      </span>
    ) : (
      value
    );

  const translateLandingFeature = (feature: Feature): Feature => {
    if (!isBn) return feature;

    const normalizedTitle = (feature.title || '').trim().toLowerCase();
    if (normalizedTitle === 'native instructors') {
      return { ...feature, title: t('features.native.title'), description: t('features.native.description') };
    }
    if (normalizedTitle === 'certified courses') {
      return { ...feature, title: t('features.certified.title'), description: t('features.certified.description') };
    }
    if (normalizedTitle === 'flexible schedule') {
      return { ...feature, title: t('features.flexible.title'), description: t('features.flexible.description') };
    }
    if (normalizedTitle === 'community support') {
      return { ...feature, title: t('features.community.title'), description: t('features.community.description') };
    }

    return feature;
  };

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
      title: isBn ? 'কাঠামোবদ্ধ পাঠ্যক্রম' : 'Structured Curriculum',
      description: isBn
        ? 'মৌলিক হিরাগানা থেকে উন্নত কাঞ্জি এবং ব্যাকরণ পর্যন্ত ক্রমিক পাঠ'
        : 'Progressive lessons from basic hiragana to advanced kanji and grammar',
    },
    {
      icon: "Video",
      title: isBn ? 'ইন্টারঅ্যাক্টিভ ভিডিও' : 'Interactive Videos',
      description: isBn
        ? 'স্থানীয় বক্তা এবং সাংস্কৃতিক প্রসঙ্গ সহ HD ভিডিও পাঠ'
        : 'HD video lessons with native speakers and cultural context',
    },
    {
      icon: "MessageCircle",
      title: isBn ? 'AI কথোপকথন' : 'AI Conversation',
      description: isBn
        ? '২৪/৭ উপলব্ধ AI শিক্ষকদের সাথে কথা বলার অনুশীলন করুন'
        : 'Practice speaking with AI tutors available 24/7',
    },
    {
      icon: "Users",
      title: isBn ? 'লাইভ ক্লাস' : 'Live Classes',
      description: isBn
        ? 'লাইভ গ্রুপ সেশন এবং ১-অন-১ টিউটরিং এ যোগ দিন'
        : 'Join live group sessions and 1-on-1 tutoring',
    },
    {
      icon: "Award",
      title: isBn ? 'সার্টিফিকেট' : 'Certificates',
      description: isBn
        ? 'স্তর সম্পূর্ণ করার সাথে সাথে স্বীকৃত সার্টিফিকেট অর্জন করুন'
        : 'Earn recognized certificates as you complete levels',
    },
    {
      icon: "Globe",
      title: isBn ? 'সাংস্কৃতিক নিমজ্জন' : 'Cultural Immersion',
      description: isBn
        ? 'জাপানি সংস্কৃতি, ঐতিহ্য এবং শিষ্টাচার সম্পর্কে শিখুন'
        : 'Learn about Japanese culture, traditions, and etiquette',
    }
  ];

  const features = settings?.features?.length ? settings.features : defaultFeatures;

  const resolveIcon = (rawIconName?: string) => {
    if (!rawIconName) return (Icons as any).BookOpen;

    const direct = (Icons as any)[rawIconName];
    if (direct) return direct;

    const stripped = rawIconName.replace(/[^a-zA-Z0-9]/g, "");
    const strippedMatch = (Icons as any)[stripped];
    if (strippedMatch) return strippedMatch;

    const pascal = rawIconName
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join("");
    const pascalMatch = (Icons as any)[pascal];
    if (pascalMatch) return pascalMatch;

    return (Icons as any).BookOpen;
  };

  // Avoid the "single card on last row" look on large screens
  const lgCols = features.length <= 4
    ? "lg:grid-cols-2"
    : (features.length % 3 === 1 ? "lg:grid-cols-2" : "lg:grid-cols-3");
  const smCols = features.length === 1 ? "sm:grid-cols-1" : "sm:grid-cols-2";
  const gridCols = `grid ${smCols} ${lgCols} gap-6`;

  return (
    <section id="features" className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-7 md:mb-9">
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
              {isBn ? "কেন আমরা আলাদা" : "Why we’re different"}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isBn ? 'কেন বেছে নিবেন ' : 'Why choose '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              {isBn ? 'জাপানিজ শিখি' : 'Japanese Shikhi'}
            </span>
            {isBn ? '?' : '?'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className={gridCols}>
          {features.map((feature, index) => {
            const IconComponent = resolveIcon(feature.icon);
            const displayFeature = translateLandingFeature(feature);
            
            return (
              <Card
                key={index}
                className="relative overflow-hidden bg-white border border-border/60 shadow-sm hover:shadow-md hover:border-orange-200 transition-shadow"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500/30 to-orange-500/30" />
                <CardHeader className="pb-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-orange-100 flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-orange-700" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {renderMaybeEnglish(displayFeature.title)}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {renderMaybeEnglish(displayFeature.description)}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}