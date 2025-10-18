import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Music, Play, Pause, Download, CheckCircle } from 'lucide-react';

type Song  = {
    id: string,
    title: string,
    artist: string,
    innertubeUrl: string,
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState<Array<Song>>([
    { id: 'song1', title: 'Sample Song 1', artist: 'Artist 1', innertubeUrl: 'https://example.com/song1.mp3' },
    { id: 'song2', title: 'Sample Song 2', artist: 'Artist 2', innertubeUrl: 'https://example.com/song2.mp3' },
  ]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cachedSongs, setCachedSongs] = useState(new Set());
  const [downloading, setDownloading] = useState(new Set());
  const audioRef = useRef(null);

  // Check which songs are cached on mount
  useEffect(() => {
    checkCachedSongs();
  }, []);

  const checkCachedSongs = async () => {
    const cached = new Set();
    for (const song of songs) {
      try {
        const isCached = await invoke('is_song_cached', { songId: song.id });
        if (isCached) {
          cached.add(song.id);
        }
      } catch (error) {
        console.error('Error checking cache:', error);
      }
    }
    setCachedSongs(cached);
  };

  const downloadSong = async (song: Song) => {
    setDownloading(prev => new Set(prev).add(song.id));
    
    try {
      await invoke('fetch_and_cache_song', {
        songId: song.id,
        innertubeUrl: song.innertubeUrl
      });
      
      setCachedSongs(prev => new Set(prev).add(song.id));
      alert(`${song.title} cached successfully!`);
    } catch (error) {
      console.error('Error downloading song:', error);
      alert(`Failed to cache ${song.title}: ${error}`);
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(song.id);
        return newSet;
      });
    }
  };

  const playSong = (song: Song) => {
    if (!cachedSongs.has(song.id)) {
      alert('Please download the song first!');
      return;
    }

    // Use custom protocol to stream the song
    const streamUrl = `stream://localhost/${song.id}`;
    
    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.play();
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Music className="w-10 h-10" />
          <h1 className="text-4xl font-bold">Music Streamer</h1>
        </div>

        {/* Current Playing */}
        {currentSong && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{currentSong.title}</h2>
                <p className="text-gray-300">{currentSong.artist}</p>
              </div>
              <button
                onClick={togglePlayPause}
                className="bg-purple-600 hover:bg-purple-700 rounded-full p-4 transition-colors"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
            </div>
          </div>
        )}

        {/* Song List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-4">Available Songs</h2>
          {songs.map(song => {
            const isCached = cachedSongs.has(song.id);
            const isDownloading = downloading.has(song.id);
            const isCurrentSong = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border transition-all ${
                  isCurrentSong 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{song.title}</h3>
                    <p className="text-gray-400 text-sm">{song.artist}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCached ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <button
                          onClick={() => playSong(song)}
                          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Play
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => downloadSong(song)}
                        disabled={isDownloading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {isDownloading ? 'Downloading...' : 'Download'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Audio error:', e);
            alert('Error playing audio. Make sure the song is properly cached.');
          }}
        />

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-300">How it works:</h3>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Click "Download" to fetch and cache songs from InnerTube</li>
            <li>Once cached, click "Play" to stream using custom protocol</li>
            <li>Audio is served via stream://localhost/song_id</li>
            <li>Supports seeking thanks to range request handling</li>
          </ol>
        </div>
      </div>
    </div>
  );
}