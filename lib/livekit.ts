import { AccessToken } from "livekit-server-sdk";
import crypto from "node:crypto";

export type TokenInput = {
  apiKey: string;
  apiSecret: string;
  identity: string;
  name: string;
  roomName: string;
  ttlSeconds: number;
};

export async function createLiveKitToken(input: TokenInput): Promise<string> {
  const token = new AccessToken(input.apiKey, input.apiSecret, {
    identity: input.identity,
    name: input.name,
    ttl: input.ttlSeconds,
  });

  token.addGrant({
    room: input.roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    canUpdateOwnMetadata: true,
  });

  return token.toJwt();
}

export function createParticipantIdentity(roomName: string): string {
  return `${roomName}_${cryptoRandomId()}`;
}

function cryptoRandomId(): string {
  return crypto.randomUUID();
}
