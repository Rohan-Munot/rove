import { z } from "zod";

export const userProfileDbSchema = z.object({
  id: z.string(),
  userId: z.string(),
  homeCountry: z.string(),
  homeCurrency: z.string(),
  preferredLanguage: z.string(),
  timeZone: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userProfileResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  homeCountry: z.string(),
  homeCurrency: z.string(),
  preferredLanguage: z.string(),
  timeZone: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userProfileUpdateSchema = z.object({
  homeCountry: z.string().min(1).optional(),
  homeCurrency: z.string().length(3).optional(),
  preferredLanguage: z.string().length(2).optional(),
  timeZone: z.string().min(1).optional(),
});

export const userProfileCreateSchema = z.object({
  homeCountry: z.string().min(1),
  homeCurrency: z.string().length(3),
  preferredLanguage: z.string().length(2),
  timeZone: z.string().min(1),
});

export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type UserProfileCreate = z.infer<typeof userProfileCreateSchema>;
