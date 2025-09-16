import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function Pricing() {
  const features = [
    "All course levels (Beginner to Advanced)",
    "Live group classes & 1-on-1 tutoring",
    "AI conversation practice",
    "Progress tracking & certificates",
    "Mobile app access",
    "Community forum access"
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-r from-red-500 to-orange-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 text-white">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to Start Your Japanese Journey?
          </h2>
          <p className="text-xl opacity-90">
            Join thousands of successful learners. Start with our free trial today!
          </p>

          <div className="bg-white rounded-2xl p-8 text-gray-900 max-w-md mx-auto">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Premium Access</h3>
              <div className="text-4xl font-bold">
                $29<span className="text-lg text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 text-left">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg py-6">
                Start 7-Day Free Trial
              </Button>
              <p className="text-xs text-gray-500">
                Cancel anytime • No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}