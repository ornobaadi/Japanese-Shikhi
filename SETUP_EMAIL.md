# Email Setup Guide

## Overview

Your Japanese Learning Platform now includes a complete Google Classroom-style student invitation system with email notifications powered by Resend.

## Dependencies Installed ✅

- `resend` - Email service provider
- `@react-email/render` - Email template rendering
- `@react-email/components` - Professional email components

## Features Implemented ✅

- **Quiz Assignment Creation**: Google Classroom-style interface with attachments
- **Student Invitation Modal**: Select existing students or invite new ones
- **Email Invitations**: Professional branded emails with course enrollment links
- **Bulk Invitations**: Send emails to multiple students at once
- **Share Links**: Copy enrollment links for easy sharing

## Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Generate an API key from your dashboard
4. Add it to your `.env.local` file:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
   ```

### 2. Optional: Custom Domain (Recommended for Production)

- For better deliverability, verify your domain in Resend
- Update the `from` field in `lib/email.ts`:
  ```typescript
  from: "Your Course Platform <noreply@yourdomain.com>";
  ```

### 3. Test the System

1. Create a quiz assignment in your admin panel
2. Click "Assign" to open the student modal
3. Enter email addresses or select existing students
4. Click "Send Invitations"

## How It Works

### Assignment Creation Flow

```
Admin Panel → Create Assignment → Click "Assign" → Student Modal → Send Emails
```

### Email Template Features

- 🎌 Branded Japanese learning theme
- 📚 Professional enrollment button
- 📱 Mobile-responsive design
- 🔗 Fallback enrollment link
- ✉️ Professional footer with sender info

### API Endpoints

- `GET /api/courses/[id]/students` - Fetch enrolled students
- `POST /api/courses/[id]/invite` - Send email invitations

## File Structure

```
components/
├── admin/
│   ├── QuizAssignmentForm.tsx     # Google Classroom-style quiz form
│   └── AssignStudentsModal.tsx    # Student invitation modal
app/api/courses/[id]/
├── students/route.ts              # Get course students
└── invite/route.ts                # Send invitations
lib/
└── email.ts                       # Resend email service
```

## Email Content Example

Your students will receive professional emails with:

- Course invitation header with gradient design
- Course name and description
- Clear "📚 Enroll Now" button
- Fallback enrollment link
- Instructor information
- Professional footer

## Troubleshooting

### Build Errors ✅ RESOLVED

- `Module not found: Can't resolve '@react-email/render'` → Fixed with dependency installation

### Email Not Sending

1. Check RESEND_API_KEY is set correctly
2. Verify API key is active in Resend dashboard
3. Check network connection and Resend status

### Students Not Receiving Emails

1. Check spam/junk folders
2. Verify email addresses are correct
3. Consider using verified domain for better deliverability

## Production Checklist

- [ ] Set up custom domain in Resend
- [ ] Update FROM_EMAIL to verified domain
- [ ] Set proper environment variables
- [ ] Test with real email addresses
- [ ] Monitor email delivery rates

Your Google Classroom clone is now complete with professional email invitations! 🎉
