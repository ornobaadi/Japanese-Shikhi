# Certificate System Documentation

## Overview
The certificate system automatically generates and validates PDF certificates for students who complete courses on the Japanese Shikhi platform.

## Features

### 1. **Automatic Certificate Generation**
- Certificates are generated on-demand when students complete a course (100% progress)
- Each certificate has a unique ID for verification
- PDF format with professional design including student name, course name, and completion date

### 2. **Certificate Verification**
- Public verification page to check certificate authenticity
- Verification via unique certificate ID
- Shows student name, course name, completion date, and progress percentage

### 3. **Download & Storage**
- Students can download their certificates from the dashboard
- Certificate IDs are stored in the database for verification
- Completion dates are tracked automatically

## Technical Implementation

### Database Schema Updates

**User Model (`lib/models/User.ts`)**
```typescript
enrolledCourses: {
  courseId: ObjectId;
  enrolledAt: Date;
  progress: {...};
  completedAt?: Date;       // NEW: When course was completed
  certificateId?: string;   // NEW: Unique certificate ID
}
```

### API Endpoints

#### 1. Generate Certificate
```
GET /api/certificates/[courseId]
```
- **Auth**: Required (Clerk)
- **Validates**: User enrollment and 100% course completion
- **Returns**: PDF file download
- **Side Effect**: Generates and stores certificate ID if not exists

#### 2. Verify Certificate
```
GET /api/certificates/verify/[certificateId]
```
- **Auth**: Not required (public endpoint)
- **Returns**: Certificate validation data (student, course, date)
- **Use Case**: Public verification by employers/institutions

#### 3. Mark Course Complete
```
POST /api/courses/[courseId]/complete
```
- **Auth**: Required (Clerk)
- **Purpose**: Mark course as completed when student finishes all lessons
- **Sets**: completedAt timestamp

### Frontend Components

#### Dashboard Certificate Button
Location: `components/dashboard/EnrolledCourses.tsx`

Shows "Download Certificate" button when:
- Course progress is 100%
- Student is enrolled in the course

Features:
- Visual loading state during download
- Green button with award icon
- Automatic PDF download on click

#### Certificate Verification Page
Location: `app/certificates/verify/[certificateId]/page.tsx`

Public page showing:
- ✓ Valid / ✗ Invalid status
- Student name
- Course name
- Completion date
- Certificate ID
- Progress percentage

## Usage Flow

### For Students:
1. Enroll in a course
2. Complete all lessons (reach 100% progress)
3. Go to Dashboard > My Courses
4. Click "Download Certificate" button
5. PDF certificate downloads automatically
6. Share certificate with employers/institutions

### For Verification:
1. Visit: `/certificates/verify/[CERTIFICATE-ID]`
2. System checks database for matching certificate
3. Displays validation result with certificate details

## Certificate Design

PDF includes:
- Professional border and layout
- "CERTIFICATE OF COMPLETION" title
- Student full name (or username/email fallback)
- Course title
- Completion date (formatted)
- Unique Certificate ID
- Japanese Shikhi branding
- Authorized signature line

## Security Features

1. **Unique Certificate IDs**: Generated using nanoid (12 characters, uppercase)
2. **Database Verification**: All certificates stored and verified against database
3. **Auth Protection**: Only enrolled students who completed course can generate
4. **Immutable Records**: Certificate IDs and completion dates are permanent once set

## Testing

### Test Certificate Generation:
1. Enroll in a course
2. Manually set progress to 100% in database (for testing):
   ```javascript
   db.users.updateOne(
     { clerkUserId: "YOUR_USER_ID", "enrolledCourses.courseId": ObjectId("COURSE_ID") },
     { $set: { "enrolledCourses.$.progress.progressPercentage": 100 } }
   )
   ```
3. Refresh dashboard and click "Download Certificate"
4. Verify PDF downloads correctly

### Test Verification:
1. Generate a certificate
2. Note the certificate ID (shown at bottom of PDF)
3. Visit `/certificates/verify/[CERTIFICATE-ID]`
4. Verify all details display correctly

## Future Enhancements

- [ ] Email certificate automatically upon completion
- [ ] Certificate templates for different course types
- [ ] QR code on certificate linking to verification page
- [ ] Certificate gallery in student profile
- [ ] Batch certificate generation for admins
- [ ] Certificate revocation system
- [ ] Multi-language certificate support
- [ ] Custom certificate designs per course

## Dependencies

- `pdf-lib`: PDF generation
- `nanoid`: Unique ID generation
- MongoDB: Certificate data storage
- Clerk: Authentication

## Support

For certificate-related issues:
- Check database for enrollment and progress records
- Verify course completion (100% progress required)
- Ensure certificate ID is properly stored
- Check API logs for generation errors
