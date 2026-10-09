import React, { useState } from 'react';
import { Reservation } from '../types';
import { 
  X, Search, Calendar, Clock, 
  Armchair, AlertTriangle, CheckCircle, 
  Ban, ShieldCheck, Mail, RefreshCw 
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

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput.trim()) {
      setActionMessage({ type: 'error', text: '조회할 이메일 주소를 입력해 주세요.' });
      return;
    }

    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/reservations?email=${encodeURIComponent(emailInput.trim())}`);
      const data = await res.json();
      if (data.ok) {
        setReservations(data.reservations || []);
        setHasSearched(true);
        if (data.reservations?.length === 0) {
          setActionMessage({ type: 'error', text: `'${emailInput}'로 등록된 예약 내역이 없습니다.` });
        }
      } else {
        setActionMessage({ type: 'error', text: data.message || '조회 실패' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: '서버 통신 실패: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async (res: Reservation) => {
    const isConfirmed = window.confirm(
      `[예약 취소 확인]\n예약번호: ${res.reservationNumber}\n좌석: ${res.bookOrSeatName}\n일자: ${res.reservationDate}\n\n정말로 이 예약을 취소하시겠습니까?\n취소 시 구글 시트의 상태가 '취소됨'으로 변경되며 좌석이 다시 반환됩니다.`
    );

    if (!isConfirmed) return;

    setCancellingNumber(res.reservationNumber);
    setActionMessage(null);
    try {
      const resp = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationNumber: res.reservationNumber,
          email: res.userEmail,
        }),
      });
      const data = await resp.json();

      if (data.ok) {
        setActionMessage({
          type: 'success',
          text: `✅ ${data.message || '예약이 성공적으로 취소되었습니다.'}`,
        });
        // Update local item status
        setReservations(prev =>
          prev.map(item =>
            item.reservationNumber === res.reservationNumber
              ? { ...item, status: '취소됨' }
              : item
          )
        );
        // Refresh floor plan
        onCancelSuccess();
      } else {
        setActionMessage({ type: 'error', text: data.message || '취소 실패' });
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
              <p className="text-xs text-slate-500">구글 시트 '예약목록' 시트 실시간 검색</p>
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
          <form onSubmit={handleSearch} className="flex gap-2">
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
            <span>추천 이메일:</span>
            <button
              type="button"
              onClick={() => { setEmailInput('jyc797@iceu.kr'); }}
              className="font-mono text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]"
            >
              jyc797@iceu.kr
            </button>
            <button
              type="button"
              onClick={() => { setEmailInput('minsu.kim@iceu.kr'); }}
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
              <p className="text-sm">구글 시트에서 예약 내역을 검색하고 있습니다...</p>
            </div>
          ) : !hasSearched ? (
            <div className="py-12 text-center text-slate-400">
              <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-600">이메일을 입력하고 [검색하기]를 눌러주세요</p>
              <p className="text-xs text-slate-400 mt-1">
                본인이 등록한 예약 목록을 확인하고 직접 취소할 수 있습니다.
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

              return (
                <div
                  key={res.reservationNumber}
                  className={`bg-white rounded-xl border p-4 transition-all shadow-xs ${
                    isCancelled ? 'border-slate-200 bg-slate-50/60 opacity-80' : 'border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isCancelled
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {res.status}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{res.bookOrSeatName}</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>예약일: <strong>{res.reservationDate}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>시간대: <strong>{res.timeSlot}</strong></span>
                        </div>
                        <div className="text-slate-400">
                          예약번호: <span className="font-mono text-slate-700">{res.reservationNumber}</span>
                        </div>
                        <div className="text-slate-400">
                          예약자: <span className="text-slate-700">{res.userName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Action Button */}
                    <div className="shrink-0 flex items-center justify-end">
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
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>취소 즉시 좌석이 다시 사용 가능한 상태로 변경됩니다.</span>
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
