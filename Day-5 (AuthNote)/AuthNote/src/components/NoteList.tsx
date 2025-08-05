import React from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea';

interface Note {
  id: string;
  content: string;
}

const NoteList = () => {

    const [notes, setNotes] = React.useState<Note[]>([]);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'notes'), (snapshot) => {
            const notesData: Note[] = [];
            snapshot.forEach((doc) => {
                notesData.push({ id: doc.id, content: doc.data().content });
            });
            setNotes(notesData);
        });
        return () => unsubscribe();
    },[]);

  return (
    <div>
        <h2 className='text-xl font-semibold mb-4'>Your Notes</h2>
        <ul className='space-y-2'>
            {notes.map((note) => (
                <li key={note.id} className='flex justify-between items-center p-2 rounded gap-2'>
                    <Textarea
                    value={note.content}
                    onChange={(e) => {
                        const updatedNote = { ...note, content: e.target.value };
                        setNotes((prev) => prev.map(n => n.id === note.id ? updatedNote : n));
                    }}
                    
                    />
                    <Button variant='destructive' size='sm' onClick={async () => {
                        try {
                            await deleteDoc(doc(db, 'notes', note.id));
                            console.log('Note deleted successfully');
                        } catch (error) {
                            console.error('Error deleting note: ', error);
                            alert('Failed to delete note. Please try again.');
                        }
                    }}>Delete</Button>
                    <Button variant='outline' size='sm' onClick={
                        async () => {
                            try {
                                const noteRef = doc(db, 'notes', note.id);
                                await updateDoc(noteRef, { content: note.content });
                                console.log('Note updated successfully');
                            } catch (error) {
                                console.error('Error updating note: ', error);
                                alert('Failed to update note. Please try again.');
                            }
                        }
                    }>Edit</Button>
                </li>
            ))}
        </ul>
        {notes.length === 0 && <p className='text-gray-500'>No notes available. Start adding some!</p>}

    </div>
  )
}

export default NoteList