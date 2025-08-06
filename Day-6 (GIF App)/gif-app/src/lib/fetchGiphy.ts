
export const fetchGiphy = async (query: string) => {
  const apiKey = import.meta.env.VITE_GIPHY_APIKEY;
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=12&offset=0&rating=g&lang=en`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data; // Return the array of GIFs
    }
    catch (error) {
        console.error('Fetch error:', error);
        return []; // Return an empty array in case of error
    }
};