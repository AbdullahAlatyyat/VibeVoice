import { NextResponse } from "next/server";

import { createRoom } from "@/lib/rooms";

export async function POST(request: Request) {
  const origin = getRequestOrigin(request);
  return NextResponse.json(createRoom(origin), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getRequestOrigin(request: Request): string {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}
