import { User } from "@clerk/nextjs/server";

/**
 * Check if a user has admin role
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.publicMetadata?.role === "admin";
}

/**
 * Check if a user is a regular user (not admin)
 */
export function isRegularUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return !isAdmin(user);
}

/**
 * Get user role string
 */
export function getUserRole(user: User | null | undefined): string {
  if (!user) return "guest";
  return user.publicMetadata?.role as string || "user";
}