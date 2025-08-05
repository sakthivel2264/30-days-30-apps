import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function Navbar() {
  const user = auth.currentUser;

  return (
    <nav className="p-4 flex justify-between bg-gray-100">
      <div className="font-bold">AuthNote</div>
      <div className="space-x-4">
        {user ? (
          <>
            <Button onClick={() => signOut(auth)} >Logout</Button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
