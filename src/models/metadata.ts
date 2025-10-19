export type Metadata = {
    size: number,
    mimeType:FileMimeType,
    filename: string,
    totalSize: number,
}


export enum FileMimeType {
    Mp3 = "audio/mpeg",
    Aac = "audio/aac",
    Wav = "audio/wav",
    Flac = "audio/flac",
    Mp4 = "audio/m4a"
}