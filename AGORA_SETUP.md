# Agora Voice/Video Calling Setup Guide

## Step 1: Create Agora Account
1. Go to [https://console.agora.io/](https://console.agora.io/)
2. Sign up for a free account
3. Verify your email

## Step 2: Create a Project
1. After login, click "Project Management" in the left sidebar
2. Click "Create" button
3. Enter project name (e.g., "Japanese-Shikhi")
4. Choose "Secured mode: APP ID + Token" for authentication
5. Click "Submit"

## Step 3: Get Credentials
1. Find your project in the project list
2. Click the "Config" button or eye icon
3. You'll see:
   - **App ID** - Copy this value
   - **App Certificate** - Click "Enable" if not enabled, then copy the value

## Step 4: Configure Environment Variables
1. Open `.env.local` file in your project root
2. Replace the placeholder values:

```env
# Agora Configuration for Voice/Video Calling
NEXT_PUBLIC_AGORA_APP_ID=your_actual_app_id_here
AGORA_APP_CERTIFICATE=your_actual_app_certificate_here
```

3. Save the file

## Step 5: Restart Development Server
1. Stop the current dev server (Ctrl+C)
2. Restart it: `npm run dev`
3. The calling feature should now work!

## Free Tier Limits
- **10,000 minutes per month** free
- More than enough for development and testing
- No credit card required for free tier

## Testing the Feature
1. Open the application
2. Go to Admin Dashboard → Students → Progress
3. Click "Send Message" on any student
4. Click the phone icon (audio call) or video icon (video call)
5. The call should initialize successfully

## Troubleshooting

### Error: "Invalid token"
- Check if `.env.local` has the correct values
- Make sure you restarted the dev server after adding credentials
- Verify App Certificate is enabled in Agora console

### Error: "Calling service not configured"
- Environment variables are not set
- Follow Step 4 again
- Ensure no spaces or quotes around the values

### Error: "Failed to get call token"
- Check API route: `/api/call/token`
- Check server logs for detailed error messages
- Verify Agora credentials are correct

## Support
- Agora Documentation: [https://docs.agora.io/](https://docs.agora.io/)
- Agora Dashboard: [https://console.agora.io/](https://console.agora.io/)
