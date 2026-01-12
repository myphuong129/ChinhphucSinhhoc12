
import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Question, QuestionType } from '../types';
import { TimerIcon, ArrowRightIcon, ArrowLeftIcon, AlertIcon, CheckCircleIcon } from './Icons';

interface QuizProps {
  lesson: Lesson;
  questions: Question[];
  onFinish: (result: any) => void;
}

const Quiz: React.FC<QuizProps> = ({ lesson, questions, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(lesson.timeout * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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

  const handleAnswer = (val: any) => {
    setAnswers(prev => ({ ...prev, [questions[currentIdx].stt]: val }));
  };

  const isMultipleType = (type: string) => {
    return type === 'ChooseMultiple' || type === 'ChooseMltiple';
  };

  const normalizeTF = (val: any) => {
    if (!val) return '';
    const v = String(val).trim().toUpperCase();
    if (v === 'A' || v === 'TRUE' || v === 'ĐÚNG' || v === 'DUNG') return 'A';
    if (v === 'B' || v === 'FALSE' || v === 'SAI') return 'B';
    return v;
  };

  const calculateScore = () => {
    let totalScore = 0;
    const details = questions.map(q => {
      const userAns = answers[q.stt];
      let isCorrect = false;

      if (q.question_type === 'ChooseOne') {
        isCorrect = userAns === q.answer_key;
      } else if (q.question_type === 'True/False') {
        isCorrect = normalizeTF(userAns) === normalizeTF(q.answer_key);
      } else if (isMultipleType(q.question_type)) {
        const sortedUser = Array.isArray(userAns) ? [...userAns].sort().join(',') : '';
        const sortedKey = q.answer_key.split(',').map(s => s.trim()).sort().join(',');
        isCorrect = sortedUser === sortedKey && sortedUser !== '';
      } else if (q.question_type === 'ShortAnswer') {
        isCorrect = String(userAns || '').trim().toLowerCase() === q.answer_key.trim().toLowerCase();
      }

      if (isCorrect) totalScore += Number(q.point || 1);
      
      return { 
        stt: q.stt, 
        isCorrect, 
        userAns, 
        correctAns: q.answer_key,
        type: q.question_type,
        question: q.question_text,
        image_id: q.image_id,
        options: {
          A: q.option_A,
          B: q.option_B,
          C: q.option_C,
          D: q.option_D
        },
        solution: q.solution
      };
    });

    return { totalScore, details };
  };

  const handleAutoSubmit = () => {
    const { totalScore, details } = calculateScore();
    const status = totalScore >= lesson.targetScore ? 'Pass' : 'Fail';
    onFinish({
      score: totalScore,
      total_questions: questions.length,
      status,
      time_spent: `${lesson.timeout * 60 - timeLeft}s`,
      details: details // Truyền object nguyên bản để App.tsx xử lý logic format sheet
    });
  };

  const manualSubmit = () => {
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    handleAutoSubmit();
  };

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="sticky top-20 z-40 flex justify-between items-center glass-card p-4 rounded-2xl mb-6 neon-border">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <TimerIcon className={`w-6 h-6 ${timeLeft < 60 ? 'text-red-500 animate-ping' : 'text-blue-400'}`} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Thời gian còn lại</p>
            <p className={`text-xl font-orbitron font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Tiến độ</p>
            <div className="flex gap-1 mt-1">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-1 rounded-full transition-all ${i === currentIdx ? 'bg-purple-500 w-8' : answers[questions[i].stt] ? 'bg-blue-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
        </div>

        <button 
          onClick={manualSubmit}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-sm uppercase tracking-widest transition-all shadow-lg shadow-green-900/20"
        >
          Nộp bài
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl min-h-[400px] flex flex-col justify-between border-blue-500/20">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Câu {currentIdx + 1}</span>
              <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {currentQ.question_type === 'True/False' ? 'Đúng hoặc Sai' : isMultipleType(currentQ.question_type) ? 'Chọn nhiều đáp án' : currentQ.question_type}
              </span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-relaxed">
              {currentQ.question_text}
            </h3>

            {currentQ.image_id && isImageUrl(currentQ.image_id) && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700 bg-black/40 p-2 flex justify-center min-h-[100px]">
                <img 
                  src={getDirectDriveLink(currentQ.image_id)} 
                  alt="Minh họa câu hỏi" 
                  className="max-h-[350px] object-contain w-auto rounded-lg shadow-2xl"
                  loading="eager"
                  onError={(e) => { (e.target as any).parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="space-y-4 mt-6">
              {currentQ.question_type === 'ChooseOne' || currentQ.question_type === 'True/False' ? (
                ['A', 'B', 'C', 'D'].map((key) => {
                  const opt = (currentQ as any)[`option_${key}`];
                  if (currentQ.question_type === 'True/False' && key !== 'A' && key !== 'B') return null;
                  if (!opt && currentQ.question_type !== 'True/False') return null;
                  
                  const isOptImage = isImageUrl(opt);
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleAnswer(key)}
                      className={`
                        w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group
                        ${answers[currentQ.stt] === key 
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0
                        ${answers[currentQ.stt] === key ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'}
                      `}>
                        {key}
                      </div>
                      <div className="font-medium flex-1">
                        {currentQ.question_type === 'True/False' 
                          ? (key === 'A' ? 'Đúng' : 'Sai') 
                          : isOptImage ? (
                              <div className="py-2">
                                <img 
                                  src={getDirectDriveLink(opt)} 
                                  alt={`Đáp án ${key}`} 
                                  className="max-h-48 rounded-lg object-contain border border-slate-700 bg-white/5" 
                                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                                />
                              </div>
                            ) : opt
                        }
                      </div>
                    </button>
                  );
                })
              ) : isMultipleType(currentQ.question_type) ? (
                ['A', 'B', 'C', 'D'].map((key) => {
                  const opt = (currentQ as any)[`option_${key}`];
                  if (!opt) return null;
                  const currentList = Array.isArray(answers[currentQ.stt]) ? answers[currentQ.stt] : [];
                  const isSelected = currentList.includes(key);
                  const isOptImage = isImageUrl(opt);

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        const newList = isSelected 
                          ? currentList.filter((k: string) => k !== key)
                          : [...currentList, key];
                        handleAnswer(newList);
                      }}
                      className={`
                        w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4
                        ${isSelected 
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded border-2 flex items-center justify-center transition-all shrink-0
                        ${isSelected ? 'bg-purple-600 border-purple-500' : 'border-slate-600 bg-slate-900'}
                      `}>
                        {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-xs text-slate-500 font-bold">{key}</span>
                        {isOptImage ? (
                          <div className="py-2">
                            <img 
                              src={getDirectDriveLink(opt)} 
                              alt={`Đáp án ${key}`} 
                              className="max-h-48 rounded-lg object-contain border border-slate-700 bg-white/5" 
                              onError={(e) => { (e.target as any).style.display = 'none'; }}
                            />
                          </div>
                        ) : <span>{opt}</span>}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">Câu trả lời ngắn:</p>
                  <input
                    type="text"
                    placeholder="Nhập nội dung đáp án..."
                    value={answers[currentQ.stt] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-blue-500 rounded-xl p-4 text-white outline-none transition-all shadow-inner"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-12">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold uppercase text-xs"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Quay lại
            </button>
            <button
              disabled={isLastQuestion}
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className={`flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-bold uppercase text-xs border border-slate-600 ${isLastQuestion ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              Tiếp theo <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border-purple-500/10">
          <h4 className="text-sm font-orbitron font-bold text-slate-400 mb-4 uppercase tracking-wider">Danh sách câu hỏi</h4>
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`
                  h-10 rounded-lg font-bold transition-all border
                  ${i === currentIdx ? 'bg-purple-600 border-purple-500 text-white scale-110 z-10' : answers[q.stt] ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-card p-8 rounded-3xl max-w-sm w-full neon-border text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
              <AlertIcon className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-orbitron font-bold text-white mb-2">NỘP BÀI?</h3>
            <p className="text-slate-400 mb-8">Bạn có chắc chắn muốn nộp bài làm của mình không?</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowConfirm(false)} className="py-3 px-4 rounded-xl border border-slate-700 text-slate-400 font-bold uppercase text-xs hover:bg-slate-800 transition-all">Tiếp tục làm</button>
              <button onClick={confirmSubmit} className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs transition-all shadow-lg shadow-blue-900/30">Xác nhận nộp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
