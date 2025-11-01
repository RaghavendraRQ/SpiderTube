
type Song = {
    id: string;
    name: string;
    thumbnail: Thumbnail[] | null;
    type: SongType;
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

export { type Song, createSong, SongType, type Thumbnail };