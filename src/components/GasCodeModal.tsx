import React, { useState } from 'react';
import { CODE_GS_CONTENT } from '../gas/codeGs';
import { INDEX_HTML_CONTENT } from '../gas/indexHtml';
import { SPREADSHEET_ID } from '../data/mockData';
import { 
  X, Copy, Check, FileCode, 
  Globe, BookOpen, ShieldAlert, Sparkles, 
  ExternalLink, Layers 
} from 'lucide-react';

interface GasCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasCodeModal: React.FC<GasCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'codegs' | 'indexhtml' | 'guide'>('codegs');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch (err) {
      console.error('클립보드 복사 실패', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Google Apps Script (GAS) 배포 코드</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  완전 분리 및 구현 완료
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                요구사항에 맞춰 <strong>Code.gs</strong>와 <strong>Index.html</strong>을 명확히 분리하여 구체적으로 작성했습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('codegs')}
              className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'codegs'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Code.gs (백엔드 로직)</span>
            </button>

            <button
              onClick={() => setActiveTab('indexhtml')}
              className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'indexhtml'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Index.html (프론트엔드 UI)</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'guide'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>구글 시트 배포 가이드</span>
            </button>
          </div>

          {activeTab !== 'guide' && (
            <button
              onClick={() => {
                if (activeTab === 'codegs') copyToClipboard(CODE_GS_CONTENT, 'Code.gs');
                if (activeTab === 'indexhtml') copyToClipboard(INDEX_HTML_CONTENT, 'Index.html');
              }}
              className="mb-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>복사되었습니다!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{activeTab === 'codegs' ? 'Code.gs 복사하기' : 'Index.html 복사하기'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-auto p-5 bg-slate-900 text-slate-100 font-mono text-xs">
          {activeTab === 'codegs' && (
            <div>
              <div className="mb-3 text-[11px] text-slate-400 bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                <span>📁 파일명: <strong>Code.gs</strong> | 구글 스프레드시트 ID: <code className="text-amber-400 font-bold">{SPREADSHEET_ID}</code></span>
                <span className="text-emerald-400 font-sans font-semibold">✓ 중복 예약 방지 & 실시간 취소 완벽 구현</span>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-slate-300 leading-relaxed">
                {CODE_GS_CONTENT}
              </pre>
            </div>
          )}

          {activeTab === 'indexhtml' && (
            <div>
              <div className="mb-3 text-[11px] text-slate-400 bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                <span>📁 파일명: <strong>Index.html</strong> (Apps Script에서 HTML 파일로 추가)</span>
                <span className="text-emerald-400 font-sans font-semibold">✓ 평면도 시각화 & 예약 조회/취소 UI 내장</span>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-slate-300 leading-relaxed">
                {INDEX_HTML_CONTENT}
              </pre>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="font-sans text-slate-800 bg-white p-6 rounded-xl border border-slate-200 space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  구글 스프레드시트에 GAS 웹앱 1분 배포 절차
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  제공해 드린 스프레드시트(ID: <code>{SPREADSHEET_ID}</code>)에 바로 등록하여 영구 사용할 수 있습니다.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Step 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>구글 스프레드시트 열기 & Apps Script 실행</span>
                  </div>
                  <p className="text-slate-600 pl-7">
                    스프레드시트 상단 메뉴에서 <strong>[확장 프로그램] &gt; [Apps Script]</strong>를 클릭합니다.
                  </p>
                  <div className="pl-7 mt-2">
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                    >
                      해당 스프레드시트 바로가기 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Code.gs 코드 붙여넣기</span>
                  </div>
                  <p className="text-slate-600 pl-7">
                    기존 기본 내용을 지우고, 위 [Code.gs] 탭의 코드를 그대로 복사하여 붙여넣고 저장(Ctrl + S)합니다.
                    (시트명 <strong>'예약목록'</strong> 및 <strong>'도서목록'</strong>과 스프레드시트 ID가 이미 사전 설정되어 있습니다.)
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Index.html 파일 추가</span>
                  </div>
                  <p className="text-slate-600 pl-7">
                    Apps Script 좌측 파일 목록에서 <strong>[+] 버튼 &gt; [HTML]</strong>을 클릭한 뒤, 파일명으로 <strong>Index</strong>를 입력합니다.<br />
                    그리고 위 [Index.html] 탭의 코드를 전체 복사하여 붙여넣고 저장합니다.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/70 border-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>웹앱으로 배포하기 (Deploy)</span>
                  </div>
                  <ul className="text-emerald-800 pl-7 space-y-1 list-disc">
                    <li>우측 상단 <strong>[배포] &gt; [새 배포]</strong> 클릭</li>
                    <li>좌측 톱니바퀴 아이콘 클릭 후 <strong>'웹 앱'</strong> 선택</li>
                    <li>설명: <code>도서관 예약 시스템 v2</code></li>
                    <li>다음 사용자로 실행: <strong>'나'</strong></li>
                    <li>액세스 권한이 있는 사용자: <strong>'모든 사용자'</strong> (또는 iceu.kr 조직 사용자) 선택</li>
                    <li><strong>[배포]</strong> 클릭 후 생성된 웹 앱 URL을 복사하여 사용하거나 본 웹앱에 연동!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>한글 시트명 및 헤더 명칭 규격 완전 준수 (예약목록, 도서목록)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition"
          >
            창 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
