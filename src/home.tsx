import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { type Genres } from "./models/song";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
    const [genres, setGenres] = useState<Genres[]>([]);

    useEffect(() => {
        async function fetchGenres() {
            try {
                const result = await invoke<Genres[]>("get_genres");
                setGenres(result);
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        }

        fetchGenres();
    }, []);

    return (
        <div className="mx-auto max-w-5xl p-6">
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Discover music</CardTitle>
                        <CardDescription>Explore genres curated from multiple sources.</CardDescription>
                    </div>
                    <div>
                        <Button asChild>
                            <Link to="/search">Search music</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {genres.map((g) => (
                            <div key={g.id} className="rounded-lg bg-white p-4 shadow-sm border">
                                <h4 className="font-semibold">{g.name}</h4>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}