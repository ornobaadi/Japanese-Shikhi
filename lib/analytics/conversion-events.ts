/**
 * Conversion Event Tracking Helpers
 * 
 * This file contains helper functions to track important conversion events
 * across Facebook Pixel, Google Analytics, and TikTok Pixel.
 */

import { trackFacebookEvent } from '@/components/analytics/FacebookPixel';
import { trackGoogleEvent } from '@/components/analytics/GoogleAnalytics';
import { trackTikTokEvent } from '@/components/analytics/TikTokPixel';

/**
 * Track when a user views a course
 */
export const trackCourseView = (courseId: string, courseName: string, price: number) => {
  // Facebook: ViewContent event
  trackFacebookEvent('ViewContent', {
    content_ids: [courseId],
    content_name: courseName,
    content_type: 'product',
    value: price,
    currency: 'BDT',
  });

  // Google Analytics: view_item event
  trackGoogleEvent('view_item', {
    items: [{
      item_id: courseId,
      item_name: courseName,
      price: price,
      currency: 'BDT',
    }],
  });

  // TikTok: ViewContent event
  trackTikTokEvent('ViewContent', {
    content_id: courseId,
    content_name: courseName,
    content_type: 'product',
    value: price,
    currency: 'BDT',
  });
};

/**
 * Track when a user enrolls in a course (free or paid)
 */
export const trackCourseEnrollment = (courseId: string, courseName: string, price: number, isFree: boolean = false) => {
  if (isFree) {
    // Free enrollment - track as CompleteRegistration
    trackFacebookEvent('CompleteRegistration', {
      content_name: courseName,
      content_ids: [courseId],
      status: true,
    });

    trackGoogleEvent('sign_up', {
      method: 'course_enrollment',
      item_name: courseName,
    });

    trackTikTokEvent('CompleteRegistration', {
      content_id: courseId,
      content_name: courseName,
    });
  } else {
    // Paid enrollment - track as Purchase/InitiateCheckout
    trackFacebookEvent('InitiateCheckout', {
      content_ids: [courseId],
      content_name: courseName,
      content_type: 'product',
      value: price,
      currency: 'BDT',
    });

    trackGoogleEvent('begin_checkout', {
      items: [{
        item_id: courseId,
        item_name: courseName,
        price: price,
        currency: 'BDT',
      }],
      value: price,
      currency: 'BDT',
    });

    trackTikTokEvent('InitiateCheckout', {
      content_id: courseId,
      content_name: courseName,
      value: price,
      currency: 'BDT',
    });
  }
};

/**
 * Track successful payment/purchase
 */
export const trackPaymentSuccess = (
  courseId: string,
  courseName: string,
  price: number,
  transactionId: string
) => {
  // Facebook: Purchase event
  trackFacebookEvent('Purchase', {
    content_ids: [courseId],
    content_name: courseName,
    content_type: 'product',
    value: price,
    currency: 'BDT',
  });

  // Google Analytics: purchase event
  trackGoogleEvent('purchase', {
    transaction_id: transactionId,
    value: price,
    currency: 'BDT',
    items: [{
      item_id: courseId,
      item_name: courseName,
      price: price,
    }],
  });

  // TikTok: CompletePayment event
  trackTikTokEvent('CompletePayment', {
    content_id: courseId,
    content_name: courseName,
    value: price,
    currency: 'BDT',
  });
};

/**
 * Track when a user adds a course to cart
 */
export const trackAddToCart = (courseId: string, courseName: string, price: number) => {
  // Facebook: AddToCart event
  trackFacebookEvent('AddToCart', {
    content_ids: [courseId],
    content_name: courseName,
    content_type: 'product',
    value: price,
    currency: 'BDT',
  });

  // Google Analytics: add_to_cart event
  trackGoogleEvent('add_to_cart', {
    items: [{
      item_id: courseId,
      item_name: courseName,
      price: price,
      currency: 'BDT',
    }],
    value: price,
    currency: 'BDT',
  });

  // TikTok: AddToCart event
  trackTikTokEvent('AddToCart', {
    content_id: courseId,
    content_name: courseName,
    value: price,
    currency: 'BDT',
  });
};

/**
 * Track when a user starts a lesson/module
 */
export const trackLessonStart = (courseId: string, courseName: string, lessonName: string) => {
  // Custom event for all platforms
  const eventData = {
    course_id: courseId,
    course_name: courseName,
    lesson_name: lessonName,
  };

  trackFacebookEvent('StartLesson', eventData);
  trackGoogleEvent('lesson_start', eventData);
  trackTikTokEvent('StartLesson', eventData);
};

/**
 * Track when a user completes a lesson/module
 */
export const trackLessonComplete = (courseId: string, courseName: string, lessonName: string) => {
  // Custom event for all platforms
  const eventData = {
    course_id: courseId,
    course_name: courseName,
    lesson_name: lessonName,
  };

  trackFacebookEvent('CompleteLesson', eventData);
  trackGoogleEvent('lesson_complete', eventData);
  trackTikTokEvent('CompleteLesson', eventData);
};

/**
 * Track when a user completes a quiz
 */
export const trackQuizComplete = (
  courseId: string,
  courseName: string,
  quizName: string,
  score: number
) => {
  const eventData = {
    course_id: courseId,
    course_name: courseName,
    quiz_name: quizName,
    score: score,
  };

  trackFacebookEvent('CompleteQuiz', eventData);
  trackGoogleEvent('quiz_complete', eventData);
  trackTikTokEvent('CompleteQuiz', eventData);
};

/**
 * Track when a user searches for courses
 */
export const trackSearch = (searchTerm: string) => {
  // Facebook: Search event
  trackFacebookEvent('Search', {
    search_string: searchTerm,
    content_category: 'courses',
  });

  // Google Analytics: search event
  trackGoogleEvent('search', {
    search_term: searchTerm,
  });

  // TikTok: Search event
  trackTikTokEvent('Search', {
    search_string: searchTerm,
  });
};
