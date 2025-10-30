import { invoke, Channel } from "@tauri-apps/api/core";
import { useState, useRef, useEffect } from "react";
import { Metadata } from "../models/metadata";

type AudioStreamEvent = 
    | { event: "Started"; data: { songId: string } }
    | { 
        event: "Progress";
        data: {
            chunkData: number[],
            chunkId: number,
            isLast: boolean
        };
    }
    | { event: "Finished" }; 

interface MediaPlayerProps {
    video_id: string;
}

export default function MediaPlayer({ video_id }: MediaPlayerProps) {
    const [filePath, setFilePath] = useState<string>("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const chunkQueueRef = useRef<Uint8Array[]>([]);
    const isAppendingRef = useRef(false);
    const metadataRef = useRef<Metadata | null>(null);
    const totalReceivedRef = useRef(0);
    const lastChunkReceivedRef = useRef(false);

    const defaultId = "F3hHTG7l1mM";
    const url = `https://music.youtube.com/watch?v=${video_id ? video_id : defaultId}`;

    // Process chunks from queue
    const processChunkQueue = () => {
        const sourceBuffer = sourceBufferRef.current;
        const mediaSource = mediaSourceRef.current;
        
        if (!sourceBuffer || isAppendingRef.current || chunkQueueRef.current.length === 0) {
            // Check if we should end the stream
            if (lastChunkReceivedRef.current && 
                chunkQueueRef.current.length === 0 && 
                !isAppendingRef.current &&
                mediaSource?.readyState === "open") {
                console.log("✅ All chunks processed, ending stream");
                mediaSource.endOfStream();
            }
            return;
        }

        if (sourceBuffer.updating) {
            return;
        }

        try {
            const chunk = chunkQueueRef.current.shift()!;
            isAppendingRef.current = true;
            sourceBuffer.appendBuffer(chunk);
        } catch (error) {
            console.error("Error appending buffer:", error);
            isAppendingRef.current = false;
        }
    };

    // Create SourceBuffer
    const createSourceBuffer = (mimeType: string) => {
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
                processChunkQueue(); // Process next chunk immediately
            });

            sourceBuffer.addEventListener("error", (e) => {
                console.error("❌ SourceBuffer error:", e);
            });

        } catch (error) {
            console.error("Failed to create SourceBuffer:", error);
            alert("MIME type not supported: " + mimeType);
        }
    };

    // Setup MediaSource
    const setupMediaSource = () => {
        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;

        const url = URL.createObjectURL(mediaSource);
        
        if (audioRef.current) {
            audioRef.current.src = url;
        }

        mediaSource.addEventListener("sourceopen", () => {
            console.log("🔓 MediaSource opened");
        });
    };

    // Audio element event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleCanPlay = () => {
            setIsBuffering(false);
            
            // Auto-play when ready
            audio.play().catch(e => {
                console.warn("Auto-play blocked by browser:", e.message);
                // User will need to click play button
            });
        };

        const handleWaiting = () => {
            setIsBuffering(true);
        };

        const handlePlaying = () => {
            console.log("▶️ Playing");
            setIsPlaying(true);
            setIsBuffering(false);
        };

        const handlePause = () => {
            console.log("⏸️ Paused");
            setIsPlaying(false);
        };

        const handleProgress = () => {
            // This fires as data is buffered
            if (audio.buffered.length > 0) {
                const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
                console.log(`📊 Buffered: ${bufferedEnd.toFixed(1)}s`);
            }
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('progress', handleProgress);

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('progress', handleProgress);
        };
    }, []);

    // Setup streaming
    async function SetUpChannel() {
        try {
            setIsBuffering(true);
            setProgress(0);
            chunkQueueRef.current = [];
            totalReceivedRef.current = 0;
            isAppendingRef.current = false;
            lastChunkReceivedRef.current = false;
            
            // Clean up previous MediaSource
            if (mediaSourceRef.current) {
                if (mediaSourceRef.current.readyState === "open") {
                    mediaSourceRef.current.endOfStream();
                }
                mediaSourceRef.current = null;
                sourceBufferRef.current = null;
            }
            
            // Create new MediaSource
            setupMediaSource();
            
            // Create channel
            const audioChannel = new Channel<AudioStreamEvent>();
            
            // Setup channel message handler
            audioChannel.onmessage = (message) => {
                switch (message.event) {
                    case "Started":
                        break;
                        
                    case "Progress":
                        const chunkData = message.data.chunkData;
                        const uint8Array = new Uint8Array(chunkData);
                        
                        // Add to queue
                        chunkQueueRef.current.push(uint8Array);
                        
                        // Update progress
                        totalReceivedRef.current += chunkData.length;
                        if (metadataRef.current && metadataRef.current.totalSize > 0) {
                            const progressPercent = (totalReceivedRef.current / metadataRef.current.totalSize) * 100;
                            setProgress(Math.round(progressPercent));
                        }
                        
                        
                        // Mark if this is the last chunk
                        if (message.data.isLast) {
                            lastChunkReceivedRef.current = true;
                        }
                        
                        // Process immediately
                        processChunkQueue();
                        break;
                        
                    case "Finished":
                        console.log("🏁 Stream finished");
                        lastChunkReceivedRef.current = true;
                        processChunkQueue(); // Try to end if queue is empty
                        break;
                        
                    default:
                        console.warn("Unknown event:", message);
                }
            };
            
            // Invoke streaming
            try {
            const metadata = await invoke<Metadata>("start_stream", { 
                videoUrl: url, 
                channel: audioChannel 
            });
            console.log("📋 Metadata:", metadata);
            metadataRef.current = metadata;
            
            // Create SourceBuffer
            createSourceBuffer(metadata.mimeType);
        } catch(err) {
            console.log('err', err)
        }
            
        } catch (error) {
            console.error("Error:", error);
            alert("Failed: " + error);
            setIsBuffering(false);
        }
    }

    const handlePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(console.error);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>🎵 Progressive Streaming Player</h2>
            
            <div style={{ marginBottom: "1rem" }}>
                <input 
                    type="text" 
                    placeholder="File Path"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    style={{ width: "300px", marginRight: "1rem" }}
                />
                <button 
                    onClick={SetUpChannel}
                    disabled={isBuffering && progress === 0}
                >
                    Start Streaming
                </button>
            </div>

            {progress > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                    <div style={{
                        width: "100%",
                        height: "20px",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "10px",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            height: "100%",
                            backgroundColor: isBuffering ? "#ff9800" : "#4caf50",
                            transition: "width 0.3s"
                        }} />
                    </div>
                    <p>
                        {isBuffering ? "⏳ Buffering..." : "✅ Ready"} - Downloaded: {progress}%
                    </p>
                </div>
            )}

            {metadataRef.current && (
                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={handlePlayPause}>
                        {isPlaying ? "⏸️ Pause" : "▶️ Play"}
                    </button>
                    <p>📁 {metadataRef.current.filename}</p>
                    <p>🎵 {metadataRef.current.mimeType}</p>
                    <p>💾 {(metadataRef.current.totalSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            )}

            <audio ref={audioRef} />
        </div>
    );
}