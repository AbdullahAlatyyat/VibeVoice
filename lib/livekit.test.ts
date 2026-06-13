import { TokenVerifier } from "livekit-server-sdk";
import { describe, expect, it } from "vitest";

import { createLiveKitToken } from "./livekit";

describe("LiveKit tokens", () => {
  it("grants only room media and data capabilities", async () => {
    const token = await createLiveKitToken({
      apiKey: "api-key",
      apiSecret: "api-secret",
      identity: "participant-1",
      name: "Ada",
      roomName: "room_private",
      ttlSeconds: 60,
    });

    const claims = await new TokenVerifier("api-key", "api-secret").verify(token);

    expect(claims.name).toBe("Ada");
    expect(claims.video?.room).toBe("room_private");
    expect(claims.video?.roomJoin).toBe(true);
    expect(claims.video?.canPublish).toBe(true);
    expect(claims.video?.canPublishData).toBe(true);
    expect(claims.video?.canSubscribe).toBe(true);
    expect(claims.video?.roomRecord).not.toBe(true);
    expect(claims.video?.roomAdmin).not.toBe(true);
  });
});
