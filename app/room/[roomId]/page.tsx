import { RoomShell } from "@/components/room-shell";

type PageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ key?: string }>;
};

export default async function RoomPage({ params, searchParams }: PageProps) {
  const { roomId } = await params;
  const { key } = await searchParams;
  return <RoomShell initialRoomKey={key ?? ""} roomId={roomId} />;
}
