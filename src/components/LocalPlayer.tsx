import { convertFileSrc } from "@tauri-apps/api/core";
import { appCacheDir } from "@tauri-apps/api/path";

interface LocalPlayerProps {
    video_id: string
}

export default function LocalPlayer({video_id}: LocalPlayerProps) {
    
    const player = async function () {
        const appCacheDirPath = await appCacheDir();

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
            <button className="btn-accent px-3 py-1 rounded" onClick={player}>Play Local Audio</button>
        </div>
    )
}