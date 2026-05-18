"use client";

import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";

import { Video, VideoOff, Mic, MicOff, Users } from "lucide-react";

import { toast } from "react-toastify";

export function LiveVideoSession({ sessionData, onEndSession }) {
   const [isConnected, setIsConnected] = useState(false);

   const [micOn, setMicOn] = useState(true);

   const [cameraOn, setCameraOn] = useState(true);

   const [remoteUsers, setRemoteUsers] = useState([]);

   const [loading, setLoading] = useState(true);

   const localVideoRef = useRef(null);

   const clientRef = useRef(null);

   const localTracksRef = useRef({
      audioTrack: null,
      videoTrack: null,
   });

   const cleanupRef = useRef(false);

   useEffect(() => {
      if (sessionData) {
         initializeAgora();
      }

      return () => {
         cleanup();
      };
   }, []);

   const initializeAgora = async () => {
      try {
         setLoading(true);

         const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");

         const client = AgoraRTC.createClient({
            mode: "rtc",
            codec: "vp8",
         });

         clientRef.current = client;

         // Enable dual stream mode
         await client.enableDualStream();

         client.on("connection-state-change", (curState, prevState) => {
            console.log("prev agora state", prevState, "→", curState);
         });

         client.on("user-published", async (user, mediaType) => {
            try {
               await client.subscribe(user, mediaType);
               console.log("Subscribed to:", user.uid, mediaType);

               if (mediaType === "video") {
                  setRemoteUsers((prev) => {
                     const exists = prev.find((u) => u.uid === user.uid);

                     if (exists) return prev;

                     return [...prev, user];
                  });

                  requestAnimationFrame(() => {
                     const container = document.getElementById(`remote-${user.uid}`);

                     if (container) {
                        user.videoTrack?.play(container);
                     }
                  });
               }

               if (mediaType === "audio") {
                  user.audioTrack?.play();
               }
            } catch (error) {
               console.error("Error subscribing to user media: ", error);
            }
         });

         client.on("user-unpublished", (user) => {
            user.videoTrack?.stop();

            setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
         });

         client.on("user-joined", (user) => {
            console.log("Remote user joined:", user.uid);
         });

         client.on("user-left", (user) => {
            console.log("Remote user left:", user.uid);
         });

         if (client.connectionState !== "DISCONNECTED") {
            await client.leave();
         }
         await client.join(sessionData.appId, sessionData.channelName, sessionData.token, sessionData.uid);

         try {
            const [localAudioTrack, localVideoTrack] = await Promise.all([
               AgoraRTC.createMicrophoneAudioTrack(),
               AgoraRTC.createCameraVideoTrack(),
            ]);

            localTracksRef.current = {
               audioTrack: localAudioTrack,
               videoTrack: localVideoTrack,
            };

            localVideoTrack.play(localVideoRef.current);

            await client.publish([localAudioTrack, localVideoTrack]);

            setIsConnected(true);

            toast.success("Connected to session");
         } catch (error) {
            if (error.name === "NotReadableError") {
               console.error("Camera or microphone is not accessible: ", error);
               toast.error(
                  "Camera or microphone is not accessible. Please check permissions or close other applications using them.",
               );
               return;
            } else {
               console.error("Error creating local tracks: ", error);
               toast.error("Failed to create local tracks.");
               return;
            }
         }

         setLoading(false);
      } catch (error) {
         console.error("Error initializing Agora: ", error);
         toast.error("Failed to connect to session: " + error.message);
         setLoading(false);
         return;
      }
   };

   const cleanup = async () => {
      try {
         if (cleanupRef.current) return;

         cleanupRef.current = true;

         const client = clientRef.current;

         const { audioTrack, videoTrack } = localTracksRef.current;

         if (audioTrack) {
            audioTrack.stop(); // Stop the audio track
            audioTrack.close(); // Close the audio track
            localTracksRef.current.audioTrack = null; // Clear reference
         }

         if (videoTrack) {
            videoTrack.stop(); // Stop the video track
            videoTrack.close(); // Close the video track
            localTracksRef.current.videoTrack = null; // Clear reference
         }

         if (client) {
            await client.unpublish([audioTrack, videoTrack].filter(Boolean)); // Unpublish tracks
            client.removeAllListeners(); // Remove all event listeners
            await client.leave(); // Leave the session
         }
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
      try {
         await cleanup(); // Ensure all tracks are stopped and resources are released
         window.close(); // Attempt to close the window/tab after leaving the session
         toast.info("You have left the session."); // Notify user of successful leave
         onEndSession(); // Proceed to end the session
      } catch (error) {
         console.error("Error while leaving the session:", error);
         toast.error("Failed to leave the session. Please try again.");
      }
   };

   if (loading) {
      return <div className="flex items-center justify-center h-screen text-white">Connecting...</div>;
   }

   return (
      <div className="h-screen bg-gray-400 flex flex-col">
         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="bg-gray-800 rounded relative">
               <div ref={localVideoRef} className="w-full h-full rounded md:col-span-2" />

               <div className="absolute bottom-2 left-2 text-white">{sessionData.isHost ? "Host" : "You"}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full h-full">
               {remoteUsers.map((user) => (
                  <div key={user.uid} id={`remote-${user.uid}`} className="bg-gray-800 rounded" />
               ))}
            </div>
         </div>

         <div className="p-4 flex justify-center gap-4">
            <Button onClick={toggleMic}>{micOn ? <Mic /> : <MicOff />}</Button>

            <Button onClick={toggleCamera}>{cameraOn ? <Video /> : <VideoOff />}</Button>

            <Button onClick={handleLeave}>Leave</Button>

            <div className="text-white flex items-center gap-2">
               <Users />
               {remoteUsers.length + 1}
            </div>
         </div>
      </div>
   );
}
