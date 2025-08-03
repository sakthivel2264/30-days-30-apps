import React from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

type TimechartProps = {
    data: { activity: string; hour: number; }[]
}

const Timechart = ({data}:TimechartProps) => {

    const chartData = {
        labels: data.map(item => item.activity),
        datasets: [{
            label: 'Hours Spent',
            data: data.map(item => item.hour),
            backgroundColor: data.map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`),
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 1,
        }],
    }
    if (data.length === 0) {
        return <div className='text-center'>No data available</div>
    }
    if (data.length > 0) {
        return (
            <div>
                <h2 className='font-bold text-2xl p-4'>TimeChart</h2>
                <Pie data={chartData} />
            </div>
        )
    }
}

export default Timechart