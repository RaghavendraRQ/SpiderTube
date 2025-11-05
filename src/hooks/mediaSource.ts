// src/hooks/useMediaSource.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { invoke, Channel } from "@tauri-apps/api/core";
import { Metadata } from "../models/metadata";

type AudioStreamEvent =
  | { event: "Started"; data: { songId: string } }
  | {
      event: "Progress";
      data: {
        chunkData: number[];
        chunkId: number;
        isLast: boolean;
      };
    }
  | { event: "Finished" };

export function useMediaSource(videoId: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const chunkQueueRef = useRef<Uint8Array[]>([]);
  const isAppendingRef = useRef(false);
  const totalReceivedRef = useRef(0);
  const lastChunkReceivedRef = useRef(false);

  const defaultId = "F3hHTG7l1mM";
  const url = `https://music.youtube.com/watch?v=${videoId || defaultId}`;

  // Process queued chunks sequentially
  const processChunkQueue = useCallback(() => {
    const sourceBuffer = sourceBufferRef.current;
    const mediaSource = mediaSourceRef.current;

    if (!sourceBuffer || isAppendingRef.current || chunkQueueRef.current.length === 0) {
      if (
        lastChunkReceivedRef.current &&
        chunkQueueRef.current.length === 0 &&
        !isAppendingRef.current &&
        mediaSource?.readyState === "open"
      ) {
        console.log("All chunks processed, ending stream");
        mediaSource.endOfStream();
      }
      return;
    }

    if (sourceBuffer.updating) return;

    try {
      const chunk = chunkQueueRef.current.shift()!;
      const uint8Array = new Uint8Array(chunk);
      isAppendingRef.current = true;
      sourceBuffer.appendBuffer(uint8Array);
    } catch (err) {
      console.error("Error appending buffer:", err);
      isAppendingRef.current = false;
    }
  }, []);

  // Initialize new SourceBuffer
  const createSourceBuffer = useCallback(
    (mimeType: string) => {
      const mediaSource = mediaSourceRef.current;
      if (!mediaSource || mediaSource.readyState !== "open") {
        console.error("MediaSource not ready");
        return;
      }

      try {
        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        sourceBufferRef.current = sourceBuffer;

        sourceBuffer.addEventListener("updateend", () => {
          isAppendingRef.current = false;
          processChunkQueue();
        });

        sourceBuffer.addEventListener("error", (e) => {
          console.error("SourceBuffer error:", e);
        });
      } catch (err) {
        console.error("Failed to create SourceBuffer:", err);
        alert("MIME type not supported: " + mimeType);
      }
    },
    [processChunkQueue]
  );

  // Setup MediaSource for playback
  const setupMediaSource = useCallback(() => {
    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    const objUrl = URL.createObjectURL(mediaSource);
    if (audioRef.current) {
      audioRef.current.src = objUrl;
    }

    mediaSource.addEventListener("sourceopen", () => {
      console.log("MediaSource opened");
    });
  }, []);

  // Stream setup logic (called externally)
  const startStream = useCallback(async () => {
    try {
      setIsBuffering(true);
      setProgress(0);
      chunkQueueRef.current = [];
      totalReceivedRef.current = 0;
      isAppendingRef.current = false;
      lastChunkReceivedRef.current = false;

      // Cleanup old MediaSource if any
      if (mediaSourceRef.current) {
        if (mediaSourceRef.current.readyState === "open") {
          mediaSourceRef.current.endOfStream();
        }
        mediaSourceRef.current = null;
        sourceBufferRef.current = null;
      }

      setupMediaSource();

      const audioChannel = new Channel<AudioStreamEvent>();
      audioChannel.onmessage = (message) => {
        switch (message.event) {
          case "Started":
            console.log("Stream started:", message.data.songId);
            break;

          case "Progress": {
            const uint8Array = new Uint8Array(message.data.chunkData);
            chunkQueueRef.current.push(uint8Array);

            totalReceivedRef.current += message.data.chunkData.length;
            if (metadata && metadata.size > 0) {
              const progressPercent =
                (totalReceivedRef.current / metadata.size) * 100;
              setProgress(Math.round(progressPercent));
            }

            if (message.data.isLast) {
              lastChunkReceivedRef.current = true;
            }
            processChunkQueue();
            break;
          }

          case "Finished":
            console.log("Stream finished");
            lastChunkReceivedRef.current = true;
            processChunkQueue();
            break;
        }
      };

      const meta = await invoke<Metadata>("start_stream", {
        videoUrl: url,
        channel: audioChannel,
      });
      console.log("Metadata:", meta);

      setMetadata(meta);
      createSourceBuffer(meta.trackType);
      setIsBuffering(false);
    } catch (err) {
      console.error("Stream setup failed:", err);
      setIsBuffering(false);
    }
  }, [setupMediaSource, processChunkQueue, createSourceBuffer, metadata, url]);

  // Audio state events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsBuffering(false);
      // audio.play().catch((e) =>
      //   console.warn("Auto-play blocked by browser:", e.message)
      // );
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const handlePlayPause = useCallback(async() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
 }, [isPlaying]);

  return {
    audioRef,
    metadata,
    isPlaying,
    isBuffering,
    progress,
    startStream,
    handlePlayPause,
  };
}
