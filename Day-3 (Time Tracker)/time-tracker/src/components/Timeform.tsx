import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

type TimeformProps = {
    onAddActivity: (activities: string, hours: number) => void;
}

const Timeform = ({ onAddActivity }: TimeformProps) => {
    const [activity, setActivity] = React.useState('')
    const [hour, setHour] = React.useState('')

    const handleSet = () => {

        console.log(`Activity: ${activity}, Hour: ${hour}`);
        if (activity && hour) {
            onAddActivity(activity, parseInt(hour));
            setActivity('');
            setHour('');
        }
    }

  return (
    <div className='flex flex-col items-center justify-center p-4 gap-2'>
        <Input placeholder='Activity (e.g Read Book, Sleep, Write,etc)' value={activity} onChange={(e) => setActivity(e.target.value)}/>
        <Input placeholder='Set Hour (e.g 8,2,etc)' value={hour} onChange={(e) => setHour(e.target.value)} type='number'/>
        <Button className='mt-4' onClick={handleSet}>Add Activity</Button>
    </div>
  )
}

export default Timeform