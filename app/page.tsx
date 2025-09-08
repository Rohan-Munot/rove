"use client";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Button onClick={() => signIn.social({ provider: "google" })}>
        Login
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => signOut()}>Logout</Button>
    </>
  );
}
