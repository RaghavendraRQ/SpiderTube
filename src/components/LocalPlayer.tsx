import { convertFileSrc } from "@tauri-apps/api/core";
import { appCacheDir } from "@tauri-apps/api/path";
import { open, BaseDirectory } from "@tauri-apps/plugin-fs";
import { useState } from "react";

interface LocalPlayerProps {
    video_id: string
}

export default function LocalPlayer({video_id}: LocalPlayerProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    
    const player = async function () {
        const appCacheDirPath = await appCacheDir();

        try {
            const imageFile = convertFileSrc(`${appCacheDirPath}/react.jpeg`);
            setImageSrc(imageFile);
            console.log("Image file path:", imageFile);
        } catch (error) {
            console.error("Error getting image file path:", error);
        }

        const filePath = `${appCacheDirPath}/${video_id}.mp3`;
        const fileSrc = convertFileSrc(filePath);
        console.log("Playing local file from:", fileSrc);

        try {
            const audio = new Audio(fileSrc);
            console.log(audio);
            await audio.play();
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    }

    return (
        <div>
            <button onClick={player}>Play Local Audio</button>
            {imageSrc && <img src={imageSrc} alt="Local" />}
        </div>
    )
}