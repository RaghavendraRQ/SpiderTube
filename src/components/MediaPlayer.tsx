import { invoke, Channel } from "@tauri-apps/api/core";
import { useState, useRef } from "react";
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

export default function ChannelPlayer() {
    const [filePath, setFilePath] = useState<string>("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    
    // Refs for MediaSource components
    const audioRef = useRef<HTMLAudioElement>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const chunkQueueRef = useRef<Uint8Array[]>([]);
    const isAppendingRef = useRef(false);
    const metadataRef = useRef<Metadata | null>(null);
    const totalReceivedRef = useRef(0);
    
    const url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

    // Process chunks from queue
    const processChunkQueue = () => {
        const sourceBuffer = sourceBufferRef.current;
        
        if (!sourceBuffer || isAppendingRef.current || chunkQueueRef.current.length === 0) {
            return;
        }

        if (sourceBuffer.updating) {
            return;
        }

        try {
            const chunk = chunkQueueRef.current.shift()!;
            isAppendingRef.current = true;
            sourceBuffer.appendBuffer(chunk);
            console.log(`Appended chunk to buffer (${chunk.length} bytes)`);
        } catch (error) {
            console.error("Error appending buffer:", error);
            isAppendingRef.current = false;
        }
    };

    // Create SourceBuffer with correct MIME type
    const createSourceBuffer = (mimeType: string) => {
        const mediaSource = mediaSourceRef.current;
        if (!mediaSource || mediaSource.readyState !== "open") {
            console.error("MediaSource not ready");
            return;
        }

        try {
            const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
            sourceBufferRef.current = sourceBuffer;
            
            console.log("SourceBuffer created with MIME type:", mimeType);

            // When buffer finishes updating, process next chunk
            sourceBuffer.addEventListener("updateend", () => {
                isAppendingRef.current = false;
                processChunkQueue();
            });

            sourceBuffer.addEventListener("error", (e) => {
                console.error("SourceBuffer error:", e);
            });

        } catch (error) {
            console.error("Failed to create SourceBuffer:", error);
            alert("Failed to create SourceBuffer. MIME type may not be supported: " + mimeType);
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
            console.log("MediaSource opened, waiting for metadata...");
        });
    };

    // Handle stream completion
    const handleStreamComplete = () => {
        console.log("Stream complete, waiting for all chunks to append...");
        
        const checkAndEnd = () => {
            if (chunkQueueRef.current.length === 0 && !isAppendingRef.current) {
                const mediaSource = mediaSourceRef.current;
                if (mediaSource && mediaSource.readyState === "open") {
                    mediaSource.endOfStream();
                    console.log("MediaSource ended");
                }
                setIsLoading(false);
            } else {
                setTimeout(checkAndEnd, 100);
            }
        };
        
        checkAndEnd();
    };

    // Setup streaming channel
    async function SetUpChannel() {
        try {
            setIsLoading(true);
            setProgress(0);
            chunkQueueRef.current = [];
            totalReceivedRef.current = 0;
            isAppendingRef.current = false;
            
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
                        console.log("Stream started:", message.data.songId);
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
                        
                        console.log(`Received chunk ${message.data.chunkId} (${chunkData.length} bytes)`);
                        
                        // Process the queue
                        processChunkQueue();
                        
                        // Check if last chunk
                        if (message.data.isLast) {
                            handleStreamComplete();
                        }
                        break;
                        
                    case "Finished":
                        console.log("Stream finished");
                        handleStreamComplete();
                        break;
                        
                    default:
                        console.warn("Unknown event:", message);
                }
            };
            
            // Invoke the streaming command
            const metadata = await invoke<Metadata>("stream_from_api", { 
                url: url, 
                onEvent: audioChannel 
            });
            
            console.log("Metadata:", metadata);
            metadataRef.current = metadata;
            
            // Create SourceBuffer with the MIME type from metadata
            createSourceBuffer(metadata.mimeType);
            
        } catch (error) {
            console.error("Error setting up channel:", error);
            alert("Failed to setup streaming: " + error);
            setIsLoading(false);
        }
    }

    // Play/Pause handler
    const handlePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch((e) => {
                console.error("Play error:", e);
            });
            setIsPlaying(true);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>🎵 MediaSource Streaming Player</h2>
            
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
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Start Streaming"}
                </button>
            </div>

            {isLoading && (
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
                            backgroundColor: "#4caf50",
                            transition: "width 0.3s"
                        }} />
                    </div>
                    <p>Buffering: {progress}%</p>
                </div>
            )}

            {metadataRef.current && (
                <div style={{ marginBottom: "1rem" }}>
                    <button onClick={handlePlayPause}>
                        {isPlaying ? "⏸️ Pause" : "▶️ Play"}
                    </button>
                    <p>File: {metadataRef.current.filename}</p>
                    <p>Type: {metadataRef.current.mimeType}</p>
                    <p>Size: {(metadataRef.current.totalSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            )}

            {/* Hidden audio element for playback */}
            <audio 
                ref={audioRef}
                onPlaying={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
        </div>
    );
}