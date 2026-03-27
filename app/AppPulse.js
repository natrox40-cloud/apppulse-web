"use client";
import { useState, useEffect } from "react";

const API = "https://apppulse-api-production.up.railway.app";

function AppPulse() {
  const [page, setPage] = useState("landing");
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [panelData, setPanelData] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState(null);

  const appNames = {
    "com.wealthfront": "Wealthfront",
    "com.robinhood.android": "Robinhood",
    "com.sofi.mobile": "SoFi",
    "piuk.blockchain.android": "Blockchain.com",
    "com.hostelworld.app": "Hostelworld",
    "com.kayak.android": "KAYAK",
    "com.asana.app": "Asana",
  };

  const getName = (id) => appNames[id] || id.split(".").slice(-1)[0];

  useEffect(() => {
    if (page === "dashboard" && apps.length === 0) {
      fetch(`${API}/apps`).then(r => r.json()).then(d => {
        if (d.apps) setApps(d.apps);
      }).catch(() => {});
    }
  }, [page]);

  const loadApp = async (appId) => {
    setSelectedApp(appId);
    setLoading(true);
    setError(null);
    setReport(null);
    setPanelData(null);
    try {
      const [panelRes, reportRes] = await Promise.all([
        fetch(`${API}/apps/${appId}/latest?days=30`).then(r => r.json()).catch(() => null),
        fetch(`${API}/apps/${appId}/report`).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      if (panelRes && panelRes.data) setPanelData(panelRes);
      if (reportRes) setReport(reportRes);
    } catch (e) {
      setError("데이터를 불러오지 못했습니다.");
    }
    setLoading(false);
  };

  const runPredict = async () => {
    if (!selectedApp) return;
    setPredicting(true);
    try {
      const res = await fetch(`${API}/apps/${selectedApp}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate_report: true }),
      });
      const data = await res.json();
      if (data.report_json) {
        setReport(data);
      }
    } catch (e) {
      setError("예측 실행에 실패했습니다.");
    }
    setPredicting(false);
  };

  const getRiskColor = (level) => {
    if (level === "위험") return { bg: "#2D0A0A", border: "#7A2020", text: "#F09595" };
    if (level === "주의") return { bg: "#2D1A04", border: "#7A5A10", text: "#FAC775" };
    return { bg: "#0A2D15", border: "#1A7A3A", text: "#97C459" };
  };

  // ========== LANDING ==========
  if (page === "landing") {
    return (
      <div style={S.root}>
        <style>{globalCSS}</style>
        <nav style={S.nav}>
          <div style={S.logoWrap}>
            <div style={S.logoIcon}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
            <span style={S.logoText}>AppPulse</span>
          </div>
          <button style={S.navBtn} onClick={() => setPage("dashboard")}>대시보드</button>
        </nav>

        <div style={S.hero}>
          <h1 style={S.heroTitle}>매주 월요일,<br/>이 리포트가 도착합니다</h1>
          <p style={S.heroSub}>앱 운영팀을 위한 AI 건강 분석 리포트.<br/>평점 추세, 업데이트 반응, 경쟁사 동향을 한 눈에.</p>
        </div>

        <div style={S.demoCard}>
          <div style={S.demoHeader}>
            <div>
              <div style={S.demoApp}>MyFinance Pro</div>
              <div style={S.demoDate}>RPT-2026-047 | 2026.03.16 — 03.22</div>
            </div>
            <span style={{...S.badge, background: "#2D1A04", color: "#FAC775", border: "1px solid #7A5A10"}}>CAUTION</span>
          </div>
          <div style={S.demoBody}>
            <div style={S.kpiGrid}>
              {[
                { l: "급락 확률", v: "62%", d: "+12%p", neg: true },
                { l: "상승 확률", v: "28%", d: "-8%p", neg: true },
                { l: "건강도", v: "0.58", d: "-0.13", neg: true },
                { l: "현재 평점", v: "4.12", d: "-0.08", neg: true },
              ].map((k, i) => (
                <div key={i} style={S.kpi}>
                  <div style={S.kpiLabel}>{k.l}</div>
                  <div style={S.kpiVal}>{k.v}</div>
                  <div style={{ fontSize: 11, color: k.neg ? "#F09595" : "#97C459", marginTop: 2 }}>{k.d}</div>
                </div>
              ))}
            </div>
            <div style={S.factorsSection}>
              <div style={S.secLabel}>위험 기여 요인</div>
              {[
                { n: "평점 하락 가속", p: 35, c: "#8B7BF4", t: "추세", tb: "#1E1940", tc: "#AFA9EC" },
                { n: "패치 후 부정 반응", p: 25, c: "#D85A30", t: "패치", tb: "#2D1508", tc: "#F0997B" },
                { n: "건강도 하락", p: 15, c: "#1D9E75", t: "건강", tb: "#082D1E", tc: "#5DCAA5" },
              ].map((f, i) => (
                <div key={i} style={S.factorRow}>
                  <span style={{ fontSize: 9, color: "#666", width: 14, fontFamily: "monospace" }}>0{i + 1}</span>
                  <span style={{ fontSize: 12, minWidth: 100, fontWeight: 500 }}>{f.n}</span>
                  <div style={S.barBg}><div style={{ ...S.barFill, width: `${f.p * 2}%`, background: f.c }} /></div>
                  <span style={{ fontSize: 11, fontWeight: 600, width: 30, textAlign: "right", fontFamily: "monospace" }}>{f.p}%</span>
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: f.tb, color: f.tc, fontWeight: 600 }}>{f.t}</span>
                </div>
              ))}
            </div>
            <div style={S.briefingPreview}>
              <div style={S.secLabel}>AI 상황 브리핑</div>
              <div style={S.briefBox}>
                이번 주 건강 상태가 악화되고 있습니다. 7일 내 하락 확률은 62%로 지난주 대비 상승했습니다. 3일 전 v4.2.1 이후 "로그인 실패", "앱 충돌" 리뷰가 집중되고 있습니다...
              </div>
            </div>
          </div>
        </div>

        <div style={S.ctaArea}>
          <p style={{ color: "#999", fontSize: 14, marginBottom: 16 }}>매주 이 리포트를 자동으로 받아보세요.</p>
          <button style={S.ctaBig} onClick={() => setPage("dashboard")}>대시보드에서 확인하기</button>
        </div>

        <div style={S.howArea}>
          <h2 style={S.howTitle}>어떻게 작동하나요?</h2>
          <div style={S.howGrid}>
            {[
              { n: "1", t: "앱 등록", d: "Google Play 앱 ID 입력. 경쟁사도 함께." },
              { n: "2", t: "AI 분석", d: "매일 리뷰 수집. 61개 변수, 200회 시뮬레이션." },
              { n: "3", t: "리포트 수신", d: "매주 월요일 이메일. 피드백할수록 정확." },
            ].map((s, i) => (
              <div key={i} style={S.step}>
                <div style={S.stepNum}>{s.n}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.t}</div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========== DASHBOARD ==========
  return (
    <div style={S.root}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={S.logoWrap} onClick={() => setPage("landing")}>
          <div style={S.logoIcon}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <span style={S.logoText}>AppPulse</span>
        </div>
        <span style={{ fontSize: 13, color: "#888" }}>{new Date().toLocaleDateString("ko-KR")}</span>
      </nav>

      <div style={S.dashWrap}>
        {/* Sidebar */}
        <div style={S.sidebar}>
          <div style={S.sideTitle}>모니터링 앱</div>
          {apps.map(a => (
            <div key={a.app_id}
              onClick={() => loadApp(a.app_id)}
              style={{
                ...S.sideItem,
                background: selectedApp === a.app_id ? "#1a1a1a" : "transparent",
                borderColor: selectedApp === a.app_id ? "#333" : "transparent",
              }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{getName(a.app_id)}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                {a.rating_7d ? `★ ${Number(a.rating_7d).toFixed(2)}` : "데이터 없음"}
              </div>
            </div>
          ))}
          {apps.length === 0 && <div style={{ fontSize: 12, color: "#666", padding: 12 }}>앱을 불러오는 중...</div>}
        </div>

        {/* Main */}
        <div style={S.main}>
          {!selectedApp && (
            <div style={S.emptyState}>
              <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.3 }}>←</div>
              <div style={{ fontSize: 14, color: "#888" }}>왼쪽에서 앱을 선택하세요</div>
            </div>
          )}

          {loading && <div style={S.emptyState}><div style={{ color: "#888" }}>데이터 불러오는 중...</div></div>}

          {selectedApp && !loading && (
            <div>
              {/* Header */}
              <div style={S.dashHeader}>
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>{getName(selectedApp)}</h1>
                  <span style={{ fontSize: 12, color: "#888" }}>{selectedApp}</span>
                </div>
                <button style={S.predictBtn} onClick={runPredict} disabled={predicting}>
                  {predicting ? "분석 중..." : "예측 실행"}
                </button>
              </div>

              {/* Panel metrics */}
              {panelData && panelData.data && panelData.data.length > 0 && (
                <div>
                  <div style={S.kpiGrid}>
                    {(() => {
                      const latest = panelData.data[panelData.data.length - 1];
                      return [
                        { l: "7일 평점", v: latest.avg_rating_7d ? Number(latest.avg_rating_7d).toFixed(2) : "N/A" },
                        { l: "부정 비율", v: latest.negative_ratio_7d ? `${(Number(latest.negative_ratio_7d) * 100).toFixed(1)}%` : "N/A" },
                        { l: "7일 리뷰수", v: latest.review_count_7d ? Math.round(Number(latest.review_count_7d)) : "N/A" },
                        { l: "가속도", v: latest.rating_accel_7v30 ? Number(latest.rating_accel_7v30).toFixed(3) : "N/A" },
                      ].map((k, i) => (
                        <div key={i} style={S.kpi}>
                          <div style={S.kpiLabel}>{k.l}</div>
                          <div style={S.kpiVal}>{k.v}</div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Mini timeline */}
                  <div style={S.chartSection}>
                    <div style={S.secLabel}>평점 추이 (최근 {panelData.data.length}일)</div>
                    <div style={S.chartWrap}>
                      <svg viewBox={`0 0 600 100`} width="100%" style={{ display: "block" }}>
                        {(() => {
                          const data = panelData.data.filter(d => d.avg_rating_7d != null);
                          if (data.length < 2) return null;
                          const vals = data.map(d => d.avg_rating_7d);
                          const min = Math.min(...vals) - 0.1;
                          const max = Math.max(...vals) + 0.1;
                          const n = vals.length;
                          const x = (i) => 20 + (i / (n - 1)) * 560;
                          const y = (v) => 10 + (1 - (v - min) / (max - min)) * 80;
                          const path = vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
                          return (
                            <>
                              <path d={path} fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinejoin="round" />
                              <circle cx={x(n - 1)} cy={y(vals[n - 1])} r="3" fill="#1D9E75" />
                              <text x={20} y={96} fill="#666" fontSize="9" fontFamily="monospace">{data[0].date}</text>
                              <text x={560} y={96} fill="#666" fontSize="9" fontFamily="monospace" textAnchor="end">{data[n - 1].date}</text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Report */}
              {report && (
                <div style={S.reportSection}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={S.secLabel}>주간 리포트</div>
                    {report.risk_level && (
                      <span style={{
                        ...S.badge,
                        ...(() => { const c = getRiskColor(report.risk_level); return { background: c.bg, color: c.text, border: `1px solid ${c.border}` }; })()
                      }}>{report.risk_level}</span>
                    )}
                  </div>

                  <div style={S.kpiGrid}>
                    <div style={S.kpi}>
                      <div style={S.kpiLabel}>급락 확률</div>
                      <div style={S.kpiVal}>{report.drop_probability}%</div>
                    </div>
                    <div style={S.kpi}>
                      <div style={S.kpiLabel}>상승 확률</div>
                      <div style={S.kpiVal}>{report.rise_probability}%</div>
                    </div>
                    <div style={S.kpi}>
                      <div style={S.kpiLabel}>건강도</div>
                      <div style={S.kpiVal}>{report.health_score ? Number(report.health_score).toFixed(2) : "N/A"}</div>
                    </div>
                    <div style={S.kpi}>
                      <div style={S.kpiLabel}>리포트 날짜</div>
                      <div style={{ ...S.kpiVal, fontSize: 14 }}>{report.report_date}</div>
                    </div>
                  </div>

                  {/* Briefing */}
                  {report.briefing_text && (
                    <div style={{ marginTop: 16 }}>
                      <div style={S.secLabel}>AI 상황 브리핑</div>
                      <div style={S.briefFull}>
                        {report.briefing_text.split("\n").map((line, i) => {
                          if (line.startsWith("# ")) return <h2 key={i} style={{ fontSize: 16, fontWeight: 600, margin: "16px 0 8px" }}>{line.replace(/^#+\s/, "")}</h2>;
                          if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: 14, fontWeight: 600, margin: "14px 0 6px", color: "#1D9E75" }}>{line.replace(/^#+\s/, "")}</h3>;
                          if (line.startsWith("**[")) return <div key={i} style={{ fontWeight: 600, marginTop: 10, color: "#FAC775" }}>{line.replace(/\*\*/g, "")}</div>;
                          if (line.startsWith("**")) return <div key={i} style={{ fontWeight: 600, marginTop: 8 }}>{line.replace(/\*\*/g, "")}</div>;
                          if (line.startsWith("---")) return <hr key={i} style={{ border: "none", borderTop: "1px solid #333", margin: "12px 0" }} />;
                          if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
                          return <p key={i} style={{ margin: "4px 0", lineHeight: 1.8 }}>{line}</p>;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Factors */}
                  {report.report_json && report.report_json.top_factors && (
                    <div style={{ marginTop: 16 }}>
                      <div style={S.secLabel}>기여 요인</div>
                      {report.report_json.top_factors.map((f, i) => (
                        <div key={i} style={S.factorRow}>
                          <span style={{ fontSize: 12, minWidth: 120, fontWeight: 500 }}>{f.name}</span>
                          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "#1a1a1a", color: "#888" }}>{f.category}</span>
                          <span style={{ fontSize: 11, color: "#888", marginLeft: "auto", fontFamily: "monospace" }}>
                            {f.current_value != null ? f.current_value : "—"}
                            {f.change != null && <span style={{ color: f.change > 0 ? "#97C459" : "#F09595", marginLeft: 6 }}>{f.change > 0 ? "+" : ""}{f.change}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!report && !loading && (
                <div style={{ ...S.emptyState, marginTop: 24 }}>
                  <div style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>아직 리포트가 없습니다.</div>
                  <button style={S.predictBtn} onClick={runPredict} disabled={predicting}>
                    {predicting ? "분석 중..." : "지금 예측 실행하기"}
                  </button>
                </div>
              )}

              {error && <div style={{ color: "#F09595", fontSize: 13, marginTop: 12 }}>{error}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== STYLES ==========
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; }
  body { background: #0e0e0e; }
`;

const S = {
  root: { fontFamily: "'Instrument Sans', sans-serif", color: "#e0ded8", background: "#0e0e0e", minHeight: "100vh" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: "1px solid #1a1a1a" },
  logoWrap: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  logoIcon: { width: 26, height: 26, borderRadius: 7, background: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 16, fontWeight: 700, letterSpacing: -0.5 },
  navBtn: { background: "#0F6E56", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },

  hero: { textAlign: "center", padding: "48px 24px 24px" },
  heroTitle: { fontSize: 32, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.8, marginBottom: 12 },
  heroSub: { fontSize: 15, color: "#888", lineHeight: 1.7 },

  demoCard: { maxWidth: 700, margin: "24px auto", border: "1px solid #222", borderRadius: 12, overflow: "hidden", background: "#111" },
  demoHeader: { padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #222", background: "#0a0a0a" },
  demoApp: { fontSize: 15, fontWeight: 600 },
  demoDate: { fontSize: 10, color: "#666", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 },
  demoBody: { padding: "16px 20px" },
  badge: { padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginBottom: 16 },
  kpi: { background: "#1a1a1a", borderRadius: 8, padding: "10px 12px" },
  kpiLabel: { fontSize: 10, color: "#888", marginBottom: 3, fontWeight: 500 },
  kpiVal: { fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -0.5 },

  secLabel: { fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 },
  factorsSection: { marginBottom: 16 },
  factorRow: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0" },
  barBg: { flex: 1, height: 4, background: "#222", borderRadius: 2, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2 },
  briefingPreview: { marginTop: 8 },
  briefBox: { background: "#1a1a1a", borderRadius: 8, padding: "12px 14px", fontSize: 12, lineHeight: 1.8, color: "#aaa" },

  ctaArea: { textAlign: "center", padding: "28px 24px" },
  ctaBig: { background: "#0F6E56", color: "#fff", border: "none", padding: "12px 36px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  howArea: { maxWidth: 700, margin: "0 auto", padding: "24px" },
  howTitle: { fontSize: 16, fontWeight: 600, textAlign: "center", marginBottom: 20 },
  howGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  step: { textAlign: "center", padding: "16px 10px" },
  stepNum: { width: 28, height: 28, borderRadius: "50%", background: "#0F2E22", color: "#5DCAA5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginBottom: 10 },

  dashWrap: { display: "flex", minHeight: "calc(100vh - 53px)" },
  sidebar: { width: 220, borderRight: "1px solid #1a1a1a", padding: "16px 0", flexShrink: 0 },
  sideTitle: { fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: 0.8, textTransform: "uppercase", padding: "0 16px", marginBottom: 12 },
  sideItem: { padding: "10px 16px", cursor: "pointer", borderLeft: "2px solid transparent", transition: "background 0.1s" },
  main: { flex: 1, padding: "24px 32px", maxWidth: 800 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300 },
  dashHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  predictBtn: { background: "#0F6E56", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  chartSection: { marginBottom: 20 },
  chartWrap: { background: "#111", border: "1px solid #222", borderRadius: 8, padding: "12px" },
  reportSection: { marginTop: 20, padding: "20px", background: "#111", border: "1px solid #222", borderRadius: 12 },
  briefFull: { background: "#0a0a0a", borderRadius: 8, padding: "16px 18px", fontSize: 13, lineHeight: 1.9, color: "#ccc", maxHeight: 600, overflowY: "auto" },
};

export default AppPulse;
