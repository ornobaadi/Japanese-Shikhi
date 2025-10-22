# 📧 Email Invitation System Setup Guide

## Overview

This project uses **Resend** to send course invitation emails. Resend is a modern email API that's easy to set up and reliable.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Go to [API Keys](https://resend.com/api-keys)
4. Click "Create API Key"
5. Give it a name (e.g., "Japanese Learning Platform")
6. Copy the API key (starts with `re_`)

### Step 2: Add to Environment Variables

1. Open or create `.env.local` file in project root
2. Add this line:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 3: Configure Sender Email

#### Option A: Use Resend's Test Domain (Quick Start)

- Default: Uses `onboarding@resend.dev`
- No setup needed
- Limitations: Only works in test mode, limited sends
- **Perfect for development/testing**

#### Option B: Use Your Own Domain (Production)

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records they provide to your domain registrar
5. Wait for verification (usually 5-10 minutes)
6. Update `lib/email.ts`:

```typescript
from: "Japanese Learning Platform <noreply@yourdomain.com>";
```

## 📝 Testing the System

### Test in Development:

1. Start your development server:

```bash
npm run dev
```

2. Go to a course page
3. Click "Quiz assignment" → "Assign to" → "All students"
4. Click "Invite students"
5. Enter your email address
6. Click "Send Invitations"

You should receive an email within seconds! 📬

### Check Logs:

- Server logs will show: `✅ Invitations sent successfully to: [emails]`
- Resend dashboard: View sent emails at [resend.com/emails](https://resend.com/emails)

## 🎨 Email Template Features

The invitation email includes:

- ✅ Beautiful gradient header
- ✅ Course name highlighted
- ✅ Clear "Enroll Now" button
- ✅ Benefits list
- ✅ Fallback text link
- ✅ Professional footer
- ✅ Mobile-responsive design

## 🔧 Customization

### Change Email Design

Edit `lib/email.ts` → `sendCourseInviteEmails` → `html` section

### Change Sender Name

Edit `lib/email.ts`:

```typescript
from: "Your Platform Name <noreply@yourdomain.com>";
```

### Add More Email Templates

Create new functions in `lib/email.ts`:

```typescript
export async function sendWelcomeEmail() { ... }
export async function sendAssignmentNotification() { ... }
```

## 🆓 Resend Pricing

- **Free Tier**: 100 emails/day, 3,000/month
- **Pro**: $20/month for 50,000 emails/month
- **Business**: Custom pricing

Perfect for testing and small-scale production use!

## 🐛 Troubleshooting

### Email not received?

1. Check spam/junk folder
2. Verify `RESEND_API_KEY` in `.env.local`
3. Check Resend dashboard for delivery status
4. Ensure email format is valid

### "Sender not verified" error?

- Using custom domain? Make sure DNS records are verified
- Switch to test domain temporarily: `onboarding@resend.dev`

### Rate limit exceeded?

- Free tier: 100 emails/day
- Upgrade plan or wait 24 hours

## 📚 Learn More

- [Resend Documentation](https://resend.com/docs)
- [Resend Email Best Practices](https://resend.com/docs/knowledge-base/email-best-practices)
- [React Email Templates](https://react.email/) - Advanced email templates

## ✅ What's Working

- ✅ Send invitations to multiple emails
- ✅ Beautiful HTML email template
- ✅ Copy invite link to clipboard
- ✅ Email validation
- ✅ Error handling
- ✅ Loading states
- ✅ Success notifications

Enjoy sending beautiful course invitations! 🎉
