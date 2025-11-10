import { Song, SongType } from "../../models/song";

interface SearchItemProps {
    song: Song;
    onSelect?: (song: Song) => void;
}

export default function SearchItem({ song, onSelect }: SearchItemProps) {
    const getTypeIcon = () => {
        switch (song.type) {
            case SongType.Playlist:
                return '📑';
            case SongType.Album:
                return '💿';
            case SongType.Artist:
                return '🎤';
            case SongType.User:
                return '👤';
            case SongType.Track:
                return '🎵';
        }
    };

    // color tokens removed; UI uses theme variables instead

    return (
        <div onClick={() => onSelect?.(song)} className="glass rounded-lg p-3 flex items-center gap-4 cursor-pointer hover:opacity-95 transition">
            <div className="relative shrink-0">
                {song.thumbnail && song.thumbnail[0] ? (
                    <img src={song.thumbnail[0].url} alt={song.name} className={`object-cover ${song.type === SongType.Artist ? 'w-20 h-20 rounded-full' : 'w-28 h-16 rounded-md'}`} />
                ) : (
                    <div className={`${song.type === SongType.Artist ? 'w-20 h-20 rounded-full' : 'w-28 h-16 rounded-md'} flex items-center justify-center`} style={{ background: "var(--color-accent)" }}>
                        <span className="text-xl">{getTypeIcon()}</span>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className={`${song.type === SongType.Track ? 'text-base font-normal' : 'text-lg font-semibold'} truncate`}>{song.name}</h3>
                {song.type !== SongType.Track && (
                    <p className="text-sm text-muted-foreground">{song.type === SongType.Playlist ? 'Playlist' : song.type === SongType.Album ? 'Album' : song.type === SongType.Artist ? 'Artist' : 'User'}</p>
                )}
            </div>
        </div>
    );
}
