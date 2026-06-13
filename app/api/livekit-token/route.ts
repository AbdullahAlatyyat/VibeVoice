import { NextResponse } from "next/server";

import { getAppConfig } from "@/lib/config";
import { createLiveKitToken, createParticipantIdentity } from "@/lib/livekit";
import {
  derivePrivateRoomName,
  isValidRoomId,
  isValidRoomKey,
  normalizeDisplayName,
} from "@/lib/rooms";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (!isTokenBody(body)) {
    return badRequest("roomId, roomKey, and displayName are required.");
  }

  const displayName = normalizeDisplayName(body.displayName);
  if (
    !isValidRoomId(body.roomId) ||
    !isValidRoomKey(body.roomKey) ||
    !displayName
  ) {
    return badRequest("Invalid room or display name.");
  }

  try {
    const config = getAppConfig();
    const roomName = derivePrivateRoomName(
      config.appSecret,
      body.roomId,
      body.roomKey,
    );
    const identity = createParticipantIdentity(roomName);
    const token = await createLiveKitToken({
      apiKey: config.livekitApiKey,
      apiSecret: config.livekitApiSecret,
      identity,
      name: displayName,
      roomName,
      ttlSeconds: config.roomTokenTtlSeconds,
    });

    return NextResponse.json(
      {
        token,
        url: config.livekitUrl,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create room token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function isTokenBody(
  body: unknown,
): body is { roomId: unknown; roomKey: unknown; displayName: unknown } {
  return (
    typeof body === "object" &&
    body !== null &&
    "roomId" in body &&
    "roomKey" in body &&
    "displayName" in body
  );
}
