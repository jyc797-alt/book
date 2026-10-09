import React, { useState } from 'react';
import { LibrarySeat, LibraryBook } from '../types';
import { 
  Armchair, Calendar, Clock, User, 
  Mail, BookOpen, AlertCircle, CheckCircle, 
  Sparkles, Zap, ShieldAlert 
} from 'lucide-react';

interface ReservationFormProps {
  selectedSeat: LibrarySeat | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  reservedSeatNames: string[];
  books: LibraryBook[];
  onSubmitReservation: (data: {
    bookOrSeatName: string;
    userName: string;
    userEmail: string;
    reservationDate: string;
    timeSlot: string;
  }) => Promise<{ ok: boolean; message: string; reservationNumber?: string }>;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  selectedSeat,
  selectedDate,
  onDateChange,
  reservedSeatNames,
  books,
  onSubmitReservation,
}) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00~13:00 (오전)');
  const [accompanyingBook, setAccompanyingBook] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Determine current item name to save
  const primaryItemName = selectedSeat ? selectedSeat.name : '';
  const finalBookOrSeatName = accompanyingBook 
    ? `${primaryItemName} (도서: ${accompanyingBook})` 
    : primaryItemName;

  // Real-time duplicate check warning: checks core ID (W-01) and any variations
  const isSelectedSeatAlreadyReserved = Boolean(
    selectedSeat && (
      reservedSeatNames.includes(selectedSeat.id) ||
      reservedSeatNames.includes(selectedSeat.name) ||
      reservedSeatNames.some(r => 
        r.includes(selectedSeat.id) || 
        (selectedSeat.name && r.includes(selectedSeat.name)) ||
        (selectedSeat.id && r.toLowerCase().includes(selectedSeat.id.toLowerCase()))
      )
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedSeat) {
      setFeedback({
        type: 'error',
        message: '먼저 왼쪽 평면도에서 원하시는 좌석을 선택해 주세요.',
      });
      return;
    }

    if (isSelectedSeatAlreadyReserved) {
      setFeedback({
        type: 'error',
        message: `[중복 예약 불가] '${primaryItemName}' 좌석은 ${selectedDate}에 이미 '예약완료' 상태입니다. 다른 좌석이나 일자를 선택해 주세요.`,
      });
      return;
    }

    if (!userName.trim() || !userEmail.trim()) {
      setFeedback({
        type: 'error',
        message: '예약자 성함과 이메일 주소를 모두 입력해 주세요.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmitReservation({
        bookOrSeatName: finalBookOrSeatName,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        reservationDate: selectedDate,
        timeSlot: timeSlot,
      });

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `🎉 예약이 완료되었습니다! (예약번호: ${res.reservationNumber || '확인됨'})\n📩 입력하신 이메일(${userEmail})로 예약 내역(예약 일자, 좌석, 이용 시간대, 예약자명, 대출 도서 목록)이 발송되었습니다.`,
        });
        // Clear fields except email for user convenience
        setUserName('');
        setAccompanyingBook('');
      } else {
        setFeedback({
          type: 'error',
          message: res.message || '예약 처리에 실패했습니다.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: '서버 통신 중 오류가 발생했습니다: ' + err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Armchair className="w-5 h-5 text-blue-600" />
              좌석 및 도서 예약 신청
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              구글 시트 '예약목록' 시트에 실시간으로 기록됩니다.
            </p>
          </div>
          <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
            중복 방지 시스템 가동중
          </span>
        </div>

        {/* Selected Seat Preview Box */}
        {selectedSeat ? (
          <div className={`p-4 rounded-xl border mb-5 transition-all ${
            isSelectedSeatAlreadyReserved
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-950'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  선택한 좌석
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedSeat.name}
                </h4>
                <div className="text-xs text-slate-600 mt-0.5">
                  구역: <span className="font-semibold">{selectedSeat.zoneName}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                isSelectedSeatAlreadyReserved
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {isSelectedSeatAlreadyReserved ? '예약 불가 (이미 마감)' : '예약 가능'}
              </span>
            </div>

            {/* Amenities tags */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-blue-100/60">
              {selectedSeat.features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-white/80 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                  <Zap className="w-3 h-3 text-amber-500" />
                  {f}
                </span>
              ))}
            </div>

            {isSelectedSeatAlreadyReserved && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-700 font-medium bg-rose-100/70 p-2 rounded-lg">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>선택하신 좌석은 해당 날짜에 이미 다른 사용자가 예약했습니다.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center mb-5">
            <Armchair className="w-8 h-8 text-slate-400 mx-auto mb-1.5 opacity-60" />
            <div className="text-sm font-semibold text-slate-700">좌석이 아직 선택되지 않았습니다</div>
            <p className="text-xs text-slate-500 mt-0.5">
              왼쪽 평면도에서 초록색 '예약가능' 좌석을 클릭해 주세요.
            </p>
          </div>
        )}

        {/* Reservation Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reservation Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              예약일자 (예약목록 '예약일자' 컬럼) *
            </label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              이용 시간대 (예약목록 '이용시간대' 컬럼) *
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition cursor-pointer"
            >
              <option value="09:00~13:00 (오전)">09:00 ~ 13:00 (오전 세션)</option>
              <option value="13:00~18:00 (오후)">13:00 ~ 18:00 (오후 세션)</option>
              <option value="18:00~22:00 (야간)">18:00 ~ 22:00 (야간 세션)</option>
              <option value="09:00~22:00 (종일)">09:00 ~ 22:00 (종일 이용)</option>
            </select>
          </div>

          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              예약자명 (예약목록 '예약자명' 컬럼) *
            </label>
            <input
              type="text"
              required
              placeholder="예: 홍길동"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* User Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              이메일 주소 (예약 내역 자동 발송 및 조회·취소용) *
            </label>
            <input
              type="email"
              required
              placeholder="예: example@iceu.kr"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Accompanying Book Selection (Optional link to '도서목록') */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                함께 대출/이용할 도서 선택 (선택 사항)
              </span>
              <span className="text-[10px] text-slate-400">'도서목록' 시트 연동</span>
            </label>
            <select
              value={accompanyingBook}
              onChange={(e) => setAccompanyingBook(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="">좌석만 예약 (도서 미지정)</option>
              {books.map((b) => (
                <option key={b.bookId} value={b.bookTitle}>
                  [{b.category}] {b.bookTitle} ({b.author})
                </option>
              ))}
            </select>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : feedback.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed font-medium">{feedback.message}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedSeat || isSelectedSeatAlreadyReserved}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
              !selectedSeat || isSelectedSeatAlreadyReserved
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isSubmitting
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-blue-500/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>구글 시트 저장 및 중복 검증 중...</span>
              </>
            ) : isSelectedSeatAlreadyReserved ? (
              <span>이미 마감된 좌석입니다 (예약 불가)</span>
            ) : !selectedSeat ? (
              <span>평면도에서 좌석을 먼저 선택하세요</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>좌석 예약 확정하기</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>* 예약 번호는 자동 난수로 생성됩니다.</span>
        <span>상태: <strong>'예약완료'</strong>로 저장</span>
      </div>
    </div>
  );
};
