# 📚 도서관 좌석 및 도서 예약 시스템 (Library Seat & Book Reservation)

Google 스프레드시트 및 Google Apps Script(GAS)와 실시간 연동되는 도서관 열람실 좌석 및 도서 예약 웹 애플리케이션입니다.  
**GitHub** 및 **Vercel** 배포를 완벽하게 지원하도록 구성되어 있습니다.

---

## 🚀 주요 기능
- **열람실 공간 및 좌석 평면도**: 창가 1인 집중석, 중앙 오픈 열람존, 노트북존, 그룹 스터디룸 실시간 현황
- **완벽한 중복 예약 차단**: 동일 일자에 동일한 물리적 좌석(W-01 등)의 중복 예약을 원천 차단
- **예약 내역 자동 이메일 발송**: 예약 완료 즉시 예약자 이메일로 5대 내역(예약자명, 일자, 좌석, 이용시간, 대출 도서) 자동 발송
- **내 예약 조회 및 실시간 취소**: 이메일 검색으로 본인 예약 확인 및 1클릭 취소 (좌석 즉시 반환)
- **Vercel Serverless & Vite 완벽 호환**: `vercel.json` 및 Serverless API (`api/index.ts`) 내장

---

## 🛠️ GitHub 및 Vercel 배포 가이드

### 1단계: GitHub에 소스코드 업로드하기

1. 터미널(또는 명령 프롬프트)을 열고 프로젝트 루트 폴더로 이동합니다.
2. Git 저장소를 초기화하고 파일을 커밋합니다:
```bash
git init
git add .
git commit -m "feat: 도서관 좌석 및 도서 예약 시스템 Vercel & GitHub 배포 준비"
```
3. GitHub에서 새 레포지토리(New Repository)를 생성합니다.
4. 원격 저장소를 연결하고 푸시합니다:
```bash
git branch -M main
git remote add origin https://github.com/사용자아이디/레포지토리이름.git
git push -u origin main
```

---

### 2단계: Vercel에서 1클릭으로 배포하기

1. [Vercel 공식 웹사이트](https://vercel.com)에 로그인합니다 (GitHub 계정으로 로그인 추천).
2. 대시보드 우측 상단의 **[Add New...] > [Project]**를 클릭합니다.
3. 방금 푸시한 GitHub 레포지토리를 찾아 **[Import]** 버튼을 클릭합니다.
4. 프로젝트 설정 화면에서 기본 설정이 자동으로 감지됩니다:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **[Deploy]** 버튼을 누릅니다!
   - 1분 내로 전 세계에 배포된 고유의 `https://your-project.vercel.app` URL이 생성됩니다.

---

## ⚙️ Vercel 동작 원리
- **프론트엔드 (Vite React SPA)**: `dist/` 폴더로 빌드되어 전 세계 엣지 CDN에서 즉각 로딩됩니다.
- **백엔드 API (`/api/*`)**: `api/index.ts`를 통해 Vercel Serverless Function으로 자동 호스팅되어 백엔드 서버 없이도 실시간 예약 및 중복 검증, GAS 동기화가 정상 작동합니다.

---

## 🔗 구글 스프레드시트 & GAS 연동 정보
- **스프레드시트 ID**: `1yArHVbhR1F4uHnjuIqFDLn_4GeLesQGSMY4Bc4mXpqk`
- **배포된 Google Apps Script Web App**:
  `https://script.google.com/a/macros/iceu.kr/s/AKfycbxbBruZulaxyJAaiVY6wZzHW7rgQkf-RFbQ2gJdr4t3GNL8pv8Gf2FTmt9I6Svm2Pij/exec`
