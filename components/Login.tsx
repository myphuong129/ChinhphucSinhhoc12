
import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { DNAIcon, LockIcon, UserIcon, Loader } from './Icons';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(account, password);
      if (response.success) {
        onLogin(response.user);
      } else {
        setError(response.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto mt-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col md:flex-row border-purple-500/20 shadow-2xl shadow-purple-900/20">
        
        {/* Left Side: Biology Visuals */}
        <div className="md:w-1/2 relative min-h-[300px] overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1200" 
            alt="DNA Structure Biology 12"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-slate-900/90"></div>
          
          <div className="relative h-full p-10 flex flex-col justify-end z-10">
            <div className="bg-blue-500/20 backdrop-blur-md p-6 rounded-2xl border border-blue-400/30">
              <h3 className="text-2xl font-orbitron font-bold text-white mb-2 neon-text">CHINH PHỤC TƯƠNG LAI</h3>
              <p className="text-blue-200 text-sm leading-relaxed">
                Khám phá thế giới của các đại phân tử hữu cơ, cơ chế di truyền ở cấp độ phân tử và chinh phục các dạng bài tập DNA - ARN - Protein.
              </p>
            </div>
            
            <div className="mt-6 flex gap-2">
              <span className="h-1 w-12 bg-blue-500 rounded-full"></span>
              <span className="h-1 w-4 bg-blue-500/30 rounded-full"></span>
              <span className="h-1 w-4 bg-blue-500/30 rounded-full"></span>
            </div>
          </div>
          
          {/* Floating DNA decoration */}
          <div className="absolute top-10 right-10 animate-float opacity-40 pointer-events-none">
            <DNAIcon className="w-24 h-24 text-blue-400" />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-slate-900/40 relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] -mr-24 -mt-24"></div>
          
          <div className="mb-10 text-center md:text-left">
            <div className="inline-block md:hidden p-4 rounded-full bg-purple-600/20 mb-4 border border-purple-500/30">
              <DNAIcon className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2 tracking-tight">Gene Quest 12</h2>
            <p className="text-slate-300 text-sm font-medium uppercase tracking-widest fontSize-smaller">Chinh phục Sinh học phân tử – Ôn thi THPT Quốc gia</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Account</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="Nhập account của bạn..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockIcon className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs text-center font-bold animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-sm">Bắt đầu hành trình</span>
                  <div className="group-hover:translate-x-1 transition-transform bg-white/20 p-1 rounded-full">
                    <DNAIcon className="w-4 h-4" />
                  </div>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Phiên bản 2.0 • 2026 Biology Digital Quest</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
