
type Song = {
    id: string;
    name: string;
    thumbnail: Thumbnail[] | null;
}

type Thumbnail = {
    url: string;
    width: number;
    height: number;
}

function createSong(id: string | null, name: string, thumbnail: Thumbnail[] | null): Song {
    return {
        id: id ? id : "",
        name,
        thumbnail
    };
}

export { type Song, createSong };