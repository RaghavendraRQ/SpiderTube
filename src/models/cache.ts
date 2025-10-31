import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";


export async function checkCacheDirectory(video_id: string) {
    const file_path = video_id + ".mp3"
    console.log(file_path )
    const doesExist = await exists(file_path, { baseDir: BaseDirectory.AppCache });
    console.log('doesExist', doesExist)
    return doesExist;
}
