# 🚀 Quick Setup: Get Your Resend API Key

## Step 1: Sign Up for Resend (FREE)

1. Go to **https://resend.com**
2. Click **"Get Started"**
3. Sign up with your email (GitHub login available)
4. **Free tier**: 100 emails/day, 3,000 emails/month

## Step 2: Get Your API Key

1. After logging in, go to your **Dashboard**
2. Click **"API Keys"** in the left sidebar
3. Click **"Create API Key"**
4. Give it a name like "Japanese Learning Platform"
5. Copy the API key (starts with `re_`)

## Step 3: Add API Key to Your Project

1. Open `.env.local` file in your project root
2. Replace `re_your_resend_api_key_here` with your actual API key:
   ```
   RESEND_API_KEY=re_1234567890abcdef...
   ```
3. Save the file

## Step 4: Restart Your Server

```bash
npm run dev
```

## ✅ Test Your Setup

1. Create a quiz assignment
2. Click "Assign"
3. Enter an email address
4. Click "Send Invitations"
5. Check your email! 📧

## 🎯 That's It!

Your Google Classroom clone now has professional email invitations!

**Need Help?**

- Resend docs: https://resend.com/docs
- Free support: Check your Resend dashboard for delivery status
