import { create } from "zustand";

interface SongState {
    currentSongId: string | null;
    setCurrentSongId: (id: string | null) => void;
}

interface QueueState {
    songQueue: string[];
    getNextSongId: () => string | null;
    setSongQueue: (queue: string[]) => void;
    clearQueue: () => void;
}

export const useSongStore = create<SongState>((set) => ({
    currentSongId: null,
    setCurrentSongId: (id) => set({ currentSongId: id }),
}));

export const useQueueStore = create<QueueState>((set) => ({
    songQueue: [],
    getNextSongId: () => {
        let nextId: string | null = null;
        set((state) => {
            if (state.songQueue.length > 0) {
                nextId = state.songQueue[0];
                return { songQueue: state.songQueue.slice(1) };
            }
            return state;
        });
        return nextId;
    },
    setSongQueue: (queue) => set({ songQueue: queue }),
    clearQueue: () => set({ songQueue: [] }),
}));