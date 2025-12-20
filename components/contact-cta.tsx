"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone } from "lucide-react";

export default function ContactCta() {
  const { t } = useLanguage();
  const isBn = t("nav.features") === "বৈশিষ্ট্যসমূহ";

  const email = t("footer.contact.email");
  const phone = t("footer.contact.phone");

  return (
    <section id="contact" className="py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isBn ? "যোগাযোগ" : "Contact"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isBn
              ? "সাইন আপ করে আজই শেখা শুরু করুন — প্রয়োজনে আমাদের সাথে কথা বলুন।"
              : "Start learning today—sign up in minutes. Need help? Contact us."}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                {isBn ? "সাপোর্ট ও যোগাযোগ" : "Support & contact"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-600">{email}</div>
                  </div>
                </a>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Phone</div>
                    <div className="text-sm text-gray-600">{phone}</div>
                  </div>
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <a href="/sign-up">{t("nav.startForFree")}</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${email}`}>{isBn ? "ইমেইল করুন" : "Email us"}</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
