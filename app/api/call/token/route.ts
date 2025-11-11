import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

// Agora credentials - You need to set these in environment variables
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get('channel');
    const role = searchParams.get('role') || 'publisher'; // publisher or subscriber
    
    console.log('Token request:', { channelName, role, APP_ID: APP_ID ? 'set' : 'missing', APP_CERT: APP_CERTIFICATE ? 'set' : 'missing' });
    
    if (!channelName) {
      return NextResponse.json({ error: 'Channel name required' }, { status: 400 });
    }

    if (!APP_ID || !APP_CERTIFICATE || APP_ID === 'your_agora_app_id_here' || APP_CERTIFICATE === 'your_agora_app_certificate_here') {
      console.error('Agora credentials not configured properly');
      return NextResponse.json({ 
        error: 'Calling service not configured',
        message: 'Please configure AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env.local file. Get credentials from https://console.agora.io/',
        appIdSet: !!APP_ID && APP_ID !== 'your_agora_app_id_here',
        certificateSet: !!APP_CERTIFICATE && APP_CERTIFICATE !== 'your_agora_app_certificate_here'
      }, { status: 503 });
    }

    // Token expires in 1 hour
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // User ID for Agora (can be any unique identifier)
    const uid = 0; // 0 means Agora will auto-assign

    // Build token
    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      agoraRole,
      privilegeExpiredTs,
      privilegeExpiredTs // Also set privilege for joining channel
    );

    return NextResponse.json({
      success: true,
      token,
      appId: APP_ID,
      channel: channelName,
      uid,
      expiresIn: expirationTimeInSeconds
    });

  } catch (error) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
