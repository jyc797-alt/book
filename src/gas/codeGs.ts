/**
 * Google Apps Script - Code.gs
 * 스프레드시트 ID: 1yArHVbhR1F4uHnjuIqFDLn_4GeLesQGSMY4Bc4mXpqk
 * 
 * 시트 구조:
 * - '예약목록': [예약번호, 도서명, 예약자명, 이메일, 예약일자, 이용시간대, 상태]
 * - '도서목록': [도서ID, 도서명, 저자, 카테고리]
 * 
 * 주요 기능:
 * 1. 완벽한 중복 예약 방지 (LockService 및 좌석 식별자 정규화 매칭)
 * 2. 예약 확정 시 자동 이메일 발송 (좌석 예약 및 도서 대출 상황 상세 안내)
 * 3. 이메일 기반 예약 조회 및 실시간 취소
 */

export const CODE_GS_CONTENT = `/**
 * ==============================================================================
 * 도서관 좌석 및 도서 예약 시스템 - Google Apps Script (Code.gs)
 * ==============================================================================
 * - 스프레드시트 ID: 1yArHVbhR1F4uHnjuIqFDLn_4GeLesQGSMY4Bc4mXpqk
 * - '예약목록' 시트 컬럼: 예약번호, 도서명, 예약자명, 이메일, 예약일자, 이용시간대, 상태
 * - '도서목록' 시트 컬럼: 도서ID, 도서명, 저자, 카테고리
 */

const SPREADSHEET_ID = '1yArHVbhR1F4uHnjuIqFDLn_4GeLesQGSMY4Bc4mXpqk';
const SHEET_RESERVATIONS = '예약목록';
const SHEET_BOOKS = '도서목록';

/**
 * [유틸리티] 좌석 고유 식별자 추출 (W-01, A-03, L-02 등)
 * - '창가 1인석 W-01 (도서: ...)' 에서 코어 좌석 'W-01' 또는 기본 좌석명을 정확히 추출
 */
function extractSeatCore(str) {
  if (!str) return '';
  str = String(str).trim();
  // 1. 좌석 ID 패턴 (W-01, A-01, B-01, L-01, S-01 등) 추출
  const idMatch = str.match(/([WwAaBbLlSs]-\d{2})/);
  if (idMatch) return idMatch[1].toUpperCase();

  // 2. 도서명 부가 설명 제거 (도서: ...)
  return str.replace(/\\(도서:.*?\\)/g, '').trim();
}

/**
 * [유틸리티] 두 좌석이 동일한 물리적 좌석인지 정밀 판별
 */
function isSameSeat(item1, item2) {
  if (!item1 || !item2) return false;
  const s1 = String(item1).trim();
  const s2 = String(item2).trim();
  if (s1 === s2) return true;

  const core1 = extractSeatCore(s1);
  const core2 = extractSeatCore(s2);
  if (core1 && core2 && core1 === core2) return true;

  if (core1 && s2.indexOf(core1) !== -1) return true;
  if (core2 && s1.indexOf(core2) !== -1) return true;

  return false;
}

/**
 * [유틸리티] 날짜 표준화 (YYYY-MM-DD 형태로 변환)
 */
function normalizeDateStr(d) {
  if (!d) return '';
  if (d instanceof Date) {
    return Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd');
  }
  const str = String(d).trim();
  const m = str.match(/(\\d{4})[.\\-\\/]\\s*(\\d{1,2})[.\\-\\/]\\s*(\\d{1,2})/);
  if (m) {
    const yyyy = m[1];
    const mm = m[2].length === 1 ? '0' + m[2] : m[2];
    const dd = m[3].length === 1 ? '0' + m[3] : m[3];
    return yyyy + '-' + mm + '-' + dd;
  }
  return str;
}

/**
 * 웹앱 진입점 (HTML 서빙 및 REST API 지원)
 */
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action) {
      const action = e.parameter.action;
      
      if (action === 'getSeatStatus') {
        const date = e.parameter.date || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
        return createJsonResponse(getSeatStatus(date));
      }
      
      if (action === 'getReservations') {
        return createJsonResponse(getReservationsByEmail(e.parameter.email));
      }

      if (action === 'getAllReservations') {
        return createJsonResponse(getAllReservations());
      }

      if (action === 'getBooks') {
        return createJsonResponse(getBookList());
      }
    }

    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('도서관 좌석 및 도서 예약 시스템')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    return createJsonResponse({ ok: false, message: 'doGet 처리 오류: ' + error.message });
  }
}

/**
 * POST 요청 처리 (외부 fetch 연동 대응)
 */
function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action || (e && e.parameter ? e.parameter.action : '');

    if (action === 'reserve') {
      return createJsonResponse(saveReservation(postData));
    }

    if (action === 'cancel') {
      return createJsonResponse(cancelReservation(postData.reservationNumber, postData.email));
    }

    return createJsonResponse({ ok: false, message: '알 수 없는 요청 action 입니다.' });
  } catch (error) {
    return createJsonResponse({ ok: false, message: 'doPost 처리 실패: ' + error.message });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 시트 객체 가져오기 (헤더 초기화 보장)
 */
function getTargetSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (sheetName === SHEET_RESERVATIONS) {
      sheet.appendRow(['예약번호', '도서명', '예약자명', '이메일', '예약일자', '이용시간대', '상태']);
      sheet.getRange(1, 1, 1, 7).setBackground('#f3f4f6').setFontWeight('bold');
    } else if (sheetName === SHEET_BOOKS) {
      sheet.appendRow(['도서ID', '도서명', '저자', '카테고리']);
      sheet.getRange(1, 1, 1, 4).setBackground('#f3f4f6').setFontWeight('bold');
      sheet.appendRow(['BK-101', '인공지능 시대를 위한 컴퓨터 과학 개론', '김지훈', '컴퓨터/IT']);
      sheet.appendRow(['BK-102', '클린 코드: 애자일 소프트웨어 장인 정신', '로버트 C. 마틴', '프로그래밍']);
      sheet.appendRow(['BK-103', '구글 앱스 스크립트 완벽 가이드', '박성호', '클라우드']);
    }
  }
  return sheet;
}

/**
 * [Task 4] 특정 날짜의 좌석 예약 현황 조회 (모든 예약된 좌석 ID 및 전체 명칭 반환)
 */
function getSeatStatus(targetDate) {
  try {
    const formattedDate = normalizeDateStr(targetDate);
    const sheet = getTargetSheet(SHEET_RESERVATIONS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { ok: true, date: formattedDate, reserved: [] };
    }

    const reservedSet = {};
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = normalizeDateStr(row[4]);
      const bookOrSeat = String(row[1]).trim();
      const status = String(row[6]).trim().replace(/\\s+/g, '');

      if (rowDate === formattedDate && status === '예약완료') {
        reservedSet[bookOrSeat] = true;
        const coreId = extractSeatCore(bookOrSeat);
        if (coreId) {
          reservedSet[coreId] = true;
        }
        const cleanName = bookOrSeat.replace(/\\(도서:.*?\\)/g, '').trim();
        if (cleanName) {
          reservedSet[cleanName] = true;
        }
      }
    }

    return {
      ok: true,
      date: formattedDate,
      reserved: Object.keys(reservedSet)
    };
  } catch (error) {
    return { ok: false, message: '좌석 현황 조회 실패: ' + error.message, reserved: [] };
  }
}

/**
 * [Task 2] 신규 예약 저장 및 동시성 중복 예약 원천 차단 (LockService 적용)
 * + [신규] 예약 완료 시 예약자 이메일로 좌석 및 도서 대출 상황 상세 자동 발송
 */
function saveReservation(data) {
  // 15초 스크립트 락을 획득하여 동시 클릭 시 중복 생성 완벽 방지
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { ok: false, message: '서버가 혼잡합니다. 잠시 후 다시 시도해 주세요.' };
  }

  try {
    if (!data.bookOrSeat || !data.name || !data.email || !data.date || !data.timeSlot) {
      return { ok: false, message: '모든 필수 항목(좌석/도서, 이름, 이메일, 예약일자, 이용시간대)을 입력해주세요.' };
    }

    const sheet = getTargetSheet(SHEET_RESERVATIONS);
    const rows = sheet.getDataRange().getValues();

    const targetDate = normalizeDateStr(data.date);
    const targetBookOrSeat = String(data.bookOrSeat).trim();
    const targetEmail = String(data.email).trim().toLowerCase();
    const targetName = String(data.name).trim();
    const targetTimeSlot = String(data.timeSlot).trim();
    const targetCore = extractSeatCore(targetBookOrSeat);

    // [중복 검증 로직]: 동일 일자에 같은 코어 좌석이 이미 '예약완료' 상태이면 거절
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowDate = normalizeDateStr(row[4]);
      const rowBookOrSeat = String(row[1]).trim();
      const rowStatus = String(row[6]).trim().replace(/\\s+/g, '');

      if (rowDate === targetDate && rowStatus === '예약완료') {
        if (isSameSeat(rowBookOrSeat, targetBookOrSeat)) {
          return {
            ok: false,
            message: '선택하신 좌석 [' + (targetCore || targetBookOrSeat) + ']은(는) ' + targetDate + '에 이미 예약완료되었습니다. 다른 좌석을 선택해 주세요.'
          };
        }
      }
    }

    // 고유 예약번호 생성 (LIB-YYYYMMDD-XXXX)
    const dateStr = targetDate.replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const reservationNumber = 'LIB-' + dateStr + '-' + randomHex;

    // 시트에 추가 [예약번호, 도서명, 예약자명, 이메일, 예약일자, 이용시간대, 상태]
    sheet.appendRow([
      reservationNumber,
      targetBookOrSeat,
      targetName,
      targetEmail,
      targetDate,
      targetTimeSlot,
      '예약완료'
    ]);

    // [이메일 발송] 좌석 예약 및 도서 대출 상황 안내 메일 전송
    let emailSent = false;
    try {
      emailSent = sendConfirmationEmail({
        email: targetEmail,
        name: targetName,
        bookOrSeat: targetBookOrSeat,
        date: targetDate,
        timeSlot: targetTimeSlot,
        reservationNumber: reservationNumber
      });
    } catch (mailErr) {
      Logger.log('이메일 전송 실패: ' + mailErr.message);
    }

    return {
      ok: true,
      message: '예약이 성공적으로 완료되었습니다!' + (emailSent ? ' 예약 및 도서 대출 상황 안내 이메일이 발송되었습니다.' : ''),
      reservationNumber: reservationNumber,
      emailSent: emailSent
    };
  } catch (error) {
    Logger.log('saveReservation 오류: ' + error.message);
    return { ok: false, message: '예약 처리 중 시스템 오류가 발생했습니다: ' + error.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * [이메일 발송 함수] 좌석 예약 및 도서 대출 상황 상세 메일 발송
 */
function sendConfirmationEmail(info) {
  try {
    const to = info.email;
    const name = info.name;
    const seatFullName = info.bookOrSeat;
    const date = info.date;
    const timeSlot = info.timeSlot;
    const reservationNumber = info.reservationNumber;

    // 도서 대출 여부 추출
    const bookMatch = seatFullName.match(/\\(도서:\\s*(.*?)\\)/);
    const bookTitle = bookMatch ? bookMatch[1].trim() : null;
    const cleanSeatName = seatFullName.replace(/\\(도서:.*?\\)/g, '').trim();

    const subject = '[인천교대 도서관] 좌석 예약 및 도서 대출 신청 완료 (' + reservationNumber + ')';

    const htmlBody = 
      '<div style="font-family: -apple-system, BlinkMacSystemFont, \\'Malgun Gothic\\', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background-color: #ffffff;">' +
        '<div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">' +
          '<h2 style="color: #1e3a8a; margin: 0; font-size: 20px;">📚 인천교육대학교 도서관 예약 완료 안내</h2>' +
          '<p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0;">신청하신 좌석 예약 및 도서 대출 상황 안내 메일입니다.</p>' +
        '</div>' +

        '<p style="font-size: 14px; color: #1e293b; line-height: 1.6;">' +
          '안녕하세요, <strong>' + name + '</strong>님.<br>' +
          '도서관 좌석 및 도서 예약 신청이 정상적으로 완료되었습니다.' +
        '</p>' +

        '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">' +
          '<h3 style="color: #0f172a; margin: 0 0 14px 0; font-size: 15px; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">📋 예약 내역 확인서</h3>' +
          '<table style="width: 100%; font-size: 13px; border-collapse: collapse; line-height: 1.8;">' +
            '<tr>' +
              '<td style="padding: 7px 0; color: #64748b; width: 140px; font-weight: bold;">1. 예약자명</td>' +
              '<td style="padding: 7px 0; font-weight: bold; color: #0f172a;">' + name + '</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="padding: 7px 0; color: #64748b; font-weight: bold;">2. 예약 일자</td>' +
              '<td style="padding: 7px 0; font-weight: bold; color: #2563eb;">' + date + '</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="padding: 7px 0; color: #64748b; font-weight: bold;">3. 배정 좌석</td>' +
              '<td style="padding: 7px 0; font-weight: bold; color: #0f172a;">' + cleanSeatName + '</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="padding: 7px 0; color: #64748b; font-weight: bold;">4. 이용 시간대</td>' +
              '<td style="padding: 7px 0; color: #0f172a; font-weight: bold;">' + timeSlot + '</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="padding: 7px 0; color: #64748b; font-weight: bold;">5. 함께 대출/이용 도서</td>' +
              '<td style="padding: 7px 0; font-weight: bold; color: ' + (bookTitle ? '#166534' : '#64748b') + ';">' +
                (bookTitle ? '📖 ' + bookTitle : '선택한 도서 없음 (좌석 전용 이용)') +
              '</td>' +
            '</tr>' +
            '<tr style="border-top: 1px dashed #cbd5e1;">' +
              '<td style="padding: 7px 0; color: #64748b;">• 예약번호</td>' +
              '<td style="padding: 7px 0; font-family: monospace; font-weight: bold; color: #475569;">' + reservationNumber + '</td>' +
            '</tr>' +
          '</table>' +
        '</div>' +

        '<div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 14px; margin-bottom: 20px; font-size: 12px; color: #1e40af; line-height: 1.6;">' +
          '<strong>💡 이용 안내 및 취소 방법</strong><br>' +
          '• 예약 시간 10분 전부터 입실이 가능합니다.<br>' +
          '• 도서 대출 신청 건은 안내 데스크에서 학생증/신분증 제시 후 수령하실 수 있습니다.<br>' +
          '• 일정 변경 시 예약 웹앱의 <strong>[예약 조회 및 취소]</strong> 메뉴에서 이메일(<code>' + to + '</code>)을 입력하여 즉시 취소하실 수 있습니다.' +
        '</div>' +

        '<div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #94a3b8;">' +
          '인천교육대학교 도서관 자동 발송 시스템' +
        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody
    });
    return true;
  } catch (err) {
    Logger.log('이메일 발송 오류: ' + err.message);
    return false;
  }
}

/**
 * [Task 1] 이메일 기준 예약 내역 검색
 */
function getReservationsByEmail(userEmail) {
  try {
    if (!userEmail) {
      return { ok: false, message: '이메일을 입력해 주세요.', reservations: [] };
    }

    const emailQuery = String(userEmail).trim().toLowerCase();
    const sheet = getTargetSheet(SHEET_RESERVATIONS);
    const rows = sheet.getDataRange().getValues();
    const reservations = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowEmail = String(row[3]).trim().toLowerCase();

      if (rowEmail === emailQuery) {
        const rowDate = normalizeDateStr(row[4]);
        reservations.push({
          reservationNumber: String(row[0]).trim(),
          bookOrSeat: String(row[1]).trim(),
          name: String(row[2]).trim(),
          email: rowEmail,
          date: rowDate,
          timeSlot: String(row[5]).trim(),
          status: String(row[6]).trim()
        });
      }
    }

    reservations.reverse();

    return {
      ok: true,
      message: reservations.length > 0 ? reservations.length + '건의 예약 내역을 찾았습니다.' : '해당 이메일로 등록된 예약 내역이 없습니다.',
      reservations: reservations
    };
  } catch (error) {
    return { ok: false, message: '조회 중 오류: ' + error.message, reservations: [] };
  }
}

/**
 * [Task 1] 예약 취소 ('상태' 열을 '취소됨'으로 갱신)
 */
function cancelReservation(reservationNumber, userEmail) {
  try {
    if (!reservationNumber) {
      return { ok: false, message: '취소할 예약번호가 지정되지 않았습니다.' };
    }

    const sheet = getTargetSheet(SHEET_RESERVATIONS);
    const rows = sheet.getDataRange().getValues();
    const targetNumber = String(reservationNumber).trim();
    const targetEmail = userEmail ? String(userEmail).trim().toLowerCase() : null;

    let foundRowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = String(row[0]).trim();
      const rowEmail = String(row[3]).trim().toLowerCase();

      if (rowNumber === targetNumber) {
        if (targetEmail && rowEmail !== targetEmail) {
          return { ok: false, message: '예약자 이메일과 일치하지 않아 취소할 수 없습니다.' };
        }
        foundRowIndex = i + 1;
        break;
      }
    }

    if (foundRowIndex === -1) {
      return { ok: false, message: '일치하는 예약 내역을 찾을 수 없습니다.' };
    }

    sheet.getRange(foundRowIndex, 7).setValue('취소됨');

    return {
      ok: true,
      message: '예약번호 [' + targetNumber + ']의 예약이 성공적으로 취소되었습니다.'
    };
  } catch (error) {
    return { ok: false, message: '예약 취소 오류: ' + error.message };
  }
}

/**
 * 전체 예약 목록 조회 (관리자/시트 실시간 동기화용)
 */
function getAllReservations() {
  try {
    const sheet = getTargetSheet(SHEET_RESERVATIONS);
    const rows = sheet.getDataRange().getValues();
    const reservations = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowDate = normalizeDateStr(row[4]);
      reservations.push({
        reservationNumber: String(row[0]).trim(),
        bookOrSeatName: String(row[1]).trim(),
        userName: String(row[2]).trim(),
        userEmail: String(row[3]).trim(),
        reservationDate: rowDate,
        timeSlot: String(row[5]).trim(),
        status: String(row[6]).trim()
      });
    }

    return { ok: true, reservations: reservations };
  } catch (error) {
    return { ok: false, message: error.message, reservations: [] };
  }
}

/**
 * 도서목록 시트 조회
 */
function getBookList() {
  try {
    const sheet = getTargetSheet(SHEET_BOOKS);
    const rows = sheet.getDataRange().getValues();
    const books = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      books.push({
        bookId: String(row[0]).trim(),
        bookTitle: String(row[1]).trim(),
        author: String(row[2]).trim(),
        category: String(row[3]).trim()
      });
    }
    return { ok: true, books: books };
  } catch (error) {
    return { ok: false, message: error.message, books: [] };
  }
}
`;
