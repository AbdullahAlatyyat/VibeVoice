"use client";

import {
  Copy,
  DoorOpen,
  KeyRound,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

type CreatedRoom = {
  roomId: string;
  roomKey: string;
  joinUrl: string;
};

export function HomeShell() {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [room, setRoom] = useState<CreatedRoom | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const [roomKey, setRoomKey] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "VibeVoice";

  async function createPrivateRoom() {
    setIsCreating(true);
    setNotice("");
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Room creation failed.");
      }
      const nextRoom = (await response.json()) as CreatedRoom;
      setRoom(nextRoom);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Room creation failed.");
    } finally {
      setIsCreating(false);
    }
  }

  function joinExistingRoom() {
    setNotice("");
    try {
      const url = new URL(joinUrl);
      if (!roomKey.trim()) {
        setNotice("Paste the room key before joining.");
        return;
      }
      window.location.href = `${url.pathname}?key=${encodeURIComponent(roomKey.trim())}`;
    } catch {
      setNotice("Paste a valid room link.");
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setNotice(`${label} copied.`);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>{appName}</span>
        </div>
        <div className="privacy-chip">
          <ShieldCheck size={16} />
          Ephemeral by default
        </div>
      </header>

      <section className="home-grid">
        <div className="hero-panel">
          <div className="hero-content">
            <p className="kicker">Self-hosted private rooms</p>
            <h1>Voice, chat, and screen share with no memory.</h1>
            <p className="hero-copy">
              Create a room, send the link and key, talk with your people, then
              leave no room history behind. No accounts. No database. No
              recordings.
            </p>
          </div>

          <div className="proof-row" aria-label="Privacy defaults">
            <div className="proof">
              <strong>No accounts</strong>
              <span>Names exist only while joining the current room.</span>
            </div>
            <div className="proof">
              <strong>No storage</strong>
              <span>Text uses LiveKit data packets and is not persisted.</span>
            </div>
            <div className="proof">
              <strong>Your media plane</strong>
              <span>LiveKit runs on your own infrastructure.</span>
            </div>
          </div>
        </div>

        <div className="action-panel">
          <div className="tabs" role="tablist" aria-label="Room actions">
            <button
              className={mode === "create" ? "tab active" : "tab"}
              onClick={() => setMode("create")}
              type="button"
            >
              <Plus size={16} /> Create
            </button>
            <button
              className={mode === "join" ? "tab active" : "tab"}
              onClick={() => setMode("join")}
              type="button"
            >
              <DoorOpen size={16} /> Join
            </button>
          </div>

          {mode === "create" ? (
            <div className="form-stack">
              <p className="note">
                Room access is split into a link and a separate key. Share them
                through different channels when you want a little more friction.
              </p>
              <button
                className="button"
                disabled={isCreating}
                onClick={createPrivateRoom}
                type="button"
              >
                <Lock size={18} />
                {isCreating ? "Creating room" : "Create private room"}
              </button>

              {room ? (
                <div className="generated-room">
                  <div className="field">
                    <label>Room link</label>
                    <div className="copy-line">
                      <div className="mono">{room.joinUrl}</div>
                      <button
                        className="button secondary"
                        onClick={() => copy(room.joinUrl, "Room link")}
                        type="button"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <label>Room key</label>
                    <div className="copy-line">
                      <div className="mono">{room.roomKey}</div>
                      <button
                        className="button secondary"
                        onClick={() => copy(room.roomKey, "Room key")}
                        type="button"
                      >
                        <KeyRound size={16} />
                      </button>
                    </div>
                  </div>

                  <a
                    className="button"
                    href={`/room/${room.roomId}?key=${encodeURIComponent(room.roomKey)}`}
                  >
                    Open room
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="form-stack">
              <div className="field">
                <label htmlFor="room-link">Room link</label>
                <input
                  className="input"
                  id="room-link"
                  onChange={(event) => setJoinUrl(event.target.value)}
                  placeholder="https://your-domain/room/..."
                  value={joinUrl}
                />
              </div>
              <div className="field">
                <label htmlFor="room-key">Room key</label>
                <input
                  className="input"
                  id="room-key"
                  onChange={(event) => setRoomKey(event.target.value)}
                  placeholder="Paste the separate key"
                  value={roomKey}
                />
              </div>
              <button className="button" onClick={joinExistingRoom} type="button">
                <DoorOpen size={18} /> Join room
              </button>
            </div>
          )}

          {notice ? <p className="note">{notice}</p> : null}
        </div>
      </section>
    </main>
  );
}
