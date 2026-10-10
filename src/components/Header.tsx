import React from 'react';
import { BookOpen, Search, Calendar, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onOpenLookup: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  activeReservationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLookup,
  selectedDate,
  onDateChange,
  activeReservationsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo & System Title */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  도서관 좌석 및 도서 예약 시스템
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  실시간 연동중
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                새별오름 도서관 열람실 실시간 예약 시스템
              </p>
            </div>
          </div>

          {/* Quick Date Switcher & My Reservations Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">예약일:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-sm"
              />
            </div>

            {/* My Reservations Button */}
            <button
              onClick={onOpenLookup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-xs"
            >
              <Search className="w-4 h-4 text-white" />
              <span>내 예약 조회 및 취소</span>
              {activeReservationsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] bg-blue-500 text-white rounded-full">
                  {activeReservationsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
