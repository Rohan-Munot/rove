import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserProfileService } from "@/lib/services/user-profile-service";
import {
  userProfileUpdateSchema,
  userProfileCreateSchema,
  userProfileResponseSchema,
} from "@/types/user-profile";

const UNAUTHORIZED = NextResponse.json(
  { error: "Unauthorized" },
  { status: 401 }
);
const NOT_FOUND = NextResponse.json(
  { error: "Profile not found" },
  { status: 404 }
);
const INTERNAL_ERROR = NextResponse.json(
  { error: "Internal server error" },
  { status: 500 }
);

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return UNAUTHORIZED;
    }
    const profile = await UserProfileService.getProfile(session.user.id);
    if (!profile) {
      return NOT_FOUND;
    }
    const validatedProfile = userProfileResponseSchema.parse(profile);
    return NextResponse.json(validatedProfile);
  } catch (error) {
    console.error("Profile API GET error:", error);
    return INTERNAL_ERROR;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return UNAUTHORIZED;
    }

    const body = await request.json();
    const validatedData = userProfileCreateSchema.parse(body);
    const existingProfile = await UserProfileService.getProfile(
      session.user.id
    );
    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists. Use PATCH to update." },
        { status: 409 }
      );
    }

    const profile = await UserProfileService.createProfile(session.user.id, {
      country: validatedData.homeCountry,
      currency: validatedData.homeCurrency,
      timezone: validatedData.timeZone,
      language: validatedData.preferredLanguage,
    });

    const validatedProfile = userProfileResponseSchema.parse(profile);
    return NextResponse.json(validatedProfile, { status: 201 });
  } catch (error) {
    console.error("Profile API POST error:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return INTERNAL_ERROR;
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return UNAUTHORIZED;
    }

    const body = await request.json();
    const validatedUpdates = userProfileUpdateSchema.parse(body);
    const profile = await UserProfileService.updateProfile(
      session.user.id,
      validatedUpdates
    );

    const validatedProfile = userProfileResponseSchema.parse(profile);
    return NextResponse.json(validatedProfile);
  } catch (error) {
    console.error("Profile API PATCH error:", error);
    return INTERNAL_ERROR;
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return UNAUTHORIZED;
    }

    const deleted = await UserProfileService.deleteProfile(session.user.id);

    if (!deleted) {
      return NOT_FOUND;
    }

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Profile API DELETE error:", error);
    return INTERNAL_ERROR;
  }
}
