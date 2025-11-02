// Set current user as admin - run this once
import { clerkClient } from '@clerk/nextjs/server';

async function setUserAsAdmin(userId) {
  try {
    const user = await (await clerkClient()).users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin'
      }
    });
    console.log('User updated as admin:', user.emailAddresses[0]?.emailAddress);
  } catch (error) {
    console.error('Error setting user as admin:', error);
  }
}

// Replace with your actual user ID from Clerk dashboard
const USER_ID = "user_2oJuLGabE3K6gjBCENph5NVFZE9"; // Get this from Clerk dashboard
setUserAsAdmin(USER_ID);