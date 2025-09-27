"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "@/components/ui/globe";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Play,
  Video,
  Star,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle
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

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">

            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-200/50 shadow-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                  ? '১০,০০০+ শিক্ষার্থীর বিশ্বস্ত'
                  : 'Trusted by 10,000+ learners'}
              </span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                4.9/5
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                {t('hero.title')}
                <span className="relative mx-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 animate-gradient bg-[length:200%_200%]">
                    {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'জাপানি' : 'Japanese'}
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-red-200 to-orange-200 rounded-full opacity-30"></div>
                </span>
                <br />
                {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ভাষা' : 'Language'}
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{t('features.interactive.title')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'লাইভ কথোপকথন' : 'Live conversations'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ' ? 'ব্যক্তিগত পথ' : 'Personalized path'}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group text-lg px-8 py-4 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 transition-all duration-300 hover:shadow-lg"
              >
                <Video className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                {t('hero.watchDemo')}
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? '১০,০০০+ সক্রিয় শিক্ষার্থী'
                    : '10,000+ active learners'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-gray-600">
                  {t('nav.features') === 'বৈশিষ্ট্যসমূহ'
                    ? '৫০০+ পাঠ উপলব্ধ'
                    : '500+ lessons available'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Globe Section */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              {/* Enhanced Globe background glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 blur-3xl animate-pulse"></div>

              {/* Globe container */}
              <div className="relative z-10 hover:scale-105 transition-transform duration-700">
                <Globe className="drop-shadow-2xl" config={HERO_GLOBE_CONFIG} />
              </div>

              {/* Floating Japanese cards with enhanced animations */}
              <Card className="absolute top-16 left-8 bg-white/95 backdrop-blur-sm shadow-xl border-0 z-20 transform rotate-[-5deg] hover:rotate-[-2deg] transition-transform duration-300 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">こんにちは</span>
                    <div className="text-xs text-gray-600">
                      <div className="font-semibold text-gray-800">Hello</div>
                      <div className="text-gray-500">Konnichiwa</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute bottom-16 right-8 bg-white/95 backdrop-blur-sm shadow-xl border-0 z-20 transform rotate-[5deg] hover:rotate-[2deg] transition-transform duration-300 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">ありがとう</span>
                    <div className="text-xs text-gray-600">
                      <div className="font-semibold text-gray-800">Thank you</div>
                      <div className="text-gray-500">Arigatou</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute top-1/2 right-0 bg-gradient-to-br from-red-50 to-orange-50 backdrop-blur-sm shadow-xl border-0 z-20 transform translate-x-4 rotate-[3deg] hover:rotate-[1deg] transition-transform duration-300 cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 group-hover:scale-110 transition-transform">漢字</div>
                  <div className="text-xs text-gray-600 mt-1">Kanji</div>
                </CardContent>
              </Card>

              <Card className="absolute top-1/4 left-0 bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-sm shadow-xl border-0 z-20 transform -translate-x-4 rotate-[-3deg] hover:rotate-[-1deg] transition-transform duration-300 cursor-pointer group">
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-blue-600 group-hover:scale-110 transition-transform">ひらがな</div>
                  <div className="text-xs text-gray-600 mt-1">Hiragana</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}