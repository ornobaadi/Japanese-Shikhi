"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import * as Icons from "lucide-react";

interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  popular: boolean;
  ctaText: string;
}

interface LandingSettings {
  pricing: PricingPlan[];
}

export default function Pricing() {
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
  const plans = [
    {
      name: t('pricing.free'),
      price: 0,
      duration: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? '৭ দিন' : '7 days',
      badge: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এখান থেকে শুরু' : 'Start Here',
      badgeColor: "bg-green-100 text-green-700",
      features: [
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'শিক্ষানবিস কোর্সে অ্যাক্সেস' : 'Access to beginner courses',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'মৌলিক হিরাগানা ও কাতাকানা পাঠ' : 'Basic hiragana & katakana lessons',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সীমিত AI কথোপকথন অনুশীলন' : 'Limited AI conversation practice',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কমিউনিটি ফোরাম অ্যাক্সেস' : 'Community forum access',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'মোবাইল অ্যাপ অ্যাক্সেস' : 'Mobile app access'
      ],
      buttonText: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'বিনামূল্যে ট্রায়াল শুরু করুন' : 'Start Free Trial',
      buttonStyle: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
    },
    {
      name: t('pricing.premium'),
      price: 29,
      duration: t('pricing.month'),
      badge: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সবচেয়ে জনপ্রিয়' : 'Most Popular',
      badgeColor: "bg-orange-100 text-orange-700",
      features: [
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সকল কোর্স স্তর (শিক্ষানবিস থেকে উন্নত)' : 'All course levels (Beginner to Advanced)',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'লাইভ গ্রুপ ক্লাস ও ১-অন-১ টিউটরিং' : 'Live group classes & 1-on-1 tutoring',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সীমাহীন AI কথোপকথন অনুশীলন' : 'Unlimited AI conversation practice',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'অগ্রগতি ট্র্যাকিং ও সার্টিফিকেট' : 'Progress tracking & certificates',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'মোবাইল অ্যাপ অ্যাক্সেস' : 'Mobile app access',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কমিউনিটি ফোরাম অ্যাক্সেস' : 'Community forum access',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ডাউনলোডযোগ্য রিসোর্স' : 'Downloadable resources',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'অগ্রাধিকার গ্রাহক সহায়তা' : 'Priority customer support'
      ],
      buttonText: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'প্রিমিয়াম নিন' : 'Get Premium',
      buttonStyle: "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
    },
    {
      name: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'লাইফটাইম' : 'Lifetime',
      price: 299,
      duration: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এক-বার' : 'one-time',
      badge: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সেরা মূল্য' : 'Best Value',
      badgeColor: "bg-purple-100 text-purple-700",
      features: [
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'প্রিমিয়ামের সব কিছু' : 'Everything in Premium',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সকল কনটেন্টে আজীবন অ্যাক্সেস' : 'Lifetime access to all content',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ভবিষ্যৎ কোর্স আপডেট অন্তর্ভুক্ত' : 'Future course updates included',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'এক্সক্লুসিভ মাস্টারক্লাস সেশন' : 'Exclusive masterclass sessions',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ব্যক্তিগত লার্নিং পরামর্শদাতা' : 'Personal learning consultant',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কাস্টম স্টাডি পরিকল্পনা তৈরি' : 'Custom study plan creation',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'উন্নত বিশ্লেষণ ড্যাশবোর্ড' : 'Advanced analytics dashboard',
        t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ভিআইপি কমিউনিটি অ্যাক্সেস' : 'VIP community access'
      ],
      buttonText: t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'আজীবন অ্যাক্সেস নিন' : 'Get Lifetime Access',
      buttonStyle: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-200/50 shadow-sm">
            {Icons.Sparkles && <Icons.Sparkles className="h-4 w-4 text-orange-500" />}
            <span className="text-sm font-medium text-gray-700">{t('pricing.title')}</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'আপনার বেছে নিন' : 'Choose Your'}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mx-3">
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'শেখার পথ' : 'Learning Path'}
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden ${index === 1 ? 'ring-2 ring-orange-200 scale-105' : ''
                }`}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4">
                <Badge className={`${plan.badgeColor} font-semibold`}>
                  {plan.badge}
                </Badge>
              </div>

              {/* Popular plan highlight */}
              {index === 1 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              )}

              <CardHeader className="pb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                      {index === 0 && Icons.Star && <Icons.Star className="h-5 w-5 text-green-500" />}
                      {index === 1 && Icons.Zap && <Icons.Zap className="h-5 w-5 text-orange-500" />}
                      {index === 2 && Icons.Crown && <Icons.Crown className="h-5 w-5 text-purple-500" />}
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </CardTitle>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ৳{plan.price}
                      </span>
                      <span className="text-lg text-gray-500">
                        /{plan.duration}
                      </span>
                    </div>
                    {plan.price === 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        {t('pricing.noCreditCard')}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                        {Icons.CheckCircle && <Icons.CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />}
                      <span className="text-sm text-gray-700 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className={`w-full ${plan.buttonStyle} text-white shadow-lg hover:shadow-xl transition-all duration-300 group`}
                >
                  {plan.buttonText}
                    {index === 1 && Icons.Zap && <Icons.Zap className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />}
                </Button>

                {/* Additional Info */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {index === 0 && t('pricing.upgradeAnytime')}
                    {index === 1 && t('pricing.cancelAnytime')}
                    {index === 2 && t('pricing.oneTimePayment')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Section */}
        <div className="text-center mt-16 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-2 text-gray-600">
              {Icons.CheckCircle && <Icons.CheckCircle className="h-5 w-5 text-green-500" />}
              <span className="text-sm">{t('pricing.guarantee')}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
                {Icons.CheckCircle && <Icons.CheckCircle className="h-5 w-5 text-green-500" />}
              <span className="text-sm">{t('pricing.securePayment')}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
                {Icons.CheckCircle && <Icons.CheckCircle className="h-5 w-5 text-green-500" />}
              <span className="text-sm">{t('pricing.satisfiedLearners')}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            {t('pricing.trustText')}
          </p>
        </div>
      </div>
    </section>
  );
}