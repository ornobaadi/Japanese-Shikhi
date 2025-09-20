import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Please define CLERK_WEBHOOK_SECRET in your environment variables');
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const headers = request.headers;

  const svixId = headers.get('svix-id');
  const svixTimestamp = headers.get('svix-timestamp');
  const svixSignature = headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing required headers' },
      { status: 400 }
    );
  }

  let event: any;

  try {
    const wh = new Webhook(webhookSecret!);
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data);
        break;
      case 'user.updated':
        await handleUserUpdated(event.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(event.data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleUserCreated(userData: any) {
  try {
    console.log('Creating user from Clerk webhook:', userData.id);

    const existingUser = await User.findOne({ clerkUserId: userData.id });
    if (existingUser) {
      console.log('User already exists, skipping creation');
      return;
    }

    const newUser = new User({
      clerkUserId: userData.id,
      email: userData.email_addresses[0]?.email_address || '',
      username: userData.username || undefined,
      firstName: userData.first_name || undefined,
      lastName: userData.last_name || undefined,
      profileImageUrl: userData.image_url || undefined,
      nativeLanguage: 'English',
      currentLevel: 'beginner',
      learningGoals: [],
    });

    await newUser.save();
    console.log('User created successfully:', newUser._id);
  } catch (error) {
    console.error('Error creating user from webhook:', error);
    throw error;
  }
}

async function handleUserUpdated(userData: any) {
  try {
    console.log('Updating user from Clerk webhook:', userData.id);

    const user = await User.findOne({ clerkUserId: userData.id });
    if (!user) {
      console.log('User not found, creating new user');
      await handleUserCreated(userData);
      return;
    }

    // Update user fields that might have changed in Clerk
    user.email = userData.email_addresses[0]?.email_address || user.email;
    user.username = userData.username || user.username;
    user.firstName = userData.first_name || user.firstName;
    user.lastName = userData.last_name || user.lastName;
    user.profileImageUrl = userData.image_url || user.profileImageUrl;

    await user.save();
    console.log('User updated successfully:', user._id);
  } catch (error) {
    console.error('Error updating user from webhook:', error);
    throw error;
  }
}

async function handleUserDeleted(userData: any) {
  try {
    console.log('Deleting user from Clerk webhook:', userData.id);

    const result = await User.findOneAndDelete({ clerkUserId: userData.id });
    if (result) {
      console.log('User deleted successfully:', result._id);
    } else {
      console.log('User not found for deletion');
    }
  } catch (error) {
    console.error('Error deleting user from webhook:', error);
    throw error;
  }
}