"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe } from "@/components/ui/globe";
import {
  Play,
  Video,
  Star,
  Users
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
  onRender: (state: any) => {},
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
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Subtle background decorative elements */}
      <div className="absolute top-32 right-32 w-64 h-64 bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-32 left-32 w-48 h-48 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Centered Content Layout */}
        <div className="text-center space-y-2">
          
          {/* Header Section */}
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Title */}
            <div className="space-y-4 pt-20">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600">Japanese</span> Language
              </h1>

              {/* Subtitle */}
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Transform from complete beginner to confident speaker with our 
                <span className="font-semibold text-gray-800"> AI-powered curriculum</span> and 
                <span className="font-semibold text-gray-800"> live expert guidance</span>.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-base px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base px-8 py-3 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
              >
                <Video className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>


          </div>

          {/* Globe Section */}
          <div className="relative flex justify-center items-center pt-12">
            <div className="relative w-full max-w-[400px] aspect-square">
              {/* Globe container with enhanced styling */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/5 to-orange-500/5 blur-2xl"></div>
              <div className="relative z-10">
                <Globe className="drop-shadow-2xl" config={HERO_GLOBE_CONFIG} />
              </div>
              
              <div className="absolute top-16 left-8 bg-white rounded-xl shadow-lg p-4 border border-gray-100 z-20 transform rotate-[-5deg]">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">こんにちは</span>
                  <div className="text-xs text-gray-500">
                    <div className="font-medium">Hello</div>
                    <div>Konnichiwa</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-16 right-8 bg-white rounded-xl shadow-lg p-4 border border-gray-100 z-20 transform rotate-[5deg]">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">ありがとう</span>
                  <div className="text-xs text-gray-500">
                    <div className="font-medium">Thank you</div>
                    <div>Arigatou</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 right-0 bg-white rounded-xl shadow-lg p-3 border border-gray-100 z-20 transform translate-x-4 rotate-[3deg]">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-500">漢字</div>
                  <div className="text-xs text-gray-500">Kanji</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}