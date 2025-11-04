
type Song = {
    id: string;
    name: string;
    thumbnail: Thumbnail[] | null;
    type: SongType;
}

type Genres = {
    id: string;
    name: string;
    is_mood: boolean;
    color: string;
}

type Playlist = {
    id: string;
    name: string;
    thumbnail: Thumbnail[] | null;
    trackCount: number;
};

type MusicPlaylist = {
    id: string;
    name: string;
    tracks: Song[];
    trackCount: number;
}

enum SongType {
    Track = "Track",
    Playlist = "Playlist",
    Album = "Album",
    Artist = "Artist",
    User = "User",
}

type Thumbnail = {
    url: string;
    width: number;
    height: number;
}

function createSong(id: string | null, name: string, thumbnail: Thumbnail[] | null, type: SongType): Song {
    return {
        id: id ? id : "",
        name,
        thumbnail,
        type
    };
}

export { type Playlist, type Song, createSong, SongType, type Thumbnail, type Genres, type MusicPlaylist };