import GifGrid from '@/components/GifGrid'
import SearchBar from '@/components/SearchBar'
import { fetchGiphy } from '@/lib/fetchGiphy';
import React, { useEffect } from 'react'

const Home = () => {
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [gifs, setGifs] = React.useState([]);

  useEffect(() => {
    // This effect can be used to fetch initial data or perform side effects
    const fetchInitialData = async () => {
      const gif = await fetchGiphy(searchQuery);
      setGifs(gif);
    };
    fetchInitialData();
  }, [searchQuery]);

  return (
    <div className='mx-auto p-12 flex flex-col items-center justify-center min-h-screen '>
      <div className='flex flex-col items-center justify-center gap-4 p-4 border-2 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-bold'>Gif Quest</h2>
      <SearchBar onSearch={setSearchQuery} searchQuery={searchQuery}/>
      <GifGrid gifs={gifs}/>
      </div>
      
    </div>
  )
}

export default Home