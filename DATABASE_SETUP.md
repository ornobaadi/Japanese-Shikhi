# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for your Japanese Shikhi learning platform.

## 🚀 Quick Start

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project called "Japanese Shikhi"

### 2. Create a Database Cluster

1. Click "Build a Database"
2. Choose "M0 Sandbox" (free tier)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "japanese-shikhi-cluster")
5. Click "Create Cluster"

### 3. Configure Database Access

1. **Create Database User:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and secure password
   - Set "Database User Privileges" to "Read and write to any database"
   - Click "Add User"

2. **Configure Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - For production, add your specific IP addresses
   - Click "Confirm"

### 4. Get Your Connection String

1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string

## 🔧 Environment Configuration

### Update your `.env.local` file:

Replace the placeholders in your `.env.local` file with your actual values:

\`\`\`env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/japanese_shikhi?retryWrites=true&w=majority

# Database Configuration
DB_NAME=japanese_shikhi
NODE_ENV=development

# Clerk Configuration (update with your actual keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Security
NEXTAUTH_SECRET=your-secure-random-string-here
\`\`\`

**Important:** Replace the following in your MongoDB URI:
- `<username>`: Your database username
- `<password>`: Your database password
- `<cluster-name>`: Your cluster name

## 🧪 Test Your Setup

Run the database test to verify everything is working:

\`\`\`bash
npm run test:db
\`\`\`

This will test:
- Database connection
- User model validation
- Course model validation
- Vocabulary model validation

## 🔗 Clerk Webhook Configuration

### Set up Clerk webhook for user synchronization:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to "Webhooks" in the left sidebar
3. Click "Add Endpoint"
4. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
5. Select these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the webhook secret and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

## 📊 Database Schema Overview

Your MongoDB database includes these collections:

### Users Collection
- User profiles and preferences
- Learning progress and statistics
- Subscription status
- Clerk integration

### Courses Collection
- Course content and metadata
- Learning objectives
- Difficulty levels and categories
- Publication status

### Vocabularies Collection
- Japanese words with readings
- English and Bengali translations
- JLPT levels and difficulty
- Spaced repetition data

## 🔒 Security Features

- ✅ Input validation with Zod schemas
- ✅ Authentication with Clerk
- ✅ MongoDB connection pooling
- ✅ Error handling and logging
- ✅ Webhook signature verification
- ✅ Data sanitization

## 📋 API Endpoints

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

### Course Management
- `GET /api/courses` - List courses with filtering
- `POST /api/courses` - Create new course (premium users)

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user synchronization

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Timeout:**
   - Check your IP whitelist in MongoDB Atlas
   - Verify your connection string format

2. **Authentication Failed:**
   - Double-check username and password
   - Ensure user has proper database privileges

3. **Webhook Verification Failed:**
   - Verify CLERK_WEBHOOK_SECRET is correct
   - Check webhook endpoint URL

### Getting Help:

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test your MongoDB connection string in MongoDB Compass
4. Ensure your Clerk configuration is correct

## 🎯 Next Steps

After setup:
1. Run `npm run dev` to start your development server
2. Test user registration and authentication
3. Verify webhook integration with Clerk
4. Start building your learning content!

Your MongoDB Atlas integration is now ready for your Japanese learning platform! 🎌