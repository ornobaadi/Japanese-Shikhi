"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart,
  Star,
  Globe
} from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const quickLinks = [
    { name: t('footer.aboutUs'), href: "#about" },
    { name: t('footer.howItWorks'), href: "#how-it-works" },
    { name: t('footer.successStories'), href: "#testimonials" },
    { name: t('footer.blog'), href: "#blog" }
  ];

  const courseLinks = [
    { name: t('footer.beginnerJapanese'), href: "#courses", badge: t('footer.popular') },
    { name: t('footer.intermediateJapanese'), href: "#courses" },
    { name: t('footer.advancedJapanese'), href: "#courses" },
    { name: t('footer.businessJapanese'), href: "#courses", badge: t('footer.new') },
    { name: t('footer.jlptPreparation'), href: "#courses" },
    { name: t('footer.conversationPractice'), href: "#courses" }
  ];

  const supportLinks = [
    { name: t('footer.helpCenter'), href: "#help" },
    { name: t('footer.contactSupport'), href: "#contact" },
    { name: t('footer.communityForum'), href: "#community" },
    { name: t('footer.privacyPolicy'), href: "#privacy" },
    { name: t('footer.termsOfService'), href: "#terms" },
    { name: t('footer.refundPolicy'), href: "#refund" }
  ];

  const socialIcons = [
    { Icon: Facebook, label: "Facebook", href: "#", color: "hover:text-blue-400" },
    { Icon: Twitter, label: "Twitter", href: "#", color: "hover:text-sky-400" },
    { Icon: Instagram, label: "Instagram", href: "#", color: "hover:text-pink-400" },
    { Icon: Youtube, label: "Youtube", href: "#", color: "hover:text-red-400" }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative">
        {/* Newsletter Section */}
        <div className="border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="bg-gradient-to-r from-red-500 to-orange-500 border-0 shadow-2xl">
              <CardContent className="p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">{t('footer.newsletter.title')}</h3>
                <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                  {t('footer.newsletter.subtitle')} {t('footer.newsletter.community')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder={t('footer.newsletter.placeholder')}
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white/50"
                  />
                  <Button className="bg-white text-red-600 hover:bg-gray-100 px-6 py-3 font-semibold">
                    {t('footer.newsletter.subscribe')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <p className="text-xs text-red-100 mt-4">
                  {t('footer.newsletter.noSpam')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-8">

            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">日</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Japanese Shikhi
                  </span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  {t('footer.brand.description')}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">{t('footer.contact.email')}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">{t('footer.contact.phone')}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Globe className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">{t('footer.contact.available')}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-700">
                  <Star className="w-3 h-3 mr-1" />
                  {t('footer.rating')}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">
                  {t('footer.students')}
                </Badge>
                <Badge className="bg-purple-100 text-purple-700">
                  {t('footer.certified')}
                </Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="font-bold text-lg text-white">{t('footer.quickLinks')}</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Courses */}
            <div className="space-y-6">
              <h4 className="font-bold text-lg text-white">{t('footer.courses')}</h4>
              <ul className="space-y-3">
                {courseLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center justify-between group"
                    >
                      <span className="flex items-center">
                        <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.name}
                      </span>
                      {link.badge && (
                        <Badge
                          className={`text-xs ${link.badge === t('footer.popular')
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                            }`}
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h4 className="font-bold text-lg text-white">{t('footer.support')}</h4>
              <ul className="space-y-3">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Social Icons */}
              <div className="space-y-4">
                <h5 className="font-semibold text-white">{t('footer.followUs')}</h5>
                <div className="flex space-x-4">
                  {socialIcons.map(({ Icon, label, href, color }, index) => (
                    <a
                      key={index}
                      href={href}
                      aria-label={label}
                      className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center ${color} transition-all duration-300 hover:scale-110 hover:shadow-lg group`}
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <span>{t('footer.copyright')}</span>
                <span className="hidden md:block">•</span>
                <span className="flex items-center">
                  {t('footer.madeWith')} <Heart className="w-4 h-4 text-red-500 mx-1" />
                </span>
              </div>

              <div className="flex items-center space-x-6 text-gray-400 text-sm">
                <a href="#privacy" className="hover:text-white transition-colors">{t('footer.privacyLink')}</a>
                <a href="#terms" className="hover:text-white transition-colors">{t('footer.termsLink')}</a>
                <a href="#cookies" className="hover:text-white transition-colors">{t('footer.cookies')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}