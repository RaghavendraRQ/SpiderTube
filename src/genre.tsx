import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { type Playlist } from "./models/song";
import { getCachePlaylists } from "./models/cache";
import { Spinner } from "./components/ui/spinner";

export default function GenrePage() {
    const { id } = useParams<{ id: string }>();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        getCachePlaylists(id || "").then(setPlaylists);
    }, [id]);

    // navigation now handled via Link to /tracks/:id

    return (
        <div className="mx-auto max-w-7xl p-6">
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Playlists</CardTitle>
                    </div>
                </CardHeader>
                {playlists.length === 0 && (
                    <div className="flex justify-center py-10">
                    <Spinner className="size-4"/>
                    </div>
                )}
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {playlists.map(p => {
                            const thumbnail = p.thumbnail && p.thumbnail.length > 0 ? p.thumbnail[0] : null;
                            return (
                                <div key={p.id} className="rounded-lg glass card overflow-hidden">
                                    <Link to={`/tracks/${p.id}`} className="w-full block text-center text-white py-2 transition">
                                    {thumbnail ? (
                                        <img src={thumbnail.url} alt={p.name} className="object-cover" 
                                        width={thumbnail.width}
                                        height={thumbnail.height}
                                        />
                                    ) : (
                                        <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground">No image</div>
                                    )}
                                     <div className="p-4">
                                        <h4 className="font-semibold truncate">{p.name}</h4>
                                    </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
