import React from 'react'

type Gif = {
  id: string;
  url: string;
  title: string;
  images: {
    fixed_height: {
        url: string;    
    }
 }
};

type GifGridProps = {
  gifs: Gif[];
}

const GifGrid = ({gifs}:GifGridProps) => {
    console.log(gifs);

  return (
    <div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>   
            {gifs.map((gif) => (
                <div key={gif.id} className='border rounded-lg p-2 shadow-md'>
                    <img src={gif.images.fixed_height.url} alt={gif.title} className='w-full h-auto rounded-lg' 
                    referrerPolicy="no-referrer"/>
                    <p className='text-center mt-2'>{gif.title}</p>
                </div>
            ))}
        </div>
        {gifs.length === 0 && <p className='text-center mt-4'>No GIFs found. Try searching for something else!</p>}
    </div>
  )
}

export default GifGrid