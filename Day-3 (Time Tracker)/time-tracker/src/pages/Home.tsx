import Timechart from '@/components/Timechart'
import Timeform from '@/components/Timeform'
import { Timer } from 'lucide-react'
import React from 'react'

const Home = () => {
    const [data, setData] = React.useState<{activity: string; hour:number;} []>([])

    const handleAddActivity = (activity: string, hour: number) => {
        setData([...data, { activity, hour }])
    }

  return (
    <div className='max-w-xl mx-auto p-4 mt-20 border-2 rounded-lg shadow-lg text-center'>
        <h2 className='flex text-2xl font-bold justify-center items-center'><Timer/> Time Tracker</h2>
        <Timeform onAddActivity={handleAddActivity}/>
        <Timechart data={data}/>
    </div>
  )
}

export default Home