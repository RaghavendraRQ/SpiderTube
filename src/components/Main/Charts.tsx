import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";


export default function ChartsPage() {
    
    useEffect(() => {
        async function fetchCharts() {
            try {
                const res = await invoke<any>("get_charts");
                console.log('Charts data:', res);
            } catch (e) {
                console.error("Failed to fetch charts", e);
            }
        }
        fetchCharts();
    }, []);

    return (
        <div>
            Charts Page
        </div>
    )
}