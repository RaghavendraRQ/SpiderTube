// src/components/MediaPlayer.tsx
import { useMediaSource } from "@/hooks/mediaSource";

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
    <div className="p-6 bg-neutral-900 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-3">🎵 Progressive Streaming Player</h2>
      <button
        onClick={startStream}
        disabled={isBuffering}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md mr-2"
      >
        {isBuffering ? "Buffering..." : "Start Stream"}
      </button>

      {metadata && (
        <div className="mt-4">
          <p>📁 {metadata.filename}</p>
          <p>🎵 {metadata.mimeType}</p>
          <p>💾 {(metadata.totalSize / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
        <div
          className={`h-2.5 rounded-full ${
            isBuffering ? "bg-yellow-500" : "bg-green-500"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <button
        onClick={handlePlayPause}
        className="mt-4 px-4 py-2 bg-gray-800 rounded-md"
      >
        {isPlaying ? "⏸ Pause" : "▶️ Play"}
      </button>

      <audio ref={audioRef} />
    </div>
  );
}
