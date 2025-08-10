"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Eye, EyeOff, User, Lock } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      const { token, userId, username: name } = res.data;
      console.log("Login successful:", res.data);
      setAuth({ token, userId, username: name });
      router.push("/chat");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: { key: string; }) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center px-4">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* WhatsApp Logo */}
          <div className="w-24 h-24 bg-[#00a884] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <div className="text-4xl font-bold text-white">W</div>
          </div>
          
          <h1 className="text-3xl font-light text-[#e9edef] mb-2">
            Welcome back
          </h1>
          <p className="text-[#8696a0] text-sm">
            Sign in to continue to WhatsApp
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-[#202c33] rounded-lg p-6 shadow-lg">
          <div className="space-y-4">
            {/* Username Field */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <User className="w-5 h-5 text-[#8696a0]" />
              </div>
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg pl-12 pr-4 py-3 border border-[#3c4a56] focus:border-[#00a884] focus:outline-none transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock className="w-5 h-5 text-[#8696a0]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg pl-12 pr-12 py-3 border border-[#3c4a56] focus:border-[#00a884] focus:outline-none transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-[#8696a0] hover:text-[#e9edef] transition-colors" />
                ) : (
                  <Eye className="w-5 h-5 text-[#8696a0] hover:text-[#e9edef] transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mt-4 mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                rememberMe 
                  ? 'bg-[#00a884] border-[#00a884]' 
                  : 'border-[#8696a0] bg-transparent'
              }`}>
                {rememberMe && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-[#8696a0] text-sm">Remember me</span>
            </label>
            <a href="#" className="text-[#00a884] hover:text-[#00a884]/80 text-sm transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#00a884] hover:bg-[#00a884]/90 disabled:bg-[#8696a0] text-white font-medium py-3 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3c4a56]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#202c33] px-2 text-[#8696a0]">Or</span>
            </div>
          </div> */}

          {/* Alternative Login Options */}
          {/* <div className="space-y-3">
            <button className="w-full bg-[#2a3942] hover:bg-[#3c4a56] text-[#e9edef] font-medium py-3 rounded-lg transition-colors border border-[#3c4a56] flex items-center justify-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-800">G</span>
              </div>
              Continue with Google
            </button>
          </div> */}

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-[#8696a0] text-sm">
              Don&apos;t have an account?{" "}
              <Link 
                href="/register" 
                className="text-[#00a884] hover:text-[#00a884]/80 font-medium transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-[#8696a0]">
          <p className="mb-2">
            Secure login powered by end-to-end encryption
          </p>
          <p>© {new Date().getFullYear()} WhatsApp Inc.</p>
        </div>
      </div>
    </div>
  );
}
