
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type MoodinputProps = {
    mood: string;
    setMood: (mood: string) => void;
    onGenerate: () => void;
    disabled?: boolean;
}

const Moodinput = ({mood, setMood, onGenerate, disabled}: MoodinputProps) => {
  return (
    <div>
        <h2 className='text-2xl font-bold mb-4'>Enter Your Mood</h2>
        <Input placeholder="How are you feeling today?(happy, sad, angry, nervous, excited)" className="mb-4" value={mood} onChange={(e)=>setMood(e.target.value)} disabled={disabled}/>
        <Button className="w-full" onClick={onGenerate}>Generate MoodMail</Button>
        <p className='mt-4 text-sm text-gray-500'>Click the button to generate your personalized MoodMail based on your mood.</p>
    </div>
  )
}

export default Moodinput