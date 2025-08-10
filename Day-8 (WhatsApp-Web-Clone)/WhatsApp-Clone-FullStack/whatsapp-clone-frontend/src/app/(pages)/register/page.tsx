"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

const Page = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    
    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            alert("Please fill in all fields");
            return;
        }
        
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post("/auth/register", { username, email, password, confirmPassword });
            const { token, userId, username: name } = res.data;
            console.log("Registration successful:", res.data);
            setAuth({ token, userId, username: name });
            router.push("/");
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111b21] flex items-center justify-center px-4">
            {/* Main Container */}
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    {/* WhatsApp Logo */}
                    <div className="w-20 h-20 bg-[#00a884] rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-white">W</div>
                    </div>
                    
                    <h1 className="text-3xl font-light text-[#e9edef] mb-2">
                        Welcome to WhatsApp
                    </h1>
                    <p className="text-[#8696a0] text-sm">
                        Create your account to get started
                    </p>
                </div>

                {/* Registration Form */}
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
                            />
                        </div>

                        {/* Email Field */}
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Mail className="w-5 h-5 text-[#8696a0]" />
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg pl-12 pr-4 py-3 border border-[#3c4a56] focus:border-[#00a884] focus:outline-none transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 text-[#8696a0] hover:text-[#e9edef]" />
                                ) : (
                                    <Eye className="w-5 h-5 text-[#8696a0] hover:text-[#e9edef]" />
                                )}
                            </button>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Lock className="w-5 h-5 text-[#8696a0]" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                className="w-full bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg pl-12 pr-12 py-3 border border-[#3c4a56] focus:border-[#00a884] focus:outline-none transition-colors"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5 text-[#8696a0] hover:text-[#e9edef]" />
                                ) : (
                                    <Eye className="w-5 h-5 text-[#8696a0] hover:text-[#e9edef]" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Register Button */}
                    <button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="w-full mt-6 bg-[#00a884] hover:bg-[#00a884]/90 disabled:bg-[#8696a0] text-white font-medium py-3 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Account...
                            </div>
                        ) : (
                            "Create Account"
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#3c4a56]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#202c33] px-2 text-[#8696a0]">Or</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-[#8696a0] text-sm">
                            Already have an account?{" "}
                            <Link 
                                href="/" 
                                className="text-[#00a884] hover:text-[#00a884]/80 font-medium transition-colors"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-xs text-[#8696a0]">
                    <p className="mb-2">
                        By creating an account, you agree to our{" "}
                        <a href="#" className="text-[#00a884] hover:underline">Terms of Service</a>{" "}
                        and{" "}
                        <a href="#" className="text-[#00a884] hover:underline">Privacy Policy</a>
                    </p>
                    <p>© 2024 WhatsApp Inc.</p>
                </div>
            </div>
        </div>
    );
};

export default Page;
