import React from 'react'
import { Input } from './ui/input'

type SearchBarProps = {
  searchQuery?: string;
  onSearch: (query: string) => void;
}

const SearchBar = ({searchQuery, onSearch}: SearchBarProps) => {

  return (
    <div className='flex items-center justify-center w-full'>
        <Input onChange={(e)=> onSearch(e.target.value)} value={searchQuery}/>
    </div>
  )
}

export default SearchBar