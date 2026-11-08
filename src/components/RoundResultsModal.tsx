import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
  Trophy,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { QUIZ_ROUNDS, STUDENTS_ROSTER, TEAMS } from '../data/quizData';
import { GameState, TeamId } from '../types/game';

interface RoundResultsModalProps {
  isOpen: boolean;
  roundNumber: number; // 1 to 8
  gameState: GameState;
  onClose: () => void;
}

export const RoundResultsModal: React.FC<RoundResultsModalProps> = ({
  isOpen,
  roundNumber,
  gameState,
  onClose,
}) => {
  const [selectedRound, setSelectedRound] = useState<number>(roundNumber || 1);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync when prop changes
  React.useEffect(() => {
    if (roundNumber) {
      setSelectedRound(roundNumber);
    }
  }, [roundNumber]);

  if (!isOpen) return null;

  const roundData = QUIZ_ROUNDS.find((r) => r.roundNumber === selectedRound);

  // Gather results for the 4 teams in this round
  const teamIds: TeamId[] = [1, 2, 3, 4];
  const roundResults = teamIds.map((tId) => {
    const team = TEAMS[tId];
    const student = STUDENTS_ROSTER[tId].find((s) => s.turnNumber === selectedRound);
    const version = roundData?.versions[tId];
    const subKey = `${selectedRound}_${tId}`;
    const submission = gameState.answers[subKey];

    const isSubmitted = !!submission;
    const selectedAnswer = submission ? submission.selectedAnswer : null;
    const isCorrect = submission ? submission.isCorrect : false;
    const correctAnswer = version ? version.correctAnswer : 'A';
    const points = isCorrect ? 10 : 0;

    return {
      teamId: tId,
      team,
      studentName: student?.name || `Học sinh đội ${tId}`,
      versionId: version?.versionId || `${selectedRound}.${tId}`,
      selectedAnswer,
      correctAnswer,
      isSubmitted,
      isCorrect,
      points,
    };
  });

  const correctCount = roundResults.filter((r) => r.isCorrect).length;
  const totalPoints = roundResults.reduce((acc, r) => acc + r.points, 0);

  // Export to CSV with UTF-8 BOM for Microsoft Excel Vietnamese support
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Đội',
      'Họ và tên thí sinh',
      'Vòng thi',
      'Mã đề',
      'Chủ đề câu hỏi',
      'Đáp án học sinh chọn',
      'Đáp án đúng',
      'Kết quả',
      'Điểm số',
    ];

    const rows = roundResults.map((r, idx) => [
      idx + 1,
      r.team.name,
      `"${r.studentName}"`,
      `Vòng ${selectedRound}`,
      `Câu ${r.versionId}`,
      `"${roundData?.topic || ''}"`,
      r.selectedAnswer ? r.selectedAnswer : 'Chưa nộp',
      r.correctAnswer,
      r.isSubmitted ? (r.isCorrect ? 'ĐÚNG' : 'SAI') : 'CHƯA NỘP',
      r.points,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ket_Qua_Vong_${selectedRound}_Toan_Hoc.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy results table to clipboard as clean markdown
  const handleCopyTable = () => {
    const markdown = [
      `### BẢNG KẾT QUẢ VÒNG ${selectedRound} - ĐẤU TRƯỜNG TOÁN HỌC`,
      `Chủ đề: ${roundData?.topic || ''}`,
      `Thời gian: 1 phút (60 giây) / câu`,
      '',
      '| STT | Đội | Thí sinh | Mã câu | Đã chọn | Đáp án đúng | Kết quả | Điểm |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...roundResults.map(
        (r, i) =>
          `| ${i + 1} | ${r.team.shortName} | ${r.studentName} | ${r.versionId} | ${r.selectedAnswer || 'Chưa nộp'} | ${r.correctAnswer} | ${r.isCorrect ? 'ĐÚNG' : 'SAI'} | +${r.points}đ |`
      ),
      '',
      `Tổng kết: ${correctCount}/4 học sinh trả lời đúng (+${totalPoints} điểm).`,
    ].join('\n');

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Print friendly report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Báo Cáo Kết Quả Đấu Trường
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                  Đúng: {correctCount}/4
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                Kết Quả Chi Tiết Vòng {selectedRound}: Đúng / Sai
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Round Selector Tabs (Vòng 1 - Vòng 8) */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Chọn Vòng:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((rNum) => (
            <button
              key={rNum}
              onClick={() => setSelectedRound(rNum)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedRound === rNum
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Vòng {rNum}
            </button>
          ))}
        </div>

        {/* Topic Banner */}
        <div className="my-3 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-extrabold text-amber-400">Chủ đề Vòng {selectedRound}:</span>
            <span className="font-medium text-slate-200">{roundData?.topic}</span>
          </div>
          <span className="text-slate-400 font-mono text-xs hidden sm:inline">
            Thời gian: 1 phút / câu
          </span>
        </div>

        {/* Detailed Table */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 my-2">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-mono text-[11px] sticky top-0 z-10">
                <th className="py-3 px-3 text-center">STT</th>
                <th className="py-3 px-3">Đội thi</th>
                <th className="py-3 px-3">Thí sinh lên bảng</th>
                <th className="py-3 px-2 text-center">Mã đề</th>
                <th className="py-3 px-3 text-center">Đã chọn</th>
                <th className="py-3 px-3 text-center">Đáp án đúng</th>
                <th className="py-3 px-3 text-center">Kết quả</th>
                <th className="py-3 px-3 text-right">Điểm cộng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {roundResults.map((r, index) => (
                <tr key={r.teamId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                    {index + 1}
                  </td>
                  <td className="py-3 px-3 font-extrabold">
                    <span className="flex items-center gap-2" style={{ color: r.team.hex }}>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: r.team.hex }}
                      />
                      <span>{r.team.name}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-100 text-sm">
                    {r.studentName}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-400 font-semibold">
                    {r.versionId}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-base">
                    {r.selectedAnswer ? (
                      <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center bg-slate-800 text-slate-200">
                        {r.selectedAnswer}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs italic font-sans">Chưa nộp</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-base">
                    <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {r.correctAnswer}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {r.isSubmitted ? (
                      r.isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ĐÚNG</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>SAI</span>
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                        Hết giờ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-sm">
                    {r.isCorrect ? (
                      <span className="text-emerald-400">+10đ</span>
                    ) : (
                      <span className="text-slate-500">0đ</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions: Export Excel, Copy, Print */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Tổng điểm vòng {selectedRound}: <strong className="text-amber-400 font-mono text-sm">+{totalPoints}đ</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Tải bảng kết quả về file Excel (.csv chuẩn tiếng Việt)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel (.csv)</span>
            </button>

            <button
              onClick={handleCopyTable}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              title="Sao chép bảng kết quả"
            >
              <Copy className="w-4 h-4 text-amber-400" />
              <span>{copied ? 'Đã sao chép!' : 'Sao chép bảng'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              title="In báo cáo kết quả"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">In báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
