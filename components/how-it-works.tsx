"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpenCheck, Sparkles, LineChart } from "lucide-react";

export default function HowItWorks() {
  const { t } = useLanguage();
  const isBn = t("nav.features") === "বৈশিষ্ট্যসমূহ";

  const steps = [
    {
      step: 1,
      title: isBn ? "কোর্স বেছে নিন" : "Pick a course",
      description: isBn
        ? "আপনার স্তর অনুযায়ী কোর্স শুরু করুন।"
        : "Start with a course that matches your level.",
      Icon: BookOpenCheck,
    },
    {
      step: 2,
      title: isBn ? "নিয়মিত অনুশীলন" : "Practice daily",
      description: isBn
        ? "লেসন, কুইজ, এবং অনুশীলনে দক্ষতা বাড়ান।"
        : "Use lessons and quizzes to build strong fundamentals.",
      Icon: Sparkles,
    },
    {
      step: 3,
      title: isBn ? "অগ্রগতি ট্র্যাক করুন" : "Track your progress",
      description: isBn
        ? "অগ্রগতি দেখে লক্ষ্য অনুযায়ী এগিয়ে যান।"
        : "See your progress and keep momentum.",
      Icon: LineChart,
    },
  ];

  return (
    <section id="how-it-works" className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-7 md:mb-9">
          <div className="flex justify-center mb-3">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border border-orange-200">
              {isBn ? "৩টি ধাপে শুরু" : "Start in 3 steps"}
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isBn ? "এটি কিভাবে কাজ করে" : "How it works"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isBn
              ? "সহজ, দ্রুত, এবং মজার শেখার রুটিন।"
              : "A simple, fast, and fun routine."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ step, title, description, Icon }) => (
            <Card
              key={step}
              className="bg-white border border-border/60 shadow-sm hover:shadow-md hover:border-orange-200 transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border border-orange-200">
                    {step}
                  </Badge>
                  <Icon className="w-5 h-5 text-orange-700" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
