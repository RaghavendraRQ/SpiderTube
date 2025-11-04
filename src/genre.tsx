import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { type Playlist } from "./models/song";



export default function GenrePage() {
    const { id } = useParams<{ id: string }>();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        async function fetchPlaylists() {
            if (!id) return;
            try {
                const res = await invoke<Playlist[]>("get_genre_playlist", { genre: id });
                console.table(res[0].thumbnail);
                setPlaylists(res || []);
            } catch (e) {
                console.error("Failed to fetch playlists", e);
            }
        }
        fetchPlaylists();
    }, [id]);

    return (
        <div className="mx-auto max-w-7xl p-6">
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Playlists</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {playlists.map(p => {
                            const thumbnail = p.thumbnail && p.thumbnail.length > 0 ? p.thumbnail[0] : null;
                            return (
                                <div key={p.id} className="border rounded overflow-hidden bg-white shadow-sm">
                                    {thumbnail ? (
                                        <img src={thumbnail.url} alt={p.name} className="object-cover" 
                                        width={thumbnail.width}
                                        height={thumbnail.height}
                                        />
                                    ) : (
                                        <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-muted-foreground">No image</div>
                                    )}
                                    <div className="p-4">
                                        <h4 className="font-semibold truncate">{p.name}</h4>
                                        <div className="text-sm text-muted-foreground mt-1">{p.track_count ?? 0} tracks</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
