import {BaseDirectory, readFile} from "@tauri-apps/plugin-fs";

interface LocalPlayerProps {
    video_id: string
}

export default function LocalPlayer({video_id}: LocalPlayerProps) {
    
    const player = async function () {
        const file = video_id + ".mp3"
        const fileData = await readFile(file, { baseDir: BaseDirectory.AppCache });

        const blob = new Blob([fileData], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();

        audio.onended = () => URL.revokeObjectURL(url);
    }

    return (
        <div>
            <button onClick={player}>Play Local Audio</button>
        </div>
    )
}