import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mulLogo from '../../assets/MUL-Logo.png';
import mulBg from './assets/mul-bg.png';

const MULClone = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage({ type: 'error', text: 'Please enter both your Registration Number and password.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const trimmedUser = username.trim();
      const response = await axios.post('/api/auth/login', {
        registrationNumber: trimmedUser,
        registeration_number: trimmedUser,
        identifier: trimmedUser,
        password,
        isCMS: true,
      });

      // Extra client-side guard for CMS access
      if (response.data?.role && !["student", "student_mod"].includes(response.data.role)) {
        setMessage({
          type: 'error',
          text: 'Access restricted: Only Minhaj University students can sign in to the CMS Portal.'
        });
        setLoading(false);
        return;
      }

      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data));
      
      setMessage({ type: 'info', text: 'Login successful. Redirecting...' });
      
      setTimeout(() => {
        navigate('/mul-dashboard');
      }, 500);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Login failed. Please check your credentials.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setMessage({ type: 'info', text: 'Forgot Password clicked. Reset instructions would be sent here.' });
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-end relative bg-cover bg-center bg-no-repeat font-sans overflow-x-hidden p-3 pb-5 sm:pb-8"
      style={{ backgroundImage: `url(${mulBg})` }}>
      {/* <div className="absolute inset-0 bg-black/15 z-10"></div> */}

      {/* Main Wrapper */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-[320px] mx-auto box-border transition-all">
        {/* Main Card */}
        <div className="w-full bg-white rounded shadow-2xl overflow-hidden border border-gray-100/80">
          {/* Top Light Gray Header */}
          <div className="bg-[#f4f4f4] pt-4 pb-3 px-4 flex flex-col items-center justify-center border-b border-gray-200">
            <img
              src={mulLogo}
              alt="Minhaj University Lahore Logo"
              className="w-[50px] h-[50px] object-contain mb-1.5"
            />
            <h1 className="text-sm font-bold text-[#333333] text-center tracking-wide">
              Campus Management System
            </h1>
          </div>

          {/* White Form Body */}
          <div className="bg-white p-4">
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              {/* Registration Number Field */}
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-xs font-semibold text-[#555555]">
                  Registration Number
                </label>
                <input
                  id="username"
                  type="text"
                  className="w-full px-2.5 py-1.5 text-xs text-[#333333] bg-white border border-[#d9d9d9] rounded-[3px] outline-none focus:border-[#66afff] focus:ring-1 focus:ring-[#66afff]/50 transition-all placeholder:text-[#aaaaaa] placeholder:text-xs"
                  placeholder="e.g. 2022f-mulbscs-093"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-xs font-semibold text-[#555555]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-2.5 py-1.5 text-xs text-[#333333] bg-white border border-[#d9d9d9] rounded-[3px] outline-none focus:border-[#66afff] focus:ring-1 focus:ring-[#66afff]/50 transition-all placeholder:text-[#aaaaaa] placeholder:text-xs"
                  placeholder="your login password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {/* Responsive Action Buttons Row */}
              <div className="flex items-center gap-2 mt-1 flex-row w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-3.5 py-1.5 bg-[#5cb85c] text-white text-xs font-semibold rounded-[3px] transition-colors shadow-sm text-center whitespace-nowrap ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#4cae4c] active:translate-y-[1px]'}`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="px-3.5 py-1.5 bg-[#f0ad4e] hover:bg-[#eea236] text-white text-xs font-semibold rounded-[3px] transition-colors shadow-sm active:translate-y-[1px] text-center whitespace-nowrap"
                >
                  Forgot Password
                </button>
              </div>

              {/* Status Alert Notification */}
              {message && (
                <div
                  className={`p-2 rounded-[3px] text-[11px] sm:text-xs mt-1 ${message.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                >
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer outside Card */}
        <div className="mt-3 sm:mt-5 text-center flex flex-col gap-0.5 z-20 px-2">
          <p className="text-[10px] xs:text-xs sm:text-sm text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            © 2026 - All Rights Reserved.
          </p>
          <p className="text-[10px] xs:text-xs sm:text-sm text-white font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Powered by: Minhaj University Lahore v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default MULClone;
