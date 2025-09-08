import { redirect } from "next/navigation";
import { createChat } from "@/utils/store/chat-store";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  console.log(session);
  if (!session) {
    redirect("/");
  }
  const id = await createChat({ userId: session.user.id as string });
  redirect(`/chat/${id}`);
}
