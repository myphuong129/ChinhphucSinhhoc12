
import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { User, Lesson, Question, AppView, ResultRecord } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import Review from './components/Review';
import { DNAIcon, Loader, AlertIcon } from './components/Icons';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const playSound = (type: 'click' | 'win' | 'fail' | 'warn') => {
    const soundUrls = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      fail: 'https://assets.mixkit.co/active_storage/sfx/255/255-preview.mp3',
      warn: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
    };
    const audio = new Audio(soundUrls[type]);
    audio.play().catch(() => {});
  };

  const fetchDashboardData = useCallback(async (account: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await api.getLessons(account);
      if (data.success) {
        setLessons(data.lessons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setView('DASHBOARD');
    fetchDashboardData(userData.account);
    playSound('click');
  };

  const handleLogout = () => {
    if (user) {
      const account = user.account;
      setUser(null);
      setLessons([]);
      setCurrentLesson(null);
      setQuestions([]);
      setLastResult(null);
      setView('LOGIN');
      playSound('click');
      api.logout(account).catch(err => console.error("Logout error:", err));
    }
  };

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startLesson = async (lesson: Lesson) => {
    if (lesson.isLocked) return;
    
    const countValue = lesson.count === undefined || lesson.count === null ? 0 : Number(lesson.count);
    if (countValue === 0) {
      setWarning('Bài học này hiện chưa có câu hỏi trong hệ thống. Vui lòng quay lại sau!');
      playSound('warn');
      return;
    }

    setLoading(true);
    try {
      const data = await api.getQuestions(lesson.stt);
      if (data.success) {
        if (!data.questions || data.questions.length === 0) {
          setWarning('Bài học này chưa có câu hỏi. Vui lòng liên hệ giáo viên để cập nhật!');
          playSound('warn');
          setLoading(false);
          return;
        }

        const shuffled = shuffleArray(data.questions);
        const limit = Math.min(countValue, shuffled.length);
        const selectedQuestions = shuffled.slice(0, limit);

        setQuestions(selectedQuestions);
        setCurrentLesson(lesson);
        setView('QUIZ');
        playSound('click');
      } else {
        setWarning(data.message || 'Không thể tải câu hỏi từ máy chủ.');
        playSound('warn');
      }
    } catch (err) {
      console.error(err);
      setWarning('Lỗi kết nối khi tải dữ liệu câu hỏi. Vui lòng kiểm tra internet!');
      playSound('warn');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizFinish = async (result: any) => {
    setLoading(true);
    try {
      const simplifiedAnswers: Record<string, string> = {};
      result.details.forEach((d: any) => {
        const displayAns = Array.isArray(d.userAns) ? d.userAns.sort().join(', ') : (d.userAns || 'Trống');
        simplifiedAnswers[d.question] = displayAns;
      });

      const response = await api.submitResult({
        score: result.score,
        total_questions: result.total_questions,
        status: result.status,
        time_spent: result.time_spent,
        answers: JSON.stringify(simplifiedAnswers),
        name: user?.name,
        role: user?.role,
        grade: user?.class,
        lesson_name: currentLesson?.name
      });
      
      setLastResult({ 
        ...result, 
        answers: JSON.stringify(result.details),
        response 
      });
      
      if (result.status === 'Pass') {
        playSound('win');
      } else {
        playSound('fail');
      }
      
      setView('REVIEW');
    } catch (err) {
      console.error(err);
      setWarning('Có lỗi khi lưu kết quả bài làm. Vui lòng chụp màn hình kết quả!');
      playSound('warn');
    } finally {
      setLoading(false);
    }
  };

  const backToDashboard = async () => {
    playSound('click');
    if (user) {
      await fetchDashboardData(user.account, false);
    }
    setView('DASHBOARD');
  };

  return (
    <div className="min-h-screen transition-all duration-500">
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center glass-card border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg neon-border animate-pulse">
            <DNAIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              GENE QUEST 12
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold opacity-70">
              Chinh phục Sinh học phân tử
            </p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-blue-400 uppercase">{user.class} • {user.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full border border-red-500/50 text-red-400 text-xs hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-wider"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </header>

      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-screen relative">
        {loading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="font-orbitron text-sm tracking-widest text-purple-400 animate-pulse uppercase">Đang xử lý...</p>
            </div>
          </div>
        )}

        {/* Custom Warning Popup */}
        {warning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="glass-card p-8 rounded-3xl max-w-sm w-full border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
                <AlertIcon className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-white mb-3 tracking-tight">CẢNH BÁO</h3>
              <p className="text-slate-300 mb-8 text-sm leading-relaxed">{warning}</p>
              <button 
                onClick={() => setWarning(null)} 
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-amber-900/40"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}

        {view === 'LOGIN' && <Login onLogin={handleLogin} />}
        {view === 'DASHBOARD' && user && (
          <Dashboard 
            lessons={lessons} 
            onStartLesson={startLesson} 
          />
        )}
        {view === 'QUIZ' && currentLesson && (
          <Quiz 
            lesson={currentLesson} 
            questions={questions} 
            onFinish={handleQuizFinish} 
          />
        )}
        {view === 'REVIEW' && (
          <Review 
            result={lastResult} 
            onBack={backToDashboard} 
          />
        )}
      </main>

      <div className="fixed top-20 right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-[-5%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default App;
