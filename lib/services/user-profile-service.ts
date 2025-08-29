import { db } from "@/database";
import { userProfile } from "@/database/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_LOCATION, type UserLocation } from "@/utils/currency";
import {
  userProfileUpdateSchema,
  type UserProfileResponse,
  type UserProfileUpdate,
} from "@/types/user-profile";

export class UserProfileService {
  private static convertToResponse(profile: any): UserProfileResponse {
    return {
      ...profile,
      createdAt: profile.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: profile.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  static async getProfile(userId: string): Promise<UserProfileResponse | null> {
    try {
      const [profile] = await db
        .select()
        .from(userProfile)
        .where(eq(userProfile.userId, userId))
        .limit(1);

      if (!profile) {
        return null;
      }

      return this.convertToResponse(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }

  static async createProfile(
    userId: string,
    location: UserLocation = DEFAULT_LOCATION
  ): Promise<UserProfileResponse> {
    try {
      const existingProfile = await this.getProfile(userId);
      if (existingProfile) {
        throw new Error("Profile already exists for this user");
      }

      const [newProfile] = await db
        .insert(userProfile)
        .values({
          userId,
          homeCountry: location.country,
          homeCurrency: location.currency,
          preferredLanguage: location.language,
          timeZone: location.timezone,
        })
        .returning();

      return this.convertToResponse(newProfile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create user profile");
    }
  }

  static async getOrCreateProfile(
    userId: string
  ): Promise<UserProfileResponse> {
    try {
      const existingProfile = await this.getProfile(userId);
      if (existingProfile) {
        return existingProfile;
      }

      return await this.createProfile(userId, DEFAULT_LOCATION);
    } catch (error) {
      console.error("Error getting or creating user profile:", error);
      throw new Error("Failed to get or create user profile");
    }
  }

  static async updateProfile(
    userId: string,
    updates: UserProfileUpdate
  ): Promise<UserProfileResponse> {
    try {
      const validatedUpdates = userProfileUpdateSchema.parse(updates);

      const existingProfile = await this.getProfile(userId);
      if (!existingProfile) {
        const locationWithUpdates = {
          ...DEFAULT_LOCATION,
          ...validatedUpdates,
        };
        return await this.createProfile(userId, locationWithUpdates);
      }

      const [updatedProfile] = await db
        .update(userProfile)
        .set({
          ...validatedUpdates,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, userId))
        .returning();

      return this.convertToResponse(updatedProfile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update user profile");
    }
  }

  static async deleteProfile(userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userProfile)
        .where(eq(userProfile.userId, userId));

      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting user profile:", error);
      throw new Error("Failed to delete user profile");
    }
  }
}
