import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FloorPlan } from './components/FloorPlan';
import { ReservationForm } from './components/ReservationForm';
import { MyReservationsModal } from './components/MyReservationsModal';
import { SheetSyncPanel } from './components/SheetSyncPanel';
import { GasCodeModal } from './components/GasCodeModal';
import { reservationService } from './services/reservationService';
import { LibrarySeat, Reservation, LibraryBook } from './types';
import { 
  Search, ShieldCheck, 
  Sparkles, CheckCircle2, Mail 
} from 'lucide-react';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-09');
  const [selectedSeat, setSelectedSeat] = useState<LibrarySeat | null>(null);
  const [reservedSeatNames, setReservedSeatNames] = useState<string[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  
  // Modals state
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isGasCodeOpen, setIsGasCodeOpen] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Load seat status for selected date
  const loadSeatStatus = useCallback(async (date: string) => {
    setIsLoadingStatus(true);
    try {
      const res = await reservationService.getSeatStatus(date);
      if (res.ok) {
        setReservedSeatNames(res.reserved || []);
      }
    } catch (e) {
      console.error('좌석 상태 로딩 오류:', e);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // Load all reservations & books
  const loadAllData = useCallback(async () => {
    try {
      const [resData, bookData] = await Promise.all([
        reservationService.getAllReservations(),
        reservationService.getBooks(),
      ]);
      if (resData.ok) {
        setAllReservations(resData.reservations || []);
      }
      if (bookData.ok) {
        setBooks(bookData.books || []);
      }
    } catch (e) {
      console.error('데이터 로딩 오류:', e);
    }
  }, []);

  useEffect(() => {
    loadSeatStatus(selectedDate);
    loadAllData();
  }, [selectedDate, loadSeatStatus, loadAllData]);

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    // If the selected seat was already booked on that new date, reset or keep
  };

  // Handle seat selection
  const handleSelectSeat = (seat: LibrarySeat) => {
    setSelectedSeat(seat);
  };

  // Submit reservation handler
  const handleReservationSubmit = async (data: {
    bookOrSeatName: string;
    userName: string;
    userEmail: string;
    reservationDate: string;
    timeSlot: string;
  }) => {
    const res = await reservationService.createReservation(data);
    if (res.ok) {
      // Reload seat status and sheet data
      await loadSeatStatus(selectedDate);
      await loadAllData();
      setSelectedSeat(null);
    }
    return res;
  };

  // Refresh upon cancellation
  const handleCancelSuccess = async () => {
    await loadSeatStatus(selectedDate);
    await loadAllData();
  };

  // Active reservations count
  const activeCount = allReservations.filter(r => r.status === '예약완료').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        onOpenLookup={() => setIsLookupOpen(true)}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        activeReservationsCount={activeCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Visual Hero Banner with Generated Photo */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-md border border-slate-200/80 bg-slate-900 min-h-[220px] sm:min-h-[260px] flex items-end">
          {/* Background Image */}
          <img
            src="/src/assets/images/library_hero_banner_1791530199466.jpg"
            alt="도서관 열람실 전경"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          {/* Gentle Gradient Mesh Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-8 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6 text-white">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  실시간 예약 동기화
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                도서관 좌석 및 열람실 스마트 예약
              </h2>
              <p className="text-sm text-slate-200 mt-1.5 leading-relaxed drop-shadow-xs max-w-xl">
                실시간 평면도와 실제 열람실 사진을 통해 원하는 좌석을 선택하고 간편하게 예약하세요. 중복 예약은 자동으로 차단되며 언제든 취소할 수 있습니다.
              </p>
            </div>

            {/* Availability Quick Stats */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 bg-slate-900/70 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <div className="text-center px-3 py-1 border-r border-white/10">
                <div className="text-[11px] text-slate-300">예약 가능</div>
                <div className="text-xl font-extrabold text-emerald-400">
                  {20 - allReservations.filter(r => r.reservationDate === selectedDate && r.status === '예약완료').length}석
                </div>
              </div>
              <div className="text-center px-3 py-1 border-r border-white/10">
                <div className="text-[11px] text-slate-300">마감 좌석</div>
                <div className="text-xl font-extrabold text-rose-400">
                  {allReservations.filter(r => r.reservationDate === selectedDate && r.status === '예약완료').length}석
                </div>
              </div>
              <div className="text-center px-3 py-1">
                <div className="text-[11px] text-slate-300">내 예약</div>
                <div className="text-xl font-extrabold text-blue-400">
                  {activeCount}건
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Layout: Left Floor Plan (7 cols) + Right Reservation Form (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Floor Plan */}
          <div className="lg:col-span-7 xl:col-span-8">
            <FloorPlan
              selectedSeat={selectedSeat}
              onSelectSeat={handleSelectSeat}
              reservedSeatNames={reservedSeatNames}
              selectedDate={selectedDate}
            />
          </div>

          {/* Right Column: Reservation Form */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <ReservationForm
              selectedSeat={selectedSeat}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              reservedSeatNames={reservedSeatNames}
              books={books}
              onSubmitReservation={handleReservationSubmit}
            />
          </div>
        </div>

        {/* Feature Highlights Footer Bar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">1. 예약 내역 조회 및 실시간 취소</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                이메일 입력만으로 '예약목록' 시트의 내역을 즉시 검색하고, 클릭 한 번으로 상태를 '취소됨'으로 변경합니다.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">2. 동일 일자 중복 예약 방지</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                동일한 '예약일자'에 동일한 '도서명/좌석'이 이미 '예약완료' 상태인 경우 서버(Code.gs)에서 확실히 거절합니다.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">3. 예약 내역 자동 이메일 발송</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                예약 완료 즉시 등록하신 이메일로 좌석 번호, 일자, 시간대, 대출 도서 정보가 담긴 확인증이 자동 전송됩니다.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 인천교육대학교 도서관 좌석 및 도서 예약 시스템</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>스프레드시트 실시간 연동 중</span>
            <span>•</span>
            <span>예약 내역 자동 이메일 발송</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MyReservationsModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onCancelSuccess={handleCancelSuccess}
      />

      <SheetSyncPanel
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        reservations={allReservations}
        books={books}
        onRefresh={loadAllData}
      />

      <GasCodeModal
        isOpen={isGasCodeOpen}
        onClose={() => setIsGasCodeOpen(false)}
      />
    </div>
  );
}
