
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, DNAIcon, HomeIcon, AlertIcon } from './Icons';
import confetti from 'canvas-confetti';

interface ReviewProps {
  result: any;
  onBack: () => void;
}

const Review: React.FC<ReviewProps> = ({ result, onBack }) => {
  const [showReview, setShowReview] = useState(false);
  const details = JSON.parse(result.answers || '[]');

  useEffect(() => {
    if (result.status === 'Pass') {
      const winAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
      winAudio.play().catch(() => {});

      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 1000 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 60 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      return () => clearInterval(interval);
    } else {
      const failAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/255/255-preview.mp3');
      failAudio.play().catch(() => {});
    }
  }, [result.status]);

  const getDirectDriveLink = (url: string) => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed.includes('drive.google.com') && !trimmed.includes('docs.google.com')) return trimmed;
    try {
      const idMatch = trimmed.match(/\/d\/([-\w]{25,})/) || 
                      trimmed.match(/[?&]id=([-\w]{25,})/) ||
                      trimmed.match(/\/file\/d\/([-\w]{25,})/);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
      }
    } catch (e) {}
    return trimmed;
  };

  const isImageUrl = (url: string) => {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim();
    return u.startsWith('http') && (
      u.includes('drive.google.com') || 
      u.includes('docs.google.com') ||
      u.includes('googleusercontent.com') ||
      u.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)
    );
  };

  const renderAnswerContent = (ans: any, type: string, options?: any) => {
    if (ans === undefined || ans === null || ans === '') return <span className="text-slate-500">Không trả lời</span>;

    // Nếu đáp án là A, B, C, D
    if (typeof ans === 'string' && /^[A-D]$/.test(ans) && options && options[ans]) {
      const content = options[ans];
      if (isImageUrl(content)) {
        return (
          <div className="mt-2">
            <span className="text-xs font-bold mr-2">{ans}:</span>
            <img 
              src={getDirectDriveLink(content)} 
              alt={ans} 
              className="max-h-32 rounded-lg border border-slate-700 inline-block bg-white/5"
              onError={(e) => { (e.target as any).style.display = 'none'; }}
            />
          </div>
        );
      }
      return <span>{ans}. {content}</span>;
    }

    // Nhiều đáp án
    if (Array.isArray(ans)) {
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {ans.map(key => (
            <div key={key} className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
              {options && options[key] && isImageUrl(options[key]) ? (
                <img 
                  src={getDirectDriveLink(options[key])} 
                  alt={key} 
                  className="h-10 rounded" 
                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                />
              ) : (
                <span>{key}. {options ? options[key] : ''}</span>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (type === 'True/False') {
      const v = String(ans).trim().toUpperCase();
      if (v === 'A' || v === 'TRUE' || v === 'ĐÚNG') return 'Đúng';
      if (v === 'B' || v === 'FALSE' || v === 'SAI') return 'Sai';
    }

    return <span>{ans}</span>;
  };

  if (!showReview) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center animate-in zoom-in-95 duration-500">
        <div className={`
          w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-8 border-4
          ${result.status === 'Pass' 
            ? 'bg-green-600/20 border-green-500 neon-border shadow-[0_0_50px_rgba(34,197,94,0.6)]' 
            : 'bg-red-600/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'}
          transition-all duration-1000 scale-110
        `}>
          {result.status === 'Pass' ? (
            <CheckCircleIcon className="w-20 h-20 text-green-500 animate-bounce" />
          ) : (
            <XCircleIcon className="w-20 h-20 text-red-500 animate-pulse" />
          )}
        </div>

        <h2 className={`text-5xl md:text-6xl font-orbitron font-bold mb-4 ${result.status === 'Pass' ? 'text-green-400 neon-text' : 'text-red-400'}`}>
          {result.status === 'Pass' ? 'CHÚC MỪNG!' : 'CHƯA ĐẠT'}
        </h2>
        
        <div className="flex items-center justify-center gap-3 mb-8 py-4 px-8 rounded-2xl max-w-fit mx-auto animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300 bg-white/5 border border-white/10 shadow-xl">
          <p className={`text-base font-bold uppercase tracking-tight ${result.status === 'Pass' ? 'text-green-400' : 'text-red-400'}`}>
            {result.status === 'Pass' 
              ? 'Chúc mừng! Bạn đã mở khóa bài tiếp theo' 
              : 'Bạn cần ôn tập lại để tiếp tục hành trình'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="glass-card p-6 rounded-2xl border-blue-500/20 group hover:border-blue-500/50 transition-all">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Điểm số đạt được</p>
            <p className="text-4xl font-orbitron font-bold text-white group-hover:text-blue-400 transition-colors">{result.score}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-purple-500/20 group hover:border-purple-500/50 transition-all">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Thời gian hoàn thành</p>
            <p className="text-4xl font-orbitron font-bold text-white group-hover:text-purple-400 transition-colors">{result.time_spent}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-widest transition-all border border-slate-700 hover:scale-105 active:scale-95"
          >
            <HomeIcon className="w-5 h-5" /> Về trang chủ
          </button>
          <button 
            onClick={() => setShowReview(true)}
            className="flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all neon-border hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20"
          >
            <DNAIcon className="w-5 h-5" /> Xem lại bài làm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-10 duration-500 pb-20">
      <div className="flex justify-between items-center mb-8 bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div>
          <h2 className="text-3xl font-orbitron font-bold text-white neon-text">BÁO CÁO CHI TIẾT</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Phân tích kết quả từng câu hỏi</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase text-xs transition-all border border-slate-700"
        >
          <HomeIcon className="w-4 h-4" /> Thoát
        </button>
      </div>

      <div className="space-y-6">
        {details.map((item: any, idx: number) => (
          <div 
            key={idx}
            className={`
              glass-card p-6 rounded-2xl border-l-8 transition-all overflow-hidden relative group
              ${item.isCorrect ? 'border-l-green-500 border-green-500/20' : 'border-l-red-500 border-red-500/20'}
            `}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${item.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                Câu {idx + 1}: {item.isCorrect ? 'Chính xác' : 'Chưa đúng'}
              </span>
            </div>
            
            <p className="text-lg text-slate-100 mb-4 font-semibold leading-relaxed relative z-10">
              {item.question}
            </p>

            {/* Ảnh minh họa trong Review */}
            {item.image_id && isImageUrl(item.image_id) && (
              <div className="mb-6 rounded-xl overflow-hidden border border-slate-700 max-w-md bg-black/40 p-1">
                <img 
                  src={getDirectDriveLink(item.image_id)} 
                  alt="Ảnh câu hỏi" 
                  className="max-h-60 object-contain rounded"
                  onError={(e) => { (e.target as any).parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className={`p-4 rounded-xl border ${item.isCorrect ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Lựa chọn của bạn</p>
                <div className={`text-sm font-bold ${item.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {renderAnswerContent(item.userAns, item.type, item.options)}
                </div>
              </div>
              {!item.isCorrect && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Đáp án đúng</p>
                  <div className="text-sm font-bold text-blue-400">
                    {renderAnswerContent(item.correctAns, item.type, item.options)}
                  </div>
                </div>
              )}
            </div>

            {item.solution && (
              <div className="mt-6 p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl z-10">
                <p className="text-[10px] text-purple-400 font-bold uppercase mb-2 flex items-center gap-2">
                   Lời giải chi tiết
                </p>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  {item.solution}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={onBack}
          className="px-16 py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest transition-all"
        >
          Quay về danh sách bài học
        </button>
      </div>
    </div>
  );
};

export default Review;
