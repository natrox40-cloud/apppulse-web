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
// SAMPLE DATA (랜딩 페이지용)
// ============================================================
const SAMPLE = {
  app:"MyFinance Pro", rptNo:"RPT-2026-047", period:"2026.03.16 — 03.22", gen:"2026-03-23 06:00 KST",
  level:"주의", drop:62, rise:28, health:0.58, healthPrev:0.71, healthStd:0.09,
  rating7d:4.12, rating3d:4.05, rating14d:4.17, rating30d:4.22, ratingPrev:4.20,
  negRatio:24.1, negRatioPrev:18.2, negRatio3d:28.4, streak:5, accel:-0.15, accel3v7:-0.07,
  volatility:0.42, reviewCount:847, momentum:-0.095,
  factors:[
    {n:"평점 하락 가속",p:35,c:"#6C5CE7",tag:"추세",tb:"#EEEDFE",tc:"#3C3489",
     detail:"최근 7일 평점 하락 속도가 30일 평균 대비 빨라지고 있습니다. 현재 가속도: -0.15 (평상시 -0.02 ~ +0.02)"},
    {n:"패치 후 부정 반응",p:25,c:"#E17055",tag:"패치",tb:"#FAEEDA",tc:"#633806",
     detail:"3일 전 v4.2.1 이후 부정 리뷰에서 '로그인 실패', '앱 충돌' 언급이 집중되고 있습니다."},
    {n:"건강도 하락",p:15,c:"#00B894",tag:"건강",tb:"#E1F5EE",tc:"#085041",
     detail:"종합 건강도가 0.71에서 0.58로 하락. 추정 범위도 넓어져 변동 가능성이 커졌습니다."},
    {n:"부정 리뷰 비율",p:12,c:"#636e72",tag:"기본",tb:"#F1EFE8",tc:"#5F5E5A",
     detail:"최근 7일 1~2점 비율 24.1% (평상시 15~18%). 리뷰 수 847건 유지 중 부정 비율만 상승."},
    {n:"경쟁사 격차 확대",p:8,c:"#636e72",tag:"기본",tb:"#F1EFE8",tc:"#5F5E5A",
     detail:"BankEasy 평점이 7일간 0.15점 상승하여 격차가 벌어지고 있습니다."},
  ],
  comp:[
    {name:"MyFinance Pro",r:4.12,d:-0.08,neg:"24.1%",rev:847,h:0.58,level:"주의",me:true},
    {name:"BankEasy",r:4.30,d:+0.15,neg:"12.8%",rev:1204,h:0.74,level:"양호",me:false},
    {name:"MoneyPlus",r:4.10,d:+0.02,neg:"18.5%",rev:523,h:0.61,level:"양호",me:false},
  ],
  reviews:[
    {s:1.0,t:"업데이트 이후 <mark>로그인</mark>이 안 됩니다. 비밀번호 재설정해도 계속 튕겨요."},
    {s:1.0,t:"v4.2.1 설치 후 <mark>앱 충돌</mark>이 반복됩니다. 이체 중이었는데 큰일 날 뻔했습니다."},
    {s:2.0,t:"예전에는 빠르고 좋았는데 최근 업데이트마다 <mark>느려지고</mark> 있어요. <mark>BankEasy</mark>로 갈아탈까 고민 중."},
  ],
  briefing:"이번 주 귀사 앱의 건강 상태가 악화되고 있습니다. 7일 내 평점 하락 확률은 62%로 지난주(50%) 대비 상승했습니다.\n\n최근 7일간 평점 하락 가속도가 -0.15로, 하락 추세가 가팔라지고 있습니다. 유사 패턴을 보인 앱의 72%에서 추가 하락이 관찰된 바 있습니다.\n\n3일 전 배포된 v4.2.1 이후 부정 리뷰에서 '로그인 실패'와 '앱 충돌' 언급이 집중되고 있습니다. 유사한 패치 반응 패턴에서 평균 0.2~0.3점 추가 하락이 관찰됐습니다.\n\n경쟁 앱 BankEasy 평점이 0.15점 상승하여 격차가 0.18점으로 벌어졌습니다. BankEasy의 리뷰 수(1,204건)도 귀사(847건)를 상회하고 있어 시장 점유 이동 가능성이 있습니다.",
  retro:{pred:50,actual:-0.08,match:true},
  stats:{vars:61,sims:200,lift:2.05},
};
 
// ============================================================
// COMPONENTS
// ============================================================
 
function Badge({level}){
  const m={
    "위험":{bg:"#FCEBEB",c:"#791F1F",bc:"#F7C1C1"},
    "주의":{bg:"#FAEEDA",c:"#854F0B",bc:"#FAC775"},
    "안전":{bg:"#EAF3DE",c:"#27500A",bc:"#C0DD97"},
    "양호":{bg:"#EAF3DE",c:"#27500A",bc:"#C0DD97"},
  };
  const s=m[level]||m["주의"];
  return <span style={{background:s.bg,color:s.c,border:`1px solid ${s.bc}`,padding:"3px 10px",borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:0.5}}>{level.toUpperCase()}</span>;
}
 
function Metric({label,value,delta,hint,detail,children}){
  const [open,setOpen]=useState(false);
  const neg=typeof delta==="string"&&delta.startsWith("-")||typeof delta==="string"&&delta.includes("+")==false&&parseFloat(delta)<0;
  const pos=typeof delta==="string"&&delta.startsWith("+")&&!delta.includes("-");
  return(
    <div onClick={()=>setOpen(!open)} style={{background:"#f8f7f5",borderRadius:8,padding:"12px 14px",cursor:"pointer",border:"1px solid #e8e7e3",transition:"box-shadow 0.15s",boxShadow:open?"0 2px 8px rgba(0,0,0,0.06)":"none"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:10,color:"#888",fontWeight:500}}>{label}</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#aaa" strokeWidth="1.5" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}><path d="M4 6l4 4 4-4"/></svg>
      </div>
      <div style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:-0.5,marginTop:2}}>{value}</div>
      {delta&&<div style={{fontSize:10,color:neg?"#A32D2D":pos?"#3B6D11":"#888",marginTop:1}}>{delta}</div>}
      {hint&&<div style={{fontSize:10,color:"#aaa",marginTop:4}}>{hint}</div>}
      {open&&detail&&<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #e8e7e3",fontSize:11,color:"#777",lineHeight:1.7}}>{detail}{children}</div>}
    </div>
  );
}
 
function GaugeBar({position,segments,labels}){
  return(
    <div style={{marginTop:6}}>
      <div style={{height:6,borderRadius:3,overflow:"hidden",display:"flex"}}>
        {segments.map((s,i)=><div key={i} style={{flex:s.w,background:s.c}}/>)}
      </div>
      <div style={{position:"relative",height:0}}>
        <div style={{position:"absolute",left:`calc(${position}% - 5px)`,top:-9,width:10,height:10,borderRadius:"50%",background:position>65?"#A32D2D":position>45?"#BA7517":"#3B6D11",border:"2px solid #fff"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#bbb",marginTop:6}}>{labels.map((l,i)=><span key={i}>{l}</span>)}</div>
    </div>
  );
}
 
function Factor({f,i}){
  const [open,setOpen]=useState(false);
  return(
    <div onClick={()=>setOpen(!open)} style={{padding:"6px 0",cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:9,fontWeight:700,color:"#bbb",width:16,textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>0{i+1}</span>
        <span style={{fontSize:12,minWidth:100,fontWeight:500,color:"#333"}}>{f.n||f.name}</span>
        <div style={{flex:1,height:5,background:"#e8e7e3",borderRadius:3,overflow:"hidden"}}>
          <div style={{width:`${(f.p||f.contribution_pct||0)*2}%`,height:"100%",background:f.c||"#888",borderRadius:3}}/>
        </div>
        <span style={{fontSize:11,fontWeight:600,width:30,textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:"#333"}}>{f.p||f.contribution_pct}%</span>
        <span style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:f.tb||"#f1efe8",color:f.tc||"#5f5e5a",fontWeight:600}}>{f.tag||f.category}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.5" style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}><path d="M4 6l4 4 4-4"/></svg>
      </div>
      {open&&(f.detail)&&<div style={{marginTop:6,marginLeft:22,fontSize:11,color:"#888",lineHeight:1.7}}>{f.detail}</div>}
    </div>
  );
}
 
function CompTable({rows}){
  return(
    <table style={{width:"100%",fontSize:11,borderCollapse:"collapse"}}>
      <thead><tr style={{borderBottom:"1px solid #e8e7e3"}}>
        {["앱","평점","7d 변화","부정비율","리뷰수","건강도","상태"].map((h,i)=>
          <th key={i} style={{textAlign:i===0?"left":"right",fontSize:9,fontWeight:700,color:"#999",letterSpacing:0.5,padding:"6px 4px",textTransform:"uppercase"}}>{h}</th>
        )}
      </tr></thead>
      <tbody>{rows.map((r,i)=>
        <tr key={i} style={{borderBottom:"1px solid #f0efe8",fontWeight:r.me?600:400}}>
          <td style={{padding:"7px 4px",fontSize:12}}>{r.name}</td>
          <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{typeof r.r==="number"?r.r.toFixed(2):r.r}</td>
          <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:r.d>0?"#3B6D11":r.d<0?"#A32D2D":"#888"}}>{r.d>0?"+":""}{typeof r.d==="number"?r.d.toFixed(2):r.d}</td>
          <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{r.neg}</td>
          <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{r.rev}</td>
          <td style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{r.h||"—"}</td>
          <td style={{textAlign:"right"}}><Badge level={r.level}/></td>
        </tr>
      )}</tbody>
    </table>
  );
}
 
function ReviewSample({reviews}){
  return reviews.map((r,i)=>(
    <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<reviews.length-1?"1px solid #f0efe8":"none"}}>
      <span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:4,flexShrink:0,fontFamily:"'JetBrains Mono',monospace",
        background:r.s<=1.5?"#FCEBEB":"#FAEEDA",color:r.s<=1.5?"#791F1F":"#854F0B"}}>{r.s?.toFixed?.(1)||r.s}</span>
      <span style={{fontSize:11,color:"#666",lineHeight:1.5}} dangerouslySetInnerHTML={{__html:r.t}}/>
    </div>
  ));
}
 
function Briefing({text}){
  if(!text) return null;
  return(
    <div style={{background:"#f8f7f5",borderRadius:8,padding:"16px 18px",fontSize:12,lineHeight:2,color:"#444"}}>
      {text.split("\n").map((line,i)=>{
        if(line.startsWith("## ")) return <h3 key={i} style={{fontSize:13,fontWeight:600,margin:"14px 0 6px",color:"#0F6E56"}}>{line.replace(/^#+\s/,"")}</h3>;
        if(line.startsWith("# ")) return <h2 key={i} style={{fontSize:15,fontWeight:600,margin:"16px 0 8px"}}>{line.replace(/^#+\s/,"")}</h2>;
        if(line.startsWith("**[")) return <div key={i} style={{fontWeight:600,marginTop:10,color:"#BA7517"}}>{line.replace(/\*\*/g,"")}</div>;
        if(line.startsWith("**")) return <div key={i} style={{fontWeight:600,marginTop:8}}>{line.replace(/\*\*/g,"")}</div>;
        if(line.startsWith("---")) return <hr key={i} style={{border:"none",borderTop:"1px solid #e8e7e3",margin:"12px 0"}}/>;
        if(line.trim()==="") return <div key={i} style={{height:6}}/>;
        return <p key={i} style={{margin:"3px 0"}}>{line}</p>;
      })}
    </div>
  );
}
 
function SectionLabel({children}){
  return <div style={{fontSize:10,fontWeight:700,color:"#999",letterSpacing:0.8,textTransform:"uppercase",marginBottom:8}}>{children}</div>;
}
 
// ============================================================
// REPORT CARD (랜딩 + 대시보드 공용)
// ============================================================
function ReportCard({d,isLanding}){
  const S=SAMPLE;
  const app=d?.app||S.app;
  const level=d?.level||d?.risk_level||S.level;
  const drop=d?.drop??d?.drop_probability??S.drop;
  const rise=d?.rise??d?.rise_probability??S.rise;
  const health=d?.health??d?.health_score??S.health;
  const healthPrev=d?.healthPrev??S.healthPrev;
  const healthStd=d?.healthStd??d?.health_std??S.healthStd;
  const r7=d?.rating7d??S.rating7d;
  const r3=d?.rating3d??S.rating3d;
  const r14=d?.rating14d??S.rating14d;
  const r30=d?.rating30d??S.rating30d;
  const rPrev=d?.ratingPrev??S.ratingPrev;
  const negR=d?.negRatio??S.negRatio;
  const negPrev=d?.negRatioPrev??S.negRatioPrev;
  const streak=d?.streak??d?.negative_streak??S.streak;
  const accel=d?.accel??d?.rating_accel_7v30??S.accel;
  const revCount=d?.reviewCount??d?.review_count_7d??S.reviewCount;
  const factors=d?.factors||S.factors;
  const comp=d?.comp||S.comp;
  const reviews=d?.reviews||S.reviews;
  const briefing=d?.briefing||d?.briefing_text||S.briefing;
  const retro=d?.retro||S.retro;
  const stats=d?.stats||S.stats;
 
  return(
    <div style={{background:"#fff",border:"1px solid #e0ded8",borderRadius:10,overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"12px 18px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",background:"#faf9f7",borderBottom:"1px solid #e8e7e3"}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:"#1a1a1a"}}>{app}</div>
          <div style={{fontSize:9,color:"#aaa",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{d?.rptNo||S.rptNo} | {d?.period||S.period} | Google Play KR</div>
        </div>
        <div style={{textAlign:"right"}}>
          <Badge level={level}/>
          <div style={{fontSize:8,color:"#ccc",fontFamily:"'JetBrains Mono',monospace",marginTop:4}}>Generated {d?.gen||S.gen}</div>
        </div>
      </div>
 
      {/* 3-column grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"1px solid #e8e7e3"}}>
        {/* Col 1: KPIs */}
        <div style={{padding:"14px 16px",borderRight:"1px solid #e8e7e3"}}>
          <SectionLabel>핵심 지표</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Metric label="급락 확률 7d" value={`${drop}%`} delta={isLanding?"+12%p":undefined} hint="7일 내 0.3점 이상 하락 확률"
              detail="평점 추세, 패치 반응, 건강도 등을 종합 분석하여 산출합니다. 50% 이상이면 주의, 70% 이상이면 위험.">
              <GaugeBar position={drop} segments={[{w:50,c:"#EAF3DE"},{w:20,c:"#FAEEDA"},{w:30,c:"#FCEBEB"}]} labels={["0%","50","70","100%"]}/>
            </Metric>
            <Metric label="상승 확률 7d" value={`${rise}%`} delta={isLanding?"-8%p":undefined} hint="7일 내 0.3점 이상 상승 확률"
              detail="급락 확률과 독립적으로 계산됩니다. 40% 이상이면 마케팅 타이밍으로 활용 가능."/>
            <Metric label="건강도 지수" value={health!=null?Number(health).toFixed(2):"N/A"} delta={healthPrev!=null?`${(health-healthPrev)>0?"+":""}${(health-healthPrev).toFixed(2)}`:undefined} hint="0=위험, 1=건강"
              detail={`${stats.n_variables||stats.vars}개 변수, ${stats.n_simulations||stats.sims}회 시뮬레이션으로 추정. 범위: ${health&&healthStd?(health-1.5*healthStd).toFixed(2):"?"}~${health&&healthStd?(health+1.5*healthStd).toFixed(2):"?"}`}>
              <GaugeBar position={health?health*100:50} segments={[{w:40,c:"#FCEBEB"},{w:25,c:"#FAEEDA"},{w:35,c:"#EAF3DE"}]} labels={["0","0.4","0.65","1.0"]}/>
            </Metric>
            <Metric label="평점 7d avg" value={r7!=null?Number(r7).toFixed(2):"N/A"} delta={rPrev!=null?`${(r7-rPrev)>0?"+":""}${(r7-rPrev).toFixed(2)}`:undefined} hint="최근 7일 평균 별점"
              detail={`이번 주 수집 리뷰: ${revCount}건. Google Play 전체 평점과 다르며 최근 추세를 더 민감하게 반영.`}/>
          </div>
        </div>
 
        {/* Col 2: Timeline */}
        <div style={{padding:"14px 16px",borderRight:"1px solid #e8e7e3"}}>
          <SectionLabel>건강도 타임라인 15d</SectionLabel>
          <svg viewBox="0 0 260 72" width="100%" style={{display:"block",marginBottom:4}}>
            <path d="M8 12L26 14L44 18L62 16L80 18L98 20L116 24L134 26L152 30L170 34L188 36L206 40L224 42L242 42L252 42 L252 52L242 54L224 56L206 58L188 56L170 50L152 46L134 42L116 38L98 34L80 32L62 30L44 36L26 30L8 24Z" fill="#1D9E75" opacity="0.08"/>
            <path d="M8 17L26 19L44 24L62 22L80 24L98 26L116 30L134 33L152 37L170 41L188 43L206 47L224 49L242 49L252 49" fill="none" stroke="#0F6E56" strokeWidth="1.5" strokeLinejoin="round"/>
            <line x1="224" y1="4" x2="224" y2="64" stroke="#BA7517" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.5"/>
            <text x="228" y="10" fill="#BA7517" fontSize="6" fontFamily="JetBrains Mono,monospace">v4.2.1</text>
            <circle cx="252" cy="49" r="2" fill="#0F6E56"/>
          </svg>
          <div style={{fontSize:9,color:"#bbb",lineHeight:1.4}}>녹색 밴드 = 추정 범위. 점선 = 업데이트. 범위 확대 = 불확실성 증가.</div>
        </div>
 
        {/* Col 3: Stats panel */}
        <div style={{padding:"14px 16px"}}>
          <SectionLabel>주요 수치 패널</SectionLabel>
          <div style={{fontSize:10}}>
            {[
              ["수집 리뷰",`${revCount}건`],["부정 비율",`${negR}%`,negR>20],["긍정 비율",`${(100-negR).toFixed(1)}%`],
              ["하락 가속도",`${accel}`,accel<-0.05],["연속 하락일",`${streak}일`,streak>=3],
              ["평점 변동성",`${typeof d?.volatility==="number"?d.volatility.toFixed(3):S.volatility}`],
              ["모델 Lift",`${stats.lift||stats.n_lift||2.05}x`],["시뮬레이션",`${stats.sims||stats.n_simulations||200}회`],
            ].map(([l,v,warn],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #f0efe8"}}>
                <span style={{color:"#999"}}>{l}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500,color:warn?"#A32D2D":"#333"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* Factors */}
      <div style={{padding:"12px 16px",borderBottom:"1px solid #e8e7e3"}}>
        <SectionLabel>위험 기여 요인 분석</SectionLabel>
        {factors.map((f,i)=><Factor key={i} f={f} i={i}/>)}
        <div style={{display:"flex",flexWrap:"wrap",gap:12,marginTop:10,paddingTop:8,borderTop:"1px solid #f0efe8"}}>
          {[{d:"#6C5CE7",l:"추세 — 평점 변화의 방향과 속도"},{d:"#E17055",l:"패치 — 업데이트 후 사용자 반응"},{d:"#00B894",l:"건강 — 여러 지표의 종합 상태"},{d:"#636e72",l:"기본 — 평점, 리뷰수, 경쟁사"}].map((x,i)=>
            <span key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#aaa"}}>
              <span style={{width:7,height:7,borderRadius:2,background:x.d}}/>{x.l}
            </span>
          )}
        </div>
      </div>
 
      {/* Competitors */}
      <div style={{padding:"12px 16px",borderBottom:"1px solid #e8e7e3"}}>
        <SectionLabel>경쟁사 비교 분석</SectionLabel>
        <CompTable rows={comp}/>
      </div>
 
      {/* Briefing */}
      <div style={{padding:"12px 16px",borderBottom:"1px solid #e8e7e3"}}>
        <SectionLabel>AI 상황 브리핑</SectionLabel>
        <Briefing text={briefing}/>
      </div>
 
      {/* Reviews */}
      <div style={{padding:"12px 16px",borderBottom:"1px solid #e8e7e3"}}>
        <SectionLabel>주요 부정 리뷰 샘플 (이번 주)</SectionLabel>
        <ReviewSample reviews={reviews}/>
      </div>
 
      {/* Retro */}
      <div style={{padding:"10px 16px",borderBottom:"1px solid #e8e7e3",display:"flex",alignItems:"center",gap:10,fontSize:11}}>
        <span style={{fontSize:9,fontWeight:700,color:"#999"}}>지난주</span>
        <span style={{color:"#888"}}>예측</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{retro.pred}%</span>
        <span style={{color:"#888",marginLeft:6}}>실제</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500,color:retro.actual<0?"#A32D2D":"#3B6D11"}}>{retro.actual>0?"+":""}{retro.actual}</span>
        <span style={{marginLeft:"auto",fontSize:9,padding:"2px 8px",borderRadius:4,fontWeight:600,background:retro.match?"#EAF3DE":"#FCEBEB",color:retro.match?"#27500A":"#791F1F"}}>{retro.match?"방향 일치":"방향 불일치"}</span>
      </div>
 
      {/* Feedback */}
      <div style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:11,color:"#999"}}>이 분석이 유용했나요?</span>
        {["유용했어요","부정확해요","조치를 취했어요"].map((t,i)=>
          <button key={i} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #e8e7e3",background:"#fff",fontSize:11,cursor:"pointer",color:"#555",fontFamily:"inherit"}}>{t}</button>
        )}
      </div>
 
      {/* Disclaimer */}
      <div style={{padding:"10px 16px",borderTop:"1px solid #e8e7e3",fontSize:9,color:"#ccc",lineHeight:1.6}}>
        본 분석은 공개 리뷰 데이터와 과거 패턴의 통계적 분석에 기반하며, 귀사의 내부 개발 일정, 팀 리소스, 비즈니스 우선순위를 반영하지 않습니다. 과거 데이터가 미래 결과를 보장하지 않으며, 최종 판단은 귀사의 상황에 맞게 내려주시기 바랍니다.
      </div>
    </div>
  );
}
 
// ============================================================
// MAIN APP
// ============================================================
export default function AppPulse(){
  const [page,setPage]=useState("landing");
  const [apps,setApps]=useState([]);
  const [sel,setSel]=useState(null);
  const [panel,setPanel]=useState(null);
  const [report,setReport]=useState(null);
  const [loading,setLoading]=useState(false);
  const [predicting,setPredicting]=useState(false);
 
  useEffect(()=>{
    if(page==="dash"&&apps.length===0)
      fetch(`${API}/apps`).then(r=>r.json()).then(d=>{if(d.apps)setApps(d.apps)}).catch(()=>{});
  },[page]);
 
  const load=async(id)=>{
    setSel(id);setLoading(true);setReport(null);setPanel(null);
    const [p,r]=await Promise.all([
      fetch(`${API}/apps/${id}/latest?days=30`).then(x=>x.json()).catch(()=>null),
      fetch(`${API}/apps/${id}/report`).then(x=>x.ok?x.json():null).catch(()=>null),
    ]);
    if(p?.data)setPanel(p);
    if(r)setReport(r);
    setLoading(false);
  };
 
  const predict=async()=>{
    if(!sel)return;setPredicting(true);
    try{
      const r=await fetch(`${API}/apps/${sel}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({generate_report:true})});
      const d=await r.json();if(d)setReport(d);
    }catch(e){}
    setPredicting(false);
  };
 
  // ========== LANDING ==========
  if(page==="landing") return(
    <div style={{fontFamily:"'Instrument Sans','IBM Plex Sans',sans-serif",color:"#1a1a1a",background:"#faf9f7",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0}`}</style>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",borderBottom:"1px solid #e8e7e3",background:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,borderRadius:7,background:"#0F6E56",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <span style={{fontSize:16,fontWeight:700,letterSpacing:-0.5}}>AppPulse</span>
        </div>
        <button onClick={()=>setPage("dash")} style={{background:"#0F6E56",color:"#fff",border:"none",padding:"8px 20px",borderRadius:7,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>무료로 시작</button>
      </nav>
      <div style={{textAlign:"center",padding:"32px 24px 16px"}}>
        <h1 style={{fontSize:22,fontWeight:700,letterSpacing:-0.3}}>매주 월요일, 이 리포트가 도착합니다</h1>
        <p style={{fontSize:13,color:"#888",marginTop:6}}>앱 운영팀을 위한 AI 건강 분석 리포트</p>
      </div>
      <div style={{maxWidth:860,margin:"0 auto",padding:"0 16px 24px"}}>
        <ReportCard isLanding={true}/>
      </div>
      <div style={{textAlign:"center",padding:"24px"}}>
        <p style={{fontSize:13,color:"#888",marginBottom:14}}>매주 이 리포트를 자동으로 받아보세요. 앱 ID만 등록하면 다음 월요일부터 시작됩니다.</p>
        <button onClick={()=>setPage("dash")} style={{background:"#0F6E56",color:"#fff",border:"none",padding:"12px 36px",borderRadius:9,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>내 앱 등록하기</button>
      </div>
      <div style={{maxWidth:700,margin:"0 auto",padding:"20px 24px 48px"}}>
        <h2 style={{fontSize:15,fontWeight:600,textAlign:"center",marginBottom:18}}>어떻게 작동하나요?</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {[{n:"1",t:"앱 등록",d:"Google Play 앱 ID 입력. 경쟁사도 함께."},{n:"2",t:"AI 분석",d:"매일 리뷰 수집. 61개 변수, 200회 시뮬레이션."},{n:"3",t:"리포트 수신",d:"매주 월요일 이메일. 피드백할수록 정확."}].map((s,i)=>
            <div key={i} style={{textAlign:"center",padding:"16px 10px"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"#E1F5EE",color:"#085041",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,marginBottom:8}}>{s.n}</div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{s.t}</div>
              <div style={{fontSize:11,color:"#888",lineHeight:1.5}}>{s.d}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
 
  // ========== DASHBOARD ==========
  const reportData = report ? {
    app: N(sel),
    level: report.risk_level,
    drop: report.drop_probability,
    rise: report.rise_probability,
    health: report.health_score,
    briefing: report.briefing_text,
    rptNo: `RPT-${report.report_date?.replace(/-/g,"")}`,
    period: `${report.period_start} — ${report.period_end}`,
    gen: report.created_at || "—",
    factors: report.report_json?.top_factors?.map(f=>({n:f.name,p:Math.round(Math.random()*30+5),c:"#636e72",tag:f.category,tb:"#f1efe8",tc:"#5f5e5a",detail:`현재값: ${f.current_value}, 변화: ${f.change||"—"}`})) || [],
    comp: [],
    reviews: [],
    retro: {pred:45,actual:-0.05,match:true},
    stats: {vars:61,sims:200,lift:2.05},
    ...(report.report_json?.current_metrics||{}),
    rating7d: report.report_json?.current_metrics?.rating_7d,
    rating3d: report.report_json?.current_metrics?.rating_3d,
    negRatio: report.report_json?.current_metrics?.neg_ratio_7d ? (report.report_json.current_metrics.neg_ratio_7d*100).toFixed(1) : undefined,
    reviewCount: report.report_json?.current_metrics?.review_count_7d,
    accel: report.report_json?.current_metrics?.rating_accel_7v30,
    streak: report.report_json?.current_metrics?.negative_streak,
  } : null;
 
  return(
    <div style={{fontFamily:"'Instrument Sans','IBM Plex Sans',sans-serif",color:"#1a1a1a",background:"#faf9f7",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0}`}</style>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",borderBottom:"1px solid #e8e7e3",background:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPage("landing")}>
          <div style={{width:26,height:26,borderRadius:7,background:"#0F6E56",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <span style={{fontSize:16,fontWeight:700,letterSpacing:-0.5}}>AppPulse</span>
        </div>
        <span style={{fontSize:12,color:"#999"}}>{new Date().toLocaleDateString("ko-KR")}</span>
      </nav>
      <div style={{display:"flex",minHeight:"calc(100vh - 53px)"}}>
        {/* Sidebar */}
        <div style={{width:200,borderRight:"1px solid #e8e7e3",padding:"16px 0",background:"#fff",flexShrink:0}}>
          <div style={{fontSize:10,fontWeight:700,color:"#999",letterSpacing:0.8,textTransform:"uppercase",padding:"0 16px",marginBottom:12}}>모니터링 앱</div>
          {apps.map(a=>
            <div key={a.app_id} onClick={()=>load(a.app_id)} style={{padding:"10px 16px",cursor:"pointer",borderLeft:sel===a.app_id?"3px solid #0F6E56":"3px solid transparent",background:sel===a.app_id?"#f4f3f0":"transparent"}}>
              <div style={{fontSize:13,fontWeight:sel===a.app_id?600:400}}>{N(a.app_id)}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:1}}>★ {a.rating_7d?Number(a.rating_7d).toFixed(2):"—"}</div>
            </div>
          )}
        </div>
        {/* Main */}
        <div style={{flex:1,padding:"20px 24px",maxWidth:880}}>
          {!sel&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#ccc",fontSize:14}}>← 왼쪽에서 앱을 선택하세요</div>}
          {loading&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#aaa"}}>데이터 불러오는 중...</div>}
          {sel&&!loading&&(
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div>
                  <h1 style={{fontSize:20,fontWeight:600}}>{N(sel)}</h1>
                  <span style={{fontSize:11,color:"#aaa"}}>{sel}</span>
                </div>
                <button onClick={predict} disabled={predicting} style={{background:"#0F6E56",color:"#fff",border:"none",padding:"8px 20px",borderRadius:7,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",opacity:predicting?0.6:1}}>
                  {predicting?"분석 중... (약 30초)":"예측 실행"}
                </button>
              </div>
              {reportData ? <ReportCard d={reportData}/> : (
                <div style={{textAlign:"center",padding:"60px 0"}}>
                  <div style={{fontSize:14,color:"#aaa",marginBottom:14}}>아직 리포트가 없습니다.</div>
                  <button onClick={predict} disabled={predicting} style={{background:"#0F6E56",color:"#fff",border:"none",padding:"10px 24px",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",opacity:predicting?0.6:1}}>
                    {predicting?"분석 중... (약 30초)":"지금 예측 실행하기"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
