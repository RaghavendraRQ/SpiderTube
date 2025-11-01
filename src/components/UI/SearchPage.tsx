import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { Song } from "../../models/song";
import SearchItem from "./SearchItem";
import MediaPlayer from "../MediaPlayer";
import { checkCacheDirectory } from "../../models/cache";
import LocalPlayer from "../LocalPlayer";

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResult, setSearhResult] = useState<Song[] | null>();
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [isCached, setIsCached] = useState<boolean>(false);
    const [searchSuggestions, setSearchSuggestions] = useState<string[] | null>(null);

    async function getSearchResult() {
        if (searchTerm.length <= 2) {
            return;
        }
        try {
            const res = await invoke<Song[]>("search_result", { trackName: searchTerm });
            console.log(res);
            setSearhResult(res);
        } catch (err) {
            console.log('err', err)
        }
    }

    async function getSearchSuggestions(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(e.target.value);
        if (e.target.value.length <= 2) {
            return;
        }
        try {
            const res = await invoke<string[]>("get_search_suggestions", { searchBuffer: e.target.value });
            setSearchSuggestions(res);
        } catch (err) {
            console.log('err', err)
        }
        
    }

    const handleSongSelect = async (song: Song) => {
        setSelectedSong(song);
        setIsCached(await checkCacheDirectory(song.id));
        console.log('selectedSong', selectedSong?.id);
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
                    onChange={(e) => getSearchSuggestions(e)}
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
            
            <div style={{ marginBottom: '20px' }}>
                {searchSuggestions?.map((suggestion, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setSearchTerm(suggestion);
                            setSearchSuggestions(null);
                        }}
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

            <div>
                {searchResult?.map((song) => (
                    <SearchItem 
                    key={song.id} 
                    song={song} 
                    onSelect={handleSongSelect}
                    />
                ))}
            </div>
        </div>
             {selectedSong && (
                isCached ? (
                    <LocalPlayer video_id={selectedSong.id}/>
                ) : (
                    <MediaPlayer video_id={selectedSong.id} />
                )
             )}
        </div>
    )
}