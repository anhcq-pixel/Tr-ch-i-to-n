import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, Play, ShieldAlert, Sparkles, Trophy, Users, X } from 'lucide-react';
import { STUDENTS_ROSTER, TEAMS } from '../data/quizData';
import { playStudentAnnounceFanfare } from '../utils/sound';
import { TeamId } from '../types/game';

interface StudentAnnounceModalProps {
  isOpen: boolean;
  turnNumber: number | null;
  onClose: () => void;
  autoCloseDelay?: number; // ms, default 7000ms
}

export const StudentAnnounceModal: React.FC<StudentAnnounceModalProps> = ({
  isOpen,
  turnNumber,
  onClose,
  autoCloseDelay = 7500,
}) => {
  useEffect(() => {
    if (isOpen && turnNumber) {
      // Play celebratory audio fanfare
      playStudentAnnounceFanfare();

      // Launch golden confetti bursts
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.35, x: 0.5 },
        colors: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#fbbf24'],
      });

      // Auto dismiss after delay so projector and teachers effortlessly see questions
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, turnNumber, autoCloseDelay, onClose]);

  if (!isOpen || !turnNumber) return null;

  // Retrieve the 4 students for this turn
  const teamIds: TeamId[] = [1, 2, 3, 4];
  const turnStudents = teamIds.map((tId) => {
    const list = STUDENTS_ROSTER[tId] || [];
    const student = list.find((s) => s.turnNumber === turnNumber);
    return {
      team: TEAMS[tId],
      studentName: student ? student.name : `Học sinh số ${turnNumber}`,
    };
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 overflow-hidden"
        >
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all z-10"
            title="Đóng hiệu ứng và vào đề thi ngay"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Banner */}
          <div className="text-center relative z-10 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs sm:text-sm uppercase tracking-wider mb-3 shadow-inner"
            >
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>VÒNG QUAY ĐÃ GỌI TÊN · LƯỢT #{turnNumber}</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </motion.div>

            <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 uppercase tracking-tight drop-shadow-md">
              XIN MỜI 4 THÍ SINH LÊN BẢNG!
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-1 flex items-center justify-center gap-2 font-medium">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Mỗi đội cử 1 đại diện tương ứng thực hiện câu hỏi phiên bản của đội mình</span>
            </p>
          </div>

          {/* 4 SuperHero Student Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 my-4">
            {turnStudents.map(({ team, studentName }, index) => {
              // Custom styles per team
              let cardGlow = 'border-emerald-500/40 bg-emerald-950/30 shadow-emerald-500/10';
              let badgeColor = 'bg-emerald-500 text-slate-950';
              let nameColor = 'text-emerald-300';

              if (team.id === 2) {
                cardGlow = 'border-amber-500/40 bg-amber-950/30 shadow-amber-500/10';
                badgeColor = 'bg-amber-500 text-slate-950';
                nameColor = 'text-amber-300';
              } else if (team.id === 3) {
                cardGlow = 'border-rose-500/40 bg-rose-950/30 shadow-rose-500/10';
                badgeColor = 'bg-rose-500 text-white';
                nameColor = 'text-rose-300';
              } else if (team.id === 4) {
                cardGlow = 'border-sky-500/40 bg-sky-950/30 shadow-sky-500/10';
                badgeColor = 'bg-sky-500 text-white';
                nameColor = 'text-sky-300';
              }

              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1 }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 ${cardGlow} flex flex-col items-center justify-between text-center shadow-lg transition-transform hover:scale-105`}
                >
                  <div className="w-full flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                      {team.shortName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono font-semibold">
                      Đề {turnNumber}.{team.id}
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="w-16 h-16 rounded-full mx-auto mb-2.5 flex items-center justify-center font-black text-2xl border-2 border-current/40 bg-slate-900/80" style={{ color: team.hex }}>
                      {studentName.charAt(0)}
                    </div>
                    <div className={`text-lg sm:text-xl font-extrabold ${nameColor} leading-snug drop-shadow-sm`}>
                      {studentName}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">
                      {team.name}
                    </div>
                  </div>

                  <div className="w-full mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-xs text-slate-300 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" style={{ color: team.hex }} />
                    <span>Lên máy làm bài</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Countdown & Action Controls */}
          <div className="mt-6 pt-4 border-t border-slate-800 relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Thời Gian Làm Bài</div>
                <div className="text-sm sm:text-base font-bold text-amber-300">
                  1 Phút (60 Giây) Cho Mỗi Câu Hỏi
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer ml-auto"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Vào Làm Bài Ngay (60s)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
