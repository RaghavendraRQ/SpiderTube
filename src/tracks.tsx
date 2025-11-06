import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { type MusicPlaylist, type Song } from "./models/song";
import Player from "./components/overlay/player";
import { Spinner } from "./components/ui/spinner";

export default function TracksPage() {
    const { id } = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<MusicPlaylist | null>(null);
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPlaylist() {
            if (!id) return;
            try {
                const res = await invoke<MusicPlaylist>("get_playlist", { id });
                setPlaylist(res || null);
            } catch (e) {
                console.error("Failed to fetch playlist", e);
            }
        }
        fetchPlaylist();
    }, [id]);

    useEffect(() => {
        if (selectedTrackId) {
            // Handle track selection

        }
    }, [selectedTrackId]);

    return (
        <div className="mx-auto max-w-4xl p-6">
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>{playlist ? playlist.name : "Playlist"}</CardTitle>
                    </div>
                </CardHeader>
                {playlist === null && (
                    <div className="flex justify-center py-10">
                   <Spinner className="size-5" /> 
                    </div>
                )}
                <CardContent>
                    {playlist && playlist.tracks && playlist.tracks.length > 0 ? (
                        <div className="space-y-4">
                            {playlist.tracks.map((t: Song) => (
                                <div key={t.id} className="flex items-center gap-4 p-3 border rounded">
                                    <div className="w-16 h-16 bg-slate-100 flex items-center justify-center overflow-hidden rounded">
                                        {t.thumbnail && t.thumbnail.length > 0 ? (
                                            <img src={t.thumbnail[0].url} alt={t.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="text-sm text-muted-foreground">No image</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium truncate">{t.name}</div>
                                        <div className="text-sm text-muted-foreground">{t.type}</div>
                                    </div>
                                    <div>
                                        <button className="bg-blue-600 text-white px-3 py-1 rounded"
                                        onClick={() => setSelectedTrackId(t.id)}
                                        >Play</button>
                                    </div>
                                </div>
                            ))}
                            <Player videoId={selectedTrackId || ""} />
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">No Songs Found</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
