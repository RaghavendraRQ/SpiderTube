import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useSearchSuggestions(debounceMs: number = 300) {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    async function fetchSuggestions(term: string) {
        try {
            setLoading(true);
            setError(null);
            const res = await invoke<string[]>("get_search_suggestions", { searchBuffer: term });
            setSuggestions(res);
        } catch (err: any) {
            console.error("get_search_suggestions failed:", err);
            setError(err?.message || "Failed to fetch suggestions");
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setSearchTerm(value);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (value.length <= 2) {
            setSuggestions([]);
            return;
        }

        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, debounceMs);
    }

    return {
        searchTerm,
        suggestions,
        loading,
        error,
        handleInputChange,
        setSearchTerm,
        setSuggestions
    };
}
