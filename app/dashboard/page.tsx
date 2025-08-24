import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import React from "react";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <div>Unauthorized</div>;
  }
  return <div>Dashboard {session?.user?.name}</div>;
};

export default Page;
