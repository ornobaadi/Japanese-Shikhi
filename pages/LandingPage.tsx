import React from "react";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Courses from "@/components/courses";
import Testimonials from "@/components/testimonials";
import Pricing from "@/components/pricing";
import Footer from "@/components/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Courses />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
}
