import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <Input className="input mb-2 w-full" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <Input className="input mb-2 w-full" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleLogin} className="btn btn-primary w-full">Login</Button>
      <p className="mt-4 text-sm text-gray-600">Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register here</a>.</p>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
