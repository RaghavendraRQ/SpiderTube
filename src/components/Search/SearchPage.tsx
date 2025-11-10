import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { Song, SongType } from "../../models/song";
import SearchItem from "./SearchItem";
import { useSearchSuggestions } from "../../hooks/search";
import { useSongStore } from "@/store/song";
import LocalPlayer from "../LocalPlayer";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export default function SearchPage() {
    const [searchResult, setSearhResult] = useState<Song[] | null>();
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const {setCurrentSongId} = useSongStore();

    const {
        searchTerm,
        setSearchTerm,
        suggestions,
        error,
        handleInputChange,
        setSuggestions,
    } = useSearchSuggestions();

    async function getSearchResult() {
        if (searchTerm.length <= 2) return;
        try {
            const res = await invoke<Song[]>("search_result", { trackName: searchTerm, limit: 20 });
            setSearhResult(res);
        } catch (err) {
            console.log('err', err)
        }
    }

    const handleSongSelect = async (song: Song) => {
        setSelectedSong(song);
        setCurrentSongId(song.id);
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Search music</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center glass rounded-md px-3 py-1">
                            <input
                                value={searchTerm}
                                onChange={handleInputChange}
                                placeholder="Search for songs, artists, albums..."
                                className="bg-transparent outline-none w-80"
                            />
                        </div>
                        <Button onClick={getSearchResult}>Search</Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {error && <div className="text-destructive text-sm mb-3">{error}</div>}

                    {/* suggestions */}
                    {suggestions && suggestions.length > 0 && (
                        <div className="mb-4 grid grid-cols-3 gap-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setSearchTerm(s); setSuggestions([]); getSearchResult(); }}
                                    className="text-sm px-3 py-1 rounded-md glass hover:opacity-95"
                                >{s}</button>
                            ))}
                        </div>
                    )}

                    {/* Results */}
                    <div className="space-y-6">
                        {searchResult?.some(song => song.type === SongType.Track) && (
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Tracks</h3>
                                <div className="space-y-2">
                                    {searchResult
                                        .filter(song => song.type === SongType.Track)
                                        .map((song) => (
                                            <SearchItem key={song.id} song={song} onSelect={handleSongSelect} />
                                        ))}
                                </div>
                            </section>
                        )}

                        {searchResult?.some(song => song.type === SongType.Album || song.type === SongType.Playlist) && (
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Albums & Playlists</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchResult
                                        .filter(song => song.type === SongType.Album || song.type === SongType.Playlist)
                                        .map((song) => (
                                            <SearchItem key={song.id} song={song} onSelect={handleSongSelect} />
                                        ))}
                                </div>
                            </section>
                        )}

                        {searchResult?.some(song => song.type === SongType.Artist) && (
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Artists</h3>
                                <div className="flex gap-4 overflow-x-auto py-2">
                                    {searchResult
                                        .filter(song => song.type === SongType.Artist)
                                        .map((song) => (
                                            <div key={song.id} className="min-w-[200px]"><SearchItem song={song} onSelect={handleSongSelect} /></div>
                                        ))}
                                </div>
                            </section>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6">
                <LocalPlayer video_id="1a5nyrMtRsk" />
            </div>
        </div>
    )
}