"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CameraOff,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  ScreenShare,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";

export function LiveVideoSession({ sessionData, onEndSession }) {
  const [isConnected, setIsConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [connectionState, setConnectionState] = useState("Connecting");

  const localVideoRef = useRef(null);
  const clientRef = useRef(null);
  const initializedRef = useRef(false);
  const cleanupRef = useRef(false);
  const localTracksRef = useRef({
    audioTrack: null,
    videoTrack: null,
  });

  useEffect(() => {
    if (!sessionData || initializedRef.current) return undefined;

    initializedRef.current = true;
    cleanupRef.current = false;
    initializeAgora();

    return () => {
      cleanup();
    };
  }, [sessionData]);

  useEffect(() => {
    if (loading || !localVideoRef.current) return;

    playLocalVideo();
  }, [loading, cameraOn]);

  useEffect(() => {
    if (loading) return;

    remoteUsers.forEach((user) => {
      playRemoteVideo(user);
    });
  }, [loading, remoteUsers]);

  const getRemoteVideoId = (uid) =>
    `remote-video-${String(uid).replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  const playLocalVideo = () => {
    const videoTrack = localTracksRef.current.videoTrack;
    const container = localVideoRef.current;

    if (!videoTrack || !container) return;

    videoTrack.play(container, { fit: "cover" });
  };

  const playRemoteVideo = (user, attempt = 0) => {
    if (!user?.videoTrack) return;

    const container = document.getElementById(getRemoteVideoId(user.uid));
    if (!container) {
      if (attempt < 20) {
        setTimeout(() => playRemoteVideo(user, attempt + 1), 50);
      }
      return;
    }

    user.videoTrack.play(container, { fit: "cover" });
  };

  const initializeAgora = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");

      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      clientRef.current = client;
      await client.enableDualStream();

      client.on("connection-state-change", (curState) => {
        setConnectionState(curState);
      });

      client.on("user-published", async (user, mediaType) => {
        try {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            setRemoteUsers((prev) => {
              const exists = prev.some((u) => u.uid === user.uid);
              return exists
                ? prev.map((existingUser) =>
                    existingUser.uid === user.uid ? user : existingUser,
                  )
                : [...prev, user];
            });
            playRemoteVideo(user);
          }

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        } catch (error) {
          console.error("Error subscribing to user media:", error);
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          user.videoTrack?.stop();
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        }
      });

      client.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.join(
        sessionData.appId,
        sessionData.channelName,
        sessionData.token,
        sessionData.uid,
      );

      const [localAudioTrack, localVideoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      localTracksRef.current = {
        audioTrack: localAudioTrack,
        videoTrack: localVideoTrack,
      };

      await client.publish([localAudioTrack, localVideoTrack]);

      setIsConnected(true);
      setLoading(false);
      toast.success("Connected to session");
    } catch (error) {
      console.error("Error initializing Agora:", error);

      const message =
        error?.code === "UID_CONFLICT"
          ? "This browser still has an active connection for the previous session. Close the duplicate tab or reopen the live room to get a fresh connection."
          : error?.name === "NotReadableError"
            ? "Camera or microphone is not accessible. Check permissions or close other apps using them."
            : error?.message || "Failed to connect to session.";

      setErrorMessage(message);
      setLoading(false);
      toast.error(message);
      await cleanup();
    }
  };

  const cleanup = async () => {
    try {
      if (cleanupRef.current) return;
      cleanupRef.current = true;

      const client = clientRef.current;
      const { audioTrack, videoTrack } = localTracksRef.current;
      const tracks = [audioTrack, videoTrack].filter(Boolean);

      if (client) {
        if (tracks.length && client.connectionState === "CONNECTED") {
          await client.unpublish(tracks);
        }
        client.removeAllListeners();
        if (client.connectionState !== "DISCONNECTED") {
          await client.leave();
        }
      }

      tracks.forEach((track) => {
        track.stop();
        track.close();
      });

      localTracksRef.current = {
        audioTrack: null,
        videoTrack: null,
      };
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  };

  const toggleMic = async () => {
    const audioTrack = localTracksRef.current?.audioTrack;
    if (!audioTrack) return;

    await audioTrack.setMuted(micOn);
    setMicOn(!micOn);
  };

  const toggleCamera = async () => {
    const videoTrack = localTracksRef.current?.videoTrack;
    if (!videoTrack) return;

    await videoTrack.setMuted(cameraOn);
    setCameraOn(!cameraOn);
  };

  const handleLeave = async () => {
    await cleanup(); // Ensure all tracks are stopped and resources are released
    window.close(); // Attempt to close the window/tab after leaving the session
    toast.info("You have left the session."); // Notify user of successful leave
    onEndSession(); // Proceed to end the session
  };

  const participantCount = remoteUsers.length + (isConnected ? 1 : 0);
  const roleLabel = sessionData.isHost ? "Host" : "Participant";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-8 py-7 shadow-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <div className="text-center">
            <p className="text-base font-semibold">
              Connecting to live training
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Setting up your camera, audio, and secure room token.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <section className="w-full max-w-md rounded-lg border border-red-400/20 bg-red-950/20 p-6 shadow-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-none text-red-300" />
            <div>
              <h1 className="text-lg font-semibold">Unable to join session</h1>
              <p className="mt-2 text-sm leading-6 text-red-100/80">
                {errorMessage}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={onEndSession}
            className="mt-6 w-full rounded bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            Return to trainings
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="flex min-h-16 flex-col gap-3 border-b border-white/10 bg-slate-950/95 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            <Radio className="h-4 w-4" />
            Live Training
          </div>
          <h1 className="mt-1 truncate text-lg font-semibold text-white">
            {sessionData.trainingTitle || "Training Session"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-2 rounded border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {connectionState}
          </span>
          <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-200">
            <Users className="h-4 w-4" />
            {participantCount} online
          </span>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-9rem)] gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:p-6">
        <div className="grid gap-4">
          <div className="relative min-h-[22rem] overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-2xl">
            <div
              ref={localVideoRef}
              className="h-full min-h-[22rem] w-full bg-slate-900 [&_*]:!h-full [&_*]:!w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover"
            />
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-2xl font-semibold text-slate-200">
                  {roleLabel.slice(0, 1)}
                </div>
              </div>
            )}
            <div className="absolute left-4 top-4 rounded border border-black/20 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              {roleLabel}
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded border border-black/20 bg-black/55 px-3 py-1.5 text-xs text-slate-100 backdrop-blur">
              {micOn ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4 text-red-300" />
              )}
              {cameraOn ? (
                <Camera className="h-4 w-4" />
              ) : (
                <CameraOff className="h-4 w-4 text-red-300" />
              )}
              You
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {remoteUsers.length > 0 ? (
              remoteUsers.map((user) => (
                <div
                  key={user.uid}
                  id={getRemoteVideoId(user.uid)}
                  className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-slate-900 [&_*]:!h-full [&_*]:!w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover"
                >
                  <span className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
                    Participant
                  </span>
                </div>
              ))
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] text-sm text-slate-400 sm:col-span-2 xl:col-span-3">
                Waiting for participants to join
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Session Details
              </h2>
              <p className="mt-1 text-xs text-slate-400">Secure video room</p>
            </div>
            <span className="rounded bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
              {roleLabel}
            </span>
          </div>

          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Channel</dt>
              <dd className="mt-1 break-all font-medium text-slate-200">
                {sessionData.channelName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Connection UID</dt>
              <dd className="mt-1 break-all font-medium text-slate-200">
                {sessionData.uid}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Participants</dt>
              <dd className="mt-1 font-medium text-slate-200">
                {participantCount}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-50/80">
            Keep this tab open while the live session is active. Opening the
            same room in multiple tabs can reserve multiple seats.
          </div>
        </aside>
      </section>

      <footer className="sticky bottom-0 border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur lg:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3">
          <ControlButton
            active={micOn}
            label={micOn ? "Mute microphone" : "Unmute microphone"}
            onClick={toggleMic}
          >
            {micOn ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </ControlButton>

          <ControlButton
            active={cameraOn}
            label={cameraOn ? "Turn camera off" : "Turn camera on"}
            onClick={toggleCamera}
          >
            {cameraOn ? (
              <Camera className="h-5 w-5" />
            ) : (
              <CameraOff className="h-5 w-5" />
            )}
          </ControlButton>

          <ControlButton disabled label="Share screen">
            <ScreenShare className="h-5 w-5" />
          </ControlButton>

          <ControlButton disabled label="Settings">
            <Settings className="h-5 w-5" />
          </ControlButton>

          <Button
            type="button"
            onClick={handleLeave}
            className="inline-flex h-11 items-center gap-2 rounded bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5" />
            Leave
          </Button>
        </div>
      </footer>
    </main>
  );
}

function ControlButton({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-11 w-11 items-center justify-center rounded border text-white transition ${
        active
          ? "border-white/10 bg-white/10 hover:bg-white/15"
          : "border-red-400/30 bg-red-500/20 text-red-100 hover:bg-red-500/30"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      {children}
    </Button>
  );
}
