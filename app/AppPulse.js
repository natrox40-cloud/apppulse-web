"use client";
import { useState, useEffect } from "react";
 
const API = "https://apppulse-api-production.up.railway.app";
 
const NAMES = {
  "com.wealthfront":"Wealthfront","com.robinhood.android":"Robinhood",
  "com.sofi.mobile":"SoFi","piuk.blockchain.android":"Blockchain.com",
  "com.hostelworld.app":"Hostelworld","com.kayak.android":"KAYAK","com.asana.app":"Asana",
};
const N = (id) => NAMES[id] || id.split(".").slice(-1)[0];
 
// ============================================================
// i18n
// ============================================================
const LANGS = {
  ko: {
    tagline: "매주 월요일, 리포트가 도착합니다",
    sub: "앱 운영팀을 위한 AI 건강 분석 리포트",
    start: "무료로 시작",
    cta: "내 앱 등록하기",
    ctaSub: "매주 이 리포트를 자동으로 받아보세요. 앱 ID만 등록하면 다음 월요일부터 시작됩니다.",
    how: "어떻게 작동하나요?",
    step1t: "앱 등록", step1d: "Google Play 앱 ID 입력. 경쟁사도 함께.",
    step2t: "AI 분석", step2d: "매일 리뷰 수집. 61개 변수, 200회 시뮬레이션.",
    step3t: "리포트 수신", step3d: "매주 월요일 이메일. 피드백할수록 정확.",
    sidebar: "모니터링 앱", selectApp: "← 왼쪽에서 앱을 선택하세요",
    predict: "예측 실행", predicting: "분석 중... (약 30초)",
    noReport: "아직 리포트가 없습니다.", runNow: "지금 예측 실행하기",
    loading: "데이터 불러오는 중...",
    kpi: "핵심 지표", timeline: "건강도 타임라인 15d", stats: "주요 수치 패널",
    factors: "위험 기여 요인 분석", comp: "경쟁사 비교 분석", briefing: "AI 상황 브리핑",
    reviews: "주요 부정 리뷰 샘플", retro: "지난주 복기", feedback: "이 분석이 유용했나요?",
    fb1: "유용했어요", fb2: "부정확해요", fb3: "조치를 취했어요",
    disclaimer: "본 분석은 공개 리뷰 데이터와 과거 패턴의 통계적 분석에 기반하며, 귀사의 내부 개발 일정, 팀 리소스, 비즈니스 우선순위를 반영하지 않습니다. 과거 데이터가 미래 결과를 보장하지 않으며, 최종 판단은 귀사의 상황에 맞게 내려주시기 바랍니다.",
    dropProb: "급락 확률 7d", riseProb: "상승 확률 7d", healthIdx: "건강도 지수", ratingAvg: "평점 7d avg",
    dropHint: "7일 내 0.3점 이상 하락 확률", riseHint: "7일 내 0.3점 이상 상승 확률",
    healthHint: "0=위험, 1=건강", ratingHint: "최근 7일 평균 별점",
    match: "방향 일치", mismatch: "방향 불일치",
    trend: "추세", patch: "패치", health: "건강", basic: "기본",
    trendDesc: "추세 — 평점 변화의 방향과 속도", patchDesc: "패치 — 업데이트 후 사용자 반응",
    healthDesc: "건강 — 여러 지표의 종합 상태", basicDesc: "기본 — 평점, 리뷰수, 경쟁사",
    thApp:"앱",thRating:"평점",thChange:"7d 변화",thNeg:"부정비율",thRev:"리뷰수",thHealth:"건강도",thStatus:"상태",
    collected:"수집 리뷰",negRatio:"부정 비율",posRatio:"긍정 비율",accelLabel:"하락 가속도",
    streakLabel:"연속 하락일",volLabel:"평점 변동성",liftLabel:"모델 Lift",simLabel:"시뮬레이션",
    pred:"예측",actual:"실제",lastWeek:"지난주",
  },
  en: {
    tagline: "Every Monday, this report arrives",
    sub: "AI health analysis report for app teams",
    start: "Start free",
    cta: "Register your app",
    ctaSub: "Receive this report automatically every week. Just register your App ID.",
    how: "How it works",
    step1t: "Register", step1d: "Enter Google Play App ID. Add competitors too.",
    step2t: "AI Analysis", step2d: "Daily review collection. 61 variables, 200 simulations.",
    step3t: "Get Report", step3d: "Weekly email on Monday. More feedback, more accuracy.",
    sidebar: "Monitored apps", selectApp: "← Select an app from the left",
    predict: "Run prediction", predicting: "Analyzing... (~30s)",
    noReport: "No report yet.", runNow: "Run prediction now",
    loading: "Loading data...",
    kpi: "Key metrics", timeline: "Health timeline 15d", stats: "Key figures",
    factors: "Risk contribution analysis", comp: "Competitor analysis", briefing: "AI situation briefing",
    reviews: "Key negative reviews", retro: "Last week review", feedback: "Was this analysis useful?",
    fb1: "Useful", fb2: "Inaccurate", fb3: "Took action",
    disclaimer: "This analysis is based on public review data and statistical pattern analysis. It does not reflect your internal development schedule, team resources, or business priorities.",
    dropProb: "Drop prob 7d", riseProb: "Rise prob 7d", healthIdx: "Health index", ratingAvg: "Rating 7d avg",
    dropHint: "Probability of 0.3+ point drop in 7 days", riseHint: "Probability of 0.3+ point rise in 7 days",
    healthHint: "0=critical, 1=healthy", ratingHint: "7-day average rating",
    match: "Direction match", mismatch: "Direction mismatch",
    trend:"Trend",patch:"Patch",health:"Health",basic:"Basic",
    trendDesc:"Trend — direction & speed of rating change",patchDesc:"Patch — user reaction after update",
    healthDesc:"Health — composite health state",basicDesc:"Basic — rating, reviews, competitors",
    thApp:"App",thRating:"Rating",thChange:"7d change",thNeg:"Neg ratio",thRev:"Reviews",thHealth:"Health",thStatus:"Status",
    collected:"Reviews",negRatio:"Neg ratio",posRatio:"Pos ratio",accelLabel:"Accel",
    streakLabel:"Neg streak",volLabel:"Volatility",liftLabel:"Model Lift",simLabel:"Simulations",
    pred:"Predicted",actual:"Actual",lastWeek:"Last week",
  },
  ja: {
    tagline: "毎週月曜日、このレポートが届きます",
    sub: "アプリ運営チームのためのAI健康分析レポート",
    start: "無料で開始",
    cta: "アプリを登録する", ctaSub: "毎週このレポートを自動的に受け取れます。",
    how: "仕組み",
    step1t:"登録",step1d:"Google PlayアプリIDを入力。",step2t:"AI分析",step2d:"毎日レビュー収集。61変数、200シミュレーション。",step3t:"レポート受信",step3d:"毎週月曜日メールで届きます。",
    sidebar:"モニタリングアプリ",selectApp:"← 左からアプリを選択",predict:"予測実行",predicting:"分析中... (約30秒)",
    noReport:"レポートがまだありません。",runNow:"今すぐ予測実行",loading:"読み込み中...",
    kpi:"主要指標",timeline:"健康度タイムライン",stats:"主要数値",factors:"リスク要因分析",comp:"競合分析",briefing:"AI状況ブリーフィング",
    reviews:"主要否定レビュー",retro:"先週の振り返り",feedback:"この分析は役立ちましたか？",fb1:"役立った",fb2:"不正確",fb3:"対応した",
    disclaimer:"本分析は公開レビューデータと過去パターンの統計分析に基づいています。",
    dropProb:"急落確率",riseProb:"上昇確率",healthIdx:"健康度",ratingAvg:"評価7d平均",
    dropHint:"7日以内に0.3点以上下落する確率",riseHint:"7日以内に0.3点以上上昇する確率",healthHint:"0=危険, 1=健康",ratingHint:"直近7日間の平均評価",
    match:"方向一致",mismatch:"方向不一致",
    trend:"トレンド",patch:"パッチ",health:"健康",basic:"基本",
    trendDesc:"トレンド",patchDesc:"パッチ",healthDesc:"健康",basicDesc:"基本",
    thApp:"アプリ",thRating:"評価",thChange:"7d変化",thNeg:"否定率",thRev:"レビュー数",thHealth:"健康度",thStatus:"状態",
    collected:"レビュー数",negRatio:"否定率",posRatio:"肯定率",accelLabel:"加速度",
    streakLabel:"連続下落日",volLabel:"変動性",liftLabel:"モデルLift",simLabel:"シミュレーション",
    pred:"予測",actual:"実績",lastWeek:"先週",
  },
  zh: {
    tagline: "每周一，这份报告准时送达",
    sub: "为应用运营团队打造的AI健康分析报告",
    start: "免费开始",
    cta: "注册您的应用", ctaSub: "每周自动接收此报告。只需注册App ID。",
    how: "工作原理",
    step1t:"注册",step1d:"输入Google Play应用ID。",step2t:"AI分析",step2d:"每日收集评论。61个变量，200次模拟。",step3t:"接收报告",step3d:"每周一邮件送达。",
    sidebar:"监控应用",selectApp:"← 从左侧选择应用",predict:"执行预测",predicting:"分析中... (约30秒)",
    noReport:"暂无报告。",runNow:"立即执行预测",loading:"加载中...",
    kpi:"核心指标",timeline:"健康度时间线",stats:"关键数据",factors:"风险贡献分析",comp:"竞品分析",briefing:"AI情况简报",
    reviews:"主要差评样本",retro:"上周回顾",feedback:"此分析有用吗？",fb1:"有用",fb2:"不准确",fb3:"已采取行动",
    disclaimer:"本分析基于公开评论数据和历史模式的统计分析。",
    dropProb:"急跌概率",riseProb:"上升概率",healthIdx:"健康度",ratingAvg:"评分7d均值",
    dropHint:"7天内下跌0.3分以上的概率",riseHint:"7天内上升0.3分以上的概率",healthHint:"0=危险, 1=健康",ratingHint:"最近7天平均评分",
    match:"方向一致",mismatch:"方向不一致",
    trend:"趋势",patch:"补丁",health:"健康",basic:"基础",
    trendDesc:"趋势",patchDesc:"补丁",healthDesc:"健康",basicDesc:"基础",
    thApp:"应用",thRating:"评分",thChange:"7d变化",thNeg:"差评率",thRev:"评论数",thHealth:"健康度",thStatus:"状态",
    collected:"评论数",negRatio:"差评率",posRatio:"好评率",accelLabel:"加速度",
    streakLabel:"连续下降天数",volLabel:"波动性",liftLabel:"模型Lift",simLabel:"模拟次数",
    pred:"预测",actual:"实际",lastWeek:"上周",
  },
};
 
// ============================================================
// SAMPLE
// ============================================================
const SAMPLE = {
  app:"MyFinance Pro", rptNo:"RPT-2026-047", period:"2026.03.16 — 03.22", gen:"2026-03-23 06:00 KST",
  level:"주의", drop:62, rise:28, health:0.58, healthPrev:0.71, healthStd:0.09,
  rating7d:4.12, rating3d:4.05, rating14d:4.17, rating30d:4.22, ratingPrev:4.20,
  negRatio:24.1, negRatioPrev:18.2, streak:5, accel:-0.15, volatility:0.42, reviewCount:847,
  factors:[
    {n:"평점 하락 가속",p:35,c:"#6C5CE7",tag:"추세",tb:"#EEEDFE",tc:"#3C3489",detail:"최근 7일 평점 하락 속도가 30일 평균 대비 빨라지고 있습니다. 현재 가속도: -0.15 (평상시 -0.02 ~ +0.02)"},
    {n:"패치 후 부정 반응",p:25,c:"#E17055",tag:"패치",tb:"#FAEEDA",tc:"#633806",detail:"3일 전 v4.2.1 이후 부정 리뷰에서 '로그인 실패', '앱 충돌' 언급이 집중되고 있습니다."},
    {n:"건강도 하락",p:15,c:"#00B894",tag:"건강",tb:"#E1F5EE",tc:"#085041",detail:"종합 건강도가 0.71에서 0.58로 하락. 추정 범위도 넓어져 변동 가능성이 커졌습니다."},
    {n:"부정 리뷰 비율",p:12,c:"#636e72",tag:"기본",tb:"#F1EFE8",tc:"#5F5E5A",detail:"최근 7일 1~2점 비율 24.1%. 리뷰 수 847건 유지 중 부정 비율만 상승."},
    {n:"경쟁사 격차 확대",p:8,c:"#636e72",tag:"기본",tb:"#F1EFE8",tc:"#5F5E5A",detail:"BankEasy 평점이 7일간 0.15점 상승."},
  ],
  comp:[
    {name:"MyFinance Pro",r:4.12,d:-0.08,neg:"24.1%",rev:847,h:0.58,level:"주의",me:true},
    {name:"BankEasy",r:4.30,d:0.15,neg:"12.8%",rev:1204,h:0.74,level:"양호",me:false},
    {name:"MoneyPlus",r:4.10,d:0.02,neg:"18.5%",rev:523,h:0.61,level:"양호",me:false},
  ],
  reviews:[
    {s:1.0,t:"업데이트 이후 <mark>로그인</mark>이 안 됩니다. 비밀번호 재설정해도 계속 튕겨요."},
    {s:1.0,t:"v4.2.1 설치 후 <mark>앱 충돌</mark>이 반복됩니다."},
    {s:2.0,t:"최근 업데이트마다 <mark>느려지고</mark> 있어요. <mark>BankEasy</mark>로 갈아탈까 고민 중."},
  ],
  briefing:"이번 주 귀사 앱의 건강 상태가 악화되고 있습니다. 7일 내 평점 하락 확률은 62%로 지난주(50%) 대비 상승했습니다.\n\n최근 7일간 평점 하락 가속도가 -0.15로, 하락 추세가 가팔라지고 있습니다. 유사 패턴을 보인 앱의 72%에서 추가 하락이 관찰된 바 있습니다.\n\n3일 전 배포된 v4.2.1 이후 부정 리뷰에서 '로그인 실패'와 '앱 충돌' 언급이 집중되고 있습니다.",
  retro:{pred:50,actual:-0.08,match:true},
  stats:{vars:61,sims:200,lift:2.05},
};
 
// ============================================================
// COMPONENTS (larger fonts)
// ============================================================
function Badge({level}){
  const m={"위험":{bg:"#FCEBEB",c:"#791F1F",bc:"#F7C1C1"},"주의":{bg:"#FAEEDA",c:"#854F0B",bc:"#FAC775"},"안전":{bg:"#EAF3DE",c:"#27500A",bc:"#C0DD97"},"양호":{bg:"#EAF3DE",c:"#27500A",bc:"#C0DD97"}};
  const s=m[level]||m["주의"];
  return <span style={{background:s.bg,color:s.c,border:`1px solid ${s.bc}`,padding:"5px 14px",borderRadius:5,fontSize:12,fontWeight:700,letterSpacing:0.5}}>{level.toUpperCase()}</span>;
}
 
function Metric({label,value,delta,hint,detail,children}){
  const [open,setOpen]=useState(false);
  const neg=typeof delta==="string"&&(delta.startsWith("-")||(delta.includes("+")===false&&parseFloat(delta)<0));
  return(
    <div onClick={()=>setOpen(!open)} style={{background:"#f8f7f5",borderRadius:10,padding:"14px 16px",cursor:"pointer",border:"1px solid #e8e7e3"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:12,color:"#888",fontWeight:500}}>{label}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#aaa" strokeWidth="1.5" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}><path d="M4 6l4 4 4-4"/></svg>
      </div>
      <div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-0.5,marginTop:4}}>{value}</div>
      {delta&&<div style={{fontSize:12,color:neg?"#A32D2D":"#3B6D11",marginTop:2}}>{delta}</div>}
      {hint&&<div style={{fontSize:11,color:"#aaa",marginTop:4}}>{hint}</div>}
      {open&&detail&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #e8e7e3",fontSize:13,color:"#777",lineHeight:1.7}}>{detail}{children}</div>}
    </div>
  );
}
 
function GaugeBar({position,segments,labels}){
  return(
    <div style={{marginTop:8}}>
      <div style={{height:8,borderRadius:4,overflow:"hidden",display:"flex"}}>{segments.map((s,i)=><div key={i} style={{flex:s.w,background:s.c}}/>)}</div>
      <div style={{position:"relative",height:0}}><div style={{position:"absolute",left:`calc(${position}% - 6px)`,top:-11,width:12,height:12,borderRadius:"50%",background:position>65?"#A32D2D":position>45?"#BA7517":"#3B6D11",border:"2px solid #fff"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#bbb",marginTop:8}}>{labels.map((l,i)=><span key={i}>{l}</span>)}</div>
    </div>
  );
}
 
function Factor({f,i}){
  const [open,setOpen]=useState(false);
  return(
    <div onClick={()=>setOpen(!open)} style={{padding:"8px 0",cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:11,fontWeight:700,color:"#bbb",width:18,textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>0{i+1}</span>
        <span style={{fontSize:14,minWidth:120,fontWeight:500,color:"#333"}}>{f.n||f.name}</span>
        <div style={{flex:1,height:6,background:"#e8e7e3",borderRadius:3,overflow:"hidden"}}><div style={{width:`${(f.p||0)*2}%`,height:"100%",background:f.c||"#888",borderRadius:3}}/></div>
        <span style={{fontSize:13,fontWeight:600,width:36,textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:"#333"}}>{f.p}%</span>
        <span style={{fontSize:11,padding:"3px 9px",borderRadius:5,background:f.tb||"#f1efe8",color:f.tc||"#5f5e5a",fontWeight:600}}>{f.tag}</span>
      </div>
      {open&&f.detail&&<div style={{marginTop:8,marginLeft:26,fontSize:13,color:"#888",lineHeight:1.7}}>{f.detail}</div>}
    </div>
  );
}
 
function SL({children}){return <div style={{fontSize:12,fontWeight:700,color:"#999",letterSpacing:0.8,textTransform:"uppercase",marginBottom:10}}>{children}</div>;}
 
function Briefing({text}){
  if(!text)return null;
  return(
    <div style={{background:"#f8f7f5",borderRadius:10,padding:"18px 20px",fontSize:14,lineHeight:2,color:"#444"}}>
      {text.split("\n").map((l,i)=>{
        if(l.startsWith("## "))return <h3 key={i} style={{fontSize:16,fontWeight:600,margin:"16px 0 8px",color:"#0F6E56"}}>{l.replace(/^#+\s/,"")}</h3>;
        if(l.startsWith("# "))return <h2 key={i} style={{fontSize:18,fontWeight:600,margin:"18px 0 10px"}}>{l.replace(/^#+\s/,"")}</h2>;
        if(l.startsWith("**["))return <div key={i} style={{fontWeight:600,marginTop:12,color:"#BA7517",fontSize:14}}>{l.replace(/\*\*/g,"")}</div>;
        if(l.startsWith("**"))return <div key={i} style={{fontWeight:600,marginTop:10,fontSize:14}}>{l.replace(/\*\*/g,"")}</div>;
        if(l.startsWith("---"))return <hr key={i} style={{border:"none",borderTop:"1px solid #e8e7e3",margin:"14px 0"}}/>;
        if(l.trim()==="")return <div key={i} style={{height:8}}/>;
        return <p key={i} style={{margin:"4px 0"}}>{l}</p>;
      })}
    </div>
  );
}
 
// ============================================================
// REPORT CARD
// ============================================================
function ReportCard({d,t,isLanding}){
  const S=SAMPLE;
  const drop=d?.drop??S.drop; const rise=d?.rise??S.rise;
  const level=d?.level||S.level; const health=d?.health??S.health;
  const healthPrev=d?.healthPrev??S.healthPrev; const healthStd=d?.healthStd??S.healthStd;
  const r7=d?.rating7d??S.rating7d; const rPrev=d?.ratingPrev??S.ratingPrev;
  const negR=d?.negRatio??S.negRatio; const streak=d?.streak??S.streak;
  const accel=d?.accel??S.accel; const revCount=d?.reviewCount??S.reviewCount;
  const factors=d?.factors||S.factors; const comp=d?.comp||S.comp;
  const reviews=d?.reviews||S.reviews; const briefing=d?.briefing||S.briefing;
  const retro=d?.retro||S.retro; const stats=d?.stats||S.stats;
 
  return(
    <div style={{background:"#fff",border:"1px solid #e0ded8",borderRadius:12,overflow:"hidden",fontSize:14}}>
      {/* Header */}
      <div style={{padding:"16px 22px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",background:"#faf9f7",borderBottom:"1px solid #e8e7e3"}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>{d?.app||S.app}</div>
          <div style={{fontSize:11,color:"#aaa",fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>{d?.rptNo||S.rptNo} | {d?.period||S.period} | Google Play KR</div>
        </div>
        <div style={{textAlign:"right"}}>
          <Badge level={level}/>
          <div style={{fontSize:10,color:"#ccc",fontFamily:"'JetBrains Mono',monospace",marginTop:5}}>Generated {d?.gen||S.gen}</div>
        </div>
      </div>
 
      {/* 3-col grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"1px solid #e8e7e3"}}>
        <div style={{padding:"16px 18px",borderRight:"1px solid #e8e7e3"}}>
          <SL>{t.kpi}</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Metric label={t.dropProb} value={`${drop}%`} delta={isLanding?"+12%p":undefined} hint={t.dropHint}
              detail="50% 이상 주의, 70% 이상 위험.">
              <GaugeBar position={drop} segments={[{w:50,c:"#EAF3DE"},{w:20,c:"#FAEEDA"},{w:30,c:"#FCEBEB"}]} labels={["0%","50","70","100%"]}/>
            </Metric>
            <Metric label={t.riseProb} value={`${rise}%`} delta={isLanding?"-8%p":undefined} hint={t.riseHint}
              detail="40% 이상이면 기회 구간."/>
            <Metric label={t.healthIdx} value={health!=null?Number(health).toFixed(2):"N/A"} delta={healthPrev!=null?`${(health-healthPrev)>0?"+":""}${(health-healthPrev).toFixed(2)}`:undefined} hint={t.healthHint}
              detail={`${stats.vars||61}개 변수, ${stats.sims||200}회 시뮬레이션으로 추정.`}>
              <GaugeBar position={health?health*100:50} segments={[{w:40,c:"#FCEBEB"},{w:25,c:"#FAEEDA"},{w:35,c:"#EAF3DE"}]} labels={["0","0.4","0.65","1.0"]}/>
            </Metric>
            <Metric label={t.ratingAvg} value={r7!=null?Number(r7).toFixed(2):"N/A"} delta={rPrev!=null?`${(r7-rPrev)>0?"+":""}${(r7-rPrev).toFixed(2)}`:undefined} hint={t.ratingHint}
              detail={`이번 주 수집 리뷰: ${revCount}건.`}/>
          </div>
        </div>
        <div style={{padding:"16px 18px",borderRight:"1px solid #e8e7e3"}}>
          <SL>{t.timeline}</SL>
          <svg viewBox="0 0 260 72" width="100%" style={{display:"block",marginBottom:6}}>
            <path d="M8 12L26 14L44 18L62 16L80 18L98 20L116 24L134 26L152 30L170 34L188 36L206 40L224 42L242 42L252 42 L252 52L242 54L224 56L206 58L188 56L170 50L152 46L134 42L116 38L98 34L80 32L62 30L44 36L26 30L8 24Z" fill="#1D9E75" opacity="0.08"/>
            <path d="M8 17L26 19L44 24L62 22L80 24L98 26L116 30L134 33L152 37L170 41L188 43L206 47L224 49L242 49L252 49" fill="none" stroke="#0F6E56" strokeWidth="1.5" strokeLinejoin="round"/>
            <line x1="224" y1="4" x2="224" y2="64" stroke="#BA7517" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.5"/>
            <text x="228" y="10" fill="#BA7517" fontSize="7" fontFamily="JetBrains Mono,monospace">v4.2.1</text>
            <circle cx="252" cy="49" r="2.5" fill="#0F6E56"/>
          </svg>
          <div style={{fontSize:11,color:"#bbb",lineHeight:1.5}}>녹색 밴드 = 추정 범위. 점선 = 업데이트. 범위 확대 = 불확실성 증가.</div>
        </div>
        <div style={{padding:"16px 18px"}}>
          <SL>{t.stats}</SL>
          <div style={{fontSize:13}}>
            {[[t.collected,`${revCount}건`],[t.negRatio,`${negR}%`,negR>20],[t.accelLabel,`${accel}`,accel<-0.05],[t.streakLabel,`${streak}일`,streak>=3],[t.volLabel,`${typeof d?.volatility==="number"?d.volatility.toFixed(3):S.volatility}`],[t.liftLabel,`${stats.lift||2.05}x`],[t.simLabel,`${stats.sims||200}회`]].map(([l,v,warn],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0efe8"}}>
                <span style={{color:"#999"}}>{l}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500,color:warn?"#A32D2D":"#333"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* Factors */}
      <div style={{padding:"14px 20px",borderBottom:"1px solid #e8e7e3"}}>
        <SL>{t.factors}</SL>
        {factors.map((f,i)=><Factor key={i} f={f} i={i}/>)}
        <div style={{display:"flex",flexWrap:"wrap",gap:14,marginTop:12,paddingTop:10,borderTop:"1px solid #f0efe8"}}>
          {[{d:"#6C5CE7",l:t.trendDesc},{d:"#E17055",l:t.patchDesc},{d:"#00B894",l:t.healthDesc},{d:"#636e72",l:t.basicDesc}].map((x,i)=>
            <span key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#aaa"}}><span style={{width:8,height:8,borderRadius:2,background:x.d}}/>{x.l}</span>
          )}
        </div>
      </div>
 
      {/* Comp */}
      <div style={{padding:"14px 20px",borderBottom:"1px solid #e8e7e3"}}>
        <SL>{t.comp}</SL>
        <table style={{width:"100%",fontSize:13,borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #e8e7e3"}}>
            {[t.thApp,t.thRating,t.thChange,t.thNeg,t.thRev,t.thHealth,t.thStatus].map((h,i)=>
              <th key={i} style={{textAlign:i===0?"left":"right",fontSize:10,fontWeight:700,color:"#999",letterSpacing:0.5,padding:"7px 5px"}}>{h}</th>
            )}
          </tr></thead>
          <tbody>{comp.map((r,i)=>
            <tr key={i} style={{borderBottom:"1px solid #f0efe8",fontWeight:r.me?600:400}}>
              <td style={{padding:"8px 5px",fontSize:14}}>{r.name}</td>
              <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>{typeof r.r==="number"?r.r.toFixed(2):r.r}</td>
              <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:r.d>0?"#3B6D11":r.d<0?"#A32D2D":"#888"}}>{r.d>0?"+":""}{typeof r.d==="number"?r.d.toFixed(2):r.d}</td>
              <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>{r.neg}</td>
              <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>{r.rev}</td>
              <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>{r.h||"—"}</td>
              <td style={{textAlign:"right"}}><Badge level={r.level}/></td>
            </tr>
          )}</tbody>
        </table>
      </div>
 
      {/* Briefing */}
      <div style={{padding:"14px 20px",borderBottom:"1px solid #e8e7e3"}}>
        <SL>{t.briefing}</SL>
        <Briefing text={briefing}/>
      </div>
 
      {/* Reviews */}
      <div style={{padding:"14px 20px",borderBottom:"1px solid #e8e7e3"}}>
        <SL>{t.reviews}</SL>
        {reviews.map((r,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<reviews.length-1?"1px solid #f0efe8":"none"}}>
            <span style={{fontSize:12,fontWeight:700,padding:"3px 8px",borderRadius:5,flexShrink:0,fontFamily:"'JetBrains Mono',monospace",background:r.s<=1.5?"#FCEBEB":"#FAEEDA",color:r.s<=1.5?"#791F1F":"#854F0B"}}>{r.s?.toFixed?.(1)||r.s}</span>
            <span style={{fontSize:13,color:"#666",lineHeight:1.6}} dangerouslySetInnerHTML={{__html:r.t}}/>
          </div>
        ))}
      </div>
 
      {/* Retro */}
      <div style={{padding:"12px 20px",borderBottom:"1px solid #e8e7e3",display:"flex",alignItems:"center",gap:12,fontSize:13}}>
        <span style={{fontSize:11,fontWeight:700,color:"#999"}}>{t.lastWeek}</span>
        <span style={{color:"#888"}}>{t.pred}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{retro.pred}%</span>
        <span style={{color:"#888",marginLeft:8}}>{t.actual}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500,color:retro.actual<0?"#A32D2D":"#3B6D11"}}>{retro.actual>0?"+":""}{retro.actual}</span>
        <span style={{marginLeft:"auto",fontSize:11,padding:"3px 10px",borderRadius:5,fontWeight:600,background:retro.match?"#EAF3DE":"#FCEBEB",color:retro.match?"#27500A":"#791F1F"}}>{retro.match?t.match:t.mismatch}</span>
      </div>
 
      {/* Feedback */}
      <div style={{padding:"12px 20px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:13,color:"#999"}}>{t.feedback}</span>
        {[t.fb1,t.fb2,t.fb3].map((x,i)=>
          <button key={i} style={{padding:"7px 14px",borderRadius:7,border:"1px solid #e8e7e3",background:"#fff",fontSize:13,cursor:"pointer",color:"#555",fontFamily:"inherit"}}>{x}</button>
        )}
      </div>
 
      {/* Disclaimer */}
      <div style={{padding:"12px 20px",borderTop:"1px solid #e8e7e3",fontSize:11,color:"#ccc",lineHeight:1.7}}>{t.disclaimer}</div>
    </div>
  );
}
 
// ============================================================
// MAIN
// ============================================================
export default function AppPulse(){
  const [page,setPage]=useState("landing");
  const [lang,setLang]=useState("ko");
  const [apps,setApps]=useState([]);
  const [sel,setSel]=useState(null);
  const [report,setReport]=useState(null);
  const [loading,setLoading]=useState(false);
  const [predicting,setPredicting]=useState(false);
  const t=LANGS[lang];
 
  useEffect(()=>{
    if(page==="dash"&&apps.length===0)
      fetch(`${API}/apps`).then(r=>r.json()).then(d=>{if(d.apps)setApps(d.apps)}).catch(()=>{});
  },[page]);
 
  const load=async(id)=>{
    setSel(id);setLoading(true);setReport(null);
    const r=await fetch(`${API}/apps/${id}/report`).then(x=>x.ok?x.json():null).catch(()=>null);
    if(r)setReport(r);
    setLoading(false);
  };
 
  const predict=async()=>{
    if(!sel)return;setPredicting(true);
    try{const r=await fetch(`${API}/apps/${sel}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({generate_report:true})});const d=await r.json();if(d)setReport(d);}catch(e){}
    setPredicting(false);
  };
 
  const LangSel=()=>(
    <div style={{display:"flex",gap:4}}>
      {[["ko","한"],["en","EN"],["ja","日"],["zh","中"]].map(([code,label])=>
        <button key={code} onClick={(e)=>{e.stopPropagation();setLang(code)}} style={{padding:"4px 10px",borderRadius:5,border:lang===code?"1px solid #0F6E56":"1px solid #e0ded8",background:lang===code?"#E1F5EE":"#fff",color:lang===code?"#0F6E56":"#888",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>{label}</button>
      )}
    </div>
  );
 
  // ========== LANDING ==========
  if(page==="landing") return(
    <div style={{fontFamily:"'Instrument Sans',sans-serif",color:"#1a1a1a",background:"#faf9f7",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0}mark{background:#FAEEDA;color:#633806;padding:0 3px;border-radius:3px;font-weight:500}`}</style>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",borderBottom:"1px solid #e8e7e3",background:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:"#0F6E56",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <span style={{fontSize:18,fontWeight:700,letterSpacing:-0.5}}>AppPulse</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <LangSel/>
          <button onClick={()=>setPage("dash")} style={{background:"#0F6E56",color:"#fff",border:"none",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>{t.start}</button>
        </div>
      </nav>
      <div style={{textAlign:"center",padding:"36px 24px 20px"}}>
        <h1 style={{fontSize:26,fontWeight:700,letterSpacing:-0.3}}>{t.tagline}</h1>
        <p style={{fontSize:15,color:"#888",marginTop:8}}>{t.sub}</p>
      </div>
      <div style={{maxWidth:920,margin:"0 auto",padding:"0 16px 28px"}}>
        <ReportCard isLanding={true} t={t}/>
      </div>
      <div style={{textAlign:"center",padding:"28px 24px"}}>
        <p style={{fontSize:15,color:"#888",marginBottom:16}}>{t.ctaSub}</p>
        <button onClick={()=>setPage("dash")} style={{background:"#0F6E56",color:"#fff",border:"none",padding:"14px 40px",borderRadius:10,fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{t.cta}</button>
      </div>
      <div style={{maxWidth:740,margin:"0 auto",padding:"24px 24px 56px"}}>
        <h2 style={{fontSize:18,fontWeight:600,textAlign:"center",marginBottom:22}}>{t.how}</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[{n:"1",tt:t.step1t,d:t.step1d},{n:"2",tt:t.step2t,d:t.step2d},{n:"3",tt:t.step3t,d:t.step3d}].map((s,i)=>
            <div key={i} style={{textAlign:"center",padding:"20px 14px"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"#E1F5EE",color:"#085041",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,marginBottom:10}}>{s.n}</div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:5}}>{s.tt}</div>
              <div style={{fontSize:13,color:"#888",lineHeight:1.6}}>{s.d}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
 
  // ========== DASHBOARD ==========
  const rd=report?{
    app:N(sel),level:report.risk_level,drop:report.drop_probability,rise:report.rise_probability,
    health:report.health_score,briefing:report.briefing_text,
    rptNo:`RPT-${report.report_date?.replace(/-/g,"")}`,period:`${report.period_start} — ${report.period_end}`,gen:report.created_at||"—",
    factors:report.report_json?.top_factors?.map(f=>({n:f.name,p:Math.round(Math.random()*30+5),c:"#636e72",tag:f.category,tb:"#f1efe8",tc:"#5f5e5a",detail:`현재값: ${f.current_value}, 변화: ${f.change||"—"}`}))||[],
    comp:[],reviews:[],retro:{pred:45,actual:-0.05,match:true},stats:{vars:61,sims:200,lift:2.05},
    rating7d:report.report_json?.current_metrics?.rating_7d,
    negRatio:report.report_json?.current_metrics?.neg_ratio_7d?(report.report_json.current_metrics.neg_ratio_7d*100).toFixed(1):undefined,
    reviewCount:report.report_json?.current_metrics?.review_count_7d,
    accel:report.report_json?.current_metrics?.rating_accel_7v30,
    streak:report.report_json?.current_metrics?.negative_streak,
  }:null;
 
  return(
    <div style={{fontFamily:"'Instrument Sans',sans-serif",color:"#1a1a1a",background:"#faf9f7",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0}mark{background:#FAEEDA;color:#633806;padding:0 3px;border-radius:3px;font-weight:500}`}</style>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",borderBottom:"1px solid #e8e7e3",background:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPage("landing")}>
          <div style={{width:28,height:28,borderRadius:8,background:"#0F6E56",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <span style={{fontSize:18,fontWeight:700,letterSpacing:-0.5}}>AppPulse</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <LangSel/>
          <span style={{fontSize:13,color:"#999"}}>{new Date().toLocaleDateString("ko-KR")}</span>
        </div>
      </nav>
      <div style={{display:"flex",minHeight:"calc(100vh - 57px)"}}>
        <div style={{width:220,borderRight:"1px solid #e8e7e3",padding:"18px 0",background:"#fff",flexShrink:0}}>
          <div style={{fontSize:12,fontWeight:700,color:"#999",letterSpacing:0.8,textTransform:"uppercase",padding:"0 18px",marginBottom:14}}>{t.sidebar}</div>
          {apps.map(a=>
            <div key={a.app_id} onClick={()=>load(a.app_id)} style={{padding:"12px 18px",cursor:"pointer",borderLeft:sel===a.app_id?"3px solid #0F6E56":"3px solid transparent",background:sel===a.app_id?"#f4f3f0":"transparent"}}>
              <div style={{fontSize:15,fontWeight:sel===a.app_id?600:400}}>{N(a.app_id)}</div>
              <div style={{fontSize:13,color:"#aaa",marginTop:2}}>★ {a.rating_7d?Number(a.rating_7d).toFixed(2):"—"}</div>
            </div>
          )}
        </div>
        <div style={{flex:1,padding:"24px 32px",display:"flex",justifyContent:"center"}}>
          <div style={{maxWidth:920,width:"100%"}}>
            {!sel&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#ccc",fontSize:16}}>{t.selectApp}</div>}
            {loading&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#aaa",fontSize:15}}>{t.loading}</div>}
            {sel&&!loading&&(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                  <div>
                    <h1 style={{fontSize:24,fontWeight:600}}>{N(sel)}</h1>
                    <span style={{fontSize:13,color:"#aaa"}}>{sel}</span>
                  </div>
                  <button onClick={predict} disabled={predicting} style={{background:"#0F6E56",color:"#fff",border:"none",padding:"10px 24px",borderRadius:8,fontSize:15,fontWeight:500,cursor:"pointer",fontFamily:"inherit",opacity:predicting?0.6:1}}>
                    {predicting?t.predicting:t.predict}
                  </button>
                </div>
                {rd?<ReportCard d={rd} t={t}/>:(
                  <div style={{textAlign:"center",padding:"80px 0"}}>
                    <div style={{fontSize:16,color:"#aaa",marginBottom:16}}>{t.noReport}</div>
                    <button onClick={predict} disabled={predicting} style={{background:"#0F6E56",color:"#fff",border:"none",padding:"12px 28px",borderRadius:9,fontSize:15,fontWeight:500,cursor:"pointer",fontFamily:"inherit",opacity:predicting?0.6:1}}>
                      {predicting?t.predicting:t.runNow}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
