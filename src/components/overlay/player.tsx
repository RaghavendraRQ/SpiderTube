import { useMediaSource } from "@/hooks/mediaSource";
import { useEffect } from "react";
import { useSongStore } from "../../store/song";
import { Slider } from "../ui/slider";

export default function Player() {
    const videoId = useSongStore((state) => state.currentSongId) || "";
    const { isPlaying, isBuffering, metadata, audioRef, startStream, handlePlayPause } = useMediaSource(videoId);
  // Note: played time and duration are intentionally omitted from visual UI for now

  useEffect(() => {
    if (videoId) {
      startStream();
      if (!isBuffering) {
        handlePlayPause();
      }
    }
  }, [videoId]);

    if (!videoId) return null;

    return (
      <div className="player-bottom">
        <audio ref={audioRef} controls={false} />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-muted shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-card-foreground">{metadata?.name || "Loading..."}</div>
            <div className="text-xs text-muted-foreground">{metadata?.type || "file"}</div>
          </div>
          <div className="w-48">
            <Slider onValueChange={() => {}} />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded btn-accent" onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
          </div>
        </div>
      </div>
    )
}