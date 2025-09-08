import { loadChat } from "@/utils/store/chat-store";
import Chat from "@/components/chat";

export default async function Page({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const messages = await loadChat(chatId);

  return <Chat id={chatId} initialMessages={messages} />;
}
