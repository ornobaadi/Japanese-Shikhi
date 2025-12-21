"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "@/components/ui/globe";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Play,
  Star,
  Users,
  BookOpen,
  ArrowRight
} from "lucide-react";

const HERO_GLOBE_CONFIG = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.9, 0.9, 0.9] as [number, number, number],
  markerColor: [251 / 255, 100 / 255, 21 / 255] as [number, number, number],
  glowColor: [1, 1, 1] as [number, number, number],
  onRender: (state: any) => { },
  markers: [
    { location: [35.6762, 139.6503] as [number, number], size: 0.12 },
    { location: [34.6937, 135.5023] as [number, number], size: 0.08 },
    { location: [40.7128, -74.006] as [number, number], size: 0.06 },
    { location: [51.5074, -0.1278] as [number, number], size: 0.06 },
    { location: [48.8566, 2.3522] as [number, number], size: 0.06 },
    { location: [37.7749, -122.4194] as [number, number], size: 0.06 },
    { location: [1.3521, 103.8198] as [number, number], size: 0.06 },
    { location: [-33.8688, 151.2093] as [number, number], size: 0.06 },
  ],
};

interface LandingSettings {
  hero: {
    heading: string;
    subheading: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: {
    totalEnrollments: number;
    coursesCount: number;
    instructorsCount: number;
    successRate: number;
  };
}

export default function Hero() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<LandingSettings | null>(null);

  const isEnglishText = (value?: string) => !!value && /[A-Za-z]/.test(value);

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

  return (
    <section className="relative bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-40 right-20 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-16 md:pb-20">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-8">

            {/* Trust Badge - Simplified */}
            <Badge variant="secondary" className="w-fit bg-orange-50 text-orange-700 border-orange-200">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                ? `${settings?.stats.totalEnrollments || '50+'}+ শিক্ষার্থীর বিশ্বস্ত`
                : `Trusted by ${settings?.stats.totalEnrollments || '50+'}+ learners`}
            </Badge>

            {/* Main Heading - Simplified */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                {(() => {
                  const heading = settings?.hero.heading || t('hero.title');
                  // Landing settings often contain English even in BN mode.
                  if (language === 'bn' && isEnglishText(heading)) {
                    return (
                      <span lang="en" className="font-inter-tight">
                        {heading}
                      </span>
                    );
                  }
                  return heading;
                })()}
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'জাপানি ভাষা' : 'Japanese Language'}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Single Clear CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.location.href = '/courses'}
              >
                {settings?.hero.ctaPrimary || t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-2"
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'আরও জানুন' : 'Learn More'}
              </Button>
            </div>

            {/* Cleaner Stats */}
            <div className="flex items-center gap-6 sm:gap-8 pt-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{settings?.stats.totalEnrollments || '50+'}+</div>
                <div className="text-sm text-gray-600">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'শিক্ষার্থী' : 'Students'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{settings?.stats.coursesCount || '10+'}+</div>
                <div className="text-sm text-gray-600">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'কোর্স' : 'Courses'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{settings?.stats.successRate || '95'}%</div>
                <div className="text-sm text-gray-600">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'সফলতা' : 'Success'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Simplified Globe Section */}
          <div className="relative hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              {/* Globe container */}
              <div className="relative z-10">
                <Globe className="drop-shadow-lg" config={HERO_GLOBE_CONFIG} />
              </div>

              {/* Simplified floating cards */}
              <Card className="absolute top-16 left-8 bg-white shadow-lg border-0 z-20 hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">こんにちは</span>
                    <div className="text-xs text-gray-600">
                      <div
                        lang="en"
                        className={`font-semibold text-gray-800 ${language === 'bn' ? 'font-inter-tight' : ''}`}
                      >
                        Hello
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute bottom-16 right-8 bg-white shadow-lg border-0 z-20 hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">ありがとう</span>
                    <div className="text-xs text-gray-600">
                      <div
                        lang="en"
                        className={`font-semibold text-gray-800 ${language === 'bn' ? 'font-inter-tight' : ''}`}
                      >
                        Thank you
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute top-1/3 right-0 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg border-0 z-20 hover:shadow-xl transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-red-600">漢字</div>
                  <div
                    lang="en"
                    className={`text-xs text-gray-600 mt-1 ${language === 'bn' ? 'font-inter-tight' : ''}`}
                  >
                    Kanji
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}