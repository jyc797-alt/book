import React, { useState, useEffect } from 'react';
import { Reservation, LibraryBook } from '../types';
import { SPREADSHEET_ID, DEFAULT_GAS_URL } from '../data/mockData';
import { 
  X, ExternalLink, RefreshCw, Table, 
  BookOpen, CheckCircle, AlertCircle, Link2, 
  Send, Database, Layers 
} from 'lucide-react';

interface SheetSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  books: LibraryBook[];
  onRefresh: () => void;
}

export const SheetSyncPanel: React.FC<SheetSyncPanelProps> = ({
  isOpen,
  onClose,
  reservations,
  books,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'books'>('reservations');
  const [gasUrlInput, setGasUrlInput] = useState(DEFAULT_GAS_URL);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetch('/api/gas/config')
      .then(r => r.json())
      .then(d => {
        if (d.gasUrl) setGasUrlInput(d.gasUrl);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveGasUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/gas/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasUrl: gasUrlInput.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestResult({ ok: true, message: 'GAS 웹앱 URL이 성공적으로 저장 및 연동되었습니다.' });
      } else {
        setTestResult({ ok: false, message: '저장 실패: ' + data.message });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: '통신 오류: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">구글 스프레드시트 실시간 데이터 현황</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                <span>시트 ID: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono text-emerald-900">{SPREADSHEET_ID}</code></span>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  스프레드시트 원본 바로가기
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GAS Web App Endpoint Setting */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex-1">
            <form onSubmit={handleSaveGasUrl} className="flex items-center gap-2">
              <label className="font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>GAS Web App URL:</span>
              </label>
              <input
                type="url"
                value={gasUrlInput}
                onChange={(e) => setGasUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                disabled={isTesting}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shrink-0 transition"
              >
                {isTesting ? '연동중...' : '연동 저장'}
              </button>
            </form>
          </div>

          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold flex items-center gap-1 shrink-0 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>새로고침</span>
          </button>
        </div>

        {testResult && (
          <div className={`px-5 py-2 text-xs flex items-center gap-2 ${
            testResult.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {testResult.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Sheet Tabs */}
        <div className="px-5 pt-3 bg-white border-b border-slate-200 flex gap-4">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'reservations'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>'예약목록' 시트 ({reservations.length}행)</span>
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'books'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>'도서목록' 시트 ({books.length}종)</span>
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto p-5 bg-slate-50/50">
          {activeTab === 'reservations' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">예약번호</th>
                    <th className="py-3 px-4">도서명 (좌석/도서)</th>
                    <th className="py-3 px-4">예약자명</th>
                    <th className="py-3 px-4">이메일</th>
                    <th className="py-3 px-4">예약일자</th>
                    <th className="py-3 px-4">이용시간대</th>
                    <th className="py-3 px-4 text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((row, idx) => (
                    <tr key={row.reservationNumber || idx} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">{row.reservationNumber}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">{row.bookOrSeatName}</td>
                      <td className="py-2.5 px-4 text-slate-700">{row.userName}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{row.userEmail}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">{row.reservationDate}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.timeSlot}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          row.status === '예약완료'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">도서ID</th>
                    <th className="py-3 px-4">도서명</th>
                    <th className="py-3 px-4">저자</th>
                    <th className="py-3 px-4">카테고리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map((b) => (
                    <tr key={b.bookId} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-purple-700">{b.bookId}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{b.bookTitle}</td>
                      <td className="py-2.5 px-4 text-slate-700">{b.author}</td>
                      <td className="py-2.5 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {b.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>* 구글 스프레드시트의 한글 컬럼 명칭을 100% 동일하게 준수합니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition"
          >
            창 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
