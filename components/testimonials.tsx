"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
}

interface LandingSettings {
  testimonials: Testimonial[];
}

export default function Testimonials() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<LandingSettings | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/landing-settings').then(res => res.json()),
      fetch('/api/ratings').then(res => res.json())
    ])
      .then(([settingsData, ratingsData]) => {
        if (settingsData.success) {
          setSettings(settingsData.data);
        }
        if (ratingsData.success && Array.isArray(ratingsData.data)) {
          // Get top rated reviews, sorted by rating (descending)
          const topRatings = ratingsData.data
            .filter((r: any) => r.rating >= 4 && r.review) // Only 4+ star reviews with text
            .sort((a: any, b: any) => b.rating - a.rating)
            .slice(0, 3)
            .map((r: any) => ({
              name: r.userName,
              role: r.courseName,
              content: r.review,
              rating: r.rating,
              avatar: r.userName.charAt(0).toUpperCase(),
              gradient: 'from-green-500 to-emerald-500',
              achievement: 'Verified Student',
              verified: r.verified
            }));
          setRatings(topRatings);
        }
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  const defaultTestimonials = [
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
    <section id="testimonials" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'শিক্ষার্থীদের মতামত' : 'What Our Students Say'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(ratings.length > 0
            ? [...ratings, ...(settings?.testimonials || defaultTestimonials).slice(0, 3 - ratings.length)]
            : (settings?.testimonials || defaultTestimonials)
          ).map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow"
            >

              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{testimonial.name}</CardTitle>
                    <CardDescription className="text-sm">{testimonial.role}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={
                        "w-4 h-4 " +
                        (star <= Math.round((testimonial as any).rating || 5)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-200")
                      }
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}