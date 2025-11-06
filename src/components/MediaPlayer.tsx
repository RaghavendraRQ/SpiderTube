// src/components/MediaPlayer.tsx
import { useMediaSource } from "@/hooks/mediaSource";
import { Progress } from "./ui/progress";

export default function MediaPlayer({ video_id }: { video_id: string }) {
  const {
    audioRef,
    metadata,
    isPlaying,
    isBuffering,
    progress,
    startStream,
    handlePlayPause,
  } = useMediaSource(video_id);

  return (
    <div className="p-6 bg-[#eaecf1] tral-900 text-white rounded-lg shadow-lg">
      <button
        onClick={startStream}
        disabled={isBuffering}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md mr-2"
      >
        {isBuffering ? "Buffering..." : "Start Stream"}
      </button>

      {metadata && (
        <div className="mt-4">
          <p>{metadata.name}</p>
          <p>{metadata.type}</p>
          <p>{(metadata.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <Progress value={progress} className="mt-4 w-full" />

      <button
        onClick={handlePlayPause}
        className="mt-4 px-4 py-2 bg-gray-800 rounded-md"
      >
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>

      <audio ref={audioRef} />
    </div>
  );
}
