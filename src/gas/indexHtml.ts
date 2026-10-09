/**
 * Google Apps Script - Index.html
 * 구글 앱스 스크립트 웹앱 프론트엔드 코드
 * 아름다운 비주얼 디자인, 한눈에 보기 편한 배치, 사진/일러스트 스타일 그래픽 적용
 */

export const INDEX_HTML_CONTENT = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>도서관 좌석 & 도서 예약 시스템</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --success: #16a34a;
      --success-light: #dcfce7;
      --danger: #dc2626;
      --danger-light: #fee2e2;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --radius: 16px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Pretendard', -apple-system, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 20px 14px; line-height: 1.5; }
    .container { max-width: 960px; margin: 0 auto; }

    /* Visual Hero Card with Illustration Banner */
    .hero-card {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
      border-radius: var(--radius);
      color: #fff;
      padding: 28px 24px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.25);
    }
    .hero-bg-art {
      position: absolute;
      right: -20px;
      bottom: -30px;
      opacity: 0.12;
      width: 220px;
      height: 220px;
      pointer-events: none;
    }
    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 10px;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .hero-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
    .hero-desc { font-size: 13px; color: #e0e7ff; max-width: 580px; }

    .stats-bar {
      display: flex;
      gap: 12px;
      margin-top: 18px;
      flex-wrap: wrap;
    }
    .stat-pill {
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(6px);
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .stat-pill strong { font-size: 14px; color: #fff; margin-left: 4px; }

    /* Navigation Tabs */
    .tabs {
      display: flex;
      gap: 8px;
      background: #e2e8f0;
      padding: 5px;
      border-radius: 12px;
      margin-bottom: 20px;
      max-width: 380px;
      margin-left: auto;
      margin-right: auto;
    }
    .tab-btn {
      flex: 1;
      padding: 10px 14px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: #ffffff;
      color: var(--primary);
      box-shadow: 0 2px 5px rgba(0,0,0,0.06);
    }

    /* Cards */
    .card {
      background: var(--card-bg);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      padding: 22px;
      margin-bottom: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }
    .card-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Zone Visual Cards */
    .zone-section {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .zone-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
    }
    .zone-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .badge-window { background: #fef3c7; color: #92400e; }
    .badge-main { background: #dbeafe; color: #1e40af; }
    .badge-laptop { background: #f3e8ff; color: #6b21a8; }
    .badge-study { background: #e0e7ff; color: #3730a3; }

    /* Seat Buttons */
    .seat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
      gap: 8px;
    }
    .seat-btn {
      aspect-ratio: 1.1;
      border: 2px solid;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fff;
      transition: all 0.15s;
    }
    .seat-btn.available {
      border-color: #86efac;
      background-color: #f0fdf4;
      color: #166534;
    }
    .seat-btn.available:hover {
      background-color: #dcfce7;
      border-color: #22c55e;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(22, 163, 74, 0.12);
    }
    .seat-btn.taken {
      border-color: #fca5a5;
      background-color: #fef2f2;
      color: #991b1b;
      cursor: not-allowed;
      opacity: 0.65;
      text-decoration: line-through;
    }
    .seat-btn.selected {
      border-color: var(--primary) !important;
      background-color: #dbeafe !important;
      color: #1e40af !important;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.3);
      transform: scale(1.03);
    }

    /* Selected Item Box */
    .selected-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Form Fields */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 4px;
    }
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 13px;
      background: #fff;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
    }
    .btn-submit:hover { background: var(--primary-hover); }
    .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }

    /* Alert Banner */
    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      margin-top: 14px;
      display: none;
      font-weight: 500;
    }
    .alert.success { background: var(--success-light); color: #14532d; border: 1px solid #bbf7d0; display: block; }
    .alert.error { background: var(--danger-light); color: #7f1d1d; border: 1px solid #fecaca; display: block; }
    .alert.info { background: #eff6ff; color: #1e3a8a; border: 1px solid #bfdbfe; display: block; }

    /* Reservation Cards */
    .reservation-card {
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
    .status-badge.active { background: #dcfce7; color: #15803d; }
    .status-badge.cancelled { background: #fee2e2; color: #b91c1c; }
    .btn-cancel {
      padding: 7px 12px;
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-cancel:hover { background: #fecaca; }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Visual Hero Card -->
    <div class="hero-card">
      <svg class="hero-bg-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
        <path d="M6 6h10M6 10h10M6 14h6"/>
      </svg>
      <div class="hero-tag">✨ 실시간 구글 시트 연동 시스템</div>
      <h1 class="hero-title">도서관 좌석 및 열람실 스마트 예약</h1>
      <p class="hero-desc">구역별 분위기를 확인하고 원하는 좌석을 선택하세요. 동일 일자 중복 예약은 차단되며 등록한 이메일로 언제든 직접 조회 및 취소할 수 있습니다.</p>
      
      <div class="stats-bar">
        <div class="stat-pill">예약일자: <strong id="stat-date">-</strong></div>
        <div class="stat-pill">예약가능: <strong id="stat-available" style="color:#86efac;">계산중...</strong></div>
        <div class="stat-pill">예약마감: <strong id="stat-taken" style="color:#fca5a5;">-</strong></div>
      </div>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="tabs">
      <button class="tab-btn active" id="tab-reserve" onclick="switchTab('reserve')">🪑 좌석 예약</button>
      <button class="tab-btn" id="tab-lookup" onclick="switchTab('lookup')">🔍 예약 조회 및 취소</button>
    </div>

    <!-- 1. 예약 탭 -->
    <div id="view-reserve">
      <div class="card">
        <div class="card-title">
          <span>열람실 구역 및 좌석 선택</span>
          <div style="font-size:12px; font-weight:normal;">
            날짜 선택: <input type="date" id="date-selector" class="form-control" style="display:inline-block; width:auto; padding:4px 8px;" onchange="loadSeatStatus()">
          </div>
        </div>

        <!-- ZONE A: 창가 1인석 -->
        <div class="zone-section">
          <div class="zone-header">
            <div>
              <span class="zone-badge badge-window">ZONE A</span>
              <strong style="margin-left:6px; font-size:13px;">🌿 창가 1인 집중존</strong>
              <span style="font-size:11px; color:var(--text-muted); margin-left:4px;">(통창 자연채광 / 개인 콘센트)</span>
            </div>
            <span style="font-size:11px; color:#166534;" id="count-window">6석</span>
          </div>
          <div class="seat-grid" id="zone-window"></div>
        </div>

        <!-- ZONE B: 중앙 오픈 열람존 -->
        <div class="zone-section">
          <div class="zone-header">
            <div>
              <span class="zone-badge badge-main">ZONE B</span>
              <strong style="margin-left:6px; font-size:13px;">📖 중앙 오픈 열람존</strong>
              <span style="font-size:11px; color:var(--text-muted); margin-left:4px;">(대형 원목 테이블 / 여유로운 독서)</span>
            </div>
            <span style="font-size:11px; color:#166534;" id="count-main">12석</span>
          </div>
          <div class="seat-grid" id="zone-main"></div>
        </div>

        <!-- ZONE C & D -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          <div class="zone-section">
            <div class="zone-header">
              <div>
                <span class="zone-badge badge-laptop">ZONE C</span>
                <strong style="margin-left:6px; font-size:13px;">💻 노트북존</strong>
              </div>
              <span style="font-size:11px; color:#166534;" id="count-laptop">6석</span>
            </div>
            <div class="seat-grid" id="zone-laptop"></div>
          </div>

          <div class="zone-section">
            <div class="zone-header">
              <div>
                <span class="zone-badge badge-study">ZONE D</span>
                <strong style="margin-left:6px; font-size:13px;">👥 스터디룸</strong>
              </div>
              <span style="font-size:11px; color:#166534;" id="count-study">2실</span>
            </div>
            <div class="seat-grid" id="zone-study"></div>
          </div>
        </div>
      </div>

      <!-- 예약 정보 입력 폼 -->
      <div class="card">
        <h3 class="card-title">📝 예약 정보 입력</h3>
        
        <div class="selected-box" id="selected-box">
          <div>
            <span style="font-size:11px; color:#2563eb; font-weight:bold;">선택된 좌석</span>
            <div style="font-size:15px; font-weight:bold;" id="selected-text">위 평면도에서 초록색 좌석을 클릭해 주세요</div>
          </div>
          <span class="status-badge active" id="selected-badge" style="display:none;">선택 완료</span>
        </div>

        <form onsubmit="handleReserveSubmit(event)">
          <input type="hidden" id="seat-input" required>
          <div class="form-grid">
            <div class="form-group">
              <label>예약일자 *</label>
              <input type="date" id="date-input" class="form-control" required onchange="syncDate(this.value)">
            </div>
            <div class="form-group">
              <label>이용시간대 *</label>
              <select id="timeslot-input" class="form-control" required>
                <option value="09:00~13:00 (오전)">09:00 ~ 13:00 (오전)</option>
                <option value="13:00~18:00 (오후)">13:00 ~ 18:00 (오후)</option>
                <option value="18:00~22:00 (야간)">18:00 ~ 22:00 (야간)</option>
                <option value="09:00~22:00 (종일)">09:00 ~ 22:00 (종일)</option>
              </select>
            </div>
            <div class="form-group">
              <label>예약자 성함 *</label>
              <input type="text" id="name-input" class="form-control" placeholder="홍길동" required>
            </div>
            <div class="form-group">
              <label>이메일 주소 *</label>
              <input type="email" id="email-input" class="form-control" placeholder="example@iceu.kr" required>
            </div>
          </div>
          <button type="submit" id="btn-submit" class="btn-submit">좌석 예약 신청하기</button>
          <div id="reserve-alert" class="alert"></div>
        </form>
      </div>
    </div>

    <!-- 2. 예약 내역 조회 및 취소 탭 -->
    <div id="view-lookup" class="hidden">
      <div class="card">
        <h3 class="card-title">🔍 내 예약 내역 조회 및 실시간 취소</h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:14px;">
          예약 등록 시 사용한 이메일을 입력하시면 구글 시트 '예약목록'에서 실시간으로 검색합니다.
        </p>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input type="email" id="lookup-email" class="form-control" placeholder="예: jyc797@iceu.kr" style="flex:1;">
          <button class="btn-submit" style="width:auto; padding:10px 20px;" onclick="searchReservations()">조회하기</button>
        </div>
        <div id="lookup-alert" class="alert"></div>
        <div id="lookup-results" style="margin-top:16px;"></div>
      </div>
    </div>
  </div>

  <script>
    const SEATS = [
      { id: 'W-01', name: '창가 1인석 W-01', zone: 'window' },
      { id: 'W-02', name: '창가 1인석 W-02', zone: 'window' },
      { id: 'W-03', name: '창가 1인석 W-03', zone: 'window' },
      { id: 'W-04', name: '창가 1인석 W-04', zone: 'window' },
      { id: 'W-05', name: '창가 1인석 W-05', zone: 'window' },
      { id: 'W-06', name: '창가 1인석 W-06', zone: 'window' },
      { id: 'A-01', name: '중앙 열람석 A-01', zone: 'main' },
      { id: 'A-02', name: '중앙 열람석 A-02', zone: 'main' },
      { id: 'A-03', name: '중앙 열람석 A-03', zone: 'main' },
      { id: 'A-04', name: '중앙 열람석 A-04', zone: 'main' },
      { id: 'A-05', name: '중앙 열람석 A-05', zone: 'main' },
      { id: 'A-06', name: '중앙 열람석 A-06', zone: 'main' },
      { id: 'B-01', name: '중앙 열람석 B-01', zone: 'main' },
      { id: 'B-02', name: '중앙 열람석 B-02', zone: 'main' },
      { id: 'B-03', name: '중앙 열람석 B-03', zone: 'main' },
      { id: 'B-04', name: '중앙 열람석 B-04', zone: 'main' },
      { id: 'B-05', name: '중앙 열람석 B-05', zone: 'main' },
      { id: 'B-06', name: '중앙 열람석 B-06', zone: 'main' },
      { id: 'L-01', name: '노트북석 L-01', zone: 'laptop' },
      { id: 'L-02', name: '노트북석 L-02', zone: 'laptop' },
      { id: 'L-03', name: '노트북석 L-03', zone: 'laptop' },
      { id: 'L-04', name: '노트북석 L-04', zone: 'laptop' },
      { id: 'L-05', name: '노트북석 L-05', zone: 'laptop' },
      { id: 'L-06', name: '노트북석 L-06', zone: 'laptop' },
      { id: 'S-01', name: '스터디룸 S-01 (4인)', zone: 'study' },
      { id: 'S-02', name: '스터디룸 S-02 (6인)', zone: 'study' }
    ];

    let reservedList = [];
    let selectedSeat = '';

    window.onload = function() {
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('date-selector').value = today;
      document.getElementById('date-input').value = today;
      document.getElementById('stat-date').textContent = today;
      loadSeatStatus();
    };

    function switchTab(t) {
      document.getElementById('tab-reserve').classList.toggle('active', t === 'reserve');
      document.getElementById('tab-lookup').classList.toggle('active', t === 'lookup');
      document.getElementById('view-reserve').classList.toggle('hidden', t !== 'reserve');
      document.getElementById('view-lookup').classList.toggle('hidden', t !== 'lookup');
    }

    function syncDate(v) {
      document.getElementById('date-selector').value = v;
      document.getElementById('stat-date').textContent = v;
      loadSeatStatus();
    }

    function loadSeatStatus() {
      const dt = document.getElementById('date-selector').value;
      document.getElementById('stat-date').textContent = dt;

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            reservedList = res.reserved || [];
            renderSeats();
            updateStats();
          })
          .withFailureHandler(function(err) {
            showAlert('reserve-alert', '좌석 상태 불러오기 실패: ' + err.message, 'error');
          })
          .getSeatStatus(dt);
      } else {
        renderSeats();
        updateStats();
      }
    }

    function updateStats() {
      const taken = SEATS.filter(s => reservedList.indexOf(s.name) !== -1 || reservedList.indexOf(s.id) !== -1).length;
      const available = SEATS.length - taken;
      document.getElementById('stat-available').textContent = available + '석';
      document.getElementById('stat-taken').textContent = taken + '석';
    }

    function renderSeats() {
      const zones = {
        window: document.getElementById('zone-window'),
        main: document.getElementById('zone-main'),
        laptop: document.getElementById('zone-laptop'),
        study: document.getElementById('zone-study')
      };
      Object.values(zones).forEach(el => el.innerHTML = '');

      SEATS.forEach(seat => {
        const isTaken = reservedList.indexOf(seat.name) !== -1 || reservedList.indexOf(seat.id) !== -1;
        const isSel = selectedSeat === seat.name;

        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'seat-btn ' + (isTaken ? 'taken' : 'available') + (isSel ? ' selected' : '');
        b.innerHTML = seat.id + '<span style="font-size:10px; margin-top:2px;">' + (isTaken ? '마감' : (isSel ? '선택' : '가능')) + '</span>';

        if (!isTaken) {
          b.onclick = function() {
            selectSeat(seat.name);
          };
        }
        if (zones[seat.zone]) zones[seat.zone].appendChild(b);
      });
    }

    function selectSeat(name) {
      selectedSeat = name;
      document.getElementById('seat-input').value = name;
      document.getElementById('selected-text').textContent = name;
      document.getElementById('selected-badge').style.display = 'inline-block';
      renderSeats();
    }

    function handleReserveSubmit(e) {
      e.preventDefault();
      const seat = document.getElementById('seat-input').value.trim();
      const date = document.getElementById('date-input').value.trim();
      const timeSlot = document.getElementById('timeslot-input').value.trim();
      const name = document.getElementById('name-input').value.trim();
      const email = document.getElementById('email-input').value.trim();

      if (!seat) {
        showAlert('reserve-alert', '원하시는 좌석을 먼저 클릭해 주세요.', 'error');
        return;
      }

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.textContent = '구글 시트 저장 및 중복 확인 중...';
      showAlert('reserve-alert', '예약 정보를 저장하고 있습니다...', 'info');

      const payload = { bookOrSeat: seat, date: date, timeSlot: timeSlot, name: name, email: email };

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            btn.disabled = false;
            btn.textContent = '좌석 예약 신청하기';
            if (res.ok) {
              showAlert('reserve-alert', '🎉 ' + res.message + ' (예약번호: ' + res.reservationNumber + ')', 'success');
              document.getElementById('seat-input').value = '';
              document.getElementById('selected-text').textContent = '위 평면도에서 초록색 좌석을 클릭해 주세요';
              document.getElementById('selected-badge').style.display = 'none';
              selectedSeat = '';
              loadSeatStatus();
            } else {
              showAlert('reserve-alert', '⚠️ ' + res.message, 'error');
            }
          })
          .withFailureHandler(function(err) {
            btn.disabled = false;
            btn.textContent = '좌석 예약 신청하기';
            showAlert('reserve-alert', '오류 발생: ' + err.message, 'error');
          })
          .saveReservation(payload);
      }
    }

    function searchReservations() {
      const email = document.getElementById('lookup-email').value.trim();
      if (!email) {
        showAlert('lookup-alert', '이메일을 입력하세요.', 'error');
        return;
      }

      showAlert('lookup-alert', '구글 시트에서 예약 내역을 검색하는 중...', 'info');
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            if (res.ok) {
              showAlert('lookup-alert', res.message, 'success');
              renderList(res.reservations, email);
            } else {
              showAlert('lookup-alert', res.message, 'error');
            }
          })
          .withFailureHandler(function(err) {
            showAlert('lookup-alert', '조회 실패: ' + err.message, 'error');
          })
          .getReservationsByEmail(email);
      }
    }

    function renderList(list, email) {
      const box = document.getElementById('lookup-results');
      box.innerHTML = '';
      if (!list || list.length === 0) {
        box.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px 0;">예약 내역이 없습니다.</p>';
        return;
      }

      list.forEach(item => {
        const d = document.createElement('div');
        d.className = 'reservation-card';
        const isCancelled = item.status === '취소됨';
        d.innerHTML = '<div>' +
          '<strong>' + item.bookOrSeat + '</strong> <span class="status-badge ' + (isCancelled ? 'cancelled' : 'active') + '">' + item.status + '</span>' +
          '<div style="font-size:12px; color:var(--text-muted); margin-top:4px;">예약번호: ' + item.reservationNumber + ' | 예약자: ' + item.name + '</div>' +
          '<div style="font-size:12px; color:var(--text-muted);">일자: ' + item.date + ' | 시간대: ' + item.timeSlot + '</div>' +
          '</div>' +
          '<div>' +
          (!isCancelled ? '<button class="btn-cancel" onclick="cancelRes(\'' + item.reservationNumber + '\',\'' + email + '\')">예약 취소</button>' : '<span style="font-size:12px; color:#94a3b8;">취소 완료됨</span>') +
          '</div>';
        box.appendChild(d);
      });
    }

    function cancelRes(num, email) {
      if (!confirm('예약 [' + num + ']을 정말 취소하시겠습니까?\\n취소 시 상태가 \\'취소됨\\'으로 변경되고 좌석이 즉시 반환됩니다.')) return;
      showAlert('lookup-alert', '예약 취소 처리 중...', 'info');

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            if (res.ok) {
              showAlert('lookup-alert', '✅ ' + res.message, 'success');
              searchReservations();
              loadSeatStatus();
            } else {
              showAlert('lookup-alert', '⚠️ ' + res.message, 'error');
            }
          })
          .withFailureHandler(function(err) {
            showAlert('lookup-alert', '취소 실패: ' + err.message, 'error');
          })
          .cancelReservation(num, email);
      }
    }

    function showAlert(id, msg, type) {
      const el = document.getElementById(id);
      el.className = 'alert ' + type;
      el.innerHTML = msg;
    }
  </script>
</body>
</html>
`;
