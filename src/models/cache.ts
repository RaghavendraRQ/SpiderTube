import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";


export async function checkCacheDirectory(video_id: string) {
    const doesExist = await exists(video_id, { baseDir: BaseDirectory.AppCache });
    return doesExist;
}
