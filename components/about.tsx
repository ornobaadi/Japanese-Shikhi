"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, MessageCircle, Trophy } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  const isBn = t("nav.features") === "বৈশিষ্ট্যসমূহ";

  const items = [
    {
      title: isBn ? "কাঠামোবদ্ধ পাঠ" : "Structured lessons",
      description: isBn
        ? "হিরাগানা → কাতাকানা → ব্যাকরণ → কাঞ্জি, ধাপে ধাপে।"
        : "Hiragana → katakana → grammar → kanji, step by step.",
      Icon: BookOpen,
    },
    {
      title: isBn ? "অনুশীলন + ফিডব্যাক" : "Practice + feedback",
      description: isBn
        ? "কুইজ ও অনুশীলনে দ্রুত আত্মবিশ্বাস বাড়ান।"
        : "Quizzes and practice that build real confidence.",
      Icon: MessageCircle,
    },
    {
      title: isBn ? "অগ্রগতি ট্র্যাকিং" : "Progress tracking",
      description: isBn
        ? "লক্ষ্য সেট করুন, স্ট্রিক ধরে রাখুন।"
        : "Set goals, keep streaks, stay consistent.",
      Icon: Trophy,
    },
  ];

  return (
    <section id="about" className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-7 md:mb-9">
          <div className="flex justify-center mb-3">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border border-orange-200">
              {isBn ? "ঝটপট ধারণা" : "Quick overview"}
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isBn ? "জাপানিজ শিখি সম্পর্কে" : "About Japanese Shikhi"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isBn
              ? "বাস্তব কাজে লাগে এমন জাপানি শিখুন — পরিষ্কারভাবে, ধারাবাহিকভাবে।"
              : "Learn practical Japanese—clearly, consistently, and with momentum."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map(({ title, description, Icon }) => (
            <Card
              key={title}
              className="bg-white border border-border/60 shadow-sm hover:shadow-md hover:border-orange-200 transition-shadow"
            >
              <CardHeader>
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-orange-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-orange-700" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
