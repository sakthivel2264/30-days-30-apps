import Noteform from "@/components/Noteform";
import NoteList from "@/components/NoteList";
import { auth } from "@/lib/firebase";

export default function Dashboard() {
  const user = auth.currentUser;

  return (
    <div className="p-4 gap-2 flex flex-col justify-center">
      <p className="mt-2">Welcome, {user?.email} 👋</p>
       <h1 className='text-3xl font-bold'>Notes App</h1>
      <Noteform/>
      <div className='border-1 border-gray-300 p-4 rounded-lg bg-white shadow-sm w-full'>
        <p className='text-sm text-gray-600'>You can add, view, and manage your notes here.</p>
        <NoteList/>
        </div>
    </div>
  );
}
