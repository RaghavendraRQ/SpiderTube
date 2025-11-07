import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { Song, SongType } from "../../models/song";
import SearchItem from "./SearchItem";
import { useSearchSuggestions } from "../../hooks/search";
import { useSongStore } from "@/store/song";

export default function SearchPage() {
    const [searchResult, setSearhResult] = useState<Song[] | null>();
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    // const [searchSuggestions, setSearchSuggestions] = useState<string[] | null>(null);
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
        if (searchTerm.length <= 2) {
            return;
        }
        try {
            const res = await invoke<Song[]>("search_result", { trackName: searchTerm, limit: 20 });
            console.log(res);
            setSearhResult(res);
        } catch (err) {
            console.log('err', err)
        }
    }

    const handleSongSelect = async (song: Song) => {
        setSelectedSong(song);
        console.log('selectedSong', selectedSong?.id);
        setCurrentSongId(song.id);
        // TODO: Add play logic or navigation here
    };

    return (
        <div>

        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input 
                    type="text"
                    placeholder="Search for the song"
                    value={searchTerm}
                    onChange={handleInputChange}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <button 
                    onClick={getSearchResult}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#0066cc',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                    >
                    Search
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            
            <div style={{ marginBottom: '20px' }}>
                {suggestions?.map((suggestion, index) => (
                    <div
                        onClick={() => {
                            setSearchTerm(suggestion);
                            setSuggestions([]);
                            getSearchResult();
                        }}
                        key={index}
                        style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer'
                        }}
                    >
                        {suggestion}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* Tracks Section */}
                {searchResult?.some(song => song.type === SongType.Track) && (
                    <div>
                        <h2 style={{ 
                            fontSize: '20px', 
                            fontWeight: '600', 
                            margin: '16px 0 12px',
                            color: '#2c3e50' 
                        }}>
                            Tracks
                        </h2>
                        <div>
                            {searchResult
                                .filter(song => song.type === SongType.Track)
                                .map((song) => (
                                    <SearchItem key={song.id} song={song} onSelect={handleSongSelect} />
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* Albums & Playlists Section */}
                {searchResult?.some(song => song.type === SongType.Album || song.type === SongType.Playlist) && (
                    <div>
                        <h2 style={{ 
                            fontSize: '20px', 
                            fontWeight: '600', 
                            margin: '16px 0 12px',
                            color: '#2c3e50' 
                        }}>
                            Albums & Playlists
                        </h2>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '16px'
                        }}>
                            {searchResult
                                .filter(song => song.type === SongType.Album || song.type === SongType.Playlist)
                                .map((song) => (
                                    <SearchItem key={song.id} song={song} onSelect={handleSongSelect} />
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* Artists Section */}
                {searchResult?.some(song => song.type === SongType.Artist) && (
                    <div>
                        <h2 style={{ 
                            fontSize: '20px', 
                            fontWeight: '600', 
                            margin: '16px 0 12px',
                            color: '#2c3e50' 
                        }}>
                            Artists
                        </h2>
                        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '4px 0' }}>
                            {searchResult
                                .filter(song => song.type === SongType.Artist)
                                .map((song) => (
                                    <div key={song.id} style={{ minWidth: '200px' }}>
                                        <SearchItem song={song} onSelect={handleSongSelect} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}


            </div>
        </div>
        </div>
    )
}