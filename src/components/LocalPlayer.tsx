import {BaseDirectory, readFile} from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";


export default function LocalPlayer() {
    
    const player = async function () {
        const file_path = await invoke<string>("get_file_path", { musicUrl: "https://www.youtube.com/watch?v=5vsOv_bcnhs" });
        console.log("File path:", file_path);
        const fileData = await readFile(file_path, { baseDir: BaseDirectory.AppCache });

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