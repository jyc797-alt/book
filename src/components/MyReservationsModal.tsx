import React, { useState, useEffect, useCallback } from 'react';
import { Reservation } from '../types';
import { reservationService } from '../services/reservationService';
import { 
  X, Search, Calendar, Clock, 
  AlertTriangle, CheckCircle, 
  Ban, ShieldCheck, Mail, RefreshCw,
  BookOpen, ChevronDown, ChevronUp, Send
} from 'lucide-react';

interface MyReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelSuccess: () => void;
  initialEmail?: string;
}

export const MyReservationsModal: React.FC<MyReservationsModalProps> = ({
  isOpen,
  onClose,
  onCancelSuccess,
  initialEmail = 'jyc797@iceu.kr',
}) => {
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancellingNumber, setCancellingNumber] = useState<string | null>(null);
  const [expandedReceiptNumber, setExpandedReceiptNumber] = useState<string | null>(null);

  const handleSearch = useCallback(async (targetEmail?: string) => {
    const queryEmail = (targetEmail !== undefined ? targetEmail : emailInput).trim();
    if (!queryEmail) {
      setActionMessage({ type: 'error', text: '조회할 이메일 주소를 입력해 주세요.' });
      return;
    }

    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await reservationService.getReservationsByEmail(queryEmail);
      if (res.ok) {
        // Normalize fields in each reservation
        const normalizedList: Reservation[] = (res.reservations || (res as any).data || []).map((r: any) => ({
          reservationNumber: String(r.reservationNumber || '').trim(),
          bookOrSeatName: String(r.bookOrSeatName || r.bookOrSeat || '').trim(),
          userName: String(r.userName || r.name || '').trim(),
          userEmail: String(r.userEmail || r.email || queryEmail).trim().toLowerCase(),
          reservationDate: String(r.reservationDate || r.date || '').trim(),
          timeSlot: String(r.timeSlot || '').trim(),
          status: String(r.status || '예약완료').trim(),
          createdAt: r.createdAt || '',
        }));

        setReservations(normalizedList);
        setHasSearched(true);
        if (normalizedList.length === 0) {
          setActionMessage({ type: 'error', text: `'${queryEmail}'로 등록된 예약 내역이 없습니다.` });
        }
      } else {
        setActionMessage({ type: 'error', text: res.message || '조회 실패' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: '예약 내역 조회 중 오류: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  }, [emailInput]);

  // Auto-search when modal opens
  useEffect(() => {
    if (isOpen && emailInput) {
      handleSearch(emailInput);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleQuickEmailClick = (email: string) => {
    setEmailInput(email);
    handleSearch(email);
  };

  const handleCancelReservation = async (res: Reservation) => {
    const rawName = res.bookOrSeatName || (res as any).bookOrSeat || '';
    const cleanSeat = rawName.replace(/\(도서:.*?\)/g, '').trim();

    const isConfirmed = window.confirm(
      `[예약 취소 확인]\n예약번호: ${res.reservationNumber}\n좌석: ${cleanSeat}\n예약일: ${res.reservationDate}\n\n정말로 이 예약을 취소하시겠습니까?\n취소 시 구글 시트와 서버에서 좌석이 즉시 반환됩니다.`
    );

    if (!isConfirmed) return;

    setCancellingNumber(res.reservationNumber);
    setActionMessage(null);
    try {
      const resp = await reservationService.cancelReservation(
        res.reservationNumber,
        res.userEmail || (res as any).email
      );

      if (resp.ok) {
        setActionMessage({
          type: 'success',
          text: `✅ 예약번호 [${res.reservationNumber}] 취소 완료! 좌석 [${cleanSeat}]이(가) 즉시 반환되었습니다.`,
        });
        // Update local status immediately
        setReservations(prev =>
          prev.map(item =>
            item.reservationNumber === res.reservationNumber
              ? { ...item, status: '취소됨' }
              : item
          )
        );
        // Refresh floor plan and parent data
        onCancelSuccess();
      } else {
        setActionMessage({ type: 'error', text: resp.message || '취소 실패' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: '취소 요청 중 오류: ' + err.message });
    } finally {
      setCancellingNumber(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">내 예약 내역 조회 및 실시간 취소</h3>
              <p className="text-xs text-slate-500">구글 시트 '예약목록' 실시간 동기화 검색</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-white">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="예약 시 입력한 이메일 주소 (예: jyc797@iceu.kr)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>검색하기</span>
            </button>
          </form>

          {/* Quick email presets */}
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500">
            <span>빠른 선택:</span>
            <button
              type="button"
              onClick={() => handleQuickEmailClick('jyc797@iceu.kr')}
              className="font-mono text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]"
            >
              jyc797@iceu.kr
            </button>
            <button
              type="button"
              onClick={() => handleQuickEmailClick('minsu.kim@iceu.kr')}
              className="font-mono text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]"
            >
              minsu.kim@iceu.kr
            </button>
          </div>

          {actionMessage && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {actionMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm">구글 시트에서 최신 예약 내역을 검색하고 있습니다...</p>
            </div>
          ) : !hasSearched ? (
            <div className="py-12 text-center text-slate-400">
              <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-600">이메일을 입력하고 [검색하기]를 눌러주세요</p>
              <p className="text-xs text-slate-400 mt-1">
                구글 시트에 등록된 예약 목록을 실시간으로 확인하고 직접 취소할 수 있습니다.
              </p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Ban className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">조회된 예약 내역이 없습니다</p>
              <p className="text-xs text-slate-400 mt-1">이메일 주소를 다시 확인해 주세요.</p>
            </div>
          ) : (
            reservations.map((res) => {
              const isCancelled = res.status === '취소됨';
              const isCancelling = cancellingNumber === res.reservationNumber;
              const isReceiptOpen = expandedReceiptNumber === res.reservationNumber;

              const rawItem = res.bookOrSeatName || (res as any).bookOrSeat || '';
              const bookMatch = rawItem.match(/\(도서:\s*(.*?)\)/);
              const bookTitle = bookMatch ? bookMatch[1].trim() : '';
              const cleanSeat = rawItem.replace(/\(도서:.*?\)/g, '').trim() || '좌석';

              return (
                <div
                  key={res.reservationNumber}
                  className={`bg-white rounded-xl border p-4 transition-all shadow-xs ${
                    isCancelled ? 'border-slate-200 bg-slate-50/60 opacity-80' : 'border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isCancelled
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {res.status}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{cleanSeat}</h4>
                      </div>

                      {/* Explicit 4 Items Summary Box */}
                      <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200/80 text-xs space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-600 w-24">1. 예약일:</span>
                          <span className="font-bold text-blue-600">{res.reservationDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-600 w-24">2. 이용 시간대:</span>
                          <span className="font-semibold text-slate-800">{res.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-600 w-24">3. 좌석 번호:</span>
                          <span className="font-semibold text-slate-900">{cleanSeat}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-600 w-24 shrink-0">4. 도서 대출 목록:</span>
                          <span className={`font-semibold ${bookTitle ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {bookTitle ? `📖 ${bookTitle}` : '선택한 도서 없음 (좌석 전용)'}
                          </span>
                        </div>
                      </div>

                      {/* Additional Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                        <span>예약자: <strong className="text-slate-700">{res.userName}</strong></span>
                        <span>예약번호: <code className="font-mono text-slate-700">{res.reservationNumber}</code></span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {isCancelled ? (
                        <div className="text-xs text-slate-400 font-medium px-3 py-1.5 rounded-lg bg-slate-100">
                          취소 완료됨
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isCancelling}
                          onClick={() => handleCancelReservation(res)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1 hover:shadow-xs disabled:opacity-50"
                        >
                          {isCancelling ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>취소 처리중...</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>예약 취소</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Toggle Email Receipt Preview */}
                      <button
                        type="button"
                        onClick={() => setExpandedReceiptNumber(isReceiptOpen ? null : res.reservationNumber)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{isReceiptOpen ? '발송 이메일 닫기' : '발송 이메일 확인'}</span>
                        {isReceiptOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Email Receipt View */}
                  {isReceiptOpen && (
                    <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-700 animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-2">
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                        <span>이메일 발송 내역 확인서 (수신자: {res.userEmail})</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1 font-sans">
                        <div className="text-[11px] text-slate-500 border-b pb-1 mb-1.5">
                          제목: [새별오름 도서관] 예약 확정 안내 - 예약일: {res.reservationDate} | 좌석: {cleanSeat}
                        </div>
                        <p className="font-semibold text-slate-800">
                          {res.userName}님, 신청하신 좌석 예약 및 도서 대출 정보입니다:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1 mt-1">
                          <li><strong>예약일:</strong> {res.reservationDate}</li>
                          <li><strong>이용 시간대:</strong> {res.timeSlot}</li>
                          <li><strong>좌석 번호:</strong> {cleanSeat}</li>
                          <li><strong>도서 대출 목록:</strong> {bookTitle || '선택한 도서 없음'}</li>
                        </ul>
                        <div className="text-[11px] text-slate-400 pt-1.5 mt-1 border-t">
                          예약번호: {res.reservationNumber} • 새별오름 도서관 자동 발송 완료
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>취소 즉시 좌석이 다시 사용 가능한 상태로 실시간 반환됩니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
