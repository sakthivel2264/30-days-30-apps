import Moodinput from '@/components/Moodinput'
import Moodoutput from '@/components/Moodoutput';
import React from 'react'

const Home = () => {
    const [mood, setMood] = React.useState('');
    const [subject, setSubject] = React.useState('');
    const [footer, setFooter] = React.useState('');
    const [generator, setGenerator] = React.useState(false);

    const handleGenerate = () => {
        const lowerMood = mood.toLowerCase();
        if (lowerMood.includes('happy')) {
            setSubject(`Your Happy MoodMail  (${new Date().toLocaleDateString()})`);
            setFooter('Stay positive and keep smiling!');
            setGenerator(true);
        }
        else if (lowerMood.includes('sad')) {
            setSubject(`Your Sad MoodMail (${new Date().toLocaleDateString()})`);
            setFooter('It\'s okay to feel sad sometimes. Take care of yourself.');
            setGenerator(true);
        }
        else if (lowerMood.includes('angry')) {
            setSubject(`Your Angry MoodMail (${new Date().toLocaleDateString()})`);
            setFooter('Take a deep breath and let it go. Anger is temporary.');
            setGenerator(true);
        }
        else if (lowerMood.includes('excited')) {
            setSubject(`Your Excited MoodMail (${new Date().toLocaleDateString()})`);
            setFooter('Channel that excitement into something productive!');
            setGenerator(true);
        }
        else if (lowerMood.includes('nervous')) {
            setSubject(`Your Nervous MoodMail (${new Date().toLocaleDateString()})`);
            setFooter('It\'s normal to feel nervous. You got this!');
            setGenerator(true);
        }
    }
    const handleReset = () => {
        setMood('');
        setSubject('');
        setFooter('');
        setGenerator(false);
    }

  return (
    <div className='max-w-xl mx-auto p-4 mt-20 border-2 rounded-lg shadow-lg text-center'>
        <h2 className='text-2xl font-bold'>MoodMail Generator</h2>
        <Moodinput mood={mood} setMood={setMood} onGenerate={handleGenerate} disabled={generator}/>
        <Moodoutput subject={subject} footer={footer} onReset={handleReset}/>
    </div>
  )
}

export default Home