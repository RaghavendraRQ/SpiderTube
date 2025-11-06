import { useMediaSource } from "@/hooks/mediaSource";
import { useEffect } from "react";
import { useSongStore } from "../../store/song";

export default function Player() {
    const videoId = useSongStore((state) => state.currentSongId) || "";
    const { isPlaying, isBuffering, progress, metadata, audioRef, startStream, handlePlayPause } = useMediaSource(videoId);
    
    useEffect(() => {
        if (videoId) {
            startStream();
        }
    }, [videoId]);

    if (!videoId) return null;

    return (
         <div className="p-4 rounded-lg bg-[#eaecf1] text-white">
      <audio ref={audioRef} controls={false} />
      <div>{metadata?.name || "Loading..."}</div>
      <div>{isBuffering ? "Buffering..." : isPlaying ? "Playing" : "Paused"}</div>
      <div className="h-1 w-full bg-gray-600 mt-2">
        <div
          className="h-1 bg-green-400"
          style={{ width: `${progress}%` }}
        />
      </div>
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