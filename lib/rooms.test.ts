import { describe, expect, it } from "vitest";

import {
  createRoom,
  derivePrivateRoomName,
  isValidRoomId,
  isValidRoomKey,
  normalizeDisplayName,
} from "./rooms";

describe("room privacy helpers", () => {
  it("creates a room without storing state", () => {
    const room = createRoom("https://voice.example.test");

    expect(room.roomId).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(room.roomKey).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(room.joinUrl).toBe(`https://voice.example.test/room/${room.roomId}`);
  });

  it("derives stable private room names without exposing the key", () => {
    const first = derivePrivateRoomName("secret", "room-123", "key-123456789");
    const second = derivePrivateRoomName("secret", "room-123", "key-123456789");
    const changed = derivePrivateRoomName("secret", "room-123", "different-key");

    expect(first).toBe(second);
    expect(first).not.toBe(changed);
    expect(first).not.toContain("room-123");
    expect(first).not.toContain("key-123456789");
  });

  it("validates room inputs and display names", () => {
    expect(isValidRoomId("abc_DEF-123")).toBe(true);
    expect(isValidRoomId("../bad")).toBe(false);
    expect(isValidRoomKey("abc_DEF-123456789")).toBe(true);
    expect(isValidRoomKey("too-short")).toBe(false);
    expect(normalizeDisplayName("  Ada   Lovelace  ")).toBe("Ada Lovelace");
    expect(normalizeDisplayName("")).toBeNull();
  });
});
