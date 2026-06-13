// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomeShell } from "./home-shell";
import { RoomShell } from "./room-shell";

describe("room UI", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a private room and exposes separate link and key", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          roomId: "room_123456",
          roomKey: "key_123456789012345",
          joinUrl: "https://voice.example/room/room_123456",
        }),
      }),
    );

    render(<HomeShell />);
    await userEvent.click(screen.getByRole("button", { name: /create private/i }));

    expect(await screen.findByText("Room link")).toBeInTheDocument();
    expect(screen.getByText("Room key")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open room/i })).toHaveAttribute(
      "href",
      "/room/room_123456?key=key_123456789012345",
    );
  });

  it("requires a display name and room key before joining", async () => {
    render(<RoomShell roomId="room_123456" />);

    expect(screen.getByRole("heading", { name: /join private room/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeRequired();
    expect(screen.getByLabelText(/room key/i)).toBeRequired();
  });

  it("submits join details to the token endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Missing test LiveKit server." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<RoomShell roomId="room_123456" />);
    await userEvent.type(screen.getByLabelText(/display name/i), "Ada");
    await userEvent.type(screen.getByLabelText(/room key/i), "key_123456789012345");
    await userEvent.click(screen.getByRole("button", { name: /join room/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/livekit-token",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          roomId: "room_123456",
          roomKey: "key_123456789012345",
          displayName: "Ada",
        }),
      }),
    ));
  });
});
