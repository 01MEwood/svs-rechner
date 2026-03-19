'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  trackStep, trackInfoClick, trackShare, trackComplete,
  getStats, incrementViews, submitRating as submitRatingStore, hasUserRated,
} from '../lib/tracking';

// ─── DESIGN TOKENS ──────────────────────────
const C = {
  orange: '#E8710A', orangeLight: '#FEF4E8', orangeMid: '#F5A623',
  orangeDark: '#B85A0A', orangeGlow: 'rgba(232,113,10,0.12)',
  bg: '#FAFAF9', card: '#FFFFFF', border: '#F0EEEB', borderHover: '#E0DDD8',
  text: '#1A1A1A', textSec: '#6B6560', textTer: '#A39E97',
  green: '#2D9D4E', greenLight: '#EEFAF0', red: '#D93025', redLight: '#FFF0EE',
  yellow: '#F5A623', yellowLight: '#FEF9EE', blue: '#1A73E8', blueLight: '#EEF4FD',
  purple: '#7C3AED',
};
const FONT = "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',system-ui,sans-serif";

// ─── INFO DATA ──────────────────────────────
const INFO = {
  rechtsform:{title:"Rechtsform & BWA",items:[{l:"Einzelunternehmen / GbR",v:"Inhaberlohn \u2260 BWA"},{l:"GmbH / UG / KG",v:"GF-Gehalt = BWA"}],hint:"Als Einzelunternehmer nimmst du Privatentnahmen (Kto. 2100) \u2014 die erscheinen NICHT im Personalaufwand deiner BWA."},
  unternehmerlohn:{title:"Kalkulatorischer Unternehmerlohn",items:[{l:"Meistergehalt angestellt (BW)",v:"4.500\u20136.500 \u20AC/Mo"},{l:"Inkl. private KV/RV",v:"ca. 900\u20131.200 \u20AC/Mo"},{l:"Mindestansatz",v:"3.500 \u20AC/Mo"}],hint:"Was m\u00FCsste ein angestellter Meister verdienen, der deinen Job macht?"},
  inhaberProd:{title:"Produktivanteil Inhaber",items:[{l:"Ein-Mann-Betrieb",v:"60\u201380 %"},{l:"2\u20133 Mitarbeiter",v:"40\u201360 %"},{l:"4\u20136 Mitarbeiter",v:"20\u201340 %"},{l:"7+ Mitarbeiter",v:"0\u201320 %"}],hint:"Wie viel deiner Arbeitszeit verbringst du DIREKT am Werkst\u00FCck?"},
  personal:{title:"Personalkosten \u2014 BWA Kto. 4000\u20134199",items:[{l:"Gesellenlohn (Tarif BW)",v:"17,50\u201320,00 \u20AC/h"},{l:"Meisterlohn (angestellt)",v:"22,00\u201328,00 \u20AC/h"}],hint:"Stundenlohn wird auf Jahresgehalt hochgerechnet. Urlaub und Lohnfortzahlung sind enthalten."},
  lohnnebenkosten:{title:"Lohnnebenkosten (AG-Anteil)",items:[{l:"Sozialversicherung",v:"ca. 21 %"},{l:"BG Holz + Umlagen",v:"ca. 7\u201311 %"},{l:"Sonderzahlungen",v:"ca. 8\u201312 %"},{l:"Gesamt typisch",v:"38\u201345 %"}],hint:"Gegenprobe: BWA Personalaufwand \u00F7 Bruttol\u00F6hne \u2212 1, dann \u00D7 100."},
  raumkosten:{title:"Raumkosten \u2014 Kto. 4200\u20134299",items:[{l:"Werkstattmiete",v:"1.200\u20133.000 \u20AC/Mo"},{l:"Heizung/Strom/Wasser",v:"400\u2013900 \u20AC/Mo"}],hint:"Bei Eigentum: kalkulatorische Miete (Marktwert) ansetzen."},
  maschinen:{title:"Maschinen \u2014 Kto. 4800\u20134960",items:[{l:"AfA + Wartung + Werkzeug",v:"1.500\u20133.500 \u20AC/Mo"},{l:"CNC Leasing + Wartung",v:"1.000\u20132.500 \u20AC/Mo"}],hint:"AfA + Wartung + Reparaturen + Verschlei\u00DFwerkzeug + Maschinenstrom."},
  fahrzeuge:{title:"Fahrzeuge \u2014 Kto. 4500\u20134580",items:[{l:"Transporter komplett",v:"800\u20131.500 \u20AC/Mo"}],hint:"Leasing/AfA + Versicherung + Steuer + Kraftstoff + Wartung."},
  versicherungen:{title:"Versicherungen \u2014 Kto. 4360\u20134390",items:[{l:"Betriebshaftpflicht + Inhalt",v:"130\u2013350 \u20AC/Mo"},{l:"IHK + HWK + Innung",v:"110\u2013310 \u20AC/Mo"}],hint:"OHNE BG \u2014 die steckt in den Lohnnebenkosten."},
  verwaltung:{title:"Verwaltung \u2014 BWA diverse",items:[{l:"Steuerberater",v:"200\u2013500 \u20AC/Mo"},{l:"Software + IT",v:"100\u2013400 \u20AC/Mo"},{l:"Telefon + Werbung",v:"180\u2013650 \u20AC/Mo"}],hint:"BWA: \u201ESonstige betriebl. Aufwendungen\u201C minus bereits erfasste Positionen."},
  zeit:{title:"Anwesenheitstage",items:[{l:"Arbeitstage (BW)",v:"ca. 249"},{l:"\u2212 Urlaub+Krankh.+Fortb.",v:"\u221243"},{l:"= Anwesenheitstage",v:"ca. 206"}],hint:"Gilt f\u00FCr jeden produktiven Kopf."},
  produktivitaet:{title:"Produktivit\u00E4tsgrad Angestellte",items:[{l:"Sehr gut",v:"75\u201380 %"},{l:"Gut",v:"70\u201375 %"},{l:"Durchschnitt",v:"65\u201370 %"}],hint:"Nur Zeit am Werkst\u00FCck. Fahrt, Aufma\u00DF, Telefon = NICHT produktiv."},
  gewinn:{title:"Gewinn- und Risikozuschlag",items:[{l:"Minimum",v:"5 %"},{l:"Solide",v:"8\u201310 %"},{l:"Investitionsf\u00E4hig",v:"10\u201315 %"}],hint:"Ohne Gewinn arbeitest du auf Selbstkosten."},
  ergebnis:{title:"Branchenwerte Schreiner BW",items:[{l:"Existenzgef\u00E4hrdend",v:"< 55 \u20AC/h"},{l:"Unterdurchschnittlich",v:"55\u201365 \u20AC/h"},{l:"Branchendurchschnitt",v:"66\u201378 \u20AC/h"},{l:"Gut kalkuliert",v:"78\u201390 \u20AC/h"},{l:"Premium",v:"90\u2013120 \u20AC/h"}],hint:"Interner Verrechnungssatz f\u00FCr Werkstattleistung \u2014 nicht Angebotspreis."},
};

const STEPS = ["Start","Info","Rechtsform","L\u00F6hne","LNK","Raum","Maschinen","Fahrzeuge","Vers.","Verwaltung","Stunden","Gewinn","Ergebnis"];

// ─── UI PRIMITIVES ──────────────────────────

function Modal({open,onClose,k}){const d=INFO[k];if(!open||!d)return null;return(
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,animation:"fadeIn .2s"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"28px 24px 32px",maxWidth:480,width:"100%",maxHeight:"80vh",overflowY:"auto",animation:"sheetUp .3s cubic-bezier(.32,.72,0,1)",boxShadow:"0 -10px 40px rgba(0,0,0,0.12)"}}>
      <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>
      <h3 style={{fontSize:18,fontWeight:600,color:C.text,margin:"0 0 16px",letterSpacing:-0.3}}>{d.title}</h3>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {d.items.map((item,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",background:C.bg,borderRadius:12,gap:12}}>
            <span style={{fontSize:14,color:C.textSec}}>{item.l}</span>
            <span style={{fontSize:14,fontWeight:600,color:C.text,whiteSpace:"nowrap"}}>{item.v}</span>
          </div>
        ))}
      </div>
      {d.hint&&<div style={{marginTop:16,padding:"14px 16px",background:C.orangeLight,borderRadius:12}}><p style={{fontSize:13,color:C.orangeDark,margin:0,lineHeight:1.55}}>{d.hint}</p></div>}
    </div>
  </div>
);}

function IBtn({k,setModal}){return(
  <button onClick={()=>{setModal(k);trackInfoClick(k);}} style={{width:24,height:24,borderRadius:"50%",border:`1.5px solid ${C.orange}`,background:"transparent",color:C.orange,fontWeight:700,fontSize:12,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>?</button>
);}

function Progress({cur,tot}){const pct=Math.round((cur/(tot-1))*100);return(
  <div style={{padding:"0 4px",marginBottom:20}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
      <span style={{fontSize:13,color:C.textTer,fontWeight:500}}>Schritt {cur+1} von {tot}</span>
      <span style={{fontSize:13,color:C.orange,fontWeight:600}}>{pct} %</span>
    </div>
    <div style={{height:4,background:C.border,borderRadius:2}}>
      <div style={{height:"100%",background:C.orange,borderRadius:2,width:`${pct}%`,transition:"width .4s cubic-bezier(.32,.72,0,1)"}}/>
    </div>
  </div>
);}

function Inp({label,sub,value,onChange,unit,min,max,step=1,info,bwa,setModal}){return(
  <div style={{marginBottom:20}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
      <label style={{fontSize:15,fontWeight:600,color:C.text,letterSpacing:-0.2}}>{label}</label>
      {info&&<IBtn k={info} setModal={setModal}/>}
    </div>
    {sub&&<p style={{fontSize:13,color:C.textTer,margin:"0 0 6px",lineHeight:1.45}}>{sub}</p>}
    {bwa&&<p style={{fontSize:12,color:C.orangeDark,margin:"0 0 10px",opacity:0.85}}>BWA: {bwa}</p>}
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{flex:1,height:6,borderRadius:3,accentColor:C.orange,cursor:"pointer"}}/>
      <div style={{display:"flex",alignItems:"baseline",gap:2,background:C.bg,padding:"8px 14px",borderRadius:12,minWidth:unit?108:72,justifyContent:"center",border:`1px solid ${C.border}`}}>
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={e=>{const v=Number(e.target.value);if(!isNaN(v))onChange(Math.min(max,Math.max(min,v)));}}
          style={{width:52,border:"none",background:"transparent",fontSize:18,fontWeight:600,color:C.text,textAlign:"right",outline:"none",fontFamily:FONT}}/>
        {unit&&<span style={{fontSize:13,color:C.textTer,fontWeight:500}}>{unit}</span>}
      </div>
    </div>
  </div>
);}

function Btn({children,onClick,primary=false,style:s={}}){return(
  <button onClick={onClick} style={{flex:1,padding:"15px 20px",borderRadius:14,cursor:"pointer",fontSize:15,fontWeight:600,letterSpacing:-0.2,border:primary?"none":`1.5px solid ${C.border}`,background:primary?C.orange:C.card,color:primary?"#fff":C.textSec,boxShadow:primary?"0 4px 16px rgba(232,113,10,0.25)":"none",transition:"transform .1s",...s}}
    onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
    onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{children}</button>
);}

function NavBtns({onBack,onNext,label="Weiter",showBack=true}){return(
  <div style={{display:"flex",gap:10,marginTop:24}}>
    {showBack&&<Btn onClick={onBack}>Zur\u00FCck</Btn>}
    <Btn onClick={onNext} primary style={{flex:showBack?1.6:1}}>{label}</Btn>
  </div>
);}

function Stp({icon,title,sub,children}){return(
  <div style={{background:C.card,borderRadius:20,padding:"28px 22px",boxShadow:"0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)",border:`1px solid ${C.border}`,animation:"slideIn .35s cubic-bezier(.32,.72,0,1)"}}>
    {icon&&<div style={{width:48,height:48,borderRadius:14,background:C.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:16}}>{icon}</div>}
    <h2 style={{fontSize:21,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:-0.4}}>{title}</h2>
    {sub&&<p style={{fontSize:13.5,color:C.textTer,margin:"0 0 22px",lineHeight:1.5}}>{sub}</p>}
    {children}
  </div>
);}

function Calc({rows,total}){return(
  <div style={{padding:"12px 14px",background:C.bg,borderRadius:14,marginBottom:6}}>
    {rows.map((r,i)=>(
      <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0",color:r.hl?C.orange:C.textSec}}>
        <span>{r.l}</span><span style={{fontWeight:600,color:r.hl?C.orange:C.text}}>{r.v}</span>
      </div>
    ))}
    {total&&<div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:14}}>
      <span style={{fontWeight:600,color:C.orange}}>{total.l}</span><span style={{fontWeight:700,color:C.orange}}>{total.v}</span>
    </div>}
  </div>
);}

function Tog({active,label,desc,onClick}){return(
  <button onClick={onClick} style={{flex:1,padding:"16px 14px",borderRadius:14,cursor:"pointer",textAlign:"left",border:active?`2px solid ${C.orange}`:`1.5px solid ${C.border}`,background:active?C.orangeLight:C.card}}>
    <div style={{fontSize:14,fontWeight:600,color:active?C.orangeDark:C.text}}>{label}</div>
    <div style={{fontSize:12,color:active?C.orange:C.textTer,marginTop:3}}>{desc}</div>
  </button>
);}

function Stars({rating,size=18}){return(
  <span style={{display:"inline-flex",gap:2}}>
    {[1,2,3,4,5].map(i=>(<svg key={i} width={size} height={size} viewBox="0 0 20 20"><path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8z" fill={i<=Math.round(rating)?C.orange:"#E0DDD8"}/></svg>))}
  </span>
);}

function StarInput({value,onChange,size=32}){return(
  <div style={{display:"flex",gap:6,justifyContent:"center"}}>
    {[1,2,3,4,5].map(i=>(<button key={i} onClick={()=>onChange(i)} style={{background:"none",border:"none",cursor:"pointer",padding:2,transform:value>=i?"scale(1.1)":"scale(1)",transition:"transform .15s"}}>
      <svg width={size} height={size} viewBox="0 0 20 20"><path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8z" fill={i<=value?C.orange:"#E0DDD8"}/></svg>
    </button>))}
  </div>
);}

function Row({l,v,c}){return(
  <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
    <span style={{color:c||C.textSec}}>{l}</span><span style={{fontWeight:600,color:C.text,whiteSpace:"nowrap"}}>{v}</span>
  </div>
);}

function TotalRow({l,v,c,big}){return(
  <div style={{display:"flex",justifyContent:"space-between",padding:big?"10px 0 4px":"6px 0",fontSize:big?15:13}}>
    <span style={{fontWeight:600,color:c||C.text}}>{l}</span><span style={{fontWeight:700,color:c||C.text}}>{v}</span>
  </div>
);}

function fmt(n){return Math.round(n).toLocaleString("de-DE");}
function fmtE(n){return fmt(n)+"\u00A0\u20AC";}
function fmtD(n){return n.toFixed(2).replace(".",",");}

function getRating(r){
  if(r<55)return{l:"Existenzgef\u00E4hrdend",c:C.red,bg:C.redLight,d:"Dein Stundensatz deckt nicht die Kosten."};
  if(r<66)return{l:"Unterdurchschnittlich",c:"#B45309",bg:"#FEF9EE",d:"Unter dem Branchendurchschnitt."};
  if(r<78)return{l:"Branchendurchschnitt",c:C.orange,bg:C.orangeLight,d:"Solide Basis \u2014 mit Optimierung ist mehr drin."};
  if(r<90)return{l:"Gut kalkuliert",c:C.green,bg:C.greenLight,d:"Professionelle Kalkulation mit Investitionsspielraum."};
  return{l:"Premium-Niveau",c:"#047857",bg:"#ECFDF5",d:"Top-Kalkulation. Spezialist mit gesunder Marge."};
}

const WPM=4.348;

// ─── MAIN COMPONENT ─────────────────────────

export default function Rechner(){
  const [s,setS]=useState(0);
  const [modal,setModal]=useState(null);
  const [stats,setStats]=useState({views:0,totalRatings:0,sumStars:0});
  const [userRating,setUserRating]=useState(0);
  const [rated,setRated]=useState(false);
  const [shared,setShared]=useState(false);
  const [d,setD]=useState({
    inhaber:true,unternehmerlohn:5000,inhaberProd:50,
    ma:2,lohn:19,wochenStd:40,lnk:42,
    raum:2200,masch:2500,fzg:1400,vers:450,verw:800,
    tage:206,std:8,prod:70,gewinn:10,
  });
  const u=(k,v)=>setD(p=>({...p,[k]:v}));
  const nx=()=>{const next=Math.min(s+1,STEPS.length-1);setS(next);trackStep(next,STEPS[next]);window.scrollTo?.({top:0,behavior:"smooth"});};
  const bk=()=>{setS(p=>Math.max(p-1,0));window.scrollTo?.({top:0,behavior:"smooth"});};

  useEffect(()=>{
    const st=incrementViews();
    setStats(st);
    setRated(hasUserRated());
    trackStep(0,"Start");
  },[]);

  const doRate=useCallback((stars)=>{
    setUserRating(stars);
    const st=submitRatingStore(stars);
    setStats(st);
    setRated(true);
  },[]);

  // ── CALCULATIONS (identical to reviewed version) ──
  const mGehalt=d.lohn*d.wochenStd*WPM;
  const jGehalt=mGehalt*12;
  const bruttoJ=d.ma*jGehalt;
  const lnkJ=bruttoJ*(d.lnk/100);
  const persAngest=bruttoJ+lnkJ;
  const ulJ=d.inhaber?d.unternehmerlohn*12:0;
  const persGes=persAngest+ulJ;
  const sachM=d.raum+d.masch+d.fzg+d.vers+d.verw;
  const sachJ=sachM*12;
  const selbstk=persGes+sachJ;
  const gewinnB=selbstk*(d.gewinn/100);
  const gesamt=selbstk+gewinnB;
  const anwStd=d.tage*d.std;
  const prodAngest=d.ma*anwStd*(d.prod/100);
  const prodInhaber=d.inhaber?anwStd*(d.inhaberProd/100):0;
  const prodGes=prodAngest+prodInhaber;
  const skSatz=prodGes>0?selbstk/prodGes:0;
  const vSatz=prodGes>0?gesamt/prodGes:0;
  const gkf=d.lohn>0&&d.ma>0?vSatz/d.lohn:0;
  const persAnteil=selbstk>0?(persGes/selbstk)*100:0;
  const rtg=getRating(vSatz);
  const avgStars=stats.totalRatings>0?stats.sumStars/stats.totalRatings:0;

  const shareText=`Mein Stundenverrechnungssatz: ${fmtD(vSatz)} \u20AC/h (netto)\n\nSelbstkosten: ${fmtD(skSatz)} \u20AC/h\nGewinnzuschlag: ${d.gewinn} %\nProduktive Stunden: ${fmt(prodGes)} h/Jahr\n\nBerechnet mit dem SVS-Rechner f\u00FCr Schreiner.`;

  const shareWA=()=>{trackShare("whatsapp");window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`,"_blank");setShared(true);};
  const shareMail=()=>{trackShare("email");window.open(`mailto:?subject=${encodeURIComponent("Mein Stundenverrechnungssatz")}&body=${encodeURIComponent(shareText)}`,"_blank");setShared(true);};

  // Track completion on result step
  useEffect(()=>{if(s===12)trackComplete(vSatz);},[s,vSatz]);

  const renderStep=()=>{
    switch(s){
    case 0:return(
      <div style={{textAlign:"center",padding:"48px 20px 32px"}}>
        <div style={{width:80,height:80,borderRadius:22,background:`linear-gradient(135deg,${C.orange},${C.orangeMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 28px",boxShadow:"0 12px 32px rgba(232,113,10,0.25)"}}>{"\u{1FA9A}"}</div>
        <h1 style={{fontSize:28,fontWeight:800,color:C.text,margin:"0 0 10px",lineHeight:1.15,letterSpacing:-0.8}}>Stundenverrechnungssatz berechnen</h1>
        <p style={{fontSize:16,color:C.textSec,margin:"0 0 6px",lineHeight:1.5}}>Vollkosten-Kalkulation nach BWA</p>
        <p style={{fontSize:13,color:C.textTer,margin:"0 0 32px"}}>3 Minuten \u00B7 Keine Anmeldung \u00B7 Daten bleiben lokal</p>
        <Btn onClick={nx} primary style={{width:"100%",maxWidth:280,padding:"17px 32px",fontSize:16,borderRadius:16}}>Jetzt berechnen</Btn>
        <p style={{fontSize:12,color:C.textTer,marginTop:20}}>Halte deine letzte BWA bereit.</p>
        {stats.totalRatings>0&&<div style={{marginTop:28,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Stars rating={avgStars} size={16}/><span style={{fontSize:13,color:C.textTer}}>{avgStars.toFixed(1)} \u00B7 {stats.totalRatings} Bewertung{stats.totalRatings!==1?"en":""}</span></div>}
        {stats.views>1&&<p style={{fontSize:12,color:C.textTer,marginTop:6}}>{fmt(stats.views)} Berechnungen</p>}
      </div>
    );

    case 1:return(
      <Stp icon={"\u{1F4CB}"} title="Zwei Seiten einer Gleichung" sub="Kosten und produktive Kapazit\u00E4t.">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          <div style={{padding:14,background:C.blueLight,borderRadius:14}}><div style={{fontSize:11,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Z\u00E4hler</div><div style={{fontSize:12,color:C.blue,lineHeight:1.6}}>Unternehmerlohn<br/>+ L\u00F6hne & LNK<br/>+ Sachkosten<br/>+ Gewinn</div></div>
          <div style={{padding:14,background:C.orangeLight,borderRadius:14}}><div style={{fontSize:11,fontWeight:700,color:C.orangeDark,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Nenner</div><div style={{fontSize:12,color:C.orangeDark,lineHeight:1.6}}>Anwesenheitstage<br/>\u00D7 Std./Tag<br/>\u00D7 Produktivit\u00E4t<br/>\u00D7 je Kopf</div></div>
        </div>
        <NavBtns onBack={bk} onNext={nx} showBack={false} label="Los geht's"/>
      </Stp>
    );

    case 2:return(
      <Stp icon={"\u{1F3E2}"} title="Rechtsform & Unternehmerlohn" sub="Erscheint dein Gehalt in der BWA?">
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          <Tog active={d.inhaber} label="Einzelunternehmen" desc="Mein Lohn \u2260 BWA" onClick={()=>u("inhaber",true)}/>
          <Tog active={!d.inhaber} label="GmbH / UG / KG" desc="GF-Gehalt = BWA" onClick={()=>u("inhaber",false)}/>
        </div>
        {d.inhaber?(<>
          <div style={{padding:"12px 14px",background:C.yellowLight,borderRadius:12,marginBottom:18}}><p style={{fontSize:12.5,color:"#92400E",margin:0,lineHeight:1.5}}>Privatentnahmen (Kto. 2100) erscheinen NICHT als Personalaufwand in der BWA.</p></div>
          <Inp label="Kalkulatorischer Unternehmerlohn" sub="Was w\u00FCrde ein angestellter Meister verdienen?" value={d.unternehmerlohn} onChange={v=>u("unternehmerlohn",v)} unit="\u20AC/Mo" min={2000} max={10000} step={100} info="unternehmerlohn" setModal={setModal}/>
          <Inp label="Dein Produktivanteil" sub="Wie viel deiner Zeit bist du DIREKT am Werkst\u00FCck?" value={d.inhaberProd} onChange={v=>u("inhaberProd",v)} unit="%" min={0} max={100} step={5} info="inhaberProd" setModal={setModal}/>
          <Calc rows={[{l:"Unternehmerlohn/Jahr",v:fmtE(ulJ)},{l:`Produktivanteil ${d.inhaberProd} %`,v:`${fmt(prodInhaber)} h/Jahr`}]}/>
        </>):(<div style={{padding:"14px 16px",background:C.blueLight,borderRadius:12}}><p style={{fontSize:13,color:C.blue,margin:0,lineHeight:1.5}}>GF-Gehalt steht in der BWA (Kto. 4110). Z\u00E4hle dich als Mitarbeiter mit.</p></div>)}
        <NavBtns onBack={bk} onNext={nx}/>
      </Stp>
    );

    case 3:return(
      <Stp icon={"\u{1F477}"} title="Produktivl\u00F6hne" sub={d.inhaber?"Angestellte \u2014 OHNE dich.":"Alle Mitarbeiter inkl. dir."}>
        <Inp label={d.inhaber?"Produktive Angestellte":"Produktive Mitarbeiter"} value={d.ma} onChange={v=>u("ma",v)} min={d.inhaber?0:1} max={25} info="personal" setModal={setModal} bwa="K\u00F6pfe auf Fertigungslohn"/>
        {d.ma>0&&(<>
          <Inp label="Durchschn. Brutto-Stundenlohn" value={d.lohn} onChange={v=>u("lohn",v)} unit="\u20AC/h" min={12} max={40} info="personal" setModal={setModal} bwa="Kto. 4110 \u00F7 Stunden"/>
          <Inp label="Wochenarbeitszeit" value={d.wochenStd} onChange={v=>u("wochenStd",v)} unit="h/Wo" min={20} max={48} setModal={setModal}/>
          <Calc rows={[{l:`${d.ma} MA \u00D7 ${fmtE(jGehalt)}/Jahr`,v:fmtE(bruttoJ)}]} total={{l:"Bruttol\u00F6hne/Jahr",v:fmtE(bruttoJ)}}/>
        </>)}
        <NavBtns onBack={bk} onNext={nx}/>
      </Stp>
    );

    case 4:return(
      <Stp icon={"\u{1F4B0}"} title="Lohnnebenkosten" sub={d.ma>0?"AG-Anteil auf Bruttol\u00F6hne.":"Keine Angestellten."}>
        {d.ma>0&&<Inp label="LNK-Aufschlag" sub="SV + BG + Umlagen + Sonderzahlungen" value={d.lnk} onChange={v=>u("lnk",v)} unit="%" min={20} max={60} info="lohnnebenkosten" setModal={setModal} bwa="(Kto. 4000\u20134199 \u2212 4110) \u00F7 4110 \u00D7 100"/>}
        <Calc rows={[...(d.ma>0?[{l:"Bruttol\u00F6hne",v:fmtE(bruttoJ)},{l:`+ LNK ${d.lnk} %`,v:fmtE(lnkJ)}]:[]),...(d.inhaber?[{l:"+ Unternehmerlohn",v:fmtE(ulJ)}]:[])]} total={{l:"Personalkosten/Jahr",v:fmtE(persGes)}}/>
        <NavBtns onBack={bk} onNext={nx}/>
      </Stp>
    );

    case 5:return(<Stp icon={"\u{1F3E0}"} title="Raumkosten" sub="Werkstatt, B\u00FCro, Lager."><Inp label="Raumkosten pro Monat" sub="Miete + NK + Strom + Heizung" value={d.raum} onChange={v=>u("raum",v)} unit="\u20AC" min={0} max={10000} step={50} info="raumkosten" setModal={setModal} bwa="Kto. 4200\u20134299 \u00F7 12"/><NavBtns onBack={bk} onNext={nx}/></Stp>);
    case 6:return(<Stp icon={"\u2699\uFE0F"} title="Maschinen & Werkzeug" sub="AfA, Wartung, Verschlei\u00DF."><Inp label="Maschinenkosten pro Monat" value={d.masch} onChange={v=>u("masch",v)} unit="\u20AC" min={0} max={15000} step={100} info="maschinen" setModal={setModal} bwa="(Kto. 4800+4900+4980) \u00F7 12"/><NavBtns onBack={bk} onNext={nx}/></Stp>);
    case 7:return(<Stp icon={"\u{1F690}"} title="Fahrzeugkosten"><Inp label="Fahrzeugkosten pro Monat" value={d.fzg} onChange={v=>u("fzg",v)} unit="\u20AC" min={0} max={8000} step={50} info="fahrzeuge" setModal={setModal} bwa="Kto. 4500\u20134580 \u00F7 12"/><NavBtns onBack={bk} onNext={nx}/></Stp>);
    case 8:return(<Stp icon={"\u{1F6E1}\uFE0F"} title="Versicherungen & Beitr\u00E4ge" sub="OHNE BG."><Inp label="Versicherungen pro Monat" value={d.vers} onChange={v=>u("vers",v)} unit="\u20AC" min={0} max={3000} step={25} info="versicherungen" setModal={setModal} bwa="Kto. 4360\u20134390 \u00F7 12"/><NavBtns onBack={bk} onNext={nx}/></Stp>);

    case 9:return(
      <Stp icon={"\u{1F5A5}\uFE0F"} title="Verwaltung & Vertrieb">
        <Inp label="Verwaltung pro Monat" value={d.verw} onChange={v=>u("verw",v)} unit="\u20AC" min={0} max={5000} step={50} info="verwaltung" setModal={setModal} bwa="Sonst. betriebl. Aufwand"/>
        <Calc rows={[{l:"Raum",v:`${fmt(d.raum)} \u20AC`},{l:"Maschinen",v:`${fmt(d.masch)} \u20AC`},{l:"Fahrzeuge",v:`${fmt(d.fzg)} \u20AC`},{l:"Vers.",v:`${fmt(d.vers)} \u20AC`},{l:"Verwaltung",v:`${fmt(d.verw)} \u20AC`}]} total={{l:"Sachkosten/Jahr",v:fmtE(sachJ)}}/>
        <NavBtns onBack={bk} onNext={nx}/>
      </Stp>
    );

    case 10:return(
      <Stp icon={"\u23F1\uFE0F"} title="Produktive Stunden" sub="Der Nenner deiner Kalkulation.">
        <Inp label="Anwesenheitstage/Jahr" sub="365 \u2212 WE \u2212 Feiertage \u2212 Urlaub \u2212 Krankheit = ca. 206" value={d.tage} onChange={v=>u("tage",v)} min={150} max={260} info="zeit" setModal={setModal}/>
        <Inp label="Stunden pro Tag" value={d.std} onChange={v=>u("std",v)} unit="h" min={4} max={12} setModal={setModal}/>
        <Inp label="Produktivit\u00E4t Angestellte" sub="Direkt am Werkst\u00FCck. 65\u201375 % realistisch." value={d.prod} onChange={v=>u("prod",v)} unit="%" min={50} max={100} step={5} info="produktivitaet" setModal={setModal}/>
        <Calc rows={[...(d.ma>0?[{l:`${d.ma} Angest. \u00D7 ${d.prod} %`,v:`${fmt(prodAngest)} h`}]:[]),...(d.inhaber?[{l:`Inhaber \u00D7 ${d.inhaberProd} %`,v:`${fmt(prodInhaber)} h`}]:[])]} total={{l:"Prod. Stunden/Jahr",v:`${fmt(prodGes)} h`}}/>
        <NavBtns onBack={bk} onNext={nx}/>
      </Stp>
    );

    case 11:return(
      <Stp icon={"\u{1F4B0}"} title="Gewinn- und Risikozuschlag">
        <Inp label="Gewinnzuschlag" sub="5 % = Minimum. 10 % = solide." value={d.gewinn} onChange={v=>u("gewinn",v)} unit="%" min={0} max={25} info="gewinn" setModal={setModal}/>
        <Calc rows={[{l:"Personalkosten",v:fmtE(persGes)},{l:"Sachkosten",v:fmtE(sachJ)},{l:"Selbstkosten",v:fmtE(selbstk)},{l:`+ Gewinn ${d.gewinn} %`,v:fmtE(gewinnB)}]} total={{l:"Gesamt inkl. Gewinn",v:fmtE(gesamt)}}/>
        <div style={{padding:"12px 14px",background:C.orangeLight,borderRadius:12,marginTop:8}}><p style={{fontSize:13,color:C.orangeDark,margin:0,fontWeight:600}}>{fmtE(gesamt)} \u00F7 {fmt(prodGes)} h = {fmtD(vSatz)} \u20AC/h</p></div>
        <NavBtns onBack={bk} onNext={nx} label="Ergebnis anzeigen"/>
      </Stp>
    );

    // ── ERGEBNIS ──
    case 12:return(
      <div style={{animation:"slideIn .35s cubic-bezier(.32,.72,0,1)"}}>
        <div style={{background:C.card,borderRadius:24,padding:"32px 24px 28px",boxShadow:"0 2px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.04)",border:`1px solid ${C.border}`,textAlign:"center",marginBottom:16}}>
          <p style={{fontSize:13,color:C.textTer,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1,fontWeight:500}}>Stundenverrechnungssatz (netto)</p>
          <div style={{fontSize:56,fontWeight:800,color:rtg.c,lineHeight:1,margin:"0 0 12px",letterSpacing:-2}}>{fmtD(vSatz)}<span style={{fontSize:28,letterSpacing:0}}> \u20AC</span></div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 18px",borderRadius:24,background:rtg.bg,color:rtg.c,fontSize:14,fontWeight:600}}>{rtg.l}</div>
          <p style={{fontSize:14,color:C.textSec,margin:"16px 0 0",lineHeight:1.5}}>{rtg.d}</p>
          <div style={{marginTop:12,fontSize:13,color:C.textTer}}>Selbstkosten {fmtD(skSatz)} \u20AC/h + Gewinn {fmtD(vSatz-skSatz)} \u20AC/h</div>
        </div>

        {/* Branchenvergleich */}
        <div style={{background:C.card,borderRadius:18,padding:"20px 22px",border:`1px solid ${C.border}`,marginBottom:16}}>
          <h3 style={{fontSize:15,fontWeight:600,color:C.text,margin:"0 0 14px"}}>Branchenvergleich</h3>
          <div style={{position:"relative",height:32,background:C.bg,borderRadius:16,overflow:"hidden"}}>
            <div style={{position:"absolute",left:"36%",width:"24%",height:"100%",background:"rgba(45,157,78,0.08)",borderLeft:`2px dashed ${C.green}`,borderRight:`2px dashed ${C.green}`}}/>
            <div style={{position:"absolute",top:"50%",transform:"translateY(-50%)",left:`${Math.min(95,Math.max(3,((vSatz-30)/100)*100))}%`,width:20,height:20,borderRadius:"50%",background:C.orange,border:"3px solid #fff",boxShadow:`0 2px 8px rgba(232,113,10,0.4)`,transition:"left .5s cubic-bezier(.32,.72,0,1)"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:C.textTer}}><span>30 \u20AC</span><span style={{color:C.green,fontWeight:600}}>66\u201390 \u20AC</span><span>130 \u20AC</span></div>
        </div>

        {/* Kalkulation */}
        <div style={{background:C.card,borderRadius:18,padding:"20px 22px",border:`1px solid ${C.border}`,marginBottom:16}}>
          <h3 style={{fontSize:15,fontWeight:600,color:C.text,margin:"0 0 14px"}}>Kalkulation</h3>
          {d.inhaber&&<Row l="Unternehmerlohn" v={fmtE(ulJ)} c={C.purple}/>}
          {d.ma>0&&<><Row l={`Bruttol\u00F6hne (${d.ma} MA)`} v={fmtE(bruttoJ)}/><Row l={`LNK (${d.lnk} %)`} v={fmtE(lnkJ)}/></>}
          <TotalRow l="Personalkosten" v={fmtE(persGes)} c={C.blue}/>
          <Row l="Raumkosten" v={fmtE(d.raum*12)}/><Row l="Maschinen" v={fmtE(d.masch*12)}/><Row l="Fahrzeuge" v={fmtE(d.fzg*12)}/><Row l="Versicherungen" v={fmtE(d.vers*12)}/><Row l="Verwaltung" v={fmtE(d.verw*12)}/>
          <TotalRow l="Selbstkosten" v={fmtE(selbstk)}/>
          <Row l={`Gewinn ${d.gewinn} %`} v={fmtE(gewinnB)} c={C.green}/>
          <TotalRow l="Gesamt" v={fmtE(gesamt)} c={C.orange} big/>
          <div style={{marginTop:14,padding:14,background:C.bg,borderRadius:14,fontSize:13,color:C.textSec,lineHeight:1.6}}>
            {d.ma>0&&<>{d.ma} Angest.: {fmt(anwStd)} h \u00D7 {d.prod} % = {fmt(prodAngest)} h<br/></>}
            {d.inhaber&&<>Inhaber: {fmt(anwStd)} h \u00D7 {d.inhaberProd} % = {fmt(prodInhaber)} h<br/></>}
            <strong>{fmtE(gesamt)} \u00F7 {fmt(prodGes)} h = {fmtD(vSatz)} \u20AC/h</strong>
          </div>
        </div>

        {/* Kennzahlen */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {(d.ma>0?[{l:"GKF",v:`${gkf.toFixed(1).replace(".",",")}\u00D7`,s:`Satz \u00F7 ${d.lohn} \u20AC`}]:[]).concat([
            {l:"Prod. Std./Jahr",v:`${fmt(prodGes)} h`},
            {l:"Kosten/Arbeitstag",v:fmtE(gesamt/d.tage/Math.max(1,d.ma+(d.inhaber?1:0)))},
            {l:"Personal-Anteil",v:`${Math.round(persAnteil)} %`,warn:persAnteil>70},
          ]).map(k=>(<div key={k.l} style={{padding:"14px 16px",background:C.card,borderRadius:16,border:`1px solid ${k.warn?C.yellowLight:C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
            <div style={{fontSize:12,color:C.textTer,marginBottom:4}}>{k.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:C.text,letterSpacing:-0.5}}>{k.v}</div>
            {k.s&&<div style={{fontSize:11,color:C.textTer}}>{k.s}</div>}
          </div>))}
        </div>

        {/* Hinweis */}
        <div style={{background:C.yellowLight,borderRadius:16,padding:"16px 18px",border:"1px solid #FDE68A",marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:600,color:"#92400E",margin:"0 0 6px"}}>Verrechnungssatz \u2260 Angebotspreis</p>
          <p style={{fontSize:12.5,color:"#92400E",margin:0,lineHeight:1.55}}>Dieser Stundensatz deckt deine Werkstattleistung. Dein Angebotspreis enth\u00E4lt zus\u00E4tzlich Materialkosten, Sonderleistungen und 19 % MwSt.</p>
        </div>

        {/* Share */}
        <div style={{background:C.card,borderRadius:18,padding:"20px 22px",border:`1px solid ${C.border}`,marginBottom:16}}>
          <h3 style={{fontSize:15,fontWeight:600,color:C.text,margin:"0 0 14px"}}>Ergebnis teilen</h3>
          <div style={{display:"flex",gap:10}}>
            <button onClick={shareWA} style={{flex:1,padding:14,borderRadius:14,border:"none",cursor:"pointer",background:"#25D366",color:"#fff",fontSize:14,fontWeight:600}}>WhatsApp</button>
            <button onClick={shareMail} style={{flex:1,padding:14,borderRadius:14,border:`1.5px solid ${C.border}`,cursor:"pointer",background:C.card,color:C.text,fontSize:14,fontWeight:600}}>E-Mail</button>
          </div>
          {shared&&<p style={{fontSize:12,color:C.green,marginTop:8,textAlign:"center"}}>Vorbereitet</p>}
        </div>

        {/* Rating */}
        <div style={{background:C.card,borderRadius:18,padding:"24px 22px",border:`1px solid ${C.border}`,marginBottom:16,textAlign:"center"}}>
          {!rated?(<><p style={{fontSize:15,fontWeight:600,color:C.text,margin:"0 0 14px"}}>Wie hilfreich war der Rechner?</p><StarInput value={userRating} onChange={doRate}/></>):(<p style={{fontSize:14,color:C.green,margin:0,fontWeight:500}}>Danke f\u00FCr deine Bewertung!</p>)}
          {stats.totalRatings>0&&<div style={{marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Stars rating={avgStars} size={14}/><span style={{fontSize:12,color:C.textTer}}>{avgStars.toFixed(1)} \u00B7 {stats.totalRatings} Bewertung{stats.totalRatings!==1?"en":""}</span></div>}
          {stats.views>1&&<p style={{fontSize:11,color:C.textTer,marginTop:6}}>{fmt(stats.views)} Berechnungen</p>}
        </div>

        {/* Disclaimer */}
        <div style={{padding:"14px 16px",background:C.bg,borderRadius:14,marginBottom:16}}>
          <p style={{fontSize:11,color:C.textTer,margin:0,lineHeight:1.55}}>Dieses Tool dient ausschlie\u00DFlich als Orientierungshilfe zur \u00DCberschlagsrechnung des Stundenverrechnungssatzes. Es ersetzt keine individuelle betriebswirtschaftliche Beratung durch einen Steuerberater oder Unternehmensberater. Die Berechnung basiert auf den eingegebenen Werten und vereinfachten Annahmen. F\u00FCr die Richtigkeit, Vollst\u00E4ndigkeit und Aktualit\u00E4t der Ergebnisse wird keine Haftung \u00FCbernommen. Gesch\u00E4ftliche Entscheidungen sollten stets auf einer professionellen Beratung basieren.</p>
        </div>

        <div style={{display:"flex",gap:10,marginBottom:8}}>
          <Btn onClick={()=>setS(0)}>Neu starten</Btn>
          <Btn onClick={()=>setS(2)} primary>Werte anpassen</Btn>
        </div>
      </div>
    );
    default:return null;
    }
  };

  return(
    <div style={{maxWidth:480,margin:"0 auto",padding:"12px 16px",fontFamily:FONT,WebkitFontSmoothing:"antialiased",minHeight:"100dvh"}}>
      {s>0&&s<12&&<Progress cur={s} tot={STEPS.length}/>}
      <div key={s}>{renderStep()}</div>
      <Modal open={!!modal} onClose={()=>setModal(null)} k={modal}/>
    </div>
  );
}
