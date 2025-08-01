import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { useState } from "react"
import { Input } from "./ui/input"
import { toast } from "sonner"

const MessageForm = () => {

    const [message, setMessage] = useState<string>("")
    const [delay, setDelay] = useState<number>(0)
    const [isSending, setIsSending] = useState<boolean>(false)
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null)
    const [sentMessage, setSentMessage] = useState<string>("")

    const handleSend = () => {
        setIsSending(true)
        const id = setTimeout(() => {
            setSentMessage(message)
            toast.success(`Message sent`, {
                duration: 3000,
                position: "top-right",
            })
            setMessage("")
            setIsSending(false)
        }, delay * 1000)
        setTimerId(id)
    }

    const handleCancel = () => {
        if (timerId) {
            clearTimeout(timerId)
            setIsSending(false)
        }
    }



  return (
    <div className='max-w-md mx-auto p-4 mt-40 bg-white border-2 shadow-md rounded-lg '>
        <h2 className='text-2xl text-center p-4 font-bold'>DM Delay Button</h2>
        <Textarea
          placeholder='Type your message here...'
          className='w-full h-32 mb-4'
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <Input
          type='text'
          placeholder='Enter delay in seconds'
          className='w-full mb-4'
          onChange={(e) => setDelay(Number(e.target.value))}
          value={delay}
          disabled={isSending}
        />
        {!isSending ? 
        <Button className="w-full" onClick={handleSend}>
          Send Message with Delay
        </Button>
        :
        <Button className="w-full" variant="destructive" onClick={handleCancel}>
          Cancel Sending...
        </Button>
        }   

        {sentMessage && (
          <div className='mt-4 p-2 bg-green-100 text-green-800 rounded'>
            <p>Message Sent: {sentMessage}</p>
          </div>
        )}
    </div>
  )
}

export default MessageForm