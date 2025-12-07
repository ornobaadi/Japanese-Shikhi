"use client";

import React, { useEffect, useState } from "react";
import { IconPhone, IconMail, IconBrandFacebook, IconBrandTiktok, IconBrandInstagram, IconBrandYoutube, IconBrandWhatsapp, IconLink } from "@tabler/icons-react";

interface Contact {
  _id?: string;
  phoneNumber?: string;
  email?: string;
  pageLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
  youtubeLink?: string;
  whatsappLink?: string;
}

export default function ContactSection() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch('/api/contact');
        if (response.ok) {
          const data = await response.json();
          setContact(data.data);
        }
      } catch (error) {
        console.error('Failed to load contact:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  if (loading || !contact) {
    return null;
  }

  const socialLinks = [
    { icon: IconBrandFacebook, link: contact.facebookLink, name: 'Facebook' },
    { icon: IconBrandTiktok, link: contact.tiktokLink, name: 'TikTok' },
    { icon: IconBrandInstagram, link: contact.instagramLink, name: 'Instagram' },
    { icon: IconBrandYoutube, link: contact.youtubeLink, name: 'YouTube' },
    { icon: IconBrandWhatsapp, link: contact.whatsappLink, name: 'WhatsApp' },
  ];

  return (
    <section id="contact" className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Have questions? We'd love to hear from you. Contact us anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Phone */}
          {contact.phoneNumber && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <IconPhone className="w-8 h-8 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Phone</h3>
              <a href={`tel:${contact.phoneNumber}`} className="text-blue-600 hover:underline">
                {contact.phoneNumber}
              </a>
            </div>
          )}

          {/* Email */}
          {contact.email && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <IconMail className="w-8 h-8 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Email</h3>
              <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                {contact.email}
              </a>
            </div>
          )}

          {/* Website */}
          {contact.pageLink && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <IconLink className="w-8 h-8 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Website</h3>
              <a href={contact.pageLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Visit Our Site
              </a>
            </div>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.some(link => link.link) && (
          <div className="mt-16">
            <h3 className="text-center text-xl font-semibold mb-8">Follow Us</h3>
            <div className="flex justify-center gap-6 flex-wrap">
              {socialLinks.map((social) => {
                if (!social.link) return null;
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                    title={social.name}
                  >
                    <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
