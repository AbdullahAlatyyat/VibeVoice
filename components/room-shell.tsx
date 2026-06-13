"use client";

import {
  KeyRound,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  LocalTrack,
  Participant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

type ParticipantView = {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isSharing: boolean;
};

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  mine: boolean;
};

type TokenResponse = {
  token: string;
  url: string;
};

export function RoomShell({
  roomId,
  initialRoomKey = "",
}: {
  roomId: string;
  initialRoomKey?: string;
}) {
  const roomRef = useRef<Room | null>(null);
  const audioSinkRef = useRef<HTMLDivElement | null>(null);
  const [roomKey, setRoomKey] = useState(initialRoomKey);
  const [displayName, setDisplayName] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<ParticipantView[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [muted, setMuted] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<LocalTrack | RemoteTrack | null>(
    null,
  );

  const connected = connectionState === "connected";

  useEffect(() => {
    return () => {
      void roomRef.current?.disconnect(true);
      roomRef.current = null;
    };
  }, []);

  async function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConnectionState("connecting");
    setError("");

    try {
      const response = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, roomKey, displayName }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Unable to join this room.");
      }

      const { token, url } = (await response.json()) as TokenResponse;
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        stopLocalTrackOnUnpublish: true,
      });

      roomRef.current = room;
      bindRoomEvents(room);
      await room.connect(url, token);
      await room.startAudio();
      await room.localParticipant.setMicrophoneEnabled(true);
      setMuted(false);
      refreshParticipants(room);
      setConnectionState("connected");
    } catch (caught) {
      setConnectionState("error");
      setError(caught instanceof Error ? caught.message : "Unable to join.");
    }
  }

  function bindRoomEvents(room: Room) {
    room
      .on(RoomEvent.ParticipantConnected, () => refreshParticipants(room))
      .on(RoomEvent.ParticipantDisconnected, () => refreshParticipants(room))
      .on(RoomEvent.ActiveSpeakersChanged, () => refreshParticipants(room))
      .on(RoomEvent.TrackMuted, () => refreshParticipants(room))
      .on(RoomEvent.TrackUnmuted, () => refreshParticipants(room))
      .on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.source === Track.Source.ScreenShare && publication.track) {
          setScreenTrack(publication.track);
          setSharing(true);
        }
        refreshParticipants(room);
      })
      .on(RoomEvent.LocalTrackUnpublished, (publication) => {
        if (publication.source === Track.Source.ScreenShare) {
          setScreenTrack(null);
          setSharing(false);
        }
        refreshParticipants(room);
      })
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (publication.source === Track.Source.ScreenShare) {
          setScreenTrack(track);
        }
        if (track.kind === Track.Kind.Audio && audioSinkRef.current) {
          const element = track.attach();
          element.dataset.participant = participant.identity;
          audioSinkRef.current.appendChild(element);
        }
        refreshParticipants(room);
      })
      .on(RoomEvent.TrackUnsubscribed, (track, publication) => {
        track.detach().forEach((element) => element.remove());
        if (publication.source === Track.Source.ScreenShare) {
          setScreenTrack(null);
        }
        refreshParticipants(room);
      })
      .on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
        if (topic !== "chat") {
          return;
        }
        const decoded = decodeMessage(payload);
        if (!decoded) {
          return;
        }
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            sender: participant?.name || participant?.identity || "Friend",
            text: decoded,
            mine: false,
          },
        ]);
      })
      .on(RoomEvent.Disconnected, () => {
        setConnectionState("idle");
        setScreenTrack(null);
        setSharing(false);
        setParticipants([]);
      });
  }

  function refreshParticipants(room: Room) {
    const active = new Set(room.activeSpeakers.map((speaker) => speaker.identity));
    const all: Participant[] = [
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values()),
    ];

    setParticipants(
      all.map((participant) => ({
        identity: participant.identity,
        name: participant.name || participant.identity,
        isLocal: participant.identity === room.localParticipant.identity,
        isSpeaking: active.has(participant.identity),
        isSharing: participant.isScreenShareEnabled,
      })),
    );
  }

  async function toggleMute() {
    const room = roomRef.current;
    if (!room) {
      return;
    }
    const nextMuted = !muted;
    await room.localParticipant.setMicrophoneEnabled(!nextMuted);
    setMuted(nextMuted);
  }

  async function toggleScreenShare() {
    const room = roomRef.current;
    if (!room) {
      return;
    }
    await room.localParticipant.setScreenShareEnabled(!sharing, {
      audio: true,
      selfBrowserSurface: "include",
      systemAudio: "include",
    });
    setSharing(!sharing);
  }

  async function leaveRoom() {
    await roomRef.current?.disconnect(true);
    roomRef.current = null;
    setConnectionState("idle");
    setScreenTrack(null);
    setSharing(false);
    setParticipants([]);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    const room = roomRef.current;
    if (!text || !room) {
      return;
    }
    const payload = new TextEncoder().encode(text);
    await room.localParticipant.publishData(payload, {
      reliable: true,
      topic: "chat",
    });
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        sender: displayName.trim() || "You",
        text,
        mine: true,
      },
    ]);
    setDraft("");
  }

  const heading = useMemo(() => {
    if (connected) {
      return "Room live";
    }
    if (connectionState === "connecting") {
      return "Joining";
    }
    return "Join private room";
  }, [connected, connectionState]);

  if (!connected) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <Sparkles size={18} />
            </span>
            <span>VibeVoice</span>
          </Link>
          <div className="privacy-chip">
            <ShieldCheck size={16} />
            Room key required
          </div>
        </header>

        <section className="stage">
          <form className="join-card" onSubmit={joinRoom}>
            <p className="kicker">Room {roomId}</p>
            <h1>{heading}</h1>
            <p>
              Your name and key are used only to enter this LiveKit room. No
              account is created.
            </p>
            <div className="form-stack">
              <div className="field">
                <label htmlFor="display-name">Display name</label>
                <input
                  className="input"
                  id="display-name"
                  maxLength={42}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="How friends see you"
                  required
                  value={displayName}
                />
              </div>
              <div className="field">
                <label htmlFor="room-key">Room key</label>
                <input
                  className="input"
                  id="room-key"
                  onChange={(event) => setRoomKey(event.target.value)}
                  placeholder="Paste room key"
                  required
                  value={roomKey}
                />
              </div>
              <button
                className="button"
                disabled={connectionState === "connecting"}
                type="submit"
              >
                <KeyRound size={18} />
                {connectionState === "connecting" ? "Joining" : "Join room"}
              </button>
              {error ? <p className="error">{error}</p> : null}
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>VibeVoice</span>
        </Link>
        <div className="privacy-chip">
          <ShieldCheck size={16} />
          Ephemeral room active
        </div>
      </header>

      <section className="room-layout">
        <aside className="participants-panel" aria-label="Participants">
          <div className="panel-title">
            <span>People</span>
            <span>{participants.length}</span>
          </div>
          <div className="participant-list">
            {participants.map((participant) => (
              <div className="participant" key={participant.identity}>
                <div className="avatar">{participant.name.slice(0, 1)}</div>
                <div className="participant-name">
                  {participant.name}
                  {participant.isLocal ? " (you)" : ""}
                </div>
                {participant.isSpeaking ? <Mic size={14} /> : null}
                {participant.isSharing ? <MonitorUp size={14} /> : null}
              </div>
            ))}
          </div>
        </aside>

        <section className="stage" aria-label="Screen share stage">
          {screenTrack ? (
            <ScreenTrack track={screenTrack} />
          ) : (
            <div className="empty-stage">
              <MonitorUp size={42} />
              <h2>No screen is being shared.</h2>
              <p>
                Voice is live. Start screen sharing when you want the room to
                focus on what you are working on.
              </p>
            </div>
          )}

          <div className="controls" aria-label="Call controls">
            <button
              aria-label={muted ? "Unmute microphone" : "Mute microphone"}
              className={muted ? "icon-button danger" : "icon-button active"}
              onClick={toggleMute}
              title={muted ? "Unmute microphone" : "Mute microphone"}
              type="button"
            >
              {muted ? <MicOff /> : <Mic />}
            </button>
            <button
              aria-label={sharing ? "Stop screen share" : "Start screen share"}
              className={sharing ? "icon-button active" : "icon-button"}
              onClick={toggleScreenShare}
              title={sharing ? "Stop screen share" : "Start screen share"}
              type="button"
            >
              <MonitorUp />
            </button>
            <button
              aria-label="Leave room"
              className="icon-button danger"
              onClick={leaveRoom}
              title="Leave room"
              type="button"
            >
              <PhoneOff />
            </button>
          </div>
        </section>

        <aside className="chat-panel" aria-label="Ephemeral chat">
          <div className="panel-title">
            <span>Ephemeral chat</span>
            <Users size={16} />
          </div>
          <div className="messages" role="log">
            {messages.length === 0 ? (
              <p className="note">
                Messages appear here only while this browser tab is in the room.
              </p>
            ) : (
              messages.map((message) => (
                <div className="message" key={message.id}>
                  <strong>{message.mine ? "You" : message.sender}</strong>
                  <span>{message.text}</span>
                </div>
              ))
            )}
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              className="input"
              maxLength={500}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Send without history"
              value={draft}
            />
            <button aria-label="Send message" className="button" type="submit">
              <Send size={18} />
            </button>
          </form>
        </aside>
      </section>

      <div ref={audioSinkRef} />
    </main>
  );
}

function ScreenTrack({ track }: { track: LocalTrack | RemoteTrack }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) {
      return;
    }

    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [track]);

  return <video autoPlay playsInline ref={videoRef} />;
}

function decodeMessage(payload: Uint8Array): string | null {
  try {
    const decoded = new TextDecoder().decode(payload).trim();
    return decoded.length > 0 && decoded.length <= 500 ? decoded : null;
  } catch {
    return null;
  }
}
