import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  LayoutGrid,
  Maximize,
  Minimize,
  Sparkles,
  Trophy,
  Tv,
  XCircle,
} from 'lucide-react';
import { QUIZ_ROUNDS, STUDENTS_ROSTER, TEAMS } from '../data/quizData';
import { MathDisplay } from './MathDisplay';
import { LuckyWheel } from './LuckyWheel';
import { CountdownTimer } from './CountdownTimer';
import { StudentAnnounceModal } from './StudentAnnounceModal';
import { RoundResultsModal } from './RoundResultsModal';
import { GameState, ProjectorMode, TeamId } from '../types/game';

interface ProjectorViewProps {
  gameState: GameState;
  onSpinWheel: (target?: number) => void;
  onSetProjectorMode: (mode: ProjectorMode, focusTeam?: TeamId) => void;
  onResetTurns?: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({
  gameState,
  onSpinWheel,
  onSetProjectorMode,
  onResetTurns,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsRound, setResultsRound] = useState<number>(1);
  const prevSpinningRef = React.useRef(gameState.isSpinning);

  const currentRoundNum = gameState.currentRound || 1;
  const roundData = QUIZ_ROUNDS.find((r) => r.roundNumber === currentRoundNum);
  const activeMode = gameState.projectorMode || 'all_teams';
  const isTimeUp = gameState.roundStatus === 'time_up';

  // Automatically trigger celebratory student announcement when wheel finishes spinning
  React.useEffect(() => {
    if (prevSpinningRef.current && !gameState.isSpinning && gameState.selectedTurn) {
      setShowAnnounceModal(true);
    }
    prevSpinningRef.current = gameState.isSpinning;
  }, [gameState.isSpinning, gameState.selectedTurn]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleOpenResults = (roundNum?: number) => {
    setResultsRound(roundNum || currentRoundNum || 1);
    setShowResultsModal(true);
  };

  // Sort teams by current score descending for live leaderboard
  const sortedTeams = ([1, 2, 3, 4] as TeamId[])
    .map((id) => ({
      id,
      info: TEAMS[id],
      score: gameState.teamScores[id] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="h-full w-full max-h-screen bg-slate-950 text-slate-100 flex flex-col p-2 sm:p-2.5 lg:p-3 select-none overflow-hidden">
      {/* Top Projector Header (Compact 16:9 Budget: ~40-44px) */}
      <header className="shrink-0 flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Tv className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Màn Hình Máy Chiếu 16:9
              </span>
              <span className="text-[11px] px-2 py-0.2 rounded bg-slate-800 text-slate-200 font-mono font-bold">
                Lượt {currentRoundNum}/8
              </span>
              <span className="text-xs text-slate-400 truncate hidden md:inline">
                · {roundData?.topic}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-slate-100 truncate leading-tight">
              HULK (Xanh lá) · THOR (Vàng) · SPIDERMAN (Đỏ) · CAPTAIN (Xanh dương)
            </h1>
          </div>
        </div>

        {/* 60s Countdown Timer, Export Results & Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Export / View Round Results Button */}
          <button
            onClick={() => handleOpenResults(currentRoundNum)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/50 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Xuất bảng điểm đúng/sai vòng 1 và các vòng"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">Xuất KQ Vòng {currentRoundNum}</span>
            <span className="sm:hidden">KQ Vòng {currentRoundNum}</span>
          </button>

          {/* Announce Modal Button */}
          {gameState.selectedTurn && (
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Xem lại 4 học sinh được gọi lên bảng"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">4 Thí Sinh #{gameState.selectedTurn}</span>
              <span className="sm:hidden">#{gameState.selectedTurn}</span>
            </button>
          )}

          {/* Synchronized 60s Countdown Timer */}
          <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg shadow-inner">
            <CountdownTimer
              timerEndsAt={gameState.timerEndsAt}
              timerDuration={gameState.timerDuration}
              isRunning={gameState.isTimerRunning}
              roundStatus={gameState.roundStatus}
              size="sm"
              showLabel={true}
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => onSetProjectorMode('all_teams')}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeMode === 'all_teams'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>4 Đề</span>
            </button>

            <button
              onClick={() => onSetProjectorMode('wheel')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                activeMode === 'wheel'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎡 Quay
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Toàn màn hình (F11)"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Time-up Compact Banner with One-Click Export Result */}
      {isTimeUp && (
        <div className="shrink-0 mt-1 bg-rose-950/90 border border-rose-500 py-1.5 px-3 rounded-lg flex items-center justify-between text-xs font-bold text-rose-200 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span className="truncate">⏰ Hết thời gian 1 phút! Lượt #{currentRoundNum} đã kết thúc.</span>
          </div>
          <button
            onClick={() => handleOpenResults(currentRoundNum)}
            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-1 shadow cursor-pointer shrink-0 ml-2"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Xem Bảng Điểm Đúng/Sai</span>
          </button>
        </div>
      )}

      {/* Main 16:9 Workspace - Zero Scroll, 100% Viewport Contained */}
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 overflow-hidden">
        {/* Horizontal Scoreboard Ribbon (Budget: ~44-50px) */}
        <div className="shrink-0 grid grid-cols-4 gap-2 mb-2">
          {sortedTeams.map((team, rankIdx) => {
            const answerKey = `${currentRoundNum}_${team.id}`;
            const sub = gameState.answers[answerKey];
            const student = STUDENTS_ROSTER[team.id].find(
              (s) => s.turnNumber === (gameState.selectedTurn || currentRoundNum)
            );
            const isFocused = gameState.projectorMode === 'team_focus' && gameState.projectorFocusTeam === team.id;
            const rankLabel = rankIdx === 0 ? 'Hạng 1' : rankIdx === 1 ? 'Hạng 2' : rankIdx === 2 ? 'Hạng 3' : 'Hạng 4';
            const rankBadge = rankIdx === 0 ? 'bg-amber-400 text-slate-950' : rankIdx === 1 ? 'bg-slate-300 text-slate-950' : rankIdx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-300';

            return (
              <div
                key={team.id}
                onClick={() => onSetProjectorMode('team_focus', team.id)}
                className={`px-2.5 py-1 sm:py-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow ${
                  isFocused
                    ? 'bg-slate-800 ring-2 ring-white scale-[1.01]'
                    : 'bg-slate-900/90 hover:bg-slate-850'
                }`}
                style={{ borderColor: team.info.hex }}
                title={`Bấm để phóng to đề ${team.info.name}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded shrink-0 ${rankBadge}`}>
                    {rankLabel}
                  </span>
                  <div className="truncate">
                    <div className="font-extrabold text-xs sm:text-sm tracking-wide truncate" style={{ color: team.info.hex }}>
                      {team.info.name}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      Thí sinh: <span className="font-bold text-white">{student?.name || 'Học sinh'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2 border-l border-slate-800">
                  <div className="text-lg sm:text-xl font-black font-mono text-amber-400 leading-none">
                    {team.score}<span className="text-[10px] font-sans text-slate-400 ml-0.5">đ</span>
                  </div>
                  <div className="text-[10px] mt-0.5 leading-none">
                    {sub ? (
                      sub.isCorrect ? (
                        <span className="font-bold text-emerald-400">Đúng +10đ</span>
                      ) : (
                        <span className="font-bold text-rose-400">Đã chọn ({sub.selectedAnswer})</span>
                      )
                    ) : isTimeUp ? (
                      <span className="font-bold text-rose-400">Hết giờ</span>
                    ) : (
                      <span className="text-amber-400/90 animate-pulse">Đang làm...</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* VIEW 1: 4 TEAMS 2x2 GRID - Strictly Fits 16:9 Aspect Ratio with Zero Page Scroll */}
        {activeMode === 'all_teams' && (
          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2 sm:gap-2.5 overflow-hidden">
            {([1, 2, 3, 4] as TeamId[]).map((tId) => {
              const team = TEAMS[tId];
              const version = roundData?.versions[tId];
              const student = STUDENTS_ROSTER[tId].find(
                (s) => s.turnNumber === (gameState.selectedTurn || currentRoundNum)
              );
              const answerKey = `${currentRoundNum}_${tId}`;
              const sub = gameState.answers[answerKey];

              return (
                <div
                  key={tId}
                  className="bg-slate-900/95 border-2 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all hover:border-slate-500 min-h-0"
                  style={{ borderColor: team.hex }}
                >
                  {/* Card Header (Compact ~32px) */}
                  <div className="shrink-0 flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-slate-950 text-xs shadow shrink-0"
                        style={{ backgroundColor: team.hex }}
                      >
                        {tId}
                      </span>
                      <div className="truncate">
                        <div className="font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5" style={{ color: team.hex }}>
                          <span className="truncate">{team.name}</span>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 shrink-0">
                            Đề {currentRoundNum}.{tId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 truncate leading-none">
                          Thí sinh: <span className="text-white font-extrabold">{student?.name || 'Học sinh'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Status Indicator + Zoom */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {sub ? (
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
                            sub.isCorrect
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                              : 'bg-rose-950 text-rose-300 border border-rose-500'
                          }`}
                        >
                          {sub.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Đáp án {sub.selectedAnswer} (+10đ)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>Chọn {sub.selectedAnswer} (0đ)</span>
                            </>
                          )}
                        </div>
                      ) : isTimeUp ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-bold">
                          <Clock className="w-3 h-3" />
                          <span>Hết giờ</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Đang làm...</span>
                        </div>
                      )}

                      <button
                        onClick={() => onSetProjectorMode('team_focus', tId)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 cursor-pointer"
                        title="Phóng to đề này ra toàn màn hình"
                      >
                        <Maximize className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content & 4 Choices (Flex-1 min-h-0 with perfectly scaled math) */}
                  {version ? (
                    <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                      {/* Question Text */}
                      <div className="shrink-0 text-sm sm:text-base font-bold text-slate-100 mb-1 leading-snug">
                        <span className="text-amber-400 font-black mr-1.5">
                          Câu {version.versionId}:
                        </span>
                        <MathDisplay text={version.content} size="base" />
                      </div>

                      {/* 4 Choices Grid (2 cols x 2 rows, fits tightly) */}
                      <div className="flex-1 min-h-0 grid grid-cols-2 gap-1.5 sm:gap-2 content-center my-0.5">
                        {version.choices.map((c) => {
                          const isCorrect = c.key === version.correctAnswer;
                          const isChosen = sub?.selectedAnswer === c.key;

                          let choiceStyle = 'bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700';
                          if (sub || gameState.isAnswerRevealed) {
                            if (isCorrect) {
                              choiceStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 font-black ring-1 ring-emerald-500/50';
                            } else if (isChosen && !sub?.isCorrect) {
                              choiceStyle = 'bg-rose-950/90 border-rose-500 text-rose-200';
                            } else {
                              choiceStyle = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-60';
                            }
                          }

                          return (
                            <div
                              key={c.key}
                              className={`px-2.5 py-1.5 sm:py-2 rounded-xl border flex items-center justify-between transition-all ${choiceStyle}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-md bg-slate-800 text-amber-400 flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-inner">
                                  {c.key}
                                </span>
                                <span className="font-extrabold text-sm sm:text-base text-slate-100 overflow-x-auto no-scrollbar py-0.5">
                                  <MathDisplay text={c.text} latex={c.latex} size="lg" />
                                </span>
                              </div>

                              {sub && isCorrect && (
                                <span className="text-[10px] font-black text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 shrink-0 ml-1">
                                  ĐÚNG
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation if revealed */}
                      {(sub || gameState.isAnswerRevealed) && version.explanation && (
                        <div className="shrink-0 mt-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 truncate">
                          <span className="font-bold text-amber-400 mr-1">Giải thích:</span>
                          <MathDisplay text={version.explanation} size="sm" />
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Card Bottom Bar (Compact ~18px) */}
                  <div className="shrink-0 mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate">
                      Đề riêng của {team.shortName} · Đúng +10đ
                    </span>
                    <button
                      onClick={() => onSetProjectorMode('team_focus', tId)}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-1"
                    >
                      <span>Toàn màn hình</span>
                      <Maximize className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: SINGLE TEAM SPOTLIGHT (When zoomed in) */}
        {activeMode === 'team_focus' && (
          <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden">
            {(() => {
              const focusId = gameState.projectorFocusTeam || 1;
              const team = TEAMS[focusId];
              const version = roundData?.versions[focusId];
              const student = STUDENTS_ROSTER[focusId].find(
                (s) => s.turnNumber === (gameState.selectedTurn || currentRoundNum)
              );
              const answerKey = `${currentRoundNum}_${focusId}`;
              const sub = gameState.answers[answerKey];

              return (
                <div
                  className="bg-slate-900 border-3 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex-1 min-h-0 flex flex-col justify-between overflow-hidden"
                  style={{ borderColor: team.hex }}
                >
                  {/* Spotlight Header */}
                  <div className="shrink-0 flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg"
                        style={{ backgroundColor: team.hex }}
                      >
                        {focusId}
                      </div>
                      <div>
                        <div className="text-lg sm:text-xl font-black uppercase tracking-wide flex items-center gap-2" style={{ color: team.hex }}>
                          <span>{team.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold font-mono">
                            Chiếu Tiêu Điểm
                          </span>
                        </div>
                        <div className="text-sm sm:text-base text-slate-200">
                          Thí sinh đại diện: <span className="font-black text-white text-base sm:text-lg">{student?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {sub && (
                        <div
                          className={`px-3 py-1.5 rounded-xl border text-sm font-extrabold flex items-center gap-1.5 ${
                            sub.isCorrect
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                              : 'bg-rose-950 text-rose-300 border-rose-500'
                          }`}
                        >
                          {sub.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Đúng: Đáp án {sub.selectedAnswer} (+10 điểm)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span>Đã chọn {sub.selectedAnswer} (0 điểm)</span>
                            </>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => onSetProjectorMode('all_teams')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs sm:text-sm font-bold border border-slate-700 cursor-pointer shadow-md"
                      >
                        ← Thu về 4 Đội
                      </button>
                    </div>
                  </div>

                  {version ? (
                    <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                      {/* Big Question Text */}
                      <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 my-2 leading-relaxed shrink-0">
                        <span className="text-amber-400 font-black mr-2">
                          Câu {version.versionId}:
                        </span>
                        <MathDisplay text={version.content} size="xl" />
                      </div>

                      {/* Jumbo Choices Grid */}
                      <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 content-center my-2">
                        {version.choices.map((c) => {
                          const isCorrect = c.key === version.correctAnswer;
                          const isChosen = sub?.selectedAnswer === c.key;

                          let choiceStyle = 'bg-slate-950 border-slate-800 text-slate-100';
                          if (sub || gameState.isAnswerRevealed) {
                            if (isCorrect) {
                              choiceStyle = 'bg-emerald-950 border-emerald-500 text-emerald-100 font-black ring-2 ring-emerald-500/40';
                            } else if (isChosen && !sub?.isCorrect) {
                              choiceStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                            } else {
                              choiceStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                            }
                          }

                          return (
                            <div
                              key={c.key}
                              className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${choiceStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-mono font-black text-xl shadow-inner">
                                  {c.key}
                                </span>
                                <span className="font-black text-xl sm:text-2xl text-slate-100">
                                  <MathDisplay text={c.text} latex={c.latex} size="2xl" />
                                </span>
                              </div>

                              {sub && isCorrect && (
                                <span className="text-xs font-black text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                  ĐÚNG
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {(sub || gameState.isAnswerRevealed) && version.explanation && (
                        <div className="shrink-0 p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 truncate">
                          <span className="font-bold text-amber-400 mr-2">Giải thích chi tiết:</span>
                          <MathDisplay text={version.explanation} size="base" />
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW 3: LUCKY WHEEL (Spacious Full View) */}
        {activeMode === 'wheel' && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-3xl p-4 overflow-hidden">
            <LuckyWheel
              isSpinning={gameState.isSpinning}
              targetTurn={gameState.wheelTarget}
              selectedTurn={gameState.selectedTurn}
              availableTurns={gameState.availableTurns}
              onSpin={onSpinWheel}
              onResetTurns={onResetTurns}
              canSpin={!gameState.isSpinning}
            />

            {gameState.selectedTurn && !gameState.isSpinning && (
              <button
                onClick={() => onSetProjectorMode('all_teams')}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Bắt đầu Lượt #{gameState.selectedTurn} (Chiếu 4 đề)</span>
                <LayoutGrid className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Celebratory Student Announcement Modal */}
      <StudentAnnounceModal
        isOpen={showAnnounceModal}
        turnNumber={gameState.selectedTurn || currentRoundNum}
        onClose={() => setShowAnnounceModal(false)}
      />

      {/* Round Results Modal (Excel Export, Correct/Wrong display for Round 1 to 8) */}
      <RoundResultsModal
        isOpen={showResultsModal}
        roundNumber={resultsRound}
        gameState={gameState}
        onClose={() => setShowResultsModal(false)}
      />
    </div>
  );
};
