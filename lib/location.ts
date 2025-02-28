export async function getGeoDataExternal() {
    const response = await fetch(`https://api.maptiler.com/geolocation/ip.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`);
    const data = await response.json();
    return { latitude: data.latitude, longitude: data.longitude };
}