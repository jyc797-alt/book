import React, { useState } from 'react';
import { LibrarySeat } from '../types';
import { LIBRARY_SEATS } from '../data/mockData';
import { 
  Sun, Laptop, Users, Armchair, 
  Check, Lock, Sparkles, Filter, 
  MapPin, Zap, Monitor, BookOpen,
  LayoutGrid, Map, Coffee, CheckCircle2
} from 'lucide-react';

// Generated image assets
const ZONE_IMAGES = {
  window: '/src/assets/images/zone_window_seat_1791530210208.jpg',
  main: '/src/assets/images/zone_main_hall_1791530221198.jpg',
  laptop: '/src/assets/images/zone_laptop_digital_1791530231339.jpg',
  study: '/src/assets/images/zone_group_study_1791530240540.jpg',
};

interface FloorPlanProps {
  selectedSeat: LibrarySeat | null;
  onSelectSeat: (seat: LibrarySeat) => void;
  reservedSeatNames: string[];
  selectedDate: string;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  selectedSeat,
  onSelectSeat,
  reservedSeatNames,
  selectedDate,
}) => {
  const [activeTab, setActiveTab] = useState<'visualCards' | 'floorMap'>('visualCards');
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('all');
  const [hoveredSeat, setHoveredSeat] = useState<LibrarySeat | null>(null);

  // Helper to determine if a seat is taken for this date
  const isSeatTaken = (seat: LibrarySeat) => {
    return reservedSeatNames.includes(seat.name) || 
           reservedSeatNames.includes(seat.id) ||
           reservedSeatNames.some(r => r.includes(seat.id) || (seat.name && r.includes(seat.name)));
  };

  // Stats calculation
  const totalSeats = LIBRARY_SEATS.length;
  const takenCount = LIBRARY_SEATS.filter(s => isSeatTaken(s)).length;
  const availableCount = totalSeats - takenCount;

  const zoneSections = [
    {
      id: 'window',
      title: '창가 1인 집중존',
      sub: '자연 채광 & 개인 스탠드 / 고요한 집중 공간',
      icon: Sun,
      image: ZONE_IMAGES.window,
      tag: 'ZONE A',
      seats: LIBRARY_SEATS.filter(s => s.zone === 'window'),
      amenities: ['통창 자연채광', '개인 콘센트', 'LED 독서등', '인체공학 의자'],
    },
    {
      id: 'main',
      title: '중앙 오픈 열람존',
      sub: '넓은 6인 원목 테이블 / 여유로운 독서 공간',
      icon: BookOpen,
      image: ZONE_IMAGES.main,
      tag: 'ZONE B',
      seats: LIBRARY_SEATS.filter(s => s.zone === 'main'),
      amenities: ['원목 대형 데스크', '매립형 전원', '펜던트 조명', '넉넉한 통로'],
    },
    {
      id: 'laptop',
      title: '노트북 & 디지털존',
      sub: '타이핑 및 충전 가능 / 과제 및 업무 최적화',
      icon: Laptop,
      image: ZONE_IMAGES.laptop,
      tag: 'ZONE C',
      seats: LIBRARY_SEATS.filter(s => s.zone === 'laptop'),
      amenities: ['타이핑 자유', '초고속 기가 Wi-Fi', 'USB-C 고속충전', '칸막이 분리'],
    },
    {
      id: 'study',
      title: '그룹 스터디룸',
      sub: '방음 유리벽 & 스마트 스크린 / 팀 회의실',
      icon: Users,
      image: ZONE_IMAGES.study,
      tag: 'ZONE D',
      seats: LIBRARY_SEATS.filter(s => s.zone === 'study'),
      amenities: ['독립 방음 공간', '대형 스마트 TV', '유리 화이트보드', '회의용 마이크'],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Header with View Toggle & Status */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              도서관 좌석 현황
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
              {selectedDate}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            사진으로 구역 분위기를 확인하고, 원하는 번호를 누르면 즉시 예약할 수 있습니다.
          </p>
        </div>

        {/* View Switcher: Photo Cards vs Floor Plan */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('visualCards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'visualCards'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>사진 & 구역별 보기</span>
          </button>
          <button
            onClick={() => setActiveTab('floorMap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'floorMap'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>도면 전체 배치도</span>
          </button>
        </div>
      </div>

      {/* Legend & Availability Pills */}
      <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-3 h-3 rounded-md bg-emerald-500 ring-2 ring-emerald-100"></span>
            <span>예약 가능 ({availableCount}석)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-3 h-3 rounded-md bg-rose-500 ring-2 ring-rose-100"></span>
            <span>예약 마감 ({takenCount}석)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-3 h-3 rounded-md bg-blue-600 ring-2 ring-blue-200"></span>
            <span>선택됨</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          💡 초록색 버튼을 클릭하면 예약 정보가 자동 입력됩니다.
        </div>
      </div>

      {/* VIEW 1: Visual Cards with High-Res Atmosphere Photos */}
      {activeTab === 'visualCards' ? (
        <div className="p-5 space-y-5 bg-slate-50/40">
          {zoneSections.map((sec) => {
            const Icon = sec.icon;
            const zoneAvailable = sec.seats.filter(s => !isSeatTaken(s)).length;
            const zoneTaken = sec.seats.length - zoneAvailable;

            return (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  {/* Photo Section (4 cols) */}
                  <div className="md:col-span-5 lg:col-span-4 relative group h-44 md:h-auto min-h-[160px] overflow-hidden bg-slate-100">
                    <img
                      src={sec.image}
                      alt={sec.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex flex-col justify-between p-3.5 text-white">
                      <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-md border border-white/20">
                        {sec.tag}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white drop-shadow-sm flex items-center gap-1.5">
                          <Icon className="w-4 h-4 text-amber-300" />
                          {sec.title}
                        </h4>
                        <div className="text-[11px] text-slate-200 mt-0.5">
                          잔여 {zoneAvailable}석 / 총 {sec.seats.length}석
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seat Grid & Features (8 cols) */}
                  <div className="md:col-span-7 lg:col-span-8 p-4 flex flex-col justify-between">
                    <div>
                      {/* Amenities pills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {sec.amenities.map((am, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            • {am}
                          </span>
                        ))}
                      </div>

                      {/* Interactive Seat Buttons */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {sec.seats.map((seat) => {
                          const taken = isSeatTaken(seat);
                          const selected = selectedSeat?.id === seat.id;

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={taken}
                              onClick={() => onSelectSeat(seat)}
                              className={`p-2.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center relative min-h-[64px] ${
                                selected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-3 ring-blue-200 scale-102 z-10'
                                  : taken
                                  ? 'bg-rose-50/70 border-rose-200 text-rose-800 cursor-not-allowed opacity-80'
                                  : 'bg-emerald-50/80 border-emerald-300 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-500 hover:shadow-xs cursor-pointer'
                              }`}
                            >
                              <span className={`text-xs font-bold ${selected ? 'text-white' : 'text-slate-900'}`}>
                                {seat.id}
                              </span>
                              
                              <span className={`text-[10px] font-semibold mt-1 px-1.5 py-0.2 rounded ${
                                selected
                                  ? 'bg-white/20 text-white'
                                  : taken
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-200/70 text-emerald-800'
                              }`}>
                                {selected ? '선택됨' : taken ? '마감' : '예약가능'}
                              </span>

                              {selected && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{sec.sub}</span>
                      <span className="font-medium text-emerald-700">
                        {zoneAvailable > 0 ? `${zoneAvailable}자리 예약 가능` : '전석 마감'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: Clean 2D Floor Plan Layout */
        <div className="p-6 bg-slate-100/60 relative select-none">
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between">
            {/* Top Window Wall Indicator */}
            <div className="h-4 bg-gradient-to-r from-sky-100 via-amber-100 to-sky-100 rounded-full border border-sky-200 flex items-center justify-center text-[10px] text-sky-800 font-bold tracking-wider mb-6">
              ☀️ 통창 자연채광 뷰 (WINDOW WALL) ☀️
            </div>

            {/* Window Zone */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  ZONE A: 창가 1인 집중석 (W-01 ~ W-06)
                </span>
                <span className="text-[11px] text-slate-400">개인 콘센트 & 스탠드</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                {LIBRARY_SEATS.filter(s => s.zone === 'window').map(seat => {
                  const taken = isSeatTaken(seat);
                  const selected = selectedSeat?.id === seat.id;
                  return (
                    <button
                      key={seat.id}
                      disabled={taken}
                      onClick={() => onSelectSeat(seat)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-3 ring-blue-200'
                          : taken
                          ? 'bg-rose-50 border-rose-200 text-rose-800 cursor-not-allowed'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer'
                      }`}
                    >
                      <div className="text-xs font-bold">{seat.id}</div>
                      <div className="text-[10px] mt-1 font-semibold">{selected ? '선택' : taken ? '마감' : '가능'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Hall */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <div className="text-xs font-bold text-blue-900 mb-3 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                ZONE B: 중앙 오픈 열람석 (원목 대형 데스크)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">테이블 A (6인석)</div>
                  <div className="grid grid-cols-3 gap-2">
                    {LIBRARY_SEATS.filter(s => s.id.startsWith('A-')).map(seat => {
                      const taken = isSeatTaken(seat);
                      const selected = selectedSeat?.id === seat.id;
                      return (
                        <button
                          key={seat.id}
                          disabled={taken}
                          onClick={() => onSelectSeat(seat)}
                          className={`p-2 rounded-lg border-2 text-center text-xs font-bold transition ${
                            selected ? 'bg-blue-600 border-blue-600 text-white' : taken ? 'bg-rose-50 border-rose-200 text-rose-800 cursor-not-allowed' : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                          }`}
                        >
                          {seat.id}
                          <span className="block text-[9px] font-normal">{selected ? '선택' : taken ? '마감' : '가능'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">테이블 B (6인석)</div>
                  <div className="grid grid-cols-3 gap-2">
                    {LIBRARY_SEATS.filter(s => s.id.startsWith('B-')).map(seat => {
                      const taken = isSeatTaken(seat);
                      const selected = selectedSeat?.id === seat.id;
                      return (
                        <button
                          key={seat.id}
                          disabled={taken}
                          onClick={() => onSelectSeat(seat)}
                          className={`p-2 rounded-lg border-2 text-center text-xs font-bold transition ${
                            selected ? 'bg-blue-600 border-blue-600 text-white' : taken ? 'bg-rose-50 border-rose-200 text-rose-800 cursor-not-allowed' : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                          }`}
                        >
                          {seat.id}
                          <span className="block text-[9px] font-normal">{selected ? '선택' : taken ? '마감' : '가능'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop Zone & Study Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200">
                <div className="text-xs font-bold text-purple-900 mb-2 flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-purple-600" />
                  ZONE C: 노트북존 (L-01 ~ L-06)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {LIBRARY_SEATS.filter(s => s.zone === 'laptop').map(seat => {
                    const taken = isSeatTaken(seat);
                    const selected = selectedSeat?.id === seat.id;
                    return (
                      <button
                        key={seat.id}
                        disabled={taken}
                        onClick={() => onSelectSeat(seat)}
                        className={`p-2 rounded-lg border-2 text-center text-xs font-bold transition ${
                          selected ? 'bg-blue-600 border-blue-600 text-white' : taken ? 'bg-rose-50 border-rose-200 text-rose-800 cursor-not-allowed' : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                        }`}
                      >
                        {seat.id}
                        <span className="block text-[9px] font-normal">{selected ? '선택' : taken ? '마감' : '가능'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200">
                <div className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  ZONE D: 스터디룸 (4인실 / 6인실)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LIBRARY_SEATS.filter(s => s.zone === 'study').map(seat => {
                    const taken = isSeatTaken(seat);
                    const selected = selectedSeat?.id === seat.id;
                    return (
                      <button
                        key={seat.id}
                        disabled={taken}
                        onClick={() => onSelectSeat(seat)}
                        className={`p-2.5 rounded-xl border-2 text-center text-xs font-bold transition ${
                          selected ? 'bg-blue-600 border-blue-600 text-white' : taken ? 'bg-rose-50 border-rose-200 text-rose-800 cursor-not-allowed' : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                        }`}
                      >
                        {seat.id}
                        <span className="block text-[10px] text-slate-500 font-medium">{seat.capacity}인실</span>
                        <span className="block text-[9px] font-normal mt-0.5">{selected ? '선택' : taken ? '마감' : '가능'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Hall Details */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
              <span>🚪 메인 출입 게이트 & 도서 무인 반납기 위치</span>
              <span>인천교육대학교 도서관 열람실</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
