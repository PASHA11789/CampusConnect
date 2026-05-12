import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full font-sans bg-white overflow-x-hidden">

            <div className="flex flex-col md:flex-row w-full min-h-screen relative group">

                {/* Left Side: Image & Description */}
                <div className="relative w-full md:w-[60%] lg:w-[70%] overflow-hidden min-h-[40vh] md:min-h-screen bg-[#0D2A42] flex items-center justify-center">
                    <div
                        className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D2A42] via-[#0D2A42]/60 to-[#0D2A42]/10 transition-opacity duration-500"></div>

                    {/* Text Content */}
                    <div className="relative h-full flex flex-col justify-center p-8 sm:p-12 lg:p-24 text-white z-10 animate-fade-in-delayed">
                        <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl mb-6 sm:mb-8 w-max border border-white/20">
                            <span className="text-lg sm:text-xl">🎓</span>
                            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Minhaj University X CampusConnect</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-lg text-left">
                            Your Campus, <span className="text-teal-400">Your Community.</span>
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed font-medium opacity-90 drop-shadow max-w-lg text-left">
                            Join thousands of students at Minhaj University to discuss ideas, find study partners, and stay updated with campus life.
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-[40%] lg:w-[30%] p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50 relative z-20 border-l border-gray-100">

                    <div className="w-full max-w-sm mx-auto animate-fade-in-delayed text-left">
                        <div className="mb-8 sm:mb-10">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D2A42] mb-2 sm:mb-3 tracking-tight">Welcome Back</h2>
                            <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">Sign in to your university account.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border-l-4 border-red-500 animate-pulse">
                                    {error}
                                </div>
                            )}

                            {/* Email Input */}
                            <div className="relative group">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-white border-2 border-slate-100 rounded-2xl text-[#0D2A42] font-bold text-sm shadow-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all duration-300 peer placeholder-transparent"
                                    placeholder="Email"
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-5 sm:left-6 top-3 sm:top-4 text-slate-400 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-all duration-300 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-[10px] peer-focus:text-teal-600 peer-focus:bg-white peer-focus:px-2 peer-valid:-top-2.5 peer-valid:left-4 peer-valid:text-[10px] peer-valid:bg-white peer-valid:px-2 pointer-events-none rounded-full"
                                >
                                    University Email
                                </label>
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-white border-2 border-slate-100 rounded-2xl text-[#0D2A42] font-bold text-sm shadow-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all duration-300 peer placeholder-transparent"
                                    placeholder="Password"
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-5 sm:left-6 top-3 sm:top-4 text-slate-400 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-all duration-300 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-[10px] peer-focus:text-teal-600 peer-focus:bg-white peer-focus:px-2 peer-valid:-top-2.5 peer-valid:left-4 peer-valid:text-[10px] peer-valid:bg-white peer-valid:px-2 pointer-events-none rounded-full"
                                >
                                    Password
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-[#0D2A42] text-white rounded-xl font-bold tracking-wide shadow-[0_10px_20px_-10px_rgba(13,42,66,0.6)] transition-all duration-300 hover:shadow-[0_15px_25px_-10px_rgba(0,140,158,0.7)] hover:-translate-y-1 hover:bg-[#008C9E] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden relative"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-white/20 hidden group-hover:block animate-shimmer"></div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
