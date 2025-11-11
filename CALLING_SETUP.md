# Voice/Video Calling Setup Guide

## Agora Configuration

This application uses Agora RTC SDK for voice and video calling features.

### Step 1: Create Agora Account

1. Go to [Agora Console](https://console.agora.io/)
2. Sign up for a free account
3. Agora provides **10,000 free minutes per month** - perfect for development and small deployments

### Step 2: Create a Project

1. Click on "Project Management" in the console
2. Click "Create" to create a new project
3. Choose "Secured mode: APP ID + Token" for authentication
4. Give your project a name (e.g., "Japanese-Shikhi")
5. Click "Submit"

### Step 3: Get Credentials

After creating the project, you'll see:

1. **App ID**: Copy this value
2. **Primary Certificate**: Enable it and copy the certificate

### Step 4: Add to Environment Variables

Add these to your `.env.local` file:

```bash
# Agora Configuration
NEXT_PUBLIC_AGORA_APP_ID=your_app_id_here
AGORA_APP_CERTIFICATE=your_primary_certificate_here
```

⚠️ **Important**: 
- `NEXT_PUBLIC_AGORA_APP_ID` must start with `NEXT_PUBLIC_` because it's used in the browser
- `AGORA_APP_CERTIFICATE` should be kept secret (server-side only)

### Step 5: Restart Development Server

After adding the credentials:

```bash
npm run dev
```

## Features Included

### Voice Calling
- One-on-one audio calls
- Mute/unmute microphone
- Call duration timer
- Connection status indicators

### Video Calling
- One-on-one video calls
- Camera on/off toggle
- Microphone mute/unmute
- Picture-in-picture local video
- Full-screen remote video

### Call Controls
- End call button
- Audio toggle (mute/unmute)
- Video toggle (camera on/off)
- Call duration display
- Real-time connection status

## Usage

### From Chat Interface

1. Open a chat with any user
2. Click the **Phone icon** for voice call
3. Click the **Video icon** for video call
4. Wait for the other person to join
5. Use the controls to mute/unmute or turn camera on/off
6. Click the red phone button to end the call

## Pricing

### Agora Free Tier
- **10,000 minutes/month** free
- After free tier: ~$0.99 per 1000 minutes for audio
- Video costs slightly more

### For Production
- Monitor usage in Agora Console
- Set up billing alerts
- Consider package plans for high usage

## Troubleshooting

### "Calling service not configured" error
- Make sure you've added the Agora credentials to `.env.local`
- Restart your development server after adding credentials

### Call not connecting
- Check if both users have granted camera/microphone permissions
- Ensure firewall is not blocking WebRTC connections
- Check Agora Console for any service issues

### No video/audio
- Check browser permissions for camera/microphone
- Try a different browser (Chrome/Edge work best)
- Check if camera/microphone is being used by another application

## Browser Support

Works best on:
- Chrome/Edge (recommended)
- Firefox
- Safari (may have limitations)

## Security Notes

- Token expires after 1 hour (configurable)
- Channels are unique per conversation
- Only authorized users can join calls
- All communication is encrypted

## Alternative Solutions

If you prefer a different calling provider:

### Twilio
- Easy to use
- Reliable but more expensive
- Good documentation

### Daily.co
- Built for video calls
- Simple integration
- Good free tier

### WebRTC (Pure)
- Free and open-source
- Requires TURN/STUN server setup
- More complex to implement
