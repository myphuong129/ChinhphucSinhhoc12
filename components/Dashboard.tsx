
import React from 'react';
import { Lesson } from '../types';
import { DNAIcon, LockIcon, PlayIcon, CheckCircleIcon, AlertIcon } from './Icons';

interface DashboardProps {
  lessons: Lesson[];
  onStartLesson: (lesson: Lesson) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ lessons, onStartLesson }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-orbitron font-bold text-white mb-2 neon-text text-wrap">CHƯƠNG TRÌNH HỌC</h2>
          <p className="text-blue-300 max-w-xl">Hệ thống bài giảng và bài tập trắc nghiệm tối ưu cho ôn thi THPT Quốc gia môn Sinh học.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3">
             <div className="bg-green-500/20 p-2 rounded-lg">
               <CheckCircleIcon className="w-5 h-5 text-green-500" />
             </div>
             <div>
               <p className="text-[10px] text-slate-400 font-bold uppercase">Hoàn thành</p>
               <p className="text-lg font-bold text-white">{lessons.filter(l => l.status === 'Pass').length}/{lessons.length}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => {
          const countValue = lesson.count === undefined || lesson.count === null ? 0 : Number(lesson.count);
          const hasNoQuestions = countValue === 0;
          
          return (
            <div 
              key={lesson.stt}
              onClick={() => onStartLesson(lesson)}
              className={`
                group relative p-6 rounded-2xl glass-card transition-all duration-300 cursor-pointer overflow-hidden
                ${lesson.isLocked 
                  ? 'opacity-60 cursor-not-allowed border-slate-700' 
                  : 'hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1'
                }
              `}
            >
              {/* Background Accent */}
              <div className={`
                absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] -mr-12 -mt-12 transition-all duration-500
                ${lesson.isLocked ? 'bg-slate-700/20' : 'bg-purple-600/20 group-hover:bg-purple-600/40'}
              `}></div>

              <div className="flex justify-between items-start mb-6">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center font-orbitron text-lg font-bold border
                  ${lesson.isLocked 
                    ? 'bg-slate-800 border-slate-700 text-slate-500' 
                    : 'bg-purple-600/20 border-purple-500/50 text-purple-400 group-hover:bg-purple-600 group-hover:text-white'
                  }
                `}>
                  {lesson.stt < 10 ? `0${lesson.stt}` : lesson.stt}
                </div>
                
                {lesson.isLocked ? (
                  <LockIcon className="w-6 h-6 text-slate-500" />
                ) : hasNoQuestions ? (
                  <AlertIcon className="w-6 h-6 text-amber-500" />
                ) : lesson.status === 'Pass' ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500 drop-shadow-glow" />
                ) : (
                  <PlayIcon className="w-6 h-6 text-blue-400 animate-pulse" />
                )}
              </div>

              <h3 className={`text-xl font-bold mb-2 transition-colors ${lesson.isLocked ? 'text-slate-400' : 'text-white group-hover:text-purple-300'}`}>
                {lesson.name}
              </h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10">
                {lesson.title}
              </p>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4 text-xs font-bold uppercase tracking-wider">
                <div className="text-slate-500">
                  Thời gian: <span className={lesson.isLocked ? '' : 'text-blue-400'}>{lesson.timeout}p</span>
                </div>
                <div className="text-slate-500 text-right">
                  Số câu: <span className={lesson.isLocked ? '' : 'text-purple-400'}>{countValue}</span>
                </div>
              </div>

              {lesson.isLocked ? (
                <div className="mt-4 p-2 bg-slate-800/50 rounded-lg text-[10px] text-center text-slate-500 uppercase">
                  Hoàn thành bài trước để mở khóa
                </div>
              ) : hasNoQuestions ? (
                <div className="mt-4 p-2 bg-amber-500/10 rounded-lg text-[10px] text-center text-amber-500 uppercase tracking-tighter font-bold">
                  Bài học này chưa có câu hỏi
                </div>
              ) : lesson.status === 'Pass' ? (
                <div className="mt-4 p-2 bg-green-500/10 rounded-lg text-[10px] text-center text-green-500 uppercase tracking-tighter">
                  Đã vượt qua • Target: {lesson.targetScore}đ
                </div>
              ) : (
                <div className="mt-4 p-2 bg-blue-500/10 rounded-lg text-[10px] text-center text-blue-400 uppercase tracking-tighter">
                  Sẵn sàng • Target: {lesson.targetScore}đ
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
