export type Metadata = {
    id: string;
    name: string;
    trackType: TrackType;
    relatedId: string;
    size: number;
    duration: number;
}

export enum TrackType {
    Track = "audio/mpeg",
    Video = "audio/m4a",
    Episode = "audio/wav",
}


export enum FileMimeType {
    Mp3 = "audio/mpeg",
    Aac = "audio/aac",
    Wav = "audio/wav",
    Flac = "audio/flac",
    Mp4 = "audio/m4a"
}