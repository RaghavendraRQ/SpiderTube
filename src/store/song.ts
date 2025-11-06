import { create } from "zustand";

interface SongState {
    currentSongId: string | null;
    setCurrentSongId: (id: string | null) => void;
}

export const useSongStore = create<SongState>((set) => ({
    currentSongId: null,
    setCurrentSongId: (id) => set({ currentSongId: id }),
}));