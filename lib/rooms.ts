import crypto from "node:crypto";

const ROOM_ID_BYTES = 9;
const ROOM_KEY_BYTES = 18;

export type CreatedRoom = {
  roomId: string;
  roomKey: string;
  joinUrl: string;
};

export function createRoom(origin: string): CreatedRoom {
  const roomId = toToken(ROOM_ID_BYTES);
  const roomKey = toToken(ROOM_KEY_BYTES);
  const joinUrl = new URL(`/room/${roomId}`, origin).toString();

  return { roomId, roomKey, joinUrl };
}

export function derivePrivateRoomName(
  appSecret: string,
  roomId: string,
  roomKey: string,
): string {
  const digest = crypto
    .createHmac("sha256", appSecret)
    .update(`${roomId}:${roomKey}`)
    .digest("base64url");

  return `room_${digest.slice(0, 48)}`;
}

export function isValidRoomId(roomId: unknown): roomId is string {
  return typeof roomId === "string" && /^[a-zA-Z0-9_-]{8,80}$/.test(roomId);
}

export function isValidRoomKey(roomKey: unknown): roomKey is string {
  return typeof roomKey === "string" && /^[a-zA-Z0-9_-]{16,160}$/.test(roomKey);
}

export function normalizeDisplayName(displayName: unknown): string | null {
  if (typeof displayName !== "string") {
    return null;
  }
  const normalized = displayName.trim().replace(/\s+/g, " ");
  if (normalized.length < 1 || normalized.length > 42) {
    return null;
  }
  return normalized;
}

function toToken(bytes: number): string {
  return crypto.randomBytes(bytes).toString("base64url");
}
