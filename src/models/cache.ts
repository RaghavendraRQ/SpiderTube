import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { Genres, Playlist } from "./song";
import { invoke } from "@tauri-apps/api/core";

// In-Memory caches
let cachedGenres: Genres[] | null = null; 
let playlistCache: Record<string, Playlist[]> = {};

// Cache related functions
export async function checkCacheDirectory(video_id: string) {
    const file_path = video_id + ".mp3"
    console.log(file_path )
    const doesExist = await exists(file_path, { baseDir: BaseDirectory.AppCache });
    console.log('doesExist', doesExist)
    return doesExist;
}

export async function getCacheGenres() {
    if (cachedGenres) { return cachedGenres; }
    
    // Fetch genres from backend
    const genres = await invoke<Genres[]>("get_genres");
    cachedGenres = genres;
    return genres;
}

export async function getCachePlaylists(genre: string) {
    if (playlistCache[genre]) {
        return playlistCache[genre];
    }

    // Fetch playlists from backend
    const playlists = await invoke<Playlist[]>("get_genre_playlist", { genre });
    playlistCache[genre] = playlists;
    return playlists;
}

export function clearCache() {
    cachedGenres = null;
    playlistCache = {};
}