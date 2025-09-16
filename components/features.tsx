import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Award,
  Globe,
  Video,
  MessageCircle,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: BookOpen,
      title: "Structured Curriculum",
      description: "Progressive lessons from basic hiragana to advanced kanji and grammar"
    },
    {
      icon: Video,
      title: "Interactive Videos",
      description: "HD video lessons with native speakers and cultural context"
    },
    {
      icon: MessageCircle,
      title: "AI Conversation",
      description: "Practice speaking with AI tutors available 24/7"
    },
    {
      icon: Users,
      title: "Live Classes",
      description: "Join live group sessions and 1-on-1 tutoring"
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Earn recognized certificates as you complete levels"
    },
    {
      icon: Globe,
      title: "Cultural Immersion",
      description: "Learn about Japanese culture, traditions, and etiquette"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Why Choose Japanese Shikhi?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the most effective way to learn Japanese with our comprehensive platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}