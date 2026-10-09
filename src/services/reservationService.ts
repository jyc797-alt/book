import { Reservation, ApiResponse, LibraryBook } from '../types';

export const reservationService = {
  // 1. Get seat reservation status for a given date
  async getSeatStatus(date: string): Promise<{ ok: boolean; date: string; reserved: string[]; message?: string }> {
    try {
      const res = await fetch(`/api/seats/status?date=${encodeURIComponent(date)}`);
      if (!res.ok) throw new Error('서버 응답 오류 (' + res.status + ')');
      return await res.json();
    } catch (err: any) {
      console.warn('API fetch fallback:', err.message);
      return { ok: true, date, reserved: [] };
    }
  },

  // 2. Search reservations by email (Task 1)
  async getReservationsByEmail(email: string): Promise<ApiResponse<Reservation[]>> {
    try {
      const res = await fetch(`/api/reservations?email=${encodeURIComponent(email)}`);
      return await res.json();
    } catch (err: any) {
      return { ok: false, message: '예약 내역 조회 중 오류: ' + err.message, data: [] };
    }
  },

  // 3. Get all reservations (for live sheet mirror table)
  async getAllReservations(): Promise<{ ok: boolean; reservations: Reservation[]; sheetHeaders: string[] }> {
    try {
      const res = await fetch('/api/reservations/all');
      return await res.json();
    } catch (err: any) {
      return { ok: false, reservations: [], sheetHeaders: [] };
    }
  },

  // 4. Get library book catalog
  async getBooks(): Promise<{ ok: boolean; books: LibraryBook[] }> {
    try {
      const res = await fetch('/api/books');
      return await res.json();
    } catch (err: any) {
      return { ok: false, books: [] };
    }
  },

  // 5. Reserve seat or book (Task 2 with duplicate check)
  async createReservation(data: {
    bookOrSeatName: string;
    userName: string;
    userEmail: string;
    reservationDate: string;
    timeSlot: string;
  }): Promise<ApiResponse<Reservation>> {
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, message: '예약 요청 실패: ' + err.message };
    }
  },

  // 6. Cancel reservation (Task 1)
  async cancelReservation(reservationNumber: string, email?: string): Promise<ApiResponse<Reservation>> {
    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationNumber, email }),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, message: '예약 취소 실패: ' + err.message };
    }
  },

  // 7. Test GAS URL config
  async getGasConfig(): Promise<{ spreadsheetId: string; gasUrl: string }> {
    try {
      const res = await fetch('/api/gas/config');
      return await res.json();
    } catch (err: any) {
      return { spreadsheetId: '1yArHVbhR1F4uHnjuIqFDLn_4GeLesQGSMY4Bc4mXpqk', gasUrl: '' };
    }
  },

  async updateGasUrl(gasUrl: string): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/gas/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasUrl }),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, message: 'GAS URL 업데이트 실패: ' + err.message };
    }
  },
};
