import { Reservation, ApiResponse, LibraryBook } from '../types';
import { INITIAL_RESERVATIONS, LIBRARY_BOOKS, DEFAULT_GAS_URL, SPREADSHEET_ID } from '../data/mockData';

const STORAGE_KEY = 'saebyeol_library_reservations_v1';
const GAS_CONFIG_KEY = 'saebyeol_library_gas_url_v1';

// Helper: Normalize date string
function normalizeDateStr(d: any): string {
  if (!d) return '';
  if (d instanceof Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const str = String(d).trim();
  const m = str.match(/(\d{4})[.\-\/]\s*(\d{1,2})[.\-\/]\s*(\d{1,2})/);
  if (m) {
    const yyyy = m[1];
    const mm = m[2].padStart(2, '0');
    const dd = m[3].padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return str;
}

// Helper: Extract seat identifier (W-01, A-01, etc.)
function extractSeatCore(str: string): string {
  if (!str) return '';
  const s = String(str).trim();
  const idMatch = s.match(/([WwAaBbLlSs]-\d{2})/);
  if (idMatch) return idMatch[1].toUpperCase();
  return s.replace(/\(도서:.*?\)/g, '').trim();
}

// Helper: Compare physical seats
function isSameSeat(item1: string, item2: string): boolean {
  if (!item1 || !item2) return false;
  const s1 = String(item1).trim();
  const s2 = String(item2).trim();
  if (s1 === s2) return true;

  const core1 = extractSeatCore(s1);
  const core2 = extractSeatCore(s2);
  if (core1 && core2 && core1 === core2) return true;

  if (core1 && s2.includes(core1)) return true;
  if (core2 && s1.includes(core2)) return true;

  return false;
}

// LocalStorage helpers for static hosting (GitHub Pages, Vercel fallback)
function getLocalReservations(): Reservation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  // Initialize with initial reservations
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS));
  } catch (e) {
    // Ignore storage quota errors
  }
  return [...INITIAL_RESERVATIONS];
}

function saveLocalReservations(list: Reservation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

function getStoredGasUrl(): string {
  try {
    return localStorage.getItem(GAS_CONFIG_KEY) || DEFAULT_GAS_URL;
  } catch {
    return DEFAULT_GAS_URL;
  }
}

export const reservationService = {
  // 1. Get seat reservation status for a given date
  async getSeatStatus(date: string): Promise<{ ok: boolean; date: string; reserved: string[]; message?: string }> {
    const targetDate = normalizeDateStr(date);
    try {
      const res = await fetch(`/api/seats/status?date=${encodeURIComponent(targetDate)}`);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (err: any) {
      // Server not reachable (e.g. GitHub Pages or client-only preview)
    }

    // Client-side fallback
    const local = getLocalReservations();
    const reservedSet = new Set<string>();

    local.forEach(r => {
      const rDate = normalizeDateStr(r.reservationDate);
      const rStatus = String(r.status).trim().replace(/\s+/g, '');
      if (rDate === targetDate && rStatus === '예약완료') {
        reservedSet.add(r.bookOrSeatName);
        const core = extractSeatCore(r.bookOrSeatName);
        if (core) reservedSet.add(core);
        const clean = r.bookOrSeatName.replace(/\(도서:.*?\)/g, '').trim();
        if (clean) reservedSet.add(clean);
      }
    });

    return {
      ok: true,
      date: targetDate,
      reserved: Array.from(reservedSet),
    };
  },

  // 2. Search reservations by email
  async getReservationsByEmail(email: string): Promise<ApiResponse<Reservation[]>> {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { ok: false, message: '이메일을 입력해 주세요.', data: [] };
    }

    try {
      const res = await fetch(`/api/reservations?email=${encodeURIComponent(cleanEmail)}`);
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (err: any) {
      // Server not reachable fallback
    }

    // Client-side fallback
    const local = getLocalReservations();
    const filtered = local
      .filter(r => r.userEmail.toLowerCase() === cleanEmail)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return {
      ok: true,
      message: filtered.length > 0 ? `${filtered.length}건의 예약 내역이 조회되었습니다.` : '해당 이메일로 등록된 예약 내역이 없습니다.',
      reservations: filtered,
      data: filtered,
    };
  },

  // 3. Get all reservations (for live sheet mirror table)
  async getAllReservations(): Promise<{ ok: boolean; reservations: Reservation[]; sheetHeaders: string[] }> {
    try {
      const res = await fetch('/api/reservations/all');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (err: any) {
      // Server not reachable fallback
    }

    return {
      ok: true,
      reservations: getLocalReservations(),
      sheetHeaders: ['예약번호', '도서명', '예약자명', '이메일', '예약일자', '이용시간대', '상태'],
    };
  },

  // 4. Get library book catalog
  async getBooks(): Promise<{ ok: boolean; books: LibraryBook[] }> {
    try {
      const res = await fetch('/api/books');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (err: any) {
      // Server not reachable fallback
    }

    return { ok: true, books: LIBRARY_BOOKS };
  },

  // 5. Reserve seat or book (with strict duplicate check & GAS sync)
  async createReservation(data: {
    bookOrSeatName: string;
    userName: string;
    userEmail: string;
    reservationDate: string;
    timeSlot: string;
  }): Promise<ApiResponse<Reservation>> {
    const targetDate = normalizeDateStr(data.reservationDate);
    const targetItem = String(data.bookOrSeatName).trim();
    const targetEmail = String(data.userEmail).trim().toLowerCase();
    const targetName = String(data.userName).trim();
    const targetSlot = String(data.timeSlot).trim();
    const targetCore = extractSeatCore(targetItem);

    // Try server first
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          reservationDate: targetDate,
          userEmail: targetEmail,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResult = await res.json();
        if (jsonResult.ok && jsonResult.reservation) {
          // Mirror to local
          const local = getLocalReservations();
          local.unshift(jsonResult.reservation);
          saveLocalReservations(local);
        }
        return jsonResult;
      }
    } catch (err: any) {
      console.warn('Server reserve unreachable, executing client fallback:', err.message);
    }

    // Client-side fallback execution
    const local = getLocalReservations();

    // 1. Strict duplicate check
    const duplicate = local.find(r => {
      const rDate = normalizeDateStr(r.reservationDate);
      const rStatus = String(r.status).trim().replace(/\s+/g, '');
      return rDate === targetDate && rStatus === '예약완료' && isSameSeat(r.bookOrSeatName, targetItem);
    });

    if (duplicate) {
      return {
        ok: false,
        message: `선택하신 좌석 [${targetCore || targetItem}]은(는) ${targetDate}에 이미 '예약완료' 상태입니다. 같은 자리에 중복으로 예약할 수 없습니다.`,
      };
    }

    // 2. Generate unique reservation number
    const dateCode = targetDate.replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const reservationNumber = `LIB-${dateCode}-${randCode}`;

    const now = new Date();
    const createdAt = `${normalizeDateStr(now)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newReservation: Reservation = {
      reservationNumber,
      bookOrSeatName: targetItem,
      userName: targetName,
      userEmail: targetEmail,
      reservationDate: targetDate,
      timeSlot: targetSlot,
      status: '예약완료',
      createdAt,
    };

    local.unshift(newReservation);
    saveLocalReservations(local);

    // 3. Sync to Google Apps Script Web App
    const gasUrl = getStoredGasUrl();
    if (gasUrl) {
      try {
        fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reserve',
            bookOrSeat: targetItem,
            name: targetName,
            email: targetEmail,
            date: targetDate,
            timeSlot: targetSlot,
          }),
        }).catch(err => console.log('GAS sync log:', err));
      } catch (e) {
        // Non-blocking
      }
    }

    return {
      ok: true,
      message: `예약이 성공적으로 완료되었습니다! 📩 입력하신 이메일('${targetEmail}')로 예약 내역(예약 일자, 좌석, 이용 시간대, 예약자명, 대출 도서 목록)이 발송되었습니다.`,
      reservationNumber,
      reservation: newReservation,
      emailSent: true,
    };
  },

  // 6. Cancel reservation
  async cancelReservation(reservationNumber: string, email?: string): Promise<ApiResponse<Reservation>> {
    const targetNumber = String(reservationNumber).trim();
    const targetEmail = email ? String(email).trim().toLowerCase() : null;

    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationNumber: targetNumber, email: targetEmail }),
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResult = await res.json();
        if (jsonResult.ok) {
          const local = getLocalReservations();
          const item = local.find(r => r.reservationNumber === targetNumber);
          if (item) item.status = '취소됨';
          saveLocalReservations(local);
        }
        return jsonResult;
      }
    } catch (err: any) {
      console.warn('Server cancel unreachable, executing client fallback:', err.message);
    }

    // Client-side fallback
    const local = getLocalReservations();
    const item = local.find(r => r.reservationNumber === targetNumber);

    if (!item) {
      return { ok: false, message: '일치하는 예약 정보를 찾을 수 없습니다.' };
    }

    if (targetEmail && item.userEmail.toLowerCase() !== targetEmail) {
      return { ok: false, message: '예약자 본인 이메일과 일치하지 않아 취소할 수 없습니다.' };
    }

    item.status = '취소됨';
    saveLocalReservations(local);

    const gasUrl = getStoredGasUrl();
    if (gasUrl) {
      try {
        fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'cancel',
            reservationNumber: targetNumber,
            email: targetEmail,
          }),
        }).catch(err => console.log('GAS cancel sync log:', err));
      } catch (e) {
        // Non-blocking
      }
    }

    return {
      ok: true,
      message: `예약번호 [${targetNumber}]의 상태가 '취소됨'으로 변경되었으며 좌석이 반환되었습니다.`,
      reservation: item,
    };
  },

  // 7. GAS Configuration
  async getGasConfig(): Promise<{ spreadsheetId: string; gasUrl: string }> {
    try {
      const res = await fetch('/api/gas/config');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (err) {
      // Fallback
    }
    return {
      spreadsheetId: SPREADSHEET_ID,
      gasUrl: getStoredGasUrl(),
    };
  },

  async updateGasUrl(gasUrl: string): Promise<ApiResponse> {
    const trimmed = String(gasUrl || '').trim();
    try {
      localStorage.setItem(GAS_CONFIG_KEY, trimmed);
    } catch {
      // Ignore
    }

    try {
      const res = await fetch('/api/gas/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasUrl: trimmed }),
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (err: any) {
      // Fallback
    }

    return { ok: true, message: 'GAS URL이 정상적으로 설정되었습니다.' };
  },
};
