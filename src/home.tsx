import { useEffect, useState } from "react";
import { type Genres } from "./models/song";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Link } from "react-router-dom";
import { getCacheGenres } from "./models/cache";
import { Spinner } from "./components/ui/spinner";

export default function HomePage() {
    const [genres, setGenres] = useState<Genres[]>([]);

    useEffect(() => {
        getCacheGenres().then(setGenres)
    }, []);

    return (
        <div className="mx-auto max-w-8xl p-6">
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
                {genres.length === 0 && (
                    <div className="flex justify-center py-10">
                    <Spinner className="size-4"/>
                    </div>
                )}
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {genres.map((g) => (
                            <Link key={g.id} to={`/genre/${g.id}`} className="rounded-lg glass card p-4 hover:shadow-md transition">
                                <h4 className="font-semibold">{g.name}</h4>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}