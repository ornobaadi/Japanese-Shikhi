import { User } from '@/lib/models';
import connectDB from '@/lib/mongodb';

// Type definitions for Clerk user data
export interface ClerkUserData {
  id: string; // Clerk user ID
  email_addresses: Array<{
    email_address: string;
    verification?: {
      status: string;
    };
  }>;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string;
  created_at: number;
  updated_at: number;
}

/**
 * Create or update user in MongoDB when Clerk user is created/updated
 */
export async function syncUserFromClerk(clerkUserData: ClerkUserData) {
  try {
    await connectDB();

    const primaryEmail = clerkUserData.email_addresses.find(
      email => email.verification?.status === 'verified'
    ) || clerkUserData.email_addresses[0];

    if (!primaryEmail) {
      throw new Error('No email address found for user');
    }

    // Check if user already exists
    let user = await User.findOne({ clerkUserId: clerkUserData.id });

    if (user) {
      // Update existing user
      user.email = primaryEmail.email_address;
      user.firstName = clerkUserData.first_name || user.firstName;
      user.lastName = clerkUserData.last_name || user.lastName;
      user.username = clerkUserData.username || user.username;
      user.profileImageUrl = clerkUserData.image_url || user.profileImageUrl;
      user.lastLoginAt = new Date();

      await user.save();
      console.log(`✅ Updated user in MongoDB: ${user.email}`);
    } else {
      // Create new user
      user = new User({
        clerkUserId: clerkUserData.id,
        email: primaryEmail.email_address,
        firstName: clerkUserData.first_name,
        lastName: clerkUserData.last_name,
        username: clerkUserData.username,
        profileImageUrl: clerkUserData.image_url,
        currentLevel: 'beginner',
        totalXP: 0,
        streak: 0,
        subscriptionStatus: 'free',
        language: 'en',
        timezone: 'UTC',
        dailyGoal: 15,
        learningGoals: [],
        preferredLearningTime: 'evening',
        notifications: {
          email: true,
          push: true,
          dailyReminder: true,
          streakReminder: true,
        },
        lastLoginAt: new Date(),
      });

      await user.save();
      console.log(`✅ Created new user in MongoDB: ${user.email}`);
    }

    return user;
  } catch (error) {
    console.error('❌ Error syncing user from Clerk:', error);
    throw error;
  }
}

/**
 * Delete user from MongoDB when Clerk user is deleted
 */
export async function deleteUserFromClerk(clerkUserId: string) {
  try {
    await connectDB();

    const user = await User.findOne({ clerkUserId });
    if (user) {
      await User.findByIdAndDelete(user._id);
      console.log(`✅ Deleted user from MongoDB: ${user.email}`);
      return true;
    } else {
      console.log(`⚠️ User not found in MongoDB: ${clerkUserId}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting user from MongoDB:', error);
    throw error;
  }
}

/**
 * Get or create user in MongoDB based on Clerk user ID
 * This is useful for API routes that need to ensure user exists
 */
export async function getOrCreateUserFromClerk(clerkUserId: string, clerkUserData?: ClerkUserData) {
  try {
    await connectDB();

    let user = await User.findOne({ clerkUserId });

    if (!user && clerkUserData) {
      // Create user if doesn't exist and we have Clerk data
      user = await syncUserFromClerk(clerkUserData);
    }

    return user;
  } catch (error) {
    console.error('❌ Error getting or creating user from Clerk:', error);
    throw error;
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateUserLastLogin(clerkUserId: string) {
  try {
    await connectDB();

    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { lastLoginAt: new Date() },
      { new: true }
    );

    if (user) {
      console.log(`✅ Updated last login for user: ${user.email}`);
    }

    return user;
  } catch (error) {
    console.error('❌ Error updating user last login:', error);
    throw error;
  }
}