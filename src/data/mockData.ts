import { LibrarySeat, LibraryBook, Reservation } from '../types';

export const SPREADSHEET_ID = '1yArHVbhR1F4uHnjuIqFDLn_4GeLesQGSMY4Bc4mXpqk';
export const DEFAULT_GAS_URL = 'https://script.google.com/a/macros/iceu.kr/s/AKfycbxbBruZulaxyJAaiVY6wZzHW7rgQkf-RFbQ2gJdr4t3GNL8pv8Gf2FTmt9I6Svm2Pij/exec';

export const LIBRARY_SEATS: LibrarySeat[] = [
  // 창가 1인 집중석 (Window Zone - W-01 ~ W-06) - 상단 자연채광 구역
  { id: 'W-01', name: '창가 1인석 W-01', zone: 'window', zoneName: '창가 1인 집중존', x: 12, y: 15, features: ['2구 콘센트', '개인 LED 조명', '자연 채광'] },
  { id: 'W-02', name: '창가 1인석 W-02', zone: 'window', zoneName: '창가 1인 집중존', x: 26, y: 15, features: ['2구 콘센트', '개인 LED 조명', '자연 채광'] },
  { id: 'W-03', name: '창가 1인석 W-03', zone: 'window', zoneName: '창가 1인 집중존', x: 40, y: 15, features: ['2구 콘센트', '개인 LED 조명', '자연 채광'] },
  { id: 'W-04', name: '창가 1인석 W-04', zone: 'window', zoneName: '창가 1인 집중존', x: 54, y: 15, features: ['2구 콘센트', '개인 LED 조명', '자연 채광'] },
  { id: 'W-05', name: '창가 1인석 W-05', zone: 'window', zoneName: '창가 1인 집중존', x: 68, y: 15, features: ['2구 콘센트', '개인 LED 조명', '자연 채광'] },
  { id: 'W-06', name: '창가 1인석 W-06', zone: 'window', zoneName: '창가 1인 집중존', x: 82, y: 15, features: ['2구 콘센트', '개인 LED 조명', '자연 채광'] },

  // 중앙 일반 열람석 A열 (A-01 ~ A-06) - 넓은 6인 테이블
  { id: 'A-01', name: '중앙 열람석 A-01', zone: 'main', zoneName: '중앙 오픈 열람존', x: 18, y: 40, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'A-02', name: '중앙 열람석 A-02', zone: 'main', zoneName: '중앙 오픈 열람존', x: 28, y: 40, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'A-03', name: '중앙 열람석 A-03', zone: 'main', zoneName: '중앙 오픈 열람존', x: 38, y: 40, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'A-04', name: '중앙 열람석 A-04', zone: 'main', zoneName: '중앙 오픈 열람존', x: 18, y: 52, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'A-05', name: '중앙 열람석 A-05', zone: 'main', zoneName: '중앙 오픈 열람존', x: 28, y: 52, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'A-06', name: '중앙 열람석 A-06', zone: 'main', zoneName: '중앙 오픈 열람존', x: 38, y: 52, features: ['매립형 콘센트', '원목 대형 데스크'] },

  // 중앙 일반 열람석 B열 (B-01 ~ B-06)
  { id: 'B-01', name: '중앙 열람석 B-01', zone: 'main', zoneName: '중앙 오픈 열람존', x: 56, y: 40, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'B-02', name: '중앙 열람석 B-02', zone: 'main', zoneName: '중앙 오픈 열람존', x: 66, y: 40, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'B-03', name: '중앙 열람석 B-03', zone: 'main', zoneName: '중앙 오픈 열람존', x: 76, y: 40, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'B-04', name: '중앙 열람석 B-04', zone: 'main', zoneName: '중앙 오픈 열람존', x: 56, y: 52, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'B-05', name: '중앙 열람석 B-05', zone: 'main', zoneName: '중앙 오픈 열람존', x: 66, y: 52, features: ['매립형 콘센트', '원목 대형 데스크'] },
  { id: 'B-06', name: '중앙 열람석 B-06', zone: 'main', zoneName: '중앙 오픈 열람존', x: 76, y: 52, features: ['매립형 콘센트', '원목 대형 데스크'] },

  // 노트북 & 디지털 존 (Laptop Zone - L-01 ~ L-06) - 타이핑 가능
  { id: 'L-01', name: '노트북석 L-01', zone: 'laptop', zoneName: '노트북 / 디지털존', x: 14, y: 76, features: ['타이핑 가능', '초고속 무선랜', 'USB 고속충전'] },
  { id: 'L-02', name: '노트북석 L-02', zone: 'laptop', zoneName: '노트북 / 디지털존', x: 26, y: 76, features: ['타이핑 가능', '초고속 무선랜', 'USB 고속충전'] },
  { id: 'L-03', name: '노트북석 L-03', zone: 'laptop', zoneName: '노트북 / 디지털존', x: 38, y: 76, features: ['타이핑 가능', '초고속 무선랜', '듀얼모니터 거치대'] },
  { id: 'L-04', name: '노트북석 L-04', zone: 'laptop', zoneName: '노트북 / 디지털존', x: 50, y: 76, features: ['타이핑 가능', '초고속 무선랜', '듀얼모니터 거치대'] },
  { id: 'L-05', name: '노트북석 L-05', zone: 'laptop', zoneName: '노트북 / 디지털존', x: 62, y: 76, features: ['타이핑 가능', '초고속 무선랜', 'USB 고속충전'] },
  { id: 'L-06', name: '노트북석 L-06', zone: 'laptop', zoneName: '노트북 / 디지털존', x: 74, y: 76, features: ['타이핑 가능', '초고속 무선랜', 'USB 고속충전'] },

  // 그룹 스터디룸 (Study Rooms - S-01 ~ S-02)
  { id: 'S-01', name: '스터디룸 S-01 (4인실)', zone: 'study', zoneName: '그룹 스터디룸', x: 88, y: 44, features: ['방음벽', '화이트보드', '55인치 모니터'], capacity: 4 },
  { id: 'S-02', name: '스터디룸 S-02 (6인실)', zone: 'study', zoneName: '그룹 스터디룸', x: 88, y: 70, features: ['방음벽', '화이트보드', '65인치 모니터'], capacity: 6 },
];

export const LIBRARY_BOOKS: LibraryBook[] = [
  { bookId: 'BK-101', bookTitle: '인공지능 시대를 위한 컴퓨터 과학 개론', author: '김지훈', category: '컴퓨터/IT' },
  { bookId: 'BK-102', bookTitle: '클린 코드: 애자일 소프트웨어 장인 정신', author: '로버트 C. 마틴', category: '프로그래밍' },
  { bookId: 'BK-103', bookTitle: '구글 앱스 스크립트 완벽 가이드', author: '박성호', category: '클라우드/업무자동화' },
  { bookId: 'BK-104', bookTitle: '모던 웹 프론트엔드 아키텍처', author: '이영희', category: '웹개발' },
  { bookId: 'BK-105', bookTitle: '생각의 탄생: 천재들의 발상법', author: '로버트 루트번스타인', category: '인문학' },
  { bookId: 'BK-106', bookTitle: '사피엔스: 유인원에서 사이보그까지', author: '유발 하라리', category: '역사/교양' },
  { bookId: 'BK-107', bookTitle: '데이터 분석을 위한 파이썬 기초', author: '웨스 맥키니', category: '데이터사이언스' },
  { bookId: 'BK-108', bookTitle: '코스모스: 칼 세이건 전집', author: '칼 세이건', category: '자연과학' },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    reservationNumber: 'LIB-20261009-0821',
    bookOrSeatName: '창가 1인석 W-02',
    userName: '정예찬',
    userEmail: 'jyc797@iceu.kr',
    reservationDate: '2026-10-09',
    timeSlot: '09:00~13:00',
    status: '예약완료',
    createdAt: '2026-10-09 08:30:12',
  },
  {
    reservationNumber: 'LIB-20261009-0914',
    bookOrSeatName: '중앙 열람석 A-03',
    userName: '김민수',
    userEmail: 'minsu.kim@iceu.kr',
    reservationDate: '2026-10-09',
    timeSlot: '13:00~18:00',
    status: '예약완료',
    createdAt: '2026-10-09 09:14:05',
  },
  {
    reservationNumber: 'LIB-20261009-1025',
    bookOrSeatName: '노트북석 L-04',
    userName: '이지원',
    userEmail: 'jiwon.lee@iceu.kr',
    reservationDate: '2026-10-09',
    timeSlot: '09:00~18:00 (종일)',
    status: '예약완료',
    createdAt: '2026-10-09 10:25:44',
  },
  {
    reservationNumber: 'LIB-20261008-0412',
    bookOrSeatName: '창가 1인석 W-05',
    userName: '정예찬',
    userEmail: 'jyc797@iceu.kr',
    reservationDate: '2026-10-08',
    timeSlot: '13:00~18:00',
    status: '취소됨',
    createdAt: '2026-10-08 11:20:00',
  },
  {
    reservationNumber: 'LIB-20261009-1102',
    bookOrSeatName: '스터디룸 S-01 (4인실)',
    userName: '박서연',
    userEmail: 'sy.park@iceu.kr',
    reservationDate: '2026-10-09',
    timeSlot: '14:00~18:00',
    status: '예약완료',
    createdAt: '2026-10-09 11:02:18',
  },
];
