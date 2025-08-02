import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Clipboard } from 'lucide-react';

type MoodoutputProps = {
    subject: string;
    footer: string;
    onReset: () => void;
}

const Moodoutput = ({subject, footer, onReset}:MoodoutputProps) => {
    
    const handleCopy = () => {
        navigator.clipboard.writeText(`Subject: ${subject}\nFooter: ${footer}`);
        alert('MoodMail copied to clipboard!');
    }

  return (
    <div>
        <div className='items-center justify-center flex flex-col '>
            <label className='text-lg font-semibold'>Generated MoodMail</label>
            <Input placeholder="Subject" className="mt-2 mb-4" readOnly value={subject} />
            <Input placeholder="Footer" className="mb-4" readOnly value={footer}/>
            <div className='flex gap-2 cursor-pointer border-2 rounded-lg px-4 justify-center font-bold w-sm'  onClick={handleCopy}>Copy Subject and Footer<Clipboard/></div>
        </div>
        <Button className="w-full mt-4" variant={"outline"} onClick={onReset}>
            Reset
        </Button>
    </div>
  )
}

export default Moodoutput