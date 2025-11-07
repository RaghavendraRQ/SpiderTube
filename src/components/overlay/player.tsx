import { useMediaSource } from "@/hooks/mediaSource";
import { useEffect } from "react";
import { useSongStore } from "../../store/song";
import { Slider } from "../ui/slider";

export default function Player() {
    const videoId = useSongStore((state) => state.currentSongId) || "";
    const { isPlaying, isBuffering, progress, metadata, audioRef, startStream, handlePlayPause } = useMediaSource(videoId);
    const duration = (metadata?.duration || 0) / 60;

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
         <div className="p-4 rounded-lg bg-[#eaecf1] text-white">
      <audio ref={audioRef} controls={false} />
      <div className="text-black">{metadata?.name || "Loading..."}</div>
      <div className="text-black">{isBuffering ? "Buffering..." : isPlaying ? "Playing" : "Paused"}</div>
      <Slider onValueChange={() => {}} />
        <div className="text-black">{duration.toFixed(2)}</div>

      <div className="mt-2 flex justify-center">
        <button
          className="px-3 py-1 rounded bg-green-600 hover:bg-green-700"
          onClick={handlePlayPause}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </div>

    )
}