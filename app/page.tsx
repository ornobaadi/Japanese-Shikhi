'use client';

import { useEffect } from 'react';
import Navbar from "./blocks/Navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Courses from "@/components/courses";
import BlogSection from "@/components/blog-section";
import Testimonials from "@/components/testimonials";
import ContactSection from "@/components/contact-section";
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
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <Features />
        <Courses />
        <BlogSection />
        <Testimonials />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
