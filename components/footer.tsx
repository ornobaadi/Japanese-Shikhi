import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";

export default function Footer() {
  const courseLinks = [
    "Beginner Japanese",
    "Intermediate Japanese", 
    "Advanced Japanese",
    "Business Japanese"
  ];

  const supportLinks = [
    "Help Center",
    "Contact Us",
    "Community",
    "Blog"
  ];

  const socialIcons = [
    { Icon: Facebook, label: "Facebook" },
    { Icon: Twitter, label: "Twitter" },
    { Icon: Instagram, label: "Instagram" },
    { Icon: Youtube, label: "Youtube" }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">日</span>
              </div>
              <span className="text-xl font-bold">Japanese Shikhi</span>
            </div>
            <p className="text-gray-400 text-sm">
              Master Japanese language with our comprehensive online courses and expert guidance.
            </p>
          </div>

          {/* Courses Section */}
          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {courseLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              {socialIcons.map(({ Icon, label }, index) => (
                <Icon 
                  key={index}
                  className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" 
                  aria-label={label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Japanese Shikhi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}