type Song = {
    Title: String,
    Duration: Number,
    Liked: boolean,
    PlayCount: Number,
}

function ConvertToSong(obj: any): Song {
    return {
        Title: obj.title,
        Duration: obj.duration,
        Liked: obj.liked,
        PlayCount: obj.play_count,
    };
}

export { type Song, ConvertToSong };