import mongoose from 'mongoose';

const LandingPageSettingsSchema = new mongoose.Schema({
  // Hero Section
  hero: {
    heading: { type: String, default: 'Learn Japanese Language' },
    subheading: { type: String, default: 'Master Japanese with Expert Instructors' },
    description: { type: String, default: 'Join thousands of students learning Japanese online' },
    ctaPrimary: { type: String, default: 'Get Started' },
    ctaSecondary: { type: String, default: 'View Courses' },
  },

  // Features Section
  features: [{
    icon: { type: String, required: true }, // Tabler icon name
    title: { type: String, required: true },
    description: { type: String, required: true },
  }],

  // Stats Section (Enrollment Counter)
  stats: {
    baseEnrollmentCount: { type: Number, default: 50 }, // Starting count
    showRealCount: { type: Boolean, default: true }, // If true, shows base + real enrollments
    coursesCount: { type: Number, default: 10 },
    instructorsCount: { type: Number, default: 5 },
    successRate: { type: Number, default: 95 },
  },

  // Testimonials Section
  testimonials: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    image: { type: String },
  }],

  // Pricing Section
  pricing: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    duration: { type: String, default: 'month' },
    features: [{ type: String }],
    popular: { type: Boolean, default: false },
    ctaText: { type: String, default: 'Get Started' },
  }],

  // SEO & Meta
  seo: {
    title: { type: String, default: 'Japanese Shikhi - Learn Japanese Online' },
    description: { type: String, default: 'Learn Japanese language online with expert instructors' },
    keywords: [{ type: String }],
  },

  // Site Settings
  siteName: { type: String, default: 'Japanese Shikhi' },
  contactEmail: { type: String },
  contactPhone: { type: String },
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    youtube: { type: String },
  },

  // Active/Inactive
  isActive: { type: Boolean, default: true },
  
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const LandingPageSettings = mongoose.models.LandingPageSettings || mongoose.model('LandingPageSettings', LandingPageSettingsSchema);

export default LandingPageSettings;
