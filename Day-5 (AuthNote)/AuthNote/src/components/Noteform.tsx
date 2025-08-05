import React from 'react'
import { Button } from './ui/button'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Textarea } from './ui/textarea'

const Noteform = () => {

    const [note, setNote] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async () => {
        if (note.trim() === '') {
            alert('Please enter a note');
            return;
        }
        setLoading(true);
        try {
            const docRef = await addDoc(collection(db, 'notes'), {
                content: note,
                createdAt: serverTimestamp(),
            });
            console.log('Document written with ID: ', docRef.id);
            setNote('');
        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Failed to save note. Please try again.');
        }finally {
            setLoading(false);
        }
    }

  return (
    <div className='space-y-4 w-full flex flex-row gap-2'>
        <Textarea
        placeholder='Enter your note here...'
        maxLength={200}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={loading}>Save Note</Button>
    </div>
  )
}

export default Noteform