export async function getLocation(searchQuery: string) {
    if (!searchQuery.trim()) throw new Error("Search query is empty");

    const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
            searchQuery
        )}.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0)
        return data;
    throw new Error("Location not found");
}