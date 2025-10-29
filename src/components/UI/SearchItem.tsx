import { Song } from "../../models/song";

interface SearchItemProps {
    song: Song;
    onSelect?: (song: Song) => void;
}

export default function SearchItem({ song, onSelect }: SearchItemProps) {
    return (
        <div 
            className="search-item"
            onClick={() => onSelect?.(song)}
            style={{
                padding: '12px',
                margin: '8px 0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}
        >
            {song.thumbnail && song.thumbnail[0] && (
                <img 
                    src={song.thumbnail[0].url} 
                    alt={song.name}
                    style={{
                        width: '120px',
                        height: '68px',
                        objectFit: 'cover',
                        borderRadius: '2px'
                    }}
                />
            )}
            <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{song.name}</h3>
            </div>
        </div>
    );
}
