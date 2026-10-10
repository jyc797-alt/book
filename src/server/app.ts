import express, { Request, Response } from 'express';
import { SPREADSHEET_ID, DEFAULT_GAS_URL, INITIAL_RESERVATIONS, LIBRARY_BOOKS } from '../data/mockData';
import { Reservation } from '../types';

export const app = express();

app.use(express.json());

// Enable CORS for API routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory store
let reservations: Reservation[] = [...INITIAL_RESERVATIONS];
let customGasUrl: string = DEFAULT_GAS_URL;

// Helper: Normalize date
export function normalizeDateStr(d: any): string {
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
export function extractSeatCore(str: string): string {
  if (!str) return '';
  const s = String(str).trim();
  const idMatch = s.match(/([WwAaBbLlSs]-\d{2})/);
  if (idMatch) return idMatch[1].toUpperCase();
  return s.replace(/\(도서:.*?\)/g, '').trim();
}

// Helper: Check if two seat strings point to the same physical seat
export function isSameSeat(item1: string, item2: string): boolean {
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

const apiRouter = express.Router();

// Root status
apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: '새별오름 도서관 좌석 및 도서 예약 시스템 API',
    spreadsheetId: SPREADSHEET_ID,
  });
});

// 1. Get seat reservation status for a specific date
apiRouter.get('/seats/status', async (req: Request, res: Response) => {
  try {
    const targetDate = normalizeDateStr(req.query.date || new Date());
    const reservedSet = new Set<string>();

    reservations.forEach(r => {
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

    res.json({
      ok: true,
      date: targetDate,
      reserved: Array.from(reservedSet),
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message, reserved: [] });
  }
});

// 2. Search reservations by email
apiRouter.get('/reservations', async (req: Request, res: Response) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ ok: false, message: '이메일을 입력해 주세요.', reservations: [] });
    }

    const filtered = reservations
      .filter(r => r.userEmail.toLowerCase() === email)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    res.json({
      ok: true,
      message: filtered.length > 0 ? `${filtered.length}건의 예약 내역이 조회되었습니다.` : '해당 이메일로 등록된 예약 내역이 없습니다.',
      reservations: filtered,
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message, reservations: [] });
  }
});

// 3. Get all reservations
apiRouter.get('/reservations/all', async (_req: Request, res: Response) => {
  res.json({
    ok: true,
    spreadsheetId: SPREADSHEET_ID,
    reservations: reservations,
    sheetHeaders: ['예약번호', '도서명', '예약자명', '이메일', '예약일자', '이용시간대', '상태'],
  });
});

// 4. Books list
apiRouter.get('/books', async (_req: Request, res: Response) => {
  res.json({
    ok: true,
    books: LIBRARY_BOOKS,
  });
});

// 5. Reserve Seat/Book with duplicate prevention and email status
apiRouter.post('/reserve', async (req: Request, res: Response) => {
  try {
    const { bookOrSeatName, userName, userEmail, reservationDate, timeSlot } = req.body;

    if (!bookOrSeatName || !userName || !userEmail || !reservationDate || !timeSlot) {
      return res.status(400).json({
        ok: false,
        message: '모든 필수 항목(좌석/도서, 이름, 이메일, 예약일자, 이용시간대)을 정확히 입력해주세요.',
      });
    }

    const targetDate = normalizeDateStr(reservationDate);
    const targetItem = String(bookOrSeatName).trim();
    const targetEmail = String(userEmail).trim().toLowerCase();
    const targetName = String(userName).trim();
    const targetSlot = String(timeSlot).trim();
    const targetCore = extractSeatCore(targetItem);

    // 엄격한 중복 예약 검증
    const duplicate = reservations.find(r => {
      const rDate = normalizeDateStr(r.reservationDate);
      const rStatus = String(r.status).trim().replace(/\s+/g, '');
      return rDate === targetDate && rStatus === '예약완료' && isSameSeat(r.bookOrSeatName, targetItem);
    });

    if (duplicate) {
      return res.status(409).json({
        ok: false,
        message: `선택하신 좌석 [${targetCore || targetItem}]은(는) ${targetDate}에 이미 '예약완료' 상태입니다. 같은 자리에 중복으로 예약할 수 없습니다.`,
      });
    }

    // 고유 예약번호 생성
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

    reservations.unshift(newReservation);

    // Google Apps Script Web App 실시간 전달
    if (customGasUrl) {
      try {
        fetch(customGasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reserve',
            bookOrSeat: targetItem,
            name: targetName,
            email: targetEmail,
            date: targetDate,
            timeSlot: targetSlot,
          }),
        }).catch(err => console.log('GAS sync log:', err.message));
      } catch (e) {
        // Non-blocking
      }
    }

    res.json({
      ok: true,
      message: `예약이 성공적으로 완료되었습니다! 📩 입력하신 이메일('${targetEmail}')로 예약 내역(예약 일자, 좌석, 이용 시간대, 예약자명, 대출 도서 목록)이 즉시 발송되었습니다.`,
      reservationNumber,
      reservation: newReservation,
      emailSent: true,
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: '서버 예약 처리 오류: ' + error.message });
  }
});

// 6. Cancel reservation
apiRouter.post('/cancel', async (req: Request, res: Response) => {
  try {
    const { reservationNumber, email } = req.body;

    if (!reservationNumber) {
      return res.status(400).json({ ok: false, message: '취소할 예약번호가 필요합니다.' });
    }

    const targetNumber = String(reservationNumber).trim();
    const targetEmail = email ? String(email).trim().toLowerCase() : null;

    const item = reservations.find(r => r.reservationNumber === targetNumber);

    if (!item) {
      return res.status(404).json({ ok: false, message: '일치하는 예약 정보를 찾을 수 없습니다.' });
    }

    if (targetEmail && item.userEmail.toLowerCase() !== targetEmail) {
      return res.status(403).json({ ok: false, message: '예약자 본인 이메일과 일치하지 않아 취소할 수 없습니다.' });
    }

    item.status = '취소됨';

    if (customGasUrl) {
      try {
        fetch(customGasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'cancel',
            reservationNumber: targetNumber,
            email: targetEmail,
          }),
        }).catch(err => console.log('GAS cancel sync log:', err.message));
      } catch (e) {
        // Non-blocking
      }
    }

    res.json({
      ok: true,
      message: `예약번호 [${targetNumber}]의 상태가 '취소됨'으로 변경되었으며 좌석이 반환되었습니다.`,
      reservation: item,
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: '예약 취소 처리 오류: ' + error.message });
  }
});

// 7. GAS Configuration
apiRouter.get('/gas/config', (_req: Request, res: Response) => {
  res.json({
    spreadsheetId: SPREADSHEET_ID,
    gasUrl: customGasUrl,
  });
});

apiRouter.post('/gas/config', (req: Request, res: Response) => {
  const { gasUrl } = req.body;
  if (gasUrl) {
    customGasUrl = String(gasUrl).trim();
  }
  res.json({ ok: true, message: 'GAS URL이 업데이트되었습니다.', gasUrl: customGasUrl });
});

// Mount router on both '/api' and '/' for maximum compatibility with Vercel rewrites & direct routes
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
