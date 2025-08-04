import Noteform from '@/components/Noteform'
import NoteList from '@/components/NoteList'
import React from 'react'

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center px-4 py-8 mx-auto border-2 rounded-lg shadow-lg bg-gray-100 space-y-4 w-2/3'>
      <h1 className='text-3xl font-bold'>Welcome to the Notes App</h1>
      <Noteform/>
      <div className='border-1 border-gray-300 p-4 rounded-lg bg-white shadow-sm w-full'>
        <p className='text-sm text-gray-600'>You can add, view, and manage your notes here.</p>
        <NoteList/>
      </div>
    </div>
  )
}

export default Home