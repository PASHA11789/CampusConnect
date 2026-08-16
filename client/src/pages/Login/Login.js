import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setupPushNotifications } from '../../utils/pushNotificationSetup';
import bgImage from '../../assets/ibn_e_khaldun.jpg';


const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const startTime = performance.now();

        try {
            const trimmedIdentifier = identifier.trim();
            const response = await axios.post('/api/auth/login', {
                registrationNumber: trimmedIdentifier,
                registeration_number: trimmedIdentifier,
                identifier: trimmedIdentifier,
                password,
            }, { timeout: 8000 });

            const totalDuration = (performance.now() - startTime).toFixed(1);
            console.log(`⏱ [Client Performance] Sign-in request answered in ${totalDuration} ms (< 3000ms target)`);

            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data));
            // Trigger push notification setup immediately after login
            // so the browser permission prompt appears while the user is active
            setupPushNotifications();
            if (response.data.role === 'alumni') {
                navigate('/career');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full w-full font-sans bg-white overflow-y-auto overflow-x-hidden">

            <div className="flex flex-col md:flex-row w-full min-h-screen relative group">

                {/* Left Side: Image & Description */}
                <div className="relative w-full md:w-[60%] lg:w-[70%] overflow-hidden min-h-[40vh] md:min-h-screen bg-[#0D2A42] flex items-center justify-center">
                    <div
                        className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D2A42] via-[#0D2A42]/60 to-[#0D2A42]/10 transition-opacity duration-500"></div>

                    {/* Text Content */}
                    <div className="relative h-full flex flex-col justify-center p-8 sm:p-12 lg:p-24 text-white z-10 animate-fade-in-delayed">
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

                            {/* Registration Number Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    id="identifier"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                    className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white border-2 border-slate-100 rounded-2xl text-[#0D2A42] font-bold text-sm shadow-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all duration-300 peer placeholder-transparent"
                                    placeholder="Registration Number"
                                    autoComplete="username"
                                />
                                <label
                                    htmlFor="identifier"
                                    className={`absolute left-4 bg-white px-2 font-bold tracking-wider uppercase transition-all duration-200 pointer-events-none rounded-full ${
                                        identifier
                                            ? '-top-2.5 text-[10px] text-teal-600'
                                            : 'top-3.5 sm:top-4 text-[11px] text-slate-400'
                                    } peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-teal-600`}
                                >
                                    Registration Number
                                </label>
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white border-2 border-slate-100 rounded-2xl text-[#0D2A42] font-bold text-sm shadow-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all duration-300 peer placeholder-transparent"
                                    placeholder="Password"
                                />
                                <label
                                    htmlFor="password"
                                    className={`absolute left-4 bg-white px-2 font-bold tracking-wider uppercase transition-all duration-200 pointer-events-none rounded-full ${
                                        password
                                            ? '-top-2.5 text-[10px] text-teal-600'
                                            : 'top-3.5 sm:top-4 text-[11px] text-slate-400'
                                    } peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-teal-600`}
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
                                            <i className="fa-solid fa-circle-notch fa-spin text-base text-white" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <i className="fa-solid fa-arrow-right text-xs transform transition-transform duration-300 group-hover:translate-x-1" />
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
