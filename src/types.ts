export interface Reservation {
  reservationNumber: string; // 예약번호 (예: LIB-20261009-1001)
  bookOrSeatName: string;    // 도서명 (좌석명 또는 도서명)
  userName: string;          // 예약자명
  userEmail: string;         // 이메일
  reservationDate: string;   // 예약일자 (YYYY-MM-DD)
  timeSlot: string;          // 이용시간대 (예: 09:00~13:00)
  status: '예약완료' | '취소됨'; // 상태
  createdAt?: string;        // 등록일시
}

export interface LibrarySeat {
  id: string;               // 좌석 식별자 (예: W-01, A-01, S-01)
  name: string;             // 좌석명 (예: 창가 1인석 W-01)
  zone: 'window' | 'main' | 'laptop' | 'study'; // 구역
  zoneName: string;         // 구역명 (창가 집중석, 중앙 열람석, 노트북 존, 스터디룸)
  x: number;                // 평면도상 X 좌표 (%)
  y: number;                // 평면도상 Y 좌표 (%)
  features: string[];       // 특징 (개인콘센트, LED조명, 모니터거치대 등)
  capacity?: number;        // 인원수 (스터디룸의 경우)
}

export interface LibraryBook {
  bookId: string;           // 도서ID
  bookTitle: string;        // 도서명
  author: string;           // 저자
  category: string;         // 카테고리
}

export interface ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data?: T;
  reservationNumber?: string;
  reservation?: Reservation;
  reservations?: Reservation[];
  emailSent?: boolean;
}
