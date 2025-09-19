import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { User } from '@/lib/models';
import connectDB from '@/lib/mongodb';
import { getOrCreateUserFromClerk } from '@/lib/clerk/user-sync';

// Types for authenticated requests
export interface AuthenticatedUser {
  clerkUserId: string;
  mongoUser: InstanceType<typeof User> | null;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  status?: number;
}

/**
 * Authenticate and get user data for API routes
 * This utility combines Clerk authentication with MongoDB user data
 */
export async function authenticateUser(request?: NextRequest): Promise<AuthResult> {
  try {
    // Get Clerk user ID
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401
      };
    }

    // Connect to database
    await connectDB();

    // Get or create user in MongoDB
    const mongoUser = await User.findOne({ clerkUserId });

    return {
      success: true,
      user: {
        clerkUserId,
        mongoUser
      }
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    };
  }
}

/**
 * Require authentication for API routes
 * Throws error if user is not authenticated
 */
export async function requireAuth(request?: NextRequest): Promise<AuthenticatedUser> {
  const authResult = await authenticateUser(request);

  if (!authResult.success || !authResult.user) {
    throw new Error(authResult.error || 'Authentication required');
  }

  return authResult.user;
}

/**
 * Check if user has premium subscription
 */
export function isPremiumUser(user: InstanceType<typeof User>): boolean {
  if (user.subscriptionStatus === 'lifetime') return true;
  if (user.subscriptionStatus === 'premium' && user.subscriptionExpiresAt) {
    return new Date() < user.subscriptionExpiresAt;
  }
  return false;
}

/**
 * Check if user can access premium content
 */
export function canAccessPremiumContent(user: InstanceType<typeof User> | null): boolean {
  if (!user) return false;
  return isPremiumUser(user);
}

/**
 * Middleware to check admin permissions (placeholder for future admin system)
 */
export function isAdmin(user: InstanceType<typeof User> | null): boolean {
  // TODO: Implement admin role checking
  // For now, return false (no admin system implemented yet)
  return false;
}

/**
 * Rate limiting check (basic implementation)
 */
export function checkRateLimit(clerkUserId: string, maxRequests = 100, windowMs = 60000): boolean {
  // TODO: Implement proper rate limiting with Redis or in-memory store
  // For now, return true (no rate limiting)
  return true;
}

/**
 * Validate user can perform action on resource
 */
export function canAccessResource(
  user: AuthenticatedUser,
  resourceUserId: string,
  requireOwnership = true
): boolean {
  if (!user.mongoUser) return false;

  // If ownership is required, check if user owns the resource
  if (requireOwnership) {
    return user.mongoUser._id.toString() === resourceUserId;
  }

  // If ownership is not required, just check if user is authenticated
  return true;
}

/**
 * Extract and validate user ID from URL parameters
 */
export function validateUserIdParam(params: { id?: string }): string | null {
  const { id } = params;
  if (!id || typeof id !== 'string') return null;
  return id;
}

/**
 * Create standardized error responses
 */
export const AuthErrors = {
  UNAUTHORIZED: { error: 'Unauthorized', status: 401 },
  FORBIDDEN: { error: 'Forbidden', status: 403 },
  USER_NOT_FOUND: { error: 'User not found', status: 404 },
  PREMIUM_REQUIRED: { error: 'Premium subscription required', status: 403 },
  ADMIN_REQUIRED: { error: 'Admin access required', status: 403 },
  RATE_LIMITED: { error: 'Rate limit exceeded', status: 429 },
} as const;