# Marketing Pixel Tracking Setup

This document explains how to use the marketing pixel tracking implementation in the Japanese Shikhi platform.

## Overview

The platform includes tracking for:
- **Facebook Pixel** - For Facebook/Instagram ad tracking and retargeting
- **Google Analytics 4** - For comprehensive site analytics
- **TikTok Pixel** - For TikTok ad tracking and audience building

## Setup

### 1. Get Your Pixel IDs

**Facebook Pixel:**
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Create or select your Pixel
3. Copy the Pixel ID (numeric value)

**Google Analytics 4:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a GA4 property
3. Copy the Measurement ID (format: G-XXXXXXXXXX)

**TikTok Pixel:**
1. Go to [TikTok Ads Manager](https://ads.tiktok.com/)
2. Navigate to Assets → Events
3. Create or select your Pixel
4. Copy the Pixel ID

### 2. Add Environment Variables

Add these to your `.env.local` file:

```env
# Marketing & Analytics Pixels
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_facebook_pixel_id_here
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your_tiktok_pixel_id_here
```

**Important:** The `NEXT_PUBLIC_` prefix is required for client-side access.

### 3. Restart Development Server

After adding environment variables, restart your dev server:

```bash
pnpm dev
```

## Usage

### Automatic Tracking

The following are tracked automatically:
- **Page Views** - Every time a user navigates to a new page
- **Route Changes** - All navigation events within the app

### Manual Conversion Tracking

For important conversion events, use the helper functions from `lib/analytics/conversion-events.ts`:

#### Track Course View

```typescript
import { trackCourseView } from '@/lib/analytics/conversion-events';

trackCourseView(course.id, course.title, course.price);
```

#### Track Free Course Enrollment

```typescript
import { trackCourseEnrollment } from '@/lib/analytics/conversion-events';

// For free courses
trackCourseEnrollment(course.id, course.title, 0, true);
```

#### Track Paid Course Checkout

```typescript
import { trackCourseEnrollment } from '@/lib/analytics/conversion-events';

// When user initiates payment
trackCourseEnrollment(course.id, course.title, course.price, false);
```

#### Track Payment Success

```typescript
import { trackPaymentSuccess } from '@/lib/analytics/conversion-events';

trackPaymentSuccess(
  course.id,
  course.title,
  course.price,
  transactionId
);
```

#### Track Add to Cart

```typescript
import { trackAddToCart } from '@/lib/analytics/conversion-events';

trackAddToCart(course.id, course.title, course.price);
```

#### Track Lesson Progress

```typescript
import { trackLessonStart, trackLessonComplete } from '@/lib/analytics/conversion-events';

// When user starts a lesson
trackLessonStart(courseId, courseName, lessonName);

// When user completes a lesson
trackLessonComplete(courseId, courseName, lessonName);
```

#### Track Quiz Completion

```typescript
import { trackQuizComplete } from '@/lib/analytics/conversion-events';

trackQuizComplete(courseId, courseName, quizName, score);
```

#### Track Search

```typescript
import { trackSearch } from '@/lib/analytics/conversion-events';

trackSearch(searchTerm);
```

## Where to Add Tracking

### Recommended Implementation Points

1. **Course View** (`app/courses/[id]/page.tsx`):
   ```typescript
   useEffect(() => {
     trackCourseView(course._id, course.title, course.price);
   }, [course]);
   ```

2. **Free Enrollment** (`components/CurriculumViewer.tsx` - after enrollment):
   ```typescript
   const handleEnroll = async () => {
     // ... enrollment logic
     trackCourseEnrollment(courseId, courseName, 0, true);
   };
   ```

3. **Paid Enrollment** (`app/payment/[id]/page.tsx` - when payment form shown):
   ```typescript
   useEffect(() => {
     trackCourseEnrollment(course._id, course.title, course.price, false);
   }, [course]);
   ```

4. **Payment Success** (`app/payment/[id]/page.tsx` - after successful payment):
   ```typescript
   const handlePaymentSuccess = (transactionId: string) => {
     trackPaymentSuccess(course._id, course.title, course.price, transactionId);
   };
   ```

5. **Lesson Start** (`components/video-player.tsx` or curriculum viewer):
   ```typescript
   const handleVideoPlay = () => {
     trackLessonStart(courseId, courseName, lessonName);
   };
   ```

6. **Quiz Completion** (`app/api/quiz-results/route.ts` - after quiz submission):
   ```typescript
   trackQuizComplete(courseId, courseName, quizName, percentage);
   ```

7. **Search** (`app/courses/page.tsx` - on search):
   ```typescript
   const handleSearch = (term: string) => {
     setSearchQuery(term);
     trackSearch(term);
   };
   ```

## Testing Pixels

### Facebook Pixel

1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper) Chrome extension
2. Visit your site
3. Click the extension icon to see if pixels are firing
4. Check Events Manager for real-time events

### Google Analytics

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension
2. Open browser console
3. Visit your site
4. Look for GA debug messages in console
5. Check Real-Time reports in GA4

### TikTok Pixel

1. Install [TikTok Pixel Helper](https://chrome.google.com/webstore/detail/tiktok-pixel-helper) Chrome extension
2. Visit your site
3. Click the extension icon to see pixel status
4. Check Events in TikTok Ads Manager

## Event Reference

### Standard Events Tracked

| Event | Facebook | Google Analytics | TikTok | Description |
|-------|----------|------------------|--------|-------------|
| Page View | PageView | page_view | PageView | Automatic on all pages |
| Course View | ViewContent | view_item | ViewContent | User views course details |
| Free Enrollment | CompleteRegistration | sign_up | CompleteRegistration | User enrolls in free course |
| Initiate Checkout | InitiateCheckout | begin_checkout | InitiateCheckout | User starts paid enrollment |
| Purchase | Purchase | purchase | CompletePayment | Payment successful |
| Add to Cart | AddToCart | add_to_cart | AddToCart | Course added to cart |
| Search | Search | search | Search | User searches for courses |

### Custom Events

| Event | Platforms | Description |
|-------|-----------|-------------|
| StartLesson | All | User starts a lesson/module |
| CompleteLesson | All | User completes a lesson/module |
| CompleteQuiz | All | User completes a quiz |

## Files Overview

- `components/analytics/FacebookPixel.tsx` - Facebook Pixel component
- `components/analytics/GoogleAnalytics.tsx` - Google Analytics component
- `components/analytics/TikTokPixel.tsx` - TikTok Pixel component
- `lib/analytics/conversion-events.ts` - Conversion tracking helpers
- `app/layout.tsx` - Root layout with pixel integrations

## Privacy Considerations

- All pixel IDs are public (client-side)
- Pixels track user behavior for advertising purposes
- Consider adding cookie consent banner for GDPR compliance
- Update privacy policy to mention tracking pixels

## Troubleshooting

**Pixels not firing:**
- Check environment variables are set correctly
- Restart dev server after adding env vars
- Ensure IDs have correct format
- Check browser console for errors

**Events not showing:**
- Allow 15-30 minutes for events to appear in dashboards
- Check pixel helper extensions for real-time validation
- Verify event data format matches platform requirements

**TypeScript errors:**
- Ensure all helper functions are imported correctly
- Check that course/lesson data includes required fields
