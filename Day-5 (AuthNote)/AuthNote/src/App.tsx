import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/register" element={!user ?<Register/>: <Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
