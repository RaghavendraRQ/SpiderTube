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

    const getTypeColor = () => {
        switch (song.type) {
            case SongType.Playlist:
                return '#2ecc71';
            case SongType.Album:
                return '#9b59b6';
            case SongType.Artist:
                return '#e74c3c';
            case SongType.User:
                return '#3498db';
            case SongType.Track:
                return '#7f8c8d';
        }
    };

    return (
        <div 
            className="search-item"
            onClick={() => onSelect?.(song)}
            style={{
                padding: '12px',
                margin: '8px 0',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                backgroundColor: '#fff',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
        >
            <div style={{ position: 'relative', flexShrink: 0 }}>
                {song.thumbnail && song.thumbnail[0] ? (
                    <img 
                        src={song.thumbnail[0].url} 
                        alt="to be implemented"
                        style={{
                            width: song.type === SongType.Artist ? '80px' : '120px',
                            height: song.type === SongType.Artist ? '80px' : '68px',
                            objectFit: 'cover',
                            borderRadius: song.type === SongType.Artist ? '50%' : '4px'
                        }}
                    />
                ) : (
                    <div style={{
                        width: song.type === SongType.Artist ? '80px' : '120px',
                        height: song.type === SongType.Artist ? '80px' : '68px',
                        backgroundColor: getTypeColor(),
                        borderRadius: song.type === SongType.Artist ? '50%' : '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                    }}>
                        {getTypeIcon()}
                    </div>
                )}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: getTypeColor(),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                }}>
                    {song.type}
                </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: song.type === SongType.Track ? '16px' : '18px',
                    fontWeight: song.type === SongType.Track ? '400' : '600',
                    color: '#2c3e50',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {song.name}
                </h3>
                {song.type !== SongType.Track && (
                    <p style={{ 
                        margin: '0',
                        fontSize: '14px',
                        color: '#7f8c8d'
                    }}>
                        {song.type === SongType.Playlist ? 'Playlist' : 
                         song.type === SongType.Album ? 'Album' : 
                         song.type === SongType.Artist ? 'Artist' : 'User'}
                    </p>
                )}
            </div>
        </div>
    );
}
