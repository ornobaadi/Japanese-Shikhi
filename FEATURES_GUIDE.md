# 📱 Messaging & Calling Features Guide

## 🎯 Where to Find All Features

### From Admin Inbox Page

When you open **Admin Dashboard → Inbox**, you'll see:

1. **Message List** - All conversations
2. **"Chat" Button** - On each message (NEW!)

### Click the "Chat" Button 💬

This opens the **ChatInterface** with ALL features:

```
┌─────────────────────────────────────────┐
│  👤 User Name          📞 🎥            │  ← Voice/Video Call Buttons
├─────────────────────────────────────────┤
│                                         │
│  Received:                              │
│  ┌───────────────────────┐              │
│  │ Hello! 👋            │              │
│  └───────────────────────┘              │
│                10:30 AM ✓✓              │
│                                         │
│                       Your Message:     │
│              ┌───────────────────────┐  │
│              │ Hi there! How are you? │ │
│              └───────────────────────┘  │
│              10:31 AM ✓                 │
│                                         │
│  [Image Preview]                        │
│  [Video Player]                         │
│  [Audio Player]                         │
│  [📄 Document.pdf] ⬇️                  │
│                                         │
├─────────────────────────────────────────┤
│ 📎  [Type a message...]        [Send]  │  ← File attachment & Send
└─────────────────────────────────────────┘
```

## ✨ Available Features

### 📎 File Sharing
**Location:** Paperclip icon (📎) at bottom left

**Supports:**
- ✅ Images (jpg, png, gif, etc.)
- ✅ Videos (mp4, webm, etc.)
- ✅ Audio (mp3, wav, etc.)
- ✅ Documents (pdf, doc, docx, etc.)

**How to use:**
1. Click paperclip icon
2. Select file(s) from computer
3. Files appear as badges below input
4. Type message (optional)
5. Click Send

**Result:**
- Images: Show as thumbnails (click to expand)
- Videos: Embedded player
- Audio: Inline player
- Documents: Download link with size

### 🗑️ Delete/Unsend Messages
**Location:** Small trash icon on YOUR messages

**Rules:**
- Only visible for messages YOU sent
- Only works within **5 minutes** of sending
- After 5 min, delete button disappears

**How to use:**
1. Look at your sent message
2. If less than 5 minutes old, trash icon appears
3. Click trash icon
4. Message deleted for both users

### 📞 Voice Calling
**Location:** Phone icon (📞) at top right

**How to use:**
1. Click phone icon
2. Call dialog opens
3. Wait for other person to join
4. Use mute button to toggle microphone
5. Red phone button to end call

**Features:**
- Real-time audio streaming
- Mute/unmute controls
- Call duration timer
- Connection status

### 🎥 Video Calling
**Location:** Video icon (🎥) at top right

**How to use:**
1. Click video icon
2. Grant camera/microphone permissions
3. Your video appears in small PiP window
4. Other person's video fills screen
5. Toggle camera on/off
6. Toggle microphone mute/unmute
7. Red phone button to end call

**Features:**
- Full-screen remote video
- Picture-in-picture local video
- Camera on/off toggle
- Microphone mute/unmute
- Call duration timer

### ✓ Read Receipts
**Location:** Appears automatically on sent messages

**Indicators:**
- ✓ (Single check) = Sent/Delivered
- ✓✓ (Double check, blue) = Read by recipient

### 🔄 Real-time Updates
- Messages auto-refresh every **3 seconds**
- New messages appear automatically
- Read status updates in real-time
- No need to refresh page

## 🚀 Quick Start

### Send a Text Message:
1. Type in input box at bottom
2. Press Enter or click Send
3. Message appears in chat

### Send Files:
1. Click 📎 paperclip icon
2. Select image/video/document
3. (Optional) Add text message
4. Click Send
5. File appears in chat with preview

### Make Voice Call:
1. Click 📞 phone icon
2. Wait for connection
3. Start talking!

### Make Video Call:
1. Click 🎥 video icon
2. Allow camera/microphone
3. Wait for other person
4. Video chat starts!

### Delete a Message:
1. Find your message (less than 5 min old)
2. Click small trash icon
3. Message deleted

## ⚙️ Setup Required

### For Calling Features:

**Get Agora Credentials (FREE):**
1. Go to: https://console.agora.io/
2. Create account (free)
3. Create project
4. Copy App ID & Certificate

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_AGORA_APP_ID=your_app_id_here
AGORA_APP_CERTIFICATE=your_certificate_here
```

**Restart server:**
```bash
npm run dev
```

**Free Tier:** 10,000 minutes/month

See `CALLING_SETUP.md` for detailed setup guide.

## 🎨 UI Features

### Message Bubbles
- **Your messages:** Blue bubbles on right
- **Their messages:** Gray bubbles on left
- **Timestamps:** Below each message
- **Read status:** Check marks on your messages

### File Previews
- **Images:** Click to open full size
- **Videos:** Play directly in chat
- **Audio:** Play with controls
- **Documents:** Download button with file info

### Call Interface
- **Professional UI:** Full-screen call dialog
- **Controls:** Mute, camera toggle, end call
- **Status:** Connection state, duration
- **PiP:** Local video in corner (video calls)

## 📝 Tips

1. **Multiple files:** Select multiple files at once
2. **Quick send:** Press Enter to send text
3. **File size:** Keep files under 10MB for best performance
4. **Browser:** Use Chrome/Edge for best calling experience
5. **Permissions:** Grant camera/mic access when prompted

## 🔒 Security

- ✅ Only sender can delete messages
- ✅ Students can't message other students
- ✅ Admins can message anyone
- ✅ Files stored securely
- ✅ Calls are encrypted
- ✅ Tokens expire after 1 hour

## 🐛 Troubleshooting

**Can't see Chat button?**
- Make sure you're on inbox page
- Look to the right of each message

**File upload not working?**
- Check file size (< 10MB recommended)
- Ensure upload API is configured

**Calling not working?**
- Add Agora credentials to `.env.local`
- Restart development server
- Check browser permissions
- Try Chrome/Edge browser

**Messages not updating?**
- Wait 3 seconds for auto-refresh
- Check internet connection

---

## 📍 Summary

**To access ALL features:**
1. Go to Admin Inbox
2. Find any message
3. Click **"Chat"** button
4. Full ChatInterface opens with:
   - 📎 File sharing
   - 📞 Voice calling
   - 🎥 Video calling
   - 🗑️ Message deletion
   - ✓ Read receipts
   - 🔄 Real-time updates

Everything is in one place! 🎉
