'use client';

import { useEffect } from 'react';
import Navbar from "./blocks/Navbar";
import Hero from "@/components/hero";
import About from "@/components/about";
import HowItWorks from "@/components/how-it-works";
import Features from "@/components/features";
import Courses from "@/components/courses";
import Pricing from "@/components/pricing";
import BlogSection from "@/components/blog-section";
import Testimonials from "@/components/testimonials";
import ContactCta from "@/components/contact-cta";
import Footer from "@/components/footer";

export default function Home() {
  useEffect(() => {
    // Track homepage view
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
      (window as any).fbq('trackCustom', 'HomePageVisit', {
        page_name: 'Homepage',
        page_type: 'landing'
      });
    }
    // --- Hash scroll fix for deep links (Contact, Courses, Features) ---
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <Hero />
        <About />
        <HowItWorks />
        <Features />
        <Courses />
        <Testimonials />
        <BlogSection />
        <ContactCta />
      </main>
    </>
  );
}
