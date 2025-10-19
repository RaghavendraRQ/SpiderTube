import { invoke, Channel } from "@tauri-apps/api/core";
import { useState } from "react";


type AudioStreamEvent = 
    | { event: "Started"; data: { songId: string } }
    | { event: "Progress";
        data: {
            chunkData: number[],
            chunkId: number,
            isLast: boolean
        };
    }
    | {event: "Finished";} 

export default function ChannelPlayer() {
    const [filePath, setFilePath] =  useState<string>("");
    const audioCtx = new window.AudioContext() ;
    let lastEnd = audioCtx?.currentTime;

    async function BufferAudio(chunk: number[]) {
        try {
        const decoded = await audioCtx.decodeAudioData(new Uint8Array(chunk).buffer);
        const source = audioCtx.createBufferSource();
        source.buffer = decoded;
        source.connect(audioCtx.destination);

        const startTime = Math.max(lastEnd, audioCtx.currentTime);
        source.start(startTime);
        lastEnd = startTime + source.buffer.duration;


        } catch (error) {
            console.error("Error decoding audio chunk:", error);
        }

    }

    async function SetUpChannel() {
        const audioChannel = new Channel<AudioStreamEvent>()
        const metadata = await invoke("stream_audio_through_channel", { filePath: filePath, onEvent: audioChannel });

        console.log("Metadata:", metadata);

        audioChannel.onmessage = (message) => {

            switch (message.event) {
                case "Started":
                    console.log(message);
                    break;
                case "progress":
                    BufferAudio(message.data.chunkData);
                    break;
                case "finished":
                    console.log("Streaming finished");
                    break;
                default:
                    console.warn("Unknown event:", message);
            }
        }

    }


    return (
        <div>
            <input type="text" placeholder="File Path"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
            />
            <button onClick={SetUpChannel}>
                Set Up Channel
            </button>
        </div>
    )
}


