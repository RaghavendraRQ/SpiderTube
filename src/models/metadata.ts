export type Metadata = {
    id: string;
    name: string;
    type: FileMimeType;
    relatedId: string;
    size: number;
    duration: number;
}



export enum FileMimeType {
    Mp3 = "audio/mpeg",
    Aac = "audio/aac",
    Wav = "audio/wav",
    Flac = "audio/flac",
    Mp4 = "audio/m4a"
}